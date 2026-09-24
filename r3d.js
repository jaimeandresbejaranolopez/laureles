/* Generado desde el plano vivo por gen_r3d.py — no editar a mano.
   Relieve 3D en WebGL, sin librerías. Se carga después de analisis.js porque
   toma de allí la Casa 30JB, el cálculo solar y el año en curso.
   Se enciende con el botón 3D; mientras está apagado no toca nada del mapa. */
(function(){
"use strict";
const EXT = window.__ANL_EXT;
if(!EXT){ console.warn("r3d.js: falta adaptador.js"); return; }
if(!window.__TER){ console.warn("r3d.js: falta datos-terreno.js, no hay relieve"); return; }

const TER  = window.__TER;
const VIAP = window.__VIAP || null;          /* corredor vial: datos-via.js */
const DATA = EXT.DATA, PX = EXT.PX, lat0 = EXT.lat0, lon0 = EXT.lon0;
const KX   = EXT.KX, KY = EXT.KY;
const state= EXT.state;
const CASA30 = window.__CASA30, SOL = window.__SOL, ANIO = window.__ANIO;
const IMPL = window.__IMPL || {};
if(!CASA30){ console.warn("r3d.js: falta analisis.js (Casa 30JB)"); return; }

/* El mapa filtra por las propiedades del GeoJSON; el 3D pregunta por el lote
   del análisis. Se traduce de uno a otro en vez de repetir la regla. */
function pasa(L){
  const M = window.__MAPA;
  if(!M) return true;
  const f = M.LOTES.features.find(x=>x.properties.lote===L.n);
  return f ? M.pasa(f.properties) : true;
}
/* tocar un lote en el 3D abre su ficha en el mapa */
function select(n){
  try{ if(n==null) cerrarFicha(); else abrirLote(n); }catch(e){}
}
/* Los hitos del sol (salida, ocaso, mediodía) para las tres fechas patrón.
   Mismo cálculo que la hoja de análisis, sobre la latitud y longitud del predio. */
const HITOS = SOL ? SOL.FECHAS.map(f=>Object.assign({}, f, SOL.hitos(ANIO,f.m,f.d,lat0,lon0)))
                  : [];

/* punto dentro de anillo, en grados: lo usa la bóveda solar para saber a qué
   lote apunta un rayo */
function dentro(pt, ring){
  let d=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0], yi=ring[i][1], xj=ring[j][0], yj=ring[j][1];
    if(((yi>pt[1])!==(yj>pt[1])) && (pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi)) d=!d;
  }
  return d;
}

/* En el plano vivo el color del lote seguía tres modos (estado, precio, m2).
   Aquí manda el mapa, que colorea por estado y nada más: se usa su misma tabla
   para que el relieve y el plano no digan cosas distintas del mismo lote. */
const GRIS_LOTE = "#8A8F82";
function colorDe(L){
  const M = window.__MAPA;
  if(!M) return GRIS_LOTE;
  const f = M.LOTES.features.find(x=>x.properties.lote===L.n);
  const e = f && M.ESTADOS[f.properties.estado];
  /* la textura se pinta en un lienzo 2D: aquí no valen las variables CSS */
  return e ? e.c : GRIS_LOTE;
}

/* el plano vivo tenía el SVG del plano detrás; aquí lo que se esconde es el mapa */
const svg = { style:{ set visibility(v){
  const m=document.getElementById("mapa"); if(m) m.style.visibility=v;
}, get visibility(){ const m=document.getElementById("mapa");
  return m?m.style.visibility:""; } } };

const R3D = (()=>{
  const cv = document.getElementById("c3d");
  const NXT=TER.nx, NYT=TER.ny, S=TER.s, Z0=TER.z0;
  const ANCHO=(NXT-1)*S, ALTO=(NYT-1)*S;
  const CX=TER.x+ANCHO/2, CY=TER.y+ALTO/2;
  const ZMID=(TER.z0+TER.z1)/2;
  let gl=null, prog=null, tex=null, vbo=null, ibo=null, nIdx=0, listo=false, activo=false;
  /* 972 m de predio: con 2048 px son 47 cm por pixel y el sardinel no existe;
     con 4096 son 24 cm y ya se lee. Se sube solo donde la GPU aguanta. */
  let TEX_T=0;
  function texTam(){
    if(TEX_T) return TEX_T;
    let max=2048;
    try{ if(gl) max=gl.getParameter(gl.MAX_TEXTURE_SIZE); }catch(e){}
    const grande = max>=4096 && Math.min(screen.width,screen.height)>=700
                   && !(navigator.deviceMemory && navigator.deviceMemory<4);
    TEX_T = grande ? 4096 : 2048;
    return TEX_T;
  }
  let ve=2.0, az=-0.62, elv=0.50, dist=1050, panX=0, panY=0;
  /* cota real del punto de mira: al encuadrar una casa se mira a la altura del
     lote, no al plano medio del modelo (si no, en ladera la casa quedaba corrida) */
  let cotaFoco=null;
  /* hasta dónde acerca la rueda: 45 m del punto de mira deja ver la casa de
     cerca (antes 260 m, que se quedaba lejos para juzgar una piscina) */
  const DIST_MIN=45;
  let modoMano=false;            /* arrastrar mueve en vez de girar */
  let H=null, texCv=null, texDirty=true, raf=0;
  let progS=null, progL=null, piezas=[], somB=null, loteCasa=null, LUZ=[-0.42,0.46,0.78];
  let domo=false, arcosB=null, marcasB=null, rayoB=null, solB=null, baseB=null;
  const etiqSol={};
  const capa=document.getElementById("capa3d");
  const globos={};

  /* ---------- alturas ---------- */
  /* El relieve SÍ dibuja los nodos de relleno —si no, al terreno le falta un
     pedazo justo donde están los lotes del vértice norte y del borde sur, y se
     ve mordido—, pero los guarda aparte para poder pintarlos distintos: ahí no
     hay levantamiento y no se puede leer la ladera como si lo hubiera. */
  let REL=null;
  const PEND_DECLARADA = 0.20;          /* igual que en MDT: el centro del rango fuerte */
  function decodificar(){
    const b=atob(TER.d), n=b.length, u=new Uint8Array(n);
    for(let i=0;i<n;i++)u[i]=b.charCodeAt(i);
    const q=new Uint16Array(u.buffer);
    H=new Float32Array(NXT*NYT);
    REL=new Uint8Array(NXT*NYT);
    for(let i=0;i<H.length;i++){
      const v=q[i];
      if(v===65535){ H[i]=NaN; continue; }
      H[i] = Z0 + (v & 0x7FFF)/100;
      REL[i] = (v & 0x8000) ? 1 : 0;
    }
    /* La franja sin levantar traía la cota del punto de curva más cercano y
       salía como una meseta. Se le da la pendiente declarada con la MISMA regla
       del informe —cota del borde levantado menos el 20 % de la distancia, con
       tope en la cota más baja medida del predio— para que el relieve y el
       informe cuenten lo mismo. Sigue rayada en la textura. */
    const NT=NXT*NYT, zB=new Float32Array(NT), dB=new Float32Array(NT), cola=[];
    let zSuelo=Infinity;
    for(let k=0;k<NT;k++){
      if(!isNaN(H[k]) && !REL[k]){ zB[k]=H[k]; dB[k]=0; cola.push(k); zSuelo=Math.min(zSuelo,H[k]); }
      else { zB[k]=NaN; dB[k]=Infinity; }
    }
    for(let t=0;t<cola.length;t++){
      const k=cola[t], j=(k/NXT)|0, i=k-j*NXT;
      for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){
        if(!di&&!dj) continue;
        const a=i+di, b2=j+dj;
        if(a<0||b2<0||a>=NXT||b2>=NYT) continue;
        const m=b2*NXT+a;
        if(!REL[m] || isNaN(H[m])) continue;
        const d=dB[k]+S*Math.hypot(di,dj);
        if(d<dB[m]-1e-6){ dB[m]=d; zB[m]=zB[k]; cola.push(m); }
      }
    }
    for(let k=0;k<NT;k++)
      if(REL[k] && !isNaN(H[k]) && !isNaN(zB[k]))
        H[k]=Math.max(zSuelo, zB[k]-PEND_DECLARADA*dB[k]);
  }
  /* ¿el nodo más cercano a este punto del plano es relleno? */
  function esRelleno(wx,wy){
    if(!REL) return false;
    const i=Math.round((wx-TER.x)/S), j=Math.round((wy-TER.y)/S);
    if(i<0||j<0||i>=NXT||j>=NYT) return false;
    return REL[j*NXT+i]===1;
  }
  const hAt=(i,j)=> (i<0||j<0||i>=NXT||j>=NYT) ? NaN : H[j*NXT+i];
  /* La altura buena más cercana, buscando en anillos alrededor del punto. Sirve
     para los lotes que quedaron fuera del levantamiento: se les cuelga el rótulo
     del borde de la malla en vez de dejarlos sin nada. */
  function alturaCerca(wx, wy){
    const i0=Math.round((wx-TER.x)/S), j0=Math.round((wy-TER.y)/S);
    for(let r=1;r<=60;r++){
      let mejor=NaN, dmin=Infinity;
      for(let dj=-r;dj<=r;dj++){
        for(let di=-r;di<=r;di++){
          if(Math.max(Math.abs(di),Math.abs(dj))!==r) continue;   /* sólo el anillo */
          const z=hAt(i0+di, j0+dj);
          if(isNaN(z)) continue;
          const d=di*di+dj*dj;
          if(d<dmin){ dmin=d; mejor=z; }
        }
      }
      if(!isNaN(mejor)) return mejor;
    }
    return NaN;
  }
  /* altura del terreno en coordenadas del plano (PX), interpolada */
  function alturaEn(wx,wy){
    const fi=(wx-TER.x)/S, fj=(wy-TER.y)/S;
    const i=Math.floor(fi), j=Math.floor(fj);
    if(i<0||j<0||i>=NXT-1||j>=NYT-1) return NaN;
    const tx=fi-i, ty=fj-j;
    const a=hAt(i,j),b=hAt(i+1,j),c=hAt(i,j+1),d=hAt(i+1,j+1);
    if(isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)) return NaN;
    return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
  }

  /* ---------- el banqueo: se aplana el terreno bajo la casa ----------
     Sin esto el volumen queda cortado por la ladera: el terreno le pasa por encima
     en la parte alta y le deja aire en la baja. Aplanar la malla es lo que de verdad
     ocurre en obra —se hace la plataforma— y además deja ver el corte y el lleno. */
  let BANQ=null;                 /* {poly:[[x,y],...], z:cota, borde:[[x,y],...]} */
  function dentroPoly(x,y,ring){
    let d=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) d=!d;
    }
    return d;
  }
  function alturaBanqueada(i,j){
    const h=hAt(i,j);
    if(!BANQ||isNaN(h)) return h;
    const wx=TER.x+i*S, wy=TER.y+j*S;
    if(dentroPoly(wx,wy,BANQ.poly)) return BANQ.z;
    /* talud de 4 m alrededor: el corte no cae a plomo */
    if(BANQ.ancho && dentroPoly(wx,wy,BANQ.ancho)){
      const t=0.5;                       /* mezcla suave para que no quede un escalón duro */
      return h*(1-t)+BANQ.z*t;
    }
    return h;
  }

  function entrelazar(m){
    const n=m.n, inter=new Float32Array(n*7);
    for(let k=0;k<n;k++){
      inter[k*7]=m.pos[k*3];inter[k*7+1]=m.pos[k*3+1];inter[k*7+2]=m.pos[k*3+2];
      inter[k*7+3]=m.uv[k*2];inter[k*7+4]=m.uv[k*2+1];
      inter[k*7+5]=m.sl[k*2];inter[k*7+6]=m.sl[k*2+1];
    }
    return inter;
  }
  function rehacerMalla(){
    if(!gl||!vbo)return;
    const m=malla();
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,entrelazar(m),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.idx,gl.STATIC_DRAW); nIdx=m.idx.length;
    faldaSucia=true;
  }

  /* ---------- el borde del modelo ----------
     La malla es una rejilla de 4 m: si el borde se corta por celdas enteras sale
     en escalera, que es lo que se veía "mordido". Ahora el borde es una curva:
     se suaviza la máscara de "hay terreno" (gaussiana de ~6 m) y la malla se
     recorta por su nivel 0,5 con marching squares, interpolando la cota sobre
     cada arista. Donde el borde suavizado entra a un nodo sin dato, la cota es
     la del nodo medido más cercano. Debajo del borde va un faldón de tierra,
     como el canto de una maqueta. */
  let FB=null, HF=null, FALDA=[], faldaB=null, faldaVE=null, faldaOsc=null, faldaSucia=false;
  function prepararBorde(){
    if(FB) return;
    const NT=NXT*NYT, val=new Float32Array(NT);
    for(let k=0;k<NT;k++) val[k]=isNaN(H[k])?0:1;
    const sg=1.4, R=4, w=[]; let sw=0;
    for(let d=-R;d<=R;d++){ const v=Math.exp(-d*d/(2*sg*sg)); w.push(v); sw+=v; }
    for(let d=0;d<w.length;d++) w[d]/=sw;
    const tmp=new Float32Array(NT); FB=new Float32Array(NT);
    for(let j=0;j<NYT;j++) for(let i=0;i<NXT;i++){ let s=0;
      for(let d=-R;d<=R;d++){ const a=i+d; if(a>=0&&a<NXT) s+=w[d+R]*val[j*NXT+a]; } tmp[j*NXT+i]=s; }
    for(let j=0;j<NYT;j++) for(let i=0;i<NXT;i++){ let s=0;
      for(let d=-R;d<=R;d++){ const b=j+d; if(b>=0&&b<NYT) s+=w[d+R]*tmp[b*NXT+i]; } FB[j*NXT+i]=s; }
    /* cota de relleno para los nodos sin dato: la del medido más cercano */
    HF=new Float32Array(NT); const cola=new Int32Array(NT); let ini=0, fin=0;
    for(let k=0;k<NT;k++){ if(!isNaN(H[k])){ HF[k]=H[k]; cola[fin++]=k; } else HF[k]=NaN; }
    while(ini<fin){ const k=cola[ini++], j=(k/NXT)|0, i=k-j*NXT;
      const vec=[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [di,dj] of vec){ const a=i+di, b=j+dj; if(a<0||b<0||a>=NXT||b>=NYT) continue;
        const q=b*NXT+a; if(isNaN(HF[q])){ HF[q]=HF[k]; cola[fin++]=q; } } }
  }
  function malla(){
    prepararBorde();
    const hB=(i,j)=>{ if(i<0||j<0||i>=NXT||j>=NYT) return NaN; const h=alturaBanqueada(i,j); return isNaN(h)?HF[j*NXT+i]:h; };
    const NT=NXT*NYT;
    const pos=[], uv=[], sl=[];
    for(let j=0;j<NYT;j++)for(let i=0;i<NXT;i++){
      const h=hB(i,j);
      const wx=TER.x+i*S, wy=TER.y+j*S;
      pos.push(wx-CX, -(wy-CY), isNaN(h)?0:(h-ZMID));
      uv.push(i/(NXT-1), j/(NYT-1));
      const hx1=hB(i+1,j),hx0=hB(i-1,j),hy1=hB(i,j+1),hy0=hB(i,j-1);
      sl.push((isNaN(hx1)||isNaN(hx0))?0:(hx1-hx0)/(2*S), (isNaN(hy1)||isNaN(hy0))?0:-(hy1-hy0)/(2*S));
    }
    const cruce=new Map();
    const punto=(a,b)=>{                         /* vértice sobre la arista a–b donde FB = 0,5 */
      const key=a<b?a*NT+b:b*NT+a; if(cruce.has(key)) return cruce.get(key);
      let t=(0.5-FB[a])/(FB[b]-FB[a]); t=Math.min(1,Math.max(0,t));
      const n=pos.length/3;
      for(let c=0;c<3;c++) pos.push(pos[a*3+c]+(pos[b*3+c]-pos[a*3+c])*t);
      for(let c=0;c<2;c++){ uv.push(uv[a*2+c]+(uv[b*2+c]-uv[a*2+c])*t); sl.push(sl[a*2+c]+(sl[b*2+c]-sl[a*2+c])*t); }
      cruce.set(key,n); return n;
    };
    const idx=[]; FALDA=[];
    for(let j=0;j<NYT-1;j++)for(let i=0;i<NXT-1;i++){
      const a=j*NXT+i,b=a+1,c=a+NXT,d=c+1;
      const ia=FB[a]>=0.5, ib=FB[b]>=0.5, ic=FB[c]>=0.5, id=FB[d]>=0.5;
      if(ia&&ib&&ic&&id){ idx.push(a,c,b, b,c,d); continue; }
      if(!ia&&!ib&&!ic&&!id) continue;
      /* recorrido a→b→d→c con los cruces del borde */
      const ciclo=[a,b,d,c], den=[ia,ib,id,ic];
      let s0=den.indexOf(true); const poly=[]; let salida=-1;
      for(let t=0;t<4;t++){
        const k=(s0+t)%4, k2=(k+1)%4, v=ciclo[k], v2=ciclo[k2];
        if(den[k]) poly.push(v);
        if(den[k]!==den[k2]){
          const x=punto(v,v2); poly.push(x);
          if(den[k]) salida=x; else if(salida>=0){ FALDA.push([salida,x]); salida=-1; }
        }
      }
      for(let t=1;t<poly.length-1;t++) idx.push(poly[0],poly[t],poly[t+1]);
    }
    const n=pos.length/3;
    return {pos:new Float32Array(pos),uv:new Float32Array(uv),sl:new Float32Array(sl),
            idx: new Uint16Array(idx), n};
  }
  /* el faldón: una pared de tierra bajo cada tramo del borde, hasta una base común */
  function construirFalda(oscuro){
    faldaB=null; if(!FALDA.length) return;
    let m=null;                                    /* posiciones actuales de la malla */
    try{ m=malla(); }catch(e){ return; }
    let zmin=Infinity; FALDA.forEach(([p,q])=>{ zmin=Math.min(zmin,m.pos[p*3+2],m.pos[q*3+2]); });
    const zb=(zmin-6)*ve;
    /* el recorrido deja siempre el afuera del mismo lado del tramo: se decide
       el lado por mayoría una sola vez y vale para todos (así no quedan rayas) */
    let votos=0;
    const tramos=FALDA.map(([p,q])=>{
      const x1=m.pos[p*3],y1=m.pos[p*3+1],z1=m.pos[p*3+2]*ve, x2=m.pos[q*3],y2=m.pos[q*3+1],z2=m.pos[q*3+2]*ve;
      let nx=y2-y1, ny=-(x2-x1); const L=Math.hypot(nx,ny)||1; nx/=L; ny/=L;
      const mx=(x1+x2)/2+nx*2+CX, my=-((y1+y2)/2+ny*2)+CY;
      const ii=Math.round((mx-TER.x)/S), jj=Math.round((my-TER.y)/S);
      const fuera=(ii<0||jj<0||ii>=NXT||jj>=NYT) ? true : FB[jj*NXT+ii]<0.5;
      votos += fuera?1:-1;
      return [x1,y1,z1,x2,y2,z2,nx,ny];
    });
    const sgn = votos>=0 ? 1 : -1;
    const V=[],N=[],I=[];
    tramos.forEach(([x1,y1,z1,x2,y2,z2,nx,ny])=>{
      /* normal casi horizontal pero algo inclinada hacia arriba: el canto se lee
         como tierra iluminada, sin quedar negro del lado de la sombra */
      const ax=nx*sgn*0.55, ay=ny*sgn*0.55, az=0.83;
      const k=V.length/3;
      V.push(x1,y1,z1, x2,y2,z2, x2,y2,zb, x1,y1,zb);
      for(let r=0;r<4;r++) N.push(ax,ay,az);
      I.push(k,k+1,k+2, k,k+2,k+3);
    });
    if(V.length/3>65535) return;
    faldaB=subir(V,N,I); faldaVE=ve; faldaOsc=oscuro;
  }

  /* ---------- textura: el mismo plano, dibujado en canvas 2D ---------- */
  function estilo(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}

  /* Parches procedurales. Se generan una sola vez y se repiten como patrón:
     con 0,24 m por pixel una brizna de pasto es medio pixel, así que lo que se
     busca no es dibujar pasto sino que el verde deje de ser plano. */
  let pastoPat=null, asfPat=null, patDe=null;
  function parche(n, base, manchas, seed){
    const c=document.createElement("canvas"); c.width=c.height=n;
    const x=c.getContext("2d");
    x.fillStyle=base; x.fillRect(0,0,n,n);
    let r=seed;
    const az=()=>{ r=(r*1103515245+12345)&0x7fffffff; return r/0x7fffffff; };
    for(const [col,cuantas,rmin,rmax,alfa] of manchas){
      x.fillStyle=col;
      for(let i=0;i<cuantas;i++){
        x.globalAlpha=alfa*(0.45+0.55*az());
        const rr=rmin+az()*(rmax-rmin);
        x.beginPath(); x.arc(az()*n, az()*n, rr, 0, 6.2832); x.fill();
      }
    }
    x.globalAlpha=1;
    return c;
  }
  function patrones(x, oscuro){
    const clave = oscuro?"osc":"clr";
    if(patDe===clave && pastoPat) return;
    patDe=clave;
    const pasto = oscuro
      ? parche(160,"#2C3A2B",[["#38492F",90,5,17,.55],["#243120",70,4,14,.5],["#41533A",40,3,9,.4]],7)
      : parche(160,"#9FB183",[["#ADBE8F",90,5,17,.55],["#8CA173",70,4,14,.5],["#B9C79C",40,3,9,.45]],7);
    const asf = oscuro
      ? parche(96,"#2A2C2B",[["#333635",60,3,10,.5],["#232524",50,3,9,.5]],23)
      : parche(96,"#4A4C4A",[["#565857",60,3,10,.5],["#3E403F",50,3,9,.5]],23);
    pastoPat=x.createPattern(pasto,"repeat");
    asfPat  =x.createPattern(asf,"repeat");
  }

  function dibujarTextura(){
    const T=texTam();
    if(!texCv){texCv=document.createElement("canvas");texCv.width=T;texCv.height=T;}
    const x=texCv.getContext("2d");
    const kx=T/ANCHO, ky=T/ALTO;
    const P=p=>{const q=PX(p);return [(q[0]-TER.x)*kx,(q[1]-TER.y)*ky];};
    const traza=(ring,cerrar)=>{x.beginPath();ring.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);});if(cerrar)x.closePath();};
    const oscuro = document.documentElement.dataset.theme==="dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    patrones(x, oscuro);
    const M = m => m*kx;                      /* metros → pixeles de la textura */
    const trazaAn = an => { x.beginPath(); an.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}); x.closePath(); };
    const trazaPoli = pol => { x.beginPath();
      pol.forEach(an=>{ an.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}); x.closePath(); }); };

    x.fillStyle=estilo("--ground")||"#E4E6D8"; x.fillRect(0,0,T,T);

    const capas = (typeof satOn!=="undefined" && satOn && typeof SAT!=="undefined")
      ? [SAT.entorno, SAT.predio||SAT].filter(m=>m&&m.foto) : [];
    const foto = capas.length ? true : null;
    if(foto){
      /* las mismas fotos aéreas, ahora colgadas del relieve: primero el entorno */
      capas.forEach(m=>{
        const a=P([m.oeste,m.norte]), b=P([m.este,m.sur]);
        x.drawImage(m.foto, a[0], a[1], b[0]-a[0], b[1]-a[1]);
      });
    } else {
      traza(DATA.lind,1); x.save(); x.clip();
      x.fillStyle=pastoPat; x.fillRect(0,0,T,T);
      x.restore();
    }

    /* áreas comunes: prado segado, un punto más claro */
    if(!foto){ x.save(); x.globalAlpha=oscuro?.18:.26; x.fillStyle=oscuro?"#93AC82":"#EDF0DC";
      DATA.soc.concat(DATA.var).forEach(a=>{traza(a.g,1);x.fill();}); x.restore(); }

    /* lotes: primero el color de venta, que es la información que se viene a leer */
    DATA.lotes.forEach(L=>{
      const ok=pasa(L);
      traza(L.g,1);
      x.fillStyle=colorDe(L);
      x.globalAlpha = ok ? (foto ? (state.modo==="estado" ? .26 : .48)
                                 : (state.modo==="estado" ? .60 : .88)) : (foto?.06:.12);
      x.fill(); x.globalAlpha=1;
    });
    /* y encima el pasto otra vez, en luz suave: devuelve el grano sin cambiar el tono */
    if(!foto){
    x.save();
    x.beginPath();
    DATA.lotes.forEach(L=>{ L.g.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}); x.closePath(); });
    x.clip();
    x.globalCompositeOperation="soft-light"; x.globalAlpha=.85;
    x.fillStyle=pastoPat; x.fillRect(0,0,T,T);
    x.restore();
    }

    /* faja de protección: es bosque de verdad, va encima del color de venta */
    if(!foto && document.getElementById("cProt").checked){
      x.save();
      x.beginPath(); DATA.prot.forEach(r=>{r.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);});x.closePath();});
      x.clip();
      x.fillStyle=oscuro?"#16210F":"#41603B"; x.globalAlpha=.78; x.fill();
      let r=99;const az=()=>{r=(r*1103515245+12345)&0x7fffffff;return r/0x7fffffff;};
      x.globalAlpha=oscuro?.30:.34; x.fillStyle=oscuro?"#2D4227":"#628556";
      for(let i=0;i<3400;i++){ x.beginPath(); x.arc(az()*T,az()*T,M(2+az()*4.5),0,6.2832); x.fill(); }
      x.globalAlpha=oscuro?.20:.22; x.fillStyle=oscuro?"#0C130A":"#27401F";
      for(let i=0;i<1800;i++){ x.beginPath(); x.arc(az()*T,az()*T,M(1.4+az()*3),0,6.2832); x.fill(); }
      x.restore();
    }

    /* separación entre lotes: seto vivo, no una línea de dibujo */
    x.lineJoin="round"; x.lineCap="round";
    if(foto){
      x.globalAlpha=.85; x.strokeStyle="#FFFFFF"; x.lineWidth=Math.max(1.2,M(0.55));
      DATA.lotes.forEach(L=>{ traza(L.g,1); x.stroke(); });
    } else {
      x.strokeStyle = oscuro ? "#1B2619" : "#4C6243";
      x.globalAlpha=.62; x.lineWidth=Math.max(1.8,M(1.0));
      DATA.lotes.forEach(L=>{ traza(L.g,1); x.stroke(); });
      x.globalAlpha=.75; x.strokeStyle = oscuro ? "#5A7042" : "#CBDBB2"; x.lineWidth=Math.max(1,M(0.4));
      DATA.lotes.forEach(L=>{ traza(L.g,1); x.stroke(); });
    }
    x.globalAlpha=1;

    /* el lote escogido */
    const Lsel = state.sel!=null ? DATA.lotes.find(z=>z.n===state.sel) : null;
    if(Lsel){ traza(Lsel.g,1);
      x.globalAlpha=.16; x.fillStyle=estilo("--gold")||"#9B7A48"; x.fill();
      x.globalAlpha=1; x.lineWidth=Math.max(4,M(1.6)); x.strokeStyle=estilo("--gold")||"#9B7A48"; x.stroke(); }

    /* ---------------- la vía, con andén, sardinel y demarcación ---------------- */
    const E_ = window.__ENTRADA || null, RED_ = !!(E_ && E_.calzada);
    if(!foto && document.getElementById("cVia").checked && (RED_ || (typeof VIAP!=="undefined" && VIAP && VIAP.calzada))){
      /* La red del plano 039 (datos-entrada.js): las bandas de la vía como las
         achura el plano —andén, franja, sardinel, calzada— y el eje recalculado
         como línea media de la calzada. En la plazoleta de acceso no se pintan eje
         ni líneas de borde, sólo la demarcación del plano. Sin ese archivo, el
         corredor viejo (VIAP). */
      const E = E_;
      const CALZ = RED_ ? E.calzada : VIAP.calzada;
      const EJE  = RED_ ? E.eje : VIAP.eje;
      const fueraDeZona = ()=>{ if(!E||!E.zona) return; x.beginPath(); x.rect(0,0,T,T);
        E.zona.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}); x.closePath(); x.clip("evenodd"); };
      const llena=(arr,col)=>{ x.fillStyle=col; (arr||[]).forEach(pol=>{ trazaPoli(pol); x.fill("evenodd"); }); };
      if(RED_){
        llena(E.anden, oscuro ? "#3A3B36" : "#DAD6C7");
        x.strokeStyle = oscuro ? "#4A4B44" : "#C6C2B2"; x.lineWidth=Math.max(1,M(0.2));
        E.anden.forEach(pol=>{ trazaPoli(pol); x.stroke(); });
        llena(E.franja, oscuro ? "#44453E" : "#C9C4B2");
        llena(E.sardinel, oscuro ? "#6A6B62" : "#F2EFE4");
      } else {
        /* andén: la franja de 2 m que queda entre el lindero del lote y la calzada */
        llena(VIAP.corredor, oscuro ? "#3A3B36" : "#DAD6C7");
        x.strokeStyle = oscuro ? "#4A4B44" : "#C6C2B2"; x.lineWidth=Math.max(1,M(0.4));
        VIAP.corredor.forEach(pol=>{ trazaPoli(pol); x.stroke(); });
        /* sardinel: labio claro justo antes del asfalto */
        x.strokeStyle = oscuro ? "#6A6B62" : "#F2EFE4"; x.lineWidth=Math.max(1.4,M(0.55));
        CALZ.forEach(pol=>{ trazaPoli(pol); x.stroke(); });
      }
      /* calzada */
      x.save();
      x.beginPath();
      CALZ.forEach(pol=>pol.forEach(an=>{ an.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}); x.closePath(); }));
      x.clip("evenodd");
      x.fillStyle=asfPat; x.fillRect(0,0,T,T);
      x.restore();
      x.save(); fueraDeZona();
      /* líneas de borde, continuas y blancas, a 0,4 m del sardinel */
      x.strokeStyle="#EFEDE2"; x.globalAlpha=.85; x.lineWidth=Math.max(1,M(0.12));
      x.setLineDash([]);
      EJE.forEach(e=>{
        [1,-1].forEach(sgn=>{
          x.beginPath();
          for(let i=0;i<e.length;i++){
            const a=e[Math.max(0,i-1)], b=e[Math.min(e.length-1,i+1)];
            const pa=P(a), pb=P(b); let dx=pb[0]-pa[0], dy=pb[1]-pa[1];
            const n=Math.hypot(dx,dy)||1; dx/=n; dy/=n;
            const q=P(e[i]), off=M(Math.max(1.2,e[i][2]-0.45))*sgn;
            const px=q[0]-dy*off, py=q[1]+dx*off;
            i?x.lineTo(px,py):x.moveTo(px,py);
          }
          x.stroke();
        });
      });
      /* eje: línea discontinua */
      x.globalAlpha=.9; x.lineWidth=Math.max(1,M(0.12));
      x.setLineDash([M(3),M(4.5)]);
      EJE.forEach(e=>{
        x.beginPath(); e.forEach((p,i)=>{const q=P(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);}); x.stroke();
      });
      x.setLineDash([]); x.globalAlpha=1;
      x.restore();
      if(E) dibujarEntrada(E);
    }

    /* plazoleta de acceso y portería, del plano 039 (mismos colores que el 2D) */
    function dibujarEntrada(E){
      const relleno=(arr,col)=>{ x.fillStyle=col; (arr||[]).forEach(r=>{ traza(r,1); x.fill(); }); };
      const borde=(arr,col,w,dash)=>{ x.strokeStyle=col; x.lineWidth=Math.max(1,M(w)); x.setLineDash(dash||[]);
        (arr||[]).forEach(r=>{ traza(r,1); x.stroke(); }); x.setLineDash([]); };
      x.save(); x.globalAlpha=1; x.lineJoin="round";
      relleno(E.social, oscuro?"#4A4638":"#E4DDC8");
      relleno(E.circulacion, oscuro?"#4E4633":"#D6C8A6");
      relleno(E.parking, oscuro?"#3E403D":"#6A6C69");
      borde(E.parking, "#F4F2EA", 0.15);
      relleno(E.verde, oscuro?"#4F6B45":"#8FAF78");
      borde(E.verde, oscuro?"#6A6B62":"#F2EFE4", 0.3);
      relleno(E.mant, oscuro?"#6E6A5C":"#D9D3C2");
      relleno(E.porteria, oscuro?"#CFCABB":"#F7F5EE");
      borde((E.mant||[]).concat(E.porteria||[]), "#3B453A", 0.25);
      x.globalAlpha=.8; borde(E.cubierta, "#3B453A", 0.12, [M(1.2),M(1)]); x.globalAlpha=1;
      /* construcciones que ya existen; la casa principal en terracota */
      (E.existentes||[]).forEach(o=>{ traza(o.g,1);
        x.fillStyle = o.t==="casa" ? (oscuro?"#8A4E32":"#B5653E") : (oscuro?"#6E6658":"#9C8F7C"); x.fill();
        x.strokeStyle="#3B2A20"; x.lineWidth=Math.max(1,M(0.3)); x.stroke(); });
      /* la cancha del Área Social 2 */
      relleno(E.cancha, oscuro?"#2F5566":"#4F7F96"); borde(E.cancha, "#F4F2EA", 0.15);
      x.strokeStyle="#F4F2EA"; x.lineWidth=Math.max(1,M(0.12)); (E.canchaL||[]).forEach(r=>{ traza(r,0); x.stroke(); });
      /* postes de energía */
      x.fillStyle="#2E3530"; (E.postes||[]).forEach(p=>{ const q=P(p); x.beginPath(); x.arc(q[0],q[1],Math.max(2,M(0.45)),0,6.2832); x.fill(); });
      /* guía de carril, cebras y flechas */
      x.globalAlpha=.9; x.strokeStyle="#F4F2EA"; x.lineWidth=Math.max(1,M(0.12)); x.setLineDash([M(3),M(4.5)]);
      (E.guia||[]).forEach(r=>{ traza(r,0); x.stroke(); }); x.setLineDash([]);
      x.globalAlpha=.95; relleno((E.cebra||[]).concat(E.flecha||[]), "#F4F2EA");
      x.restore();
    }

    x.strokeStyle=foto?"#FFD84A":(estilo("--forest")||"#32402F");
    x.lineWidth=Math.max(3,M(foto?1.8:1.4)); traza(DATA.lind,1); x.stroke();

    /* Zona sin levantamiento: se dibuja el terreno para que el modelo no quede
       mordido, pero rayado, porque esa altura es del punto de curva más cercano
       y no un dato de campo. Se marca nodo a nodo sobre la propia rejilla. */
    if(REL){
      const rayas=document.createElement("canvas"); rayas.width=rayas.height=10;
      const rx=rayas.getContext("2d");
      rx.strokeStyle="rgba(60,58,48,.55)"; rx.lineWidth=2.4;
      rx.beginPath(); rx.moveTo(-2,10); rx.lineTo(10,-2);
      rx.moveTo(3,13); rx.lineTo(13,3); rx.stroke();
      const pat=x.createPattern(rayas,"repeat");
      x.save();
      x.beginPath();
      const cw=S*kx+1.0, ch=S*ky+1.0;          /* una celda de la rejilla, con solape */
      for(let j=0;j<NYT;j++) for(let i=0;i<NXT;i++){
        if(REL[j*NXT+i]!==1) continue;
        x.rect((i*S)*kx - cw/2, (j*S)*ky - ch/2, cw, ch);
      }
      x.clip();
      x.fillStyle="rgba(214,208,190,.72)"; x.fillRect(0,0,T,T);
      x.fillStyle=pat; x.fillRect(0,0,T,T);
      x.restore();
    }

    /* los números ya no se estampan: van como globos que siempre miran a la cámara */
    texDirty=false;
    if(gl&&tex){
      gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texCv);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
  }


  /* ---------- globos de número: siempre miran a la cámara ---------- */
  function crearGlobos(){
    DATA.lotes.forEach(L=>{
      const d=document.createElement("div");
      d.className="rotulo3d"; d.textContent=L.n;
      d.onclick=e=>{ e.stopPropagation(); select(L.n); };
      capa.appendChild(d); globos[L.n]=d;
    });
  }
  function proyectar(M,x,y,z){
    const w=M[3]*x+M[7]*y+M[11]*z+M[15];
    if(w<=0.0001)return null;
    return [ (M[0]*x+M[4]*y+M[8]*z+M[12])/w, (M[1]*x+M[5]*y+M[9]*z+M[13])/w ];
  }
  /* banderín de la casa existente: el asta sale del suelo en el punto de la casa */
  let banderin3d=null;
  function ubicarBanderin(M){
    const E=window.__ENTRADA; if(!E||!E.casaActual) return;
    if(!banderin3d){
      banderin3d=document.createElement("div");
      banderin3d.className="banderin banderin3d";
      banderin3d.style.cssText="position:absolute;left:0;top:0;pointer-events:auto;transform:translate(-4px,-100%);z-index:3";
      banderin3d.innerHTML='<svg width="30" height="46" viewBox="0 0 30 46" aria-hidden="true">'+
        '<line x1="4" y1="3" x2="4" y2="45" stroke="#2A241D" stroke-width="2.4" stroke-linecap="round"/>'+
        '<path d="M5 4 L27 11 L5 18 Z" fill="#B5653E" stroke="#F4F2EA" stroke-width="1.2" stroke-linejoin="round"/>'+
        '<circle cx="4" cy="44" r="2.6" fill="#2A241D"/></svg>'+
        '<span><b>Casa actual</b><i>Arquitectura típica · referencia en campo</i></span>';
      banderin3d.title="Casa principal existente, en el lote "+E.casaActual.lote;
      banderin3d.onclick=ev=>{ ev.stopPropagation(); try{ avisar("Casa actual de arquitectura típica, en el lote "+E.casaActual.lote+
        ". Es el punto de referencia para ubicarse en el predio.", 6000); }catch(e){} };
      capa.appendChild(banderin3d);
    }
    const c=PX(E.casaActual.p); let h=alturaEn(c[0],c[1]); if(isNaN(h)) h=alturaCerca(c[0],c[1]);
    const r=cv.getBoundingClientRect();
    const p = isNaN(h) ? null : proyectar(M, c[0]-CX, -(c[1]-CY), (h-ZMID)*ve+0.5);
    if(!p){ banderin3d.style.display="none"; return; }
    const sx=(p[0]*0.5+0.5)*r.width, sy=(1-(p[1]*0.5+0.5))*r.height;
    if(sx<-60||sy<-10||sx>r.width+10||sy>r.height+60){ banderin3d.style.display="none"; return; }
    banderin3d.style.display=""; banderin3d.style.left=sx.toFixed(1)+"px"; banderin3d.style.top=sy.toFixed(1)+"px";
  }
  function ubicarGlobos(M,ancho,alto){
    try{ ubicarBanderin(M); }catch(e){}
    if(!Object.keys(globos).length)return;
    const ver=document.getElementById("cNum").checked;
    const r=cv.getBoundingClientRect();
    const puestos=[];
    DATA.lotes.forEach(L=>{
      const d=globos[L.n]; if(!d)return;
      if(!ver || (domo && state.sel!==L.n)){ d.style.display="none"; return; }
      const c=PX(L.c);
      let h=alturaEn(c[0],c[1]);
      if(isNaN(h)) h=alturaCerca(c[0],c[1]);
      if(isNaN(h)){ d.style.display="none"; return; }
      /* Ahora la malla llega a todo el predio, así que la altura ya no falta.
         Lo que se marca es otra cosa: que ese lote no está levantado entero. */
      const AI = IMPL[String(L.n)];
      const flojo = (AI && AI.cob!=null && AI.cob<0.98) || esRelleno(c[0],c[1]);
      d.classList.toggle("sinCota", !!flojo);
      d.title = flojo
        ? "Lote "+L.n+(AI&&AI.cob!=null ? " — sólo el "+Math.round(AI.cob*100)+
            " % está dentro del área levantada" : " — fuera del área levantada")
        : "Lote "+L.n;
      const p=proyectar(M, c[0]-CX, -(c[1]-CY), (h-ZMID)*ve+6);
      if(!p){ d.style.display="none"; return; }
      const sx=(p[0]*0.5+0.5)*r.width, sy=(1-(p[1]*0.5+0.5))*r.height;
      if(sx<-40||sy<-30||sx>r.width+40||sy>r.height+30){ d.style.display="none"; return; }
      let choca=false;
      for(const q of puestos){ if(Math.abs(q[0]-sx)<26 && Math.abs(q[1]-sy)<15){choca=true;break;} }
      if(choca){ d.style.display="none"; return; }
      puestos.push([sx,sy]);
      d.style.display=""; d.style.left=sx.toFixed(1)+"px"; d.style.top=sy.toFixed(1)+"px";
      d.style.opacity = pasa(L) ? 1 : .3;
      d.classList.toggle("sel", state.sel===L.n);
    });
  }

  /* ---------- volumen de casa y su sombra ---------- */
  const ALTURA_CASA=5.0;
  /* ---------- Casa 30JB: el volumen de estudio, por piezas ----------
     Los bloques van en coordenadas locales de la envolvente: u a lo ancho,
     v hacia el fondo, ambos en fracción del tamaño de referencia (22,4 x 28,4 m
     de casa, 40 m con el deck). Así la misma casa se adapta al rectángulo que
     de verdad cupo en cada lote sin cambiar de proporción.                */
  const REF_W=CASA30.W, REF_DC=CASA30.D, REF_DT=40.0, ENTRE_NIV=3.0;
  const ALTO_BAJO=CASA30.hBaja, ALTO_ARCO=CASA30.hArco, ALTO_CARPORT=CASA30.hCarport, PARAPETO=CASA30.parapeto;
  const BLOQUES=CASA30.bloques;

  function malloSolido(){
    if(!listo||!gl){ return; }
    piezas=[]; somB=null;
    const banqAntes = BANQ ? BANQ.z+'|'+BANQ.poly[0][0].toFixed(1)+','+BANQ.poly[0][1].toFixed(1) : '';
    BANQ=null;
    if(loteCasa==null){ if(banqAntes) rehacerMalla(); return; }
    const A=(typeof IMPL!=="undefined")?IMPL[String(loteCasa)]:null;
    if(!A){ if(banqAntes) rehacerMalla(); return; }
    if(!A.k||!A.k.o){
      /* Cinco lotes del predio —48, 65, 83, 84 y 86— no admiten una sola
         plataforma: la casa se implanta en bancales. Hasta ahora aquí se
         devolvía sin dibujar nada y en el 3D del mapa esos lotes salían sin
         casa. La geometría la calcula el mismo módulo que dibuja el informe
         (window.__IMPLANTAR_TERRAZA), para que mapa e informe no cuenten dos
         historias distintas del mismo lote. */
      const KT=(typeof window.__IMPLANTAR_TERRAZA==="function")
             ? window.__IMPLANTAR_TERRAZA(+loteCasa) : null;
      if(KT) malloTerraza(KT);
      if(banqAntes) rehacerMalla();
      return;
    }
    const K=A.k;
    const dosNiveles=(K.mod==="2p" && K.zm!=null);
    /* la piscina y el deck salieron del modelo: el volumen es sólo la casa */
    const escU = K.L/REF_W;                       /* ancho hallado / ancho de referencia */
    const escV = (K.Dc||REF_DC)/REF_DC;

    const o=K.o, ux=K.ux, uv=K.uv;
    /* punto del terreno a partir de (u,v) en metros de referencia */
    const XY=(u,v,cls)=>{
      const uu=u*escU, vv=v*escV;
      return [o[0]+ux[0]*uu+uv[0]*vv, o[1]+ux[1]*uu+uv[1]*vv];
    };
    const Zp=z=>(z-ZMID)*ve;
    const z0=Zp(K.z);                              /* nivel de acceso, en el relieve exagerado */
    const zb=dosNiveles?(z0-ENTRE_NIV*ve):z0;         /* el -1 baja 3 m de verdad */
    /* toda la escena comparte la exageración vertical del relieve: si el terreno va
       a 2x y la casa a 1x, las proporciones entre casa y ladera dejan de tener sentido.
       Con el control RELIEVE en 1x se ve la escala verdadera. */
    const H = m => m*ve;

    const V=[],N=[],I=[];
    const mete=(x,y,z,nx,ny,nz)=>{V.push(x-CX,-(y-CY),z);N.push(nx,ny,nz);return V.length/3-1;};
    function prisma(quad,za,zc,tapa){
      const arr=quad.map(p=>mete(p[0],p[1],zc,0,0,1));
      if(tapa!==false) for(let i=1;i<arr.length-1;i++) I.push(arr[0],arr[i],arr[i+1]);
      for(let i=0;i<quad.length;i++){
        const a=quad[i], b=quad[(i+1)%quad.length];
        const dx=b[0]-a[0], dy=-(b[1]-a[1]), L=Math.hypot(dx,dy)||1;
        const nx=dy/L, ny=-dx/L;
        const p1=mete(a[0],a[1],za,nx,ny,0), p2=mete(b[0],b[1],za,nx,ny,0);
        const p3=mete(b[0],b[1],zc,nx,ny,0), p4=mete(a[0],a[1],zc,nx,ny,0);
        I.push(p1,p2,p3, p1,p3,p4);
      }
    }
    function reset(){ V.length=0;N.length=0;I.length=0; }
    function cerrar(color){ if(I.length) piezas.push({b:subir(V.slice(),N.slice(),I.slice()),c:color}); reset(); }
    const quad=(u0,v0,u1,v1,cls)=>[XY(u0,v0,cls),XY(u1,v0,cls),XY(u1,v1,cls),XY(u0,v1,cls)];

    /* --- 0. el banqueo: se aplana el terreno bajo la casa y se dibuja el corte --- */
    (function(){
      const q  = quad(-1.0, -1.0, REF_W+1.0, REF_DC+1.0, "muro");
      const qq = quad(-5.0, -5.0, REF_W+5.0, REF_DC+5.0, "muro");
      BANQ = {poly:q, ancho:qq, z:K.z};        /* la malla se aplana a la cota de acceso */
      let zmin=1e9;
      qq.forEach(pt=>{ const hh=alturaEn(pt[0],pt[1]); if(!isNaN(hh)) zmin=Math.min(zmin,(hh-ZMID)*ve); });
      if(!isFinite(zmin)) zmin=z0-3;
      /* el muro de contención del lado bajo, para que la plataforma no flote */
      prisma(q, Math.min(zmin-0.6, z0-0.5), z0-H(0.12), true);
      cerrar([0.66,0.58,0.45,1.0]);
    })();

    /* --- casa configurada con IA (ia.js): bloques genéricos en el marco de
       referencia, ya convertidos por el cliente. Si hay una para ESTE lote,
       reemplaza a la Casa 30JB; si no, se dibuja el tipo de siempre. --- */
    const CI = (window.__CASA_IA && String(window.__CASA_IA.lote)===String(loteCasa)
                && Array.isArray(window.__CASA_IA.bloques)) ? window.__CASA_IA : null;
    function dibujarIA(C){
      const B = C.bloques;
      const n1 = B.filter(b=>b.clase==="muro" && (b.nivel||1)===1);
      const baseDe = b=>{                      /* cota de arranque de un bloque de nivel 2 */
        const cu=(b.u0+b.u1)/2, cv=(b.v0+b.v1)/2;
        const bajo = n1.find(x=>cu>=x.u0&&cu<=x.u1&&cv>=x.v0&&cv<=x.v1);
        return bajo ? (bajo.alto||3.4) : 3.4;
      };
      /* muros nivel 1 */
      n1.forEach(b=>prisma(quad(b.u0,b.v0,b.u1,b.v1,"muro"), z0, z0+H(b.alto||3.4), true));
      cerrar([0.93,0.90,0.83,1.0]);
      /* muros nivel 2, un tono más claro para que se lea el piso */
      B.filter(b=>b.clase==="muro" && b.nivel===2).forEach(b=>{
        const za=z0+H(baseDe(b));
        prisma(quad(b.u0,b.v0,b.u1,b.v1,"muro"), za, za+H(b.alto||3.0), true);
      });
      cerrar([0.95,0.93,0.87,1.0]);
      /* parapetos de todos los muros */
      B.filter(b=>b.clase==="muro").forEach(b=>{
        const e=0.30, za = (b.nivel===2) ? z0+H(baseDe(b)) : z0, top = za+H(b.alto||(b.nivel===2?3.0:3.4));
        [[b.u0,b.v0,b.u1,b.v0+e],[b.u0,b.v1-e,b.u1,b.v1],[b.u0,b.v0,b.u0+e,b.v1],[b.u1-e,b.v0,b.u1,b.v1]]
          .forEach(q=>prisma(quad(q[0],q[1],q[2],q[3],"muro"), top, top+H(PARAPETO), true));
      });
      cerrar([0.97,0.95,0.90,1.0]);
      /* porches y carports: losa sobre cuatro columnas */
      B.filter(b=>b.clase==="porche").forEach(b=>{
        const h=b.alto||3.2;
        prisma(quad(b.u0,b.v0,b.u1,b.v1,"porche"), z0+H(h-0.32), z0+H(h), true);
        const c=0.34;
        [[b.u0,b.v0],[b.u1-c,b.v0],[b.u0,b.v1-c],[b.u1-c,b.v1-c]].forEach(([a,bb])=>
          prisma(quad(a,bb,a+c,bb+c,"porche"), z0, z0+H(h-0.32), false));
      });
      cerrar([0.90,0.87,0.79,1.0]);
      /* patios (piedra) y decks (madera) */
      B.filter(b=>b.clase==="patio").forEach(b=>prisma(quad(b.u0,b.v0,b.u1,b.v1,"patio"), z0-H(0.05), z0+H(0.02), true));
      cerrar([0.72,0.66,0.55,1.0]);
      B.filter(b=>b.clase==="deck").forEach(b=>prisma(quad(b.u0,b.v0,b.u1,b.v1,"patio"), z0-H(0.05), z0+H(0.06), true));
      cerrar([0.60,0.42,0.25,1.0]);
      /* piscina: brocal claro y lámina de agua hundida */
      /* el brocal es un anillo (no una losa: taparía el agua) y el agua queda
         apenas por encima del deck para que se vea desde cualquier ángulo */
      B.filter(b=>b.clase==="piscina").forEach(b=>{
        const e=0.4;
        [[b.u0-e,b.v0-e,b.u1+e,b.v0],[b.u0-e,b.v1,b.u1+e,b.v1+e],[b.u0-e,b.v0,b.u0,b.v1],[b.u1,b.v0,b.u1+e,b.v1]]
          .forEach(q=>prisma(quad(q[0],q[1],q[2],q[3],"patio"), z0-H(0.05), z0+H(0.14), true));
      });
      cerrar([0.90,0.89,0.84,1.0]);
      B.filter(b=>b.clase==="piscina").forEach(b=>{
        prisma(quad(b.u0,b.v0,b.u1,b.v1,"patio"), z0-H(0.05), z0+H(0.10), true);
      });
      cerrar([0.36,0.64,0.80,1.0]);
    }
    if(CI){ dibujarIA(CI); }
    else {
    /* --- 1. muros: el cuerpo de la casa, crema --- */
    BLOQUES.forEach(([nom,u0,v0,u1,v1,h,cls])=>{
      if(cls!=="muro") return;

      prisma(quad(u0,v0,u1,v1,cls), z0, z0+H(h), true);
    });
    cerrar([0.93,0.90,0.83,1.0]);

    /* --- 2. parapetos: el borde de la cubierta plana, un tono más claro --- */
    BLOQUES.forEach(([nom,u0,v0,u1,v1,h,cls])=>{
      if(cls!=="muro") return;
      const e=0.30;
      [[u0,v0,u1,v0+e],[u0,v1-e,u1,v1],[u0,v0,u0+e,v1],[u1-e,v0,u1,v1]].forEach(q=>
        prisma(quad(q[0],q[1],q[2],q[3],cls), z0+H(h), z0+H(h+PARAPETO), true));
    });
    cerrar([0.97,0.95,0.90,1.0]);

    /* --- 3. carport: losa sobre cuatro columnas --- */
    (function(){
      const b=BLOQUES.find(x=>x[0]==="carport");
      const [,u0,v0,u1,v1,h]=b;
      prisma(quad(u0,v0,u1,v1,"porche"), z0+H(h-0.32), z0+H(h), true);   /* la losa */
      const c=0.34;
      [[u0,v0],[u1-c,v0],[u0,v1-c],[u1-c,v1-c]].forEach(([a,bb])=>
        prisma(quad(a,bb,a+c,bb+c,"porche"), z0, z0+H(h-0.32), false));
      cerrar([0.90,0.87,0.79,1.0]);
    })();

    /* --- 4. el arco de acceso: hueco de medio punto en la fachada --- */
    (function(){
      const b=BLOQUES.find(x=>x[0]==="acceso");
      const [,u0,v0,u1,,h]=b;
      const cu=(u0+u1)/2, R=(u1-u0)*0.30, alt=h*0.62;      /* arranque del arco */
      const e=0.30, pasos=14;
      /* jambas */
      prisma(quad(u0,v0,cu-R,v0+e,"muro"), z0, z0+H(h), true);
      prisma(quad(cu+R,v0,u1,v0+e,"muro"), z0, z0+H(h), true);
      /* tímpano sobre el arco, por gajos */
      for(let i=0;i<pasos;i++){
        const a1=Math.PI*i/pasos, a2=Math.PI*(i+1)/pasos;
        const x1=cu-R*Math.cos(a1), x2=cu-R*Math.cos(a2);
        const y1=alt+R*Math.sin(a1), y2=alt+R*Math.sin(a2);
        const yy=Math.min(y1,y2);
        prisma(quad(Math.min(x1,x2),v0,Math.max(x1,x2),v0+e,"muro"), z0+H(yy), z0+H(h), true);
      }
      cerrar([0.95,0.92,0.86,1.0]);
    })();

    /* --- 5. lamas de madera: el cierre del carport y el paño de la fachada --- */
    (function(){
      const car=BLOQUES.find(x=>x[0]==="carport");
      const alc=BLOQUES.find(x=>x[0]==="alcobas");
      const e=0.14;
      prisma(quad(car[1],car[4]-e,car[3],car[4],"porche"), z0, z0+H(ALTO_CARPORT-0.32), true);
      prisma(quad(alc[1],alc[2],alc[1]+e,alc[2]+7.0,"muro"), z0+H(0.4), z0+H(ALTO_BAJO-0.25), true);
      cerrar([0.55,0.38,0.22,1.0]);
    })();

    /* --- 6. patio, deck y piscina --- */
    (function(){
      const pa=BLOQUES.find(x=>x[0]==="patio");
      prisma(quad(pa[1],pa[2],pa[3],pa[4],"patio"), z0-H(0.05), z0+H(0.02), true);
      cerrar([0.72,0.66,0.55,1.0]);
    })();

    /* --- 7. el nivel −1, enterrado contra la ladera --- */
    if(dosNiveles){
      BLOQUES.forEach(([nom,u0,v0,u1,v1,h,cls])=>{
        if(cls!=="muro" || nom==="acceso") return;
        prisma(quad(u0,v0,u1,v1,cls), zb, z0, false);
      });
      cerrar([0.44,0.36,0.26,1.0]);
    }
    } /* fin de la Casa 30JB */

    /* la malla se rehace si el banqueo cambió */
    const banqAhora = BANQ ? BANQ.z+'|'+BANQ.poly[0][0].toFixed(1)+','+BANQ.poly[0][1].toFixed(1) : '';
    if(banqAhora!==banqAntes) rehacerMalla();

    /* --- 8. la sombra sobre el terreno --- */
    const alt=SOLPOS?SOLPOS.alt:60, azm=SOLPOS?SOLPOS.az:120;
    /* con casa de IA la sombra sale de SUS bloques y de su altura mayor */
    const BL_SOMBRA = CI ? CI.bloques.filter(b=>b.clase==="muro"||b.clase==="porche")
                               .map(b=>[b.nombre,b.u0,b.v0,b.u1,b.v1,b.alto||3.4,b.clase])
                         : BLOQUES;
    const ALT_SOMBRA = CI ? Math.max(3.4, ...CI.bloques.filter(b=>b.clase==="muro")
                               .map(b=>(b.nivel===2?3.4:0)+(b.alto||3.4))) : ALTURA_CASA;
    if(alt>2){
      const Lp=ALT_SOMBRA/Math.tan(alt*Math.PI/180);
      if(Lp<300){
        const A2=azm*Math.PI/180, dx=-Lp*Math.sin(A2), dy=Lp*Math.cos(A2);
        const base=[];
        BL_SOMBRA.forEach(([nom,u0,v0,u1,v1,h,cls])=>{
          if(cls!=="muro"&&cls!=="porche") return;
          quad(u0,v0,u1,v1,cls).forEach(q=>base.push(q));
        });
        const casco=convexo(base.concat(base.map(q=>[q[0]+dx,q[1]+dy])));
        const V2=[],N2=[],I2=[];
        casco.forEach(q=>{ const hh=alturaEn(q[0],q[1]);
          V2.push(q[0]-CX, -(q[1]-CY), ((isNaN(hh)?K.z:hh)-ZMID)*ve+0.35); N2.push(0,0,1); });
        for(let i=1;i<casco.length-1;i++) I2.push(0,i,i+1);
        if(I2.length) somB=subir(V2,N2,I2);
      }
    }
  }
  /* ---------- la casa en bancales ----------
     Mismo lenguaje que el volumen de una sola plataforma: un prisma de tierra
     por bancal —su plataforma y el muro que la sostiene—, encima el cuerpo de
     la casa y su parapeto, y la sombra proyectada sobre el terreno real. Las
     cotas de piso (npt) salen del MDT bancal por bancal; no se promedian. */
  function malloTerraza(K){
    const o=K.o, ux=K.ux, uv=K.uv;
    const XY=(u,v)=>[o[0]+ux[0]*u+uv[0]*v, o[1]+ux[1]*u+uv[1]*v];
    const Zp=z=>(z-ZMID)*ve, H=m=>m*ve;
    const V=[],N=[],I=[];
    const mete=(x,y,z,nx,ny,nz)=>{V.push(x-CX,-(y-CY),z);N.push(nx,ny,nz);return V.length/3-1;};
    function prisma(qd,za,zc,tapa){
      const arr=qd.map(p=>mete(p[0],p[1],zc,0,0,1));
      if(tapa!==false) for(let i=1;i<arr.length-1;i++) I.push(arr[0],arr[i],arr[i+1]);
      for(let i=0;i<qd.length;i++){
        const a=qd[i], b=qd[(i+1)%qd.length];
        const dx=b[0]-a[0], dy=-(b[1]-a[1]), L=Math.hypot(dx,dy)||1;
        const nx=dy/L, ny=-dx/L;
        const p1=mete(a[0],a[1],za,nx,ny,0), p2=mete(b[0],b[1],za,nx,ny,0);
        const p3=mete(b[0],b[1],zc,nx,ny,0), p4=mete(a[0],a[1],zc,nx,ny,0);
        I.push(p1,p2,p3, p1,p3,p4);
      }
    }
    const reset=()=>{V.length=0;N.length=0;I.length=0;};
    const cerrar=c=>{ if(I.length) piezas.push({b:subir(V.slice(),N.slice(),I.slice()),c:c}); reset(); };
    const quad=(u0,v0,u1,v1)=>[XY(u0,v0),XY(u1,v0),XY(u1,v1),XY(u0,v1)];

    const niv = K.niveles||[];
    if(!niv.length) return;
    const alto = K.alto || 3.0, PAR = 0.35;

    /* 1. los bancales: plataforma y muro de contención hasta el terreno */
    niv.forEach(nv=>{
      let zmin=1e9;
      for(let u=nv.u0; u<=nv.u1+1e-6; u+=1.0)
        for(let v=0; v<=K.A+1e-6; v+=1.0){
          const p=XY(u,v), hh=alturaEn(p[0],p[1]);
          if(!isNaN(hh)) zmin=Math.min(zmin,(hh-ZMID)*ve);
        }
      const top=Zp(nv.npt);
      if(!isFinite(zmin)) zmin=top-H(1.5);
      prisma(quad(nv.u0,0,nv.u1,K.A), Math.min(zmin-0.45, top-H(0.40)), top-H(0.12), true);
    });
    cerrar([0.66,0.58,0.45,1.0]);

    /* 2. el cuerpo de cada bancal */
    niv.forEach(nv=>{
      const top=Zp(nv.npt);
      prisma(quad(nv.u0,0,nv.u1,K.A), top-H(0.12), top+H(alto), true);
    });
    cerrar([0.93,0.90,0.83,1.0]);

    /* 3. el parapeto de la cubierta plana de cada nivel */
    niv.forEach(nv=>{
      const top=Zp(nv.npt)+H(alto), e=0.30;
      [[nv.u0,0,nv.u1,e],[nv.u0,K.A-e,nv.u1,K.A],
       [nv.u0,0,nv.u0+e,K.A],[nv.u1-e,0,nv.u1,K.A]].forEach(q=>
        prisma(quad(q[0],q[1],q[2],q[3]), top, top+H(PAR), true));
    });
    cerrar([0.97,0.95,0.90,1.0]);

    /* 4. la sombra sobre el terreno */
    const altS=SOLPOS?SOLPOS.alt:60, azm=SOLPOS?SOLPOS.az:120;
    if(altS>2){
      const Lp=(alto+PAR)/Math.tan(altS*Math.PI/180);
      if(Lp<300){
        const A2=azm*Math.PI/180, dx=-Lp*Math.sin(A2), dy=Lp*Math.cos(A2);
        const base=quad(0,0,K.L,K.A);
        const casco=convexo(base.concat(base.map(q=>[q[0]+dx,q[1]+dy])));
        const V2=[],N2=[],I2=[];
        casco.forEach(q=>{ const hh=alturaEn(q[0],q[1]);
          V2.push(q[0]-CX, -(q[1]-CY), ((isNaN(hh)?K.z:hh)-ZMID)*ve+0.35); N2.push(0,0,1); });
        for(let i=1;i<casco.length-1;i++) I2.push(0,i,i+1);
        if(I2.length) somB=subir(V2,N2,I2);
      }
    }
  }

  function convexo(ps){
    const p=ps.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
    const lo=[],hi=[];
    for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
    for(let i=p.length-1;i>=0;i--){const q=p[i];
      while(hi.length>=2&&cr(hi[hi.length-2],hi[hi.length-1],q)<=0)hi.pop();hi.push(q);}
    lo.pop();hi.pop();return lo.concat(hi);
  }
  function subir(V,N,I){
    const b={v:gl.createBuffer(),n:gl.createBuffer(),i:gl.createBuffer(),c:I.length};
    gl.bindBuffer(gl.ARRAY_BUFFER,b.v);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(V),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(N),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.i);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(I),gl.STATIC_DRAW);
    return b;
  }
  function pintarSolido(b,M,color){
    if(!b)return;
    gl.useProgram(progS);
    const ap=gl.getAttribLocation(progS,"p"), an=gl.getAttribLocation(progS,"nn");
    gl.bindBuffer(gl.ARRAY_BUFFER,b.v);gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(gl.getUniformLocation(progS,"M"),false,M);
    gl.uniform4f(gl.getUniformLocation(progS,"C"),color[0],color[1],color[2],color[3]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.i);
    gl.drawElements(gl.TRIANGLES,b.c,gl.UNSIGNED_SHORT,0);
  }
  let SOLPOS=null;


  /* ---------- bóveda solar sobre el lote ---------- */
  const RADIO_DOMO = 78;                 /* metros: la bóveda encierra la casa con holgura */
  function centroCasa(){
    const A=(typeof IMPL!=="undefined")?IMPL[String(loteCasa)]:null;
    if(!A) return null;
    /* en los lotes de bancales el centro sale de la implantación en terrazas */
    const B = (A.k && A.k.o) ? A.k
            : ((typeof window.__IMPLANTAR_TERRAZA==="function")
                 ? window.__IMPLANTAR_TERRAZA(+loteCasa) : null);
    if(!B||!B.g) return null;
    const g=B.g.slice(0,-1);
    const cx=g.reduce((a,p)=>a+p[0],0)/g.length, cy=g.reduce((a,p)=>a+p[1],0)/g.length;
    return {x:cx-CX, y:-(cy-CY), z:(B.z-ZMID)*ve, cota:B.z};
  }
  const puntoCielo=(c,alt,az,R)=>{
    const A=alt*Math.PI/180, Z=az*Math.PI/180;
    return [c.x + R*Math.cos(A)*Math.sin(Z), c.y + R*Math.cos(A)*Math.cos(Z), c.z + R*Math.sin(A)];
  };
  function tiraLineas(V){
    const b={v:gl.createBuffer(),n:V.length/3};
    gl.bindBuffer(gl.ARRAY_BUFFER,b.v);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(V),gl.STATIC_DRAW);
    return b;
  }
  function pintarLineas(b,M,color,modo,tam){
    if(!b)return;
    gl.useProgram(progL);
    const ap=gl.getAttribLocation(progL,"p");
    gl.bindBuffer(gl.ARRAY_BUFFER,b.v);
    gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(gl.getUniformLocation(progL,"M"),false,M);
    gl.uniform4f(gl.getUniformLocation(progL,"C"),color[0],color[1],color[2],color[3]);
    gl.uniform1f(gl.getUniformLocation(progL,"SZ"),tam||1);
    gl.uniform1f(gl.getUniformLocation(progL,"RED"),modo===gl.POINTS?1:0);
    gl.drawArrays(modo,0,b.n);
  }
  function mallaSolar(){
    arcosB=marcasB=rayoB=solB=baseB=null;
    Object.values(etiqSol).forEach(e=>e.el.remove());
    for(const k in etiqSol) delete etiqSol[k];
    if(!domo||!listo||!gl) return;
    const c=centroCasa(); if(!c) return;
    const R=RADIO_DOMO;
    /* los tres recorridos, uno detrás de otro con un corte entre ellos */
    const arcos=[];
    HITOS.forEach(h=>{
      const pts=h.recorrido.filter(p=>p.alt>0);
      for(let i=0;i<pts.length-1;i++){
        const a=puntoCielo(c,pts[i].alt,pts[i].az,R), b=puntoCielo(c,pts[i+1].alt,pts[i+1].az,R);
        arcos.push(a[0],a[1],a[2], b[0],b[1],b[2]);
      }
    });
    arcosB=tiraLineas(arcos);
    /* marcas de hora sobre el recorrido de la fecha elegida */
    const f=SOL.FECHAS[fechaSol]||SOL.FECHAS[1];
    const marcas=[];
    for(let hh=6;hh<=18;hh++){
      const p=SOL.posicion(ANIO,f.m,f.d,hh,lat0,lon0);
      if(p.alt<=1) continue;
      const q=puntoCielo(c,p.alt,p.az,R);
      marcas.push(q[0],q[1],q[2]);
      const d=document.createElement("div");
      d.className="rotulo3d hora";
      d.textContent=(hh>12?hh-12:hh)+(hh<12?"a":"p");
      capa.appendChild(d); etiqSol["h"+hh]={el:d, p:q};
    }
    marcasB=tiraLineas(marcas);
    /* el sol de la hora elegida, su rayo y la vertical al terreno */
    const ps=SOL.posicion(ANIO,f.m,f.d,horaSol,lat0,lon0);
    if(ps.alt>0){
      const q=puntoCielo(c,ps.alt,ps.az,R);
      solB=tiraLineas([q[0],q[1],q[2]]);
      rayoB=tiraLineas([q[0],q[1],q[2], c.x,c.y,c.z+2]);
      const pie=[c.x+R*Math.cos(ps.alt*Math.PI/180)*Math.sin(ps.az*Math.PI/180),
                 c.y+R*Math.cos(ps.alt*Math.PI/180)*Math.cos(ps.az*Math.PI/180), c.z];
      baseB=tiraLineas([q[0],q[1],q[2], pie[0],pie[1],pie[2],
                        pie[0],pie[1],pie[2], c.x,c.y,c.z]);
    }
  }
  let fechaSol=1, horaSol=9;

  /* ---------- matrices ---------- */
  const mul=(a,b)=>{const o=new Float32Array(16);
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s;}return o;};
  function persp(f,asp,n,fa){const t=1/Math.tan(f/2),o=new Float32Array(16);
    o[0]=t/asp;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o;}
  function mirar(e,c,u){
    const z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z[0]/=l;z[1]/=l;z[2]/=l;
    let X=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...X)||1;X=X.map(v=>v/l);
    const Y=[z[1]*X[2]-z[2]*X[1],z[2]*X[0]-z[0]*X[2],z[0]*X[1]-z[1]*X[0]];
    return new Float32Array([X[0],Y[0],z[0],0, X[1],Y[1],z[1],0, X[2],Y[2],z[2],0,
      -(X[0]*e[0]+X[1]*e[1]+X[2]*e[2]), -(Y[0]*e[0]+Y[1]*e[1]+Y[2]*e[2]), -(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]), 1]);
  }
  const zFoco=()=> cotaFoco==null ? 0 : (cotaFoco-ZMID)*ve;
  const ojo=()=>[panX+dist*Math.cos(elv)*Math.sin(az), panY+dist*Math.cos(elv)*Math.cos(az), zFoco()+dist*Math.sin(elv)];
  const foco=()=>[panX,panY,zFoco()];

  /* ---------- WebGL ---------- */
  const VS=`attribute vec3 p;attribute vec2 uv;attribute vec2 sl;
uniform mat4 M;uniform float VE;varying vec2 vUv;varying vec3 vN;
void main(){vec3 q=vec3(p.x,p.y,p.z*VE);vUv=uv;
vN=normalize(vec3(-sl.x*VE,-sl.y*VE,1.0));gl_Position=M*vec4(q,1.0);}`;
  const FS=`precision mediump float;varying vec2 vUv;varying vec3 vN;
uniform sampler2D T;uniform vec3 L;uniform vec3 CIELO;
void main(){vec4 c=texture2D(T,vUv);
float d=max(dot(normalize(vN),normalize(L)),0.0);
float amb=0.46+0.54*d;
vec3 col=c.rgb*amb+CIELO*0.05*(1.0-d);
gl_FragColor=vec4(col,1.0);}`;
  const VS3=`attribute vec3 p;uniform mat4 M;uniform float SZ;
void main(){gl_Position=M*vec4(p,1.0);gl_PointSize=SZ;}`;
  const FS3=`precision mediump float;uniform vec4 C;uniform float RED;
void main(){
  if(RED>0.5){ vec2 d=gl_PointCoord-vec2(0.5); if(dot(d,d)>0.25) discard; }
  gl_FragColor=C;}`;
  const VS2=`attribute vec3 p;attribute vec3 nn;uniform mat4 M;uniform float VE;
varying float sh;void main(){vec3 q=vec3(p.x,p.y,p.z);
sh=0.42+0.58*max(dot(normalize(nn),normalize(vec3(-0.42,0.46,0.78))),0.0);
gl_Position=M*vec4(q,1.0);}`;
  const FS2=`precision mediump float;varying float sh;uniform vec4 C;
void main(){gl_FragColor=vec4(C.rgb*sh,C.a);}`;
  function compilar(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;}

  function iniciar(){
    if(listo)return true;
    gl=cv.getContext("webgl",{antialias:true,alpha:true})||cv.getContext("experimental-webgl");
    if(!gl)return false;
    decodificar();
    const m=malla();
    prog=gl.createProgram();
    gl.attachShader(prog,compilar(gl.VERTEX_SHADER,VS));
    gl.attachShader(prog,compilar(gl.FRAGMENT_SHADER,FS));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const inter=entrelazar(m);
    vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,inter,gl.STATIC_DRAW);
    const st=7*4;
    const ap=gl.getAttribLocation(prog,"p"),au=gl.getAttribLocation(prog,"uv"),as=gl.getAttribLocation(prog,"sl");
    gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,st,0);
    gl.enableVertexAttribArray(au);gl.vertexAttribPointer(au,2,gl.FLOAT,false,st,12);
    gl.enableVertexAttribArray(as);gl.vertexAttribPointer(as,2,gl.FLOAT,false,st,20);
    ibo=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.idx,gl.STATIC_DRAW); nIdx=m.idx.length;
    tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    progL=gl.createProgram();
    gl.attachShader(progL,compilar(gl.VERTEX_SHADER,VS3));
    gl.attachShader(progL,compilar(gl.FRAGMENT_SHADER,FS3));
    gl.linkProgram(progL);
    if(!gl.getProgramParameter(progL,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(progL));
    progS=gl.createProgram();
    gl.attachShader(progS,compilar(gl.VERTEX_SHADER,VS2));
    gl.attachShader(progS,compilar(gl.FRAGMENT_SHADER,FS2));
    gl.linkProgram(progS);
    if(!gl.getProgramParameter(progS,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(progS));
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    listo=true; dibujarTextura(); crearGlobos();
    return true;
  }

  function dimensionar(){
    const r=cv.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(r.width*dpr)), h=Math.max(1,Math.round(r.height*dpr));
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
    return [w,h];
  }
  /* ---------- el lote no queda debajo de la ficha ----------
     El punto de mira (el centro de la casa del lote escogido) se lleva al centro
     de la franja de pantalla que la ficha deja libre: arriba de la hoja en el
     celular, a la izquierda del panel en pantalla ancha. Se hace corriendo la
     imagen en la proyección —no moviendo la cámara—, así que la perspectiva
     es la misma y el toque sobre un lote se corrige con el mismo corrimiento. */
  let OFF=[0,0];
  function desfaseVista(){
    const f=document.getElementById("ficha");
    if(!f || !f.classList.contains("on")) return [0,0];
    const r=cv.getBoundingClientRect(), rf=f.getBoundingClientRect();
    if(!r.width||!r.height) return [0,0];
    if(innerWidth<=900){
      if(rf.top >= r.bottom-8) return [0,0];
      const alto=r.top+8, bajo=Math.max(alto+60, rf.top-8);
      const c=(alto+bajo)/2;
      return [0, Math.max(-0.9, Math.min(0.9, 1-2*(c-r.top)/r.height))];
    }
    if(rf.left <= r.left+40) return [0,0];
    const c=(r.left+rf.left-10)/2;
    return [Math.max(-0.9, Math.min(0.9, 2*(c-r.left)/r.width-1)), 0];
  }
  function corrimiento(o){ const m=new Float32Array(16); m[0]=m[5]=m[10]=m[15]=1; m[12]=o[0]; m[13]=o[1]; return m; }
  /* la hoja cambia de alto (arrastre, transición): se vuelve a pintar */
  (function(){
    const f=document.getElementById("ficha"); if(!f) return;
    try{ new ResizeObserver(()=>{ if(activo) pedir(); }).observe(f); }catch(e){}
    try{ new MutationObserver(()=>{ if(activo) pedir(); }).observe(f,{attributes:true,attributeFilter:["class","style"]}); }catch(e){}
  })();
  function pintar3d(){
    if(!listo||!activo)return;
    if(texDirty)dibujarTextura();
    const [w,h]=dimensionar();
    gl.viewport(0,0,w,h);
    gl.clearColor(0,0,0,0);   /* transparente: se ve el fondo del plano, claro u oscuro */
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    OFF=desfaseVista();
    const M=mul(corrimiento(OFF), mul(persp(0.85,w/h,5,6000),mirar(ojo(),foco(),[0,0,1])));
    gl.uniformMatrix4fv(gl.getUniformLocation(prog,"M"),false,M);
    gl.uniform1f(gl.getUniformLocation(prog,"VE"),ve);
    gl.uniform3f(gl.getUniformLocation(prog,"L"),LUZ[0],LUZ[1],LUZ[2]);
    gl.uniform3f(gl.getUniformLocation(prog,"CIELO"),0.62,0.70,0.80);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.uniform1i(gl.getUniformLocation(prog,"T"),0);
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    { const st3=7*4;
      const a1=gl.getAttribLocation(prog,"p"),a2=gl.getAttribLocation(prog,"uv"),a3=gl.getAttribLocation(prog,"sl");
      gl.enableVertexAttribArray(a1);gl.vertexAttribPointer(a1,3,gl.FLOAT,false,st3,0);
      gl.enableVertexAttribArray(a2);gl.vertexAttribPointer(a2,2,gl.FLOAT,false,st3,12);
      gl.enableVertexAttribArray(a3);gl.vertexAttribPointer(a3,2,gl.FLOAT,false,st3,20); }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    gl.drawElements(gl.TRIANGLES,nIdx,gl.UNSIGNED_SHORT,0);
    { const osc = document.documentElement.dataset.theme==="dark" ||
        (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
      if(!faldaB || faldaVE!==ve || faldaOsc!==osc || faldaSucia) { construirFalda(osc); faldaSucia=false; }
      pintarSolido(faldaB,M, osc?[0.30,0.26,0.21,1]:[0.60,0.51,0.40,1]); }
    pintarSolido(somB,M,[0.10,0.12,0.09,0.34]);
    piezas.forEach(p=>pintarSolido(p.b,M,p.c));    /* la Casa 30JB, pieza por pieza */
    if(domo){
      pintarLineas(baseB,M,[0.61,0.48,0.28,0.55],gl.LINES,1);
      pintarLineas(arcosB,M,[0.86,0.66,0.24,0.95],gl.LINES,1);
      pintarLineas(marcasB,M,[0.72,0.54,0.18,1.0],gl.POINTS,7);
      pintarLineas(rayoB,M,[0.95,0.76,0.25,0.9],gl.LINES,1);
      pintarLineas(solB,M,[1.0,0.84,0.35,0.30],gl.POINTS,42);
      pintarLineas(solB,M,[1.0,0.79,0.20,1.0],gl.POINTS,20);
    }
    /* el atributo de la malla del terreno se reengancha para el siguiente cuadro */
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    const st2=7*4;
    const ap2=gl.getAttribLocation(prog,"p"),au2=gl.getAttribLocation(prog,"uv"),as2=gl.getAttribLocation(prog,"sl");
    gl.enableVertexAttribArray(ap2);gl.vertexAttribPointer(ap2,3,gl.FLOAT,false,st2,0);
    gl.enableVertexAttribArray(au2);gl.vertexAttribPointer(au2,2,gl.FLOAT,false,st2,12);
    gl.enableVertexAttribArray(as2);gl.vertexAttribPointer(as2,2,gl.FLOAT,false,st2,20);
    ubicarGlobos(M,w,h);
    if(domo){
      const r=cv.getBoundingClientRect();
      for(const k in etiqSol){
        const e=etiqSol[k], q=proyectar(M,e.p[0],e.p[1],e.p[2]);
        if(!q){ e.el.style.display="none"; continue; }
        const sx=(q[0]*0.5+0.5)*r.width, sy=(1-(q[1]*0.5+0.5))*r.height;
        if(sx<-30||sy<-20||sx>r.width+30||sy>r.height+20){ e.el.style.display="none"; continue; }
        e.el.style.display=""; e.el.style.left=sx.toFixed(1)+"px"; e.el.style.top=sy.toFixed(1)+"px";
      }
    }
  }
  const pedir=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;pintar3d();});};

  /* ---------- selección por rayo ---------- */
  function loteEn(px,py){
    const r=cv.getBoundingClientRect();
    const ndcx=((px-r.left)/r.width)*2-1-OFF[0], ndcy=1-((py-r.top)/r.height)*2-OFF[1];
    const e=ojo(), f=foco();
    const fw=[f[0]-e[0],f[1]-e[1],f[2]-e[2]]; let l=Math.hypot(...fw); const F=fw.map(v=>v/l);
    // derecha = normalize(cross(F,[0,0,1])) ; arriba = cross(derecha,F)
    let D=[F[1]*1-F[2]*0, F[2]*0-F[0]*1, 0]; l=Math.hypot(...D)||1; D=D.map(v=>v/l);
    const U=[D[1]*F[2]-D[2]*F[1], D[2]*F[0]-D[0]*F[2], D[0]*F[1]-D[1]*F[0]];
    const asp=r.width/r.height, t=Math.tan(0.85/2);
    let d=[F[0]+D[0]*ndcx*t*asp+U[0]*ndcy*t,
           F[1]+D[1]*ndcx*t*asp+U[1]*ndcy*t,
           F[2]+D[2]*ndcx*t*asp+U[2]*ndcy*t];
    l=Math.hypot(...d); d=d.map(v=>v/l);
    let tt=0;
    for(let i=0;i<1400;i++){
      tt+=2.5;
      const X=e[0]+d[0]*tt, Y=e[1]+d[1]*tt, Z=e[2]+d[2]*tt;
      if(tt>5000)break;
      const wx=X+CX, wy=CY-Y;
      const hh=alturaEn(wx,wy);
      if(isNaN(hh))continue;
      const zt=(hh-ZMID)*ve;
      if(Z<=zt){
        const lon=lon0+wx/KX, lat=lat0-wy/KY;
        const L=DATA.lotes.find(o=>dentro([lon,lat],o.g));
        return L?L.n:null;
      }
    }
    return null;
  }

  /* ---------- interacción ---------- */
  const pts=new Map(); let arr=null, pin=null, movido=false;
  cv.addEventListener("pointerdown",e=>{
    cv.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    movido=false;
    if(pts.size===2){const[a,b]=[...pts.values()];pin={d:Math.hypot(a.x-b.x,a.y-b.y),dist};arr=null;}
    else arr={x:e.clientX,y:e.clientY,az,elv,pan:(modoMano ? !e.shiftKey : (e.shiftKey||e.button===2)),px:panX,py:panY};
  });
  cv.addEventListener("pointermove",e=>{
    if(!pts.has(e.pointerId))return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pin&&pts.size===2){
      const[a,b]=[...pts.values()];const nd=Math.hypot(a.x-b.x,a.y-b.y);
      if(pin.d>4){dist=Math.max(DIST_MIN,Math.min(3200,pin.dist*pin.d/nd));pedir();}
      movido=true; return;
    }
    if(!arr)return;
    const dx=e.clientX-arr.x, dy=e.clientY-arr.y;
    if(Math.abs(dx)+Math.abs(dy)>4)movido=true;
    if(arr.pan){
      const k=dist/900;
      panX=arr.px-(dx*Math.cos(az)-dy*Math.sin(az))*k;
      panY=arr.py+(dx*Math.sin(az)+dy*Math.cos(az))*k;
    }else{
      az=arr.az-dx*0.006;
      elv=Math.max(0.12,Math.min(1.45,arr.elv+dy*0.005));
    }
    pedir();
  });
  ["pointerup","pointercancel"].forEach(t=>cv.addEventListener(t,e=>{
    const era=pts.size; pts.delete(e.pointerId); if(pts.size<2)pin=null;
    if(era===1&&!movido){const n=loteEn(e.clientX,e.clientY); if(n!=null)select(n); else select(null);}
    arr=null;
  }));
  cv.addEventListener("wheel",e=>{e.preventDefault();
    dist=Math.max(DIST_MIN,Math.min(3200,dist*(e.deltaY>0?1.12:0.9)));pedir();},{passive:false});
  cv.addEventListener("contextmenu",e=>e.preventDefault());

  addEventListener("resize",()=>{if(activo)pedir();});

  return {
    activar(v){
      activo=v;
      if(v&&!listo){ if(!iniciar()){activo=false;return false;} }
      cv.hidden=!v; capa.hidden=!v; svg.style.visibility=v?"hidden":"";
      { const st=document.querySelector(".stage")||document.querySelector("main");
        if(st) st.classList.toggle("en3d",v); }
      if(v){texDirty=true;this.encuadrar();}
      return true;
    },
    activo:()=>activo,
    mano(v){ modoMano = !!v; cv.style.cursor = modoMano ? "grab" : "move"; return modoMano; },
    haciaMano:()=>modoMano,
    refrescar(){ texDirty=true; if(activo){malloSolido();pedir();} },
    exagerar(v){ if(domo)return false; ve=v; malloSolido(); pedir(); return true; },
    casa(n,f,h){ loteCasa=n; if(f!=null)this.sol(f,h); else {malloSolido(); if(domo)mallaSolar(); pedir();} },
    irA(n,ancho){
      const L=DATA.lotes.find(x=>x.n===n); if(!L)return;
      const c=PX(L.c);
      panX=c[0]-CX; panY=-(c[1]-CY);
      { const z=alturaEn(c[0],c[1]); cotaFoco = isNaN(z) ? null : z; }
      if(ancho||domo){ dist=RADIO_DOMO*3.0; elv=0.30; }   /* que quepa la bóveda entera */
      else { dist=185; elv=0.44; }
      pedir();
    },
    quitarCasa(){ loteCasa=null; malloSolido(); if(domo)mallaSolar(); pedir(); },
    /* encuadre sobre la casa (centro de la envolvente), para el render */
    enfocarCasa(n,d,e){
      const A=(typeof IMPL!=="undefined")?IMPL[String(n)]:null; const K=A&&A.k; if(!K||!K.o) return false;
      const L=K.L, D=K.Dc||K.A||28.4;
      const c=[K.o[0]+K.ux[0]*L/2+K.uv[0]*D/2, K.o[1]+K.ux[1]*L/2+K.uv[1]*D/2];
      panX=c[0]-CX; panY=-(c[1]-CY);
      { const z=alturaEn(c[0],c[1]); cotaFoco = isNaN(z) ? (K.z!=null?K.z:null) : z; }
      dist=d||70; elv=(e!=null)?e:0.40;
      /* que la cámara mire desde la vía hacia el fondo: azimut según el eje v */
      az=Math.atan2(-K.uv[1], K.uv[0]) + Math.PI;
      pedir(); return true;
    },
    /* captura del lienzo para el render: se pinta de forma sincrónica y se
       compone sobre un cielo claro (el lienzo es transparente) */
    capturar(maxW){
      if(!listo||!activo) return null;
      pintar3d();
      const W=Math.min(maxW||1536, cv.width), H=Math.round(cv.height*W/cv.width);
      const c2=document.createElement("canvas"); c2.width=W; c2.height=H;
      const x=c2.getContext("2d");
      const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#DCE9F2"); g.addColorStop(0.55,"#EEF2EA"); g.addColorStop(1,"#E4E8DC");
      x.fillStyle=g; x.fillRect(0,0,W,H);
      x.drawImage(cv,0,0,W,H);
      return c2.toDataURL("image/jpeg",0.9);
    },
    camara(d,e,a){ if(d)dist=d; if(e!=null)elv=e; if(a!=null)az=a; pedir(); },
    /* centrar la cámara en un punto [lon,lat] (p. ej. la portería) */
    enfocar(ll,d,e,a){ const c=PX(ll); panX=c[0]-CX; panY=-(c[1]-CY); if(d)dist=d; if(e!=null)elv=e; if(a!=null)az=a; pedir(); return true; },
    domoSolar(v){
      domo=v;
      if(v){ ve=1; mallaSolar(); }                 /* a escala real: si no, los ángulos mienten */
      else { Object.values(etiqSol).forEach(e=>e.el.remove());
             for(const k in etiqSol) delete etiqSol[k];
             arcosB=marcasB=rayoB=solB=baseB=null; }
      malloSolido(); pedir();
      return domo;
    },
    haciaDomo:()=>domo,
    sol(f,h){
      if(typeof SOL==="undefined"){ malloSolido(); pedir(); return; }
      if(f!=null)fechaSol=f; if(h!=null)horaSol=h;
      const F=SOL.FECHAS[f]||SOL.FECHAS[1];
      SOLPOS=SOL.posicion(ANIO,F.m,F.d,h,lat0,lon0);
      if(SOLPOS.alt>3){
        const A=SOLPOS.alt*Math.PI/180, Z=SOLPOS.az*Math.PI/180;
        LUZ=[Math.cos(A)*Math.sin(Z), Math.cos(A)*Math.cos(Z), Math.sin(A)];
      } else LUZ=[-0.42,0.46,0.78];
      malloSolido(); if(domo) mallaSolar(); pedir();
    },
    ve:()=>ve,
    encuadrar(){
      az=-0.62; elv=0.50; panX=0; panY=0; cotaFoco=null;
      const r=cv.getBoundingClientRect(); if(!r.width){dist=1050;pedir();return;}
      const reserva = el => {
        if(!el) return 16;
        const g = getComputedStyle(el);
        if(g.display==="none" || g.visibility==="hidden" || +g.opacity===0) return 16;
        const c = el.getBoundingClientRect();
        if(!c.width || !c.height) return 16;
        if(c.width > r.width*0.6) return 16;      /* hoja inferior: no quita ancho */
        if(c.bottom < r.top+10 || c.top > r.bottom-10) return 16;   /* fuera de cuadro */
        return Math.min(c.width+28, r.width*0.4);
      };
      const izq = reserva(document.getElementById("rail"));
      const der = reserva(document.querySelector(".panel, .ficha.on"));
      const availW=Math.max(r.width-izq-der,180), availH=Math.max(r.height-90,180);
      const RAD=Math.hypot(ANCHO,ALTO)/2, fov=0.85, asp=r.width/r.height;
      const dV=RAD/Math.tan(fov/2)*(r.height/availH);
      const dH=RAD/(Math.tan(fov/2)*asp)*(r.width/availW);
      dist=Math.max(260,Math.min(3200,Math.max(dV,dH)*0.82));
      /* correr el modelo hacia el hueco libre entre el panel lateral y la ficha */
      const centroLibre=(izq+(r.width-der))/2;
      const off=(centroLibre-r.width/2)/r.width;
      const mundoW=2*dist*Math.tan(fov/2)*asp;
      const desp=-off*mundoW;
      const D=[-Math.cos(az),Math.sin(az)];
      panX=D[0]*desp; panY=D[1]*desp;
      pedir();
    }
  };
})();

window.__R3D = R3D;

/* ---- enganche del 3D con el resto del mapa ---- */
const b   = document.getElementById("b3d");
const ctl = document.getElementById("ve3d");
if(b && ctl){
  b.onclick = ()=>{
    const nuevo = !R3D.activo();
    if(!R3D.activar(nuevo)){
      try{ avisar("Este dispositivo no puede mostrar el relieve 3D."); }catch(e){}
      return; }
    b.classList.toggle("on3d", nuevo);
    ctl.hidden = !nuevo;
    b.title = nuevo ? "Volver al mapa" : "Ver el terreno en relieve";
    /* los mandos del mapa plano no sirven dentro del 3D */
    ["giro","pistaNav"].forEach(id=>{ const e=document.getElementById(id);
      if(e) e.style.display = nuevo ? "none" : ""; });
    if(nuevo) try{ avisar("Arrastre para girar, rueda para acercar, toque un lote para ver su ficha."); }catch(e){}
  };
  /* el interruptor de mano, en la misma barra del relieve */
  const bMano = document.getElementById("ve3dMano");
  if(bMano) bMano.onclick = ()=>{
    const on = R3D.mano(!R3D.haciaMano());
    bMano.classList.toggle("on", on);
    bMano.title = on ? "Arrastre: mover · Mayús+arrastre: girar"
                     : "Arrastre: girar · Mayús+arrastre: mover";
    try{ avisar(on ? "Arrastre para mover el modelo. Con Mayús, gira."
                   : "Arrastre para girar. Con Mayús, mueve."); }catch(e){}
  };

  const fit = document.getElementById("ve3dFit");
  if(fit) fit.onclick = ()=>R3D.encuadrar();
  const bSol = document.getElementById("ve3dSol");
  if(bSol) bSol.onclick = ()=>{
    if(state.sel==null){ try{ avisar("Escoja primero un lote."); }catch(e){} return; }
    const on = R3D.domoSolar(!R3D.haciaDomo());
    bSol.classList.toggle("on", on);
    ctl.querySelectorAll("[data-ve]").forEach(y=>
      y.classList.toggle("on", on ? y.dataset.ve==="1" : y.dataset.ve==="2"));
    if(on){ R3D.irA(state.sel,true);
      try{ avisar("Recorridos del sol en solsticios y equinoccio, a escala real."); }catch(e){} }
  };
  ctl.querySelectorAll("[data-ve]").forEach(x=>{
    x.onclick = ()=>{
      if(!R3D.exagerar(+x.dataset.ve)){
        try{ avisar("Con la bóveda solar la escala se mantiene real."); }catch(e){}
        return; }
      ctl.querySelectorAll("[data-ve]").forEach(y=>y.classList.toggle("on", y===x));
    };
  });
  /* Los rótulos de lote van en su propia capa, no dentro del lienzo: la rueda
     del ratón encima de un número se perdía y no acercaba. Se reenvía al
     lienzo para que la rueda funcione en toda la pantalla. */
  const capaRot = document.getElementById("capa3d");
  const lienzo  = document.getElementById("c3d");
  if(capaRot && lienzo) capaRot.addEventListener("wheel", e=>{
    e.preventDefault();
    lienzo.dispatchEvent(new WheelEvent("wheel", {deltaY:e.deltaY, deltaX:e.deltaX,
      clientX:e.clientX, clientY:e.clientY, cancelable:true}));
  }, {passive:false});

  /* El volumen de la casa sigue al lote escogido, igual que en el plano vivo.
     pintarFicha() se llama también en cada refrescar(), así que sólo se
     reconstruye cuando de verdad cambia el lote: rehacer la malla en cada
     repintado costaría un segundo por nada. */
  let loteEnPie = null;
  if(typeof window.pintarFicha==="function"){
    const prev = window.pintarFicha;
    window.pintarFicha = function(n){
      const r = prev.apply(this, arguments);
      if(n!==loteEnPie){ loteEnPie=n;
        if(R3D.activo()){ R3D.casa(n,null,null);
          /* la cámara va a la casa de ese lote, mirando desde la vía; la ficha
             deja libre la franja de arriba y ahí queda (desfaseVista) */
          if(n!=null && !R3D.enfocarCasa(n, innerWidth<=900?135:110, 0.50)) R3D.irA(n); } }
      else if(R3D.activo()) R3D.refrescar();
      return r;
    };
  }
  if(typeof window.cerrarFicha==="function"){
    const prev = window.cerrarFicha;
    window.cerrarFicha = function(){ const r = prev.apply(this, arguments);
      loteEnPie=null; if(R3D.activo()) R3D.quitarCasa(); return r; };
  }
  /* el 3D se redibuja cuando cambia el filtro */
  if(typeof window.refrescar==="function"){
    const prev = window.refrescar;
    window.refrescar = function(){ const r = prev.apply(this, arguments);
                                   if(R3D.activo()) R3D.refrescar(); return r; };
  }
  /* al encender el 3D con un lote ya escogido, la casa entra con él */
  const _act = b.onclick;
  b.onclick = function(ev){
    const r = _act.call(this, ev);
    if(R3D.activo() && state.sel!=null){ loteEnPie=state.sel; R3D.casa(state.sel,null,null); }
    return r;
  };
}
})();
