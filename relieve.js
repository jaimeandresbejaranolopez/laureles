/* =============================================================================
   LAURELES CAMPESTRE · RELIEVE 3D  (motor Three.js)
   -----------------------------------------------------------------------------
   Reemplaza el motor WebGL escrito a mano. Lo que gana no es adorno: sombras
   proyectadas de verdad a la hora que se escoja, materiales que distinguen el
   pasto de la tierra y de la roca, niebla y cielo con profundidad, y miles de
   árboles dibujados de una sola vez sin que se caiga la fluidez.

   QUÉ ES DATO Y QUÉ ES REPRESENTACIÓN, porque aquí es fácil confundirlo:
     · La malla del terreno, cada cota, cada pendiente y la franja sin levantar
       salen del mismo modelo de alturas del plano 039 que usa el informe.
     · El corredor vial, los linderos, los lotes y las fajas de protección salen
       del DXF georreferenciado.
     · El sol es cálculo astronómico para la latitud y longitud del predio.
     · El PASTO, la TIERRA, la ROCA y la CORTEZA son textura procedural: ruido
       escrito en el sombreador. No son fotos del sitio y no pretenden serlo;
       están para que la ladera se lea como ladera y no como plástico verde.
     · Los ÁRBOLES se siembran únicamente dentro de las fajas de protección del
       plano, que es donde está el guadual de verdad. Ni uno solo cae fuera.
       Su posición exacta dentro de la faja sí es aleatoria: es un bosque, no
       un inventario forestal.
   ============================================================================= */
(function(){
"use strict";
if(typeof THREE==="undefined"){ console.warn("relieve: falta three.min.js"); return; }
const EXT = window.__ANL_EXT;
if(!EXT){ console.warn("relieve: falta el adaptador"); return; }
if(!window.__TER){ console.warn("relieve: falta la malla de alturas"); return; }

const TER=window.__TER, VIAP=window.__VIAP||null;
const DATA=EXT.DATA, PX=EXT.PX, lat0=EXT.lat0, lon0=EXT.lon0;
const SOL=window.__SOL, ANIO=window.__ANIO||new Date().getFullYear();
const IMPL=window.__IMPL||{};

const NX=TER.nx, NY=TER.ny, S=TER.s, Z0=TER.z0;
const ANCHO=(NX-1)*S, ALTO=(NY-1)*S;
const CX=TER.x+ANCHO/2, CY=TER.y+ALTO/2;      /* centro del predio, en metros locales */

/* -----------------------------------------------------------------------------
   1 · ALTURAS
   Igual que en el informe: los nodos de relleno —los que el levantamiento no
   midió— no se dejan planos, se les da la pendiente declarada del 20 % con la
   misma regla escrita, y quedan marcados para poder pintarlos distinto.
   --------------------------------------------------------------------------- */
let H=null, REL=null, ZMIN=Infinity, ZMAX=-Infinity;
const PEND_DECLARADA=0.20;
function decodificar(){
  if(H) return;
  const b=atob(TER.d), n=b.length, u=new Uint8Array(n);
  for(let i=0;i<n;i++) u[i]=b.charCodeAt(i);
  const q=new Uint16Array(u.buffer);
  H=new Float32Array(NX*NY); REL=new Uint8Array(NX*NY);
  for(let i=0;i<H.length;i++){
    const v=q[i];
    if(v===65535){ H[i]=NaN; continue; }
    H[i]=Z0+(v&0x7FFF)/100;
    REL[i]=(v&0x8000)?1:0;
  }
  const NT=NX*NY, zB=new Float32Array(NT), dB=new Float32Array(NT), cola=[];
  let zSuelo=Infinity;
  for(let k=0;k<NT;k++){
    if(!isNaN(H[k])&&!REL[k]){ zB[k]=H[k]; dB[k]=0; cola.push(k); zSuelo=Math.min(zSuelo,H[k]); }
    else { zB[k]=NaN; dB[k]=Infinity; }
  }
  for(let t=0;t<cola.length;t++){
    const k=cola[t], j=(k/NX)|0, i=k-j*NX;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){
      if(!di&&!dj) continue;
      const a=i+di, b2=j+dj;
      if(a<0||b2<0||a>=NX||b2>=NY) continue;
      const m=b2*NX+a;
      if(!REL[m]||isNaN(H[m])) continue;
      const d=dB[k]+S*Math.hypot(di,dj);
      if(d<dB[m]-1e-6){ dB[m]=d; zB[m]=zB[k]; cola.push(m); }
    }
  }
  for(let k=0;k<NT;k++)
    if(REL[k]&&!isNaN(H[k])&&!isNaN(zB[k])) H[k]=Math.max(zSuelo, zB[k]-PEND_DECLARADA*dB[k]);
  /* los huecos que queden se rellenan con el vecino válido más cercano para que
     la malla no tenga agujeros; quedan marcados como relleno */
  for(let k=0;k<NT;k++) if(isNaN(H[k])){ const z=cerca(k); if(!isNaN(z)){ H[k]=z; REL[k]=1; } }
  for(let k=0;k<NT;k++) if(!isNaN(H[k])){ ZMIN=Math.min(ZMIN,H[k]); ZMAX=Math.max(ZMAX,H[k]); }
  function cerca(k){
    const j0=(k/NX)|0, i0=k-j0*NX;
    for(let r=1;r<=40;r++){
      for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){
        if(Math.max(Math.abs(di),Math.abs(dj))!==r) continue;
        const a=i0+di, b2=j0+dj;
        if(a<0||b2<0||a>=NX||b2>=NY) continue;
        const z=H[b2*NX+a];
        if(!isNaN(z)) return z;
      }
    }
    return NaN;
  }
}
const hNodo=(i,j)=> (i<0||j<0||i>=NX||j>=NY) ? NaN : H[j*NX+i];
/* altura interpolada en metros locales (x este, y sur) */
function alturaEn(x,y){
  const fi=(x-TER.x)/S, fj=(y-TER.y)/S;
  const i=Math.floor(fi), j=Math.floor(fj);
  const a=hNodo(i,j), b=hNodo(i+1,j), c=hNodo(i,j+1), d=hNodo(i+1,j+1);
  if(isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)) return NaN;
  const tx=fi-i, ty=fj-j;
  return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
}

/* -----------------------------------------------------------------------------
   2 · ESCENA
   Mundo en metros: X al este, Z al sur, Y hacia arriba. La exageración vertical
   multiplica sólo la Y, y va rotulada en la barra para que nadie lea la ladera
   más parada de lo que es.
   --------------------------------------------------------------------------- */
const cv=document.getElementById("c3d");
let ren=null, esc=null, cam=null, raf=0, listo=false, activo=false;
let ve=2.0, az=-0.62, elv=0.50, dist=1050, panX=0, panY=0, modoMano=false;
let mundo=null, gTerreno=null, matTerreno=null, luzSol=null, luzCielo=null, cielo=null, gCordillera=null;
let gCasa=null, gLotes=null, gVias=null, gArboles=[], gDomo=null;
let loteCasa=null, fechaSol=1, horaSol=9, SOLPOS=null;
const capa=document.getElementById("capa3d"), globos={};

const COL={
  pasto:      new THREE.Color("#6E8C4A"),
  pastoSeco:  new THREE.Color("#94A25A"),
  tierra:     new THREE.Color("#8A6B45"),
  roca:       new THREE.Color("#7E7A6E"),
  declarado:  new THREE.Color("#B08A3C"),
  asfalto:    new THREE.Color("#4A4A46"),
  bosque:     new THREE.Color("#33502F"),
  cielo:      new THREE.Color("#AFC6DC"),
  horizonte:  new THREE.Color("#E4E3D4")
};

function crear(){
  if(ren) return;
  ren=new THREE.WebGLRenderer({canvas:cv, antialias:true, alpha:false, powerPreference:"high-performance"});
  ren.setPixelRatio(Math.min(devicePixelRatio||1, 2));
  ren.outputColorSpace=THREE.SRGBColorSpace;
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=1.02;
  ren.shadowMap.enabled=true;
  ren.shadowMap.type=THREE.PCFSoftShadowMap;

  esc=new THREE.Scene();
  esc.fog=new THREE.Fog(COL.horizonte.getHex(), 1100, 5200);
  cam=new THREE.PerspectiveCamera(48, 1, 2, 12000);

  /* cielo: una cúpula con degradado, no una imagen. Da el aire que separa la
     loma del fondo y le pone horizonte a la escena. */
  cielo=new THREE.Mesh(
    new THREE.SphereGeometry(6000, 32, 16),
    new THREE.ShaderMaterial({
      side:THREE.BackSide, depthWrite:false, fog:false,
      uniforms:{ arriba:{value:COL.cielo}, abajo:{value:COL.horizonte} },
      vertexShader:"varying float vh; void main(){ vh=normalize(position).y; "+
        "gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader:"uniform vec3 arriba; uniform vec3 abajo; varying float vh;"+
        "void main(){ float t=clamp(vh*2.9+0.06,0.0,1.0); t=pow(t,0.62);"+
        "gl_FragColor=vec4(mix(abajo,arriba,t),1.0); }"
    }));
  cielo.renderOrder=-1;
  esc.add(cielo);

  /* luz: el sol como direccional con sombra, y el cielo como rebote. La sombra
     cubre el predio entero, que es lo que hay que juzgar. */
  luzSol=new THREE.DirectionalLight(0xFFF3DD, 2.6);
  luzSol.castShadow=true;
  const R=Math.hypot(ANCHO,ALTO)/2*1.05;
  luzSol.shadow.mapSize.set(4096,4096);
  luzSol.shadow.camera.left=-R; luzSol.shadow.camera.right=R;
  luzSol.shadow.camera.top=R;   luzSol.shadow.camera.bottom=-R;
  luzSol.shadow.camera.near=1;  luzSol.shadow.camera.far=R*4;
  luzSol.shadow.bias=-0.00035;
  luzSol.shadow.normalBias=0.08;
  luzSol.shadow.camera.updateProjectionMatrix();
  esc.add(luzSol); esc.add(luzSol.target);
  luzCielo=new THREE.HemisphereLight(0xBFD4E8, 0x5B6340, 0.85);
  esc.add(luzCielo);

  /* Todo lo que vive sobre el terreno cuelga de un mismo grupo, y la
     exageración vertical se aplica UNA vez ahí: así la casa, los árboles y la
     ladera se estiran juntos y las proporciones entre ellos no mienten. */
  mundo=new THREE.Group(); mundo.scale.y=ve; esc.add(mundo);
  construirCordillera();
  lienzos();                 /* la máscara del plano, antes del material */
  construirTerreno();
  construirEntorno();
  construirArboles();
  ponerSol(fechaSol, horaSol);
  listo=true;
}

/* -----------------------------------------------------------------------------
   3 · EL TERRENO Y SU MATERIAL
   La malla es el levantamiento, nodo a nodo. El color NO es una foto: se calcula
   en el sombreador a partir de dos cosas que sí están medidas —la pendiente y la
   cota— más ruido para que no se vea como plástico. La regla es la misma que la
   del mapa de pendientes del informe: donde se para, aparece la tierra; donde se
   para mucho, la roca. Así el relieve dice lo mismo que las barras del informe.
   --------------------------------------------------------------------------- */
const RUIDO_GLSL = [
"float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
"float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);",
"  float a=hash21(i), b=hash21(i+vec2(1.0,0.0)), c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0));",
"  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }",
"float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }"
].join("\n");

function construirTerreno(){
  decodificar();
  const geo=new THREE.BufferGeometry();
  const nv=NX*NY;
  const pos=new Float32Array(nv*3), pend=new Float32Array(nv), decl=new Float32Array(nv);
  for(let j=0;j<NY;j++) for(let i=0;i<NX;i++){
    const k=j*NX+i, z=H[k];
    pos[k*3]   = TER.x + i*S - CX;          /* X este, centrado */
    pos[k*3+1] = isNaN(z)?Z0:z;             /* Y arriba (sin exagerar todavía) */
    pos[k*3+2] = TER.y + j*S - CY;          /* Z sur */
    const zx=(hNodo(i+1,j)-hNodo(i-1,j))/(2*S), zy=(hNodo(i,j+1)-hNodo(i,j-1))/(2*S);
    const p=Math.hypot(isNaN(zx)?0:zx, isNaN(zy)?0:zy);
    pend[k]=isNaN(p)?0:p;
    decl[k]=REL[k]?1:0;
  }
  const idx=new Uint32Array((NX-1)*(NY-1)*6);
  let t=0;
  for(let j=0;j<NY-1;j++) for(let i=0;i<NX-1;i++){
    const a=j*NX+i, b=a+1, c=a+NX, d=c+1;
    idx[t++]=a; idx[t++]=c; idx[t++]=b;
    idx[t++]=b; idx[t++]=c; idx[t++]=d;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos,3));
  geo.setAttribute("aPend",    new THREE.BufferAttribute(pend,1));
  geo.setAttribute("aDecl",    new THREE.BufferAttribute(decl,1));
  geo.setIndex(new THREE.BufferAttribute(idx,1));
  geo.computeVertexNormals();

  matTerreno=new THREE.MeshStandardMaterial({ color:0xFFFFFF, roughness:0.94, metalness:0.0 });
  matTerreno.onBeforeCompile = sh => {
    sh.uniforms.uPasto   ={value:COL.pasto};
    sh.uniforms.uSeco    ={value:COL.pastoSeco};
    sh.uniforms.uTierra  ={value:COL.tierra};
    sh.uniforms.uRoca    ={value:COL.roca};
    sh.uniforms.uDecl    ={value:COL.declarado};
    sh.uniforms.uAsf     ={value:COL.asfalto};
    sh.uniforms.uBosque  ={value:COL.bosque};
    sh.uniforms.uMask    ={value:texMask};
    sh.uniforms.uLote    ={value:texLote};
    sh.uniforms.uExt     ={value:new THREE.Vector2(ANCHO,ALTO)};
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>",
        "#include <common>\nattribute float aPend;\nattribute float aDecl;\n"+
        "varying float vPend; varying float vDecl; varying vec3 vMundo;")
      .replace("#include <begin_vertex>",
        "#include <begin_vertex>\nvPend=aPend; vDecl=aDecl; vMundo=position;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>",
        "#include <common>\nvarying float vPend; varying float vDecl; varying vec3 vMundo;\n"+
        "uniform vec3 uPasto; uniform vec3 uSeco; uniform vec3 uTierra; uniform vec3 uRoca; uniform vec3 uDecl;\n"+
        "uniform vec3 uAsf; uniform vec3 uBosque; uniform sampler2D uMask; uniform sampler2D uLote;\n"+
        "uniform vec2 uExt;\n"+
        RUIDO_GLSL)
      .replace("#include <color_fragment>",
        "#include <color_fragment>\n"+
        /* pasto: dos verdes mezclados por ruido, en tres escalas, para que no se
           vea un tapete uniforme ni desde lejos ni de cerca */
        "  vec2 q = vMundo.xz;\n"+
        "  float n1 = fbm(q*0.035);\n"+
        "  float n2 = vnoise(q*0.55);\n"+
        "  float n3 = vnoise(q*3.10);\n"+
        "  vec3 verde = mix(uPasto, uSeco, clamp(n1*1.25-0.08,0.0,1.0));\n"+
        "  float n4 = vnoise(q*11.0);\n"+
        "  verde *= 0.88 + 0.15*n2 + 0.09*n3 + 0.06*n4;\n"+
        /* la pendiente medida decide cuánta tierra y cuánta roca asoman */
        "  float tierra = smoothstep(0.46, 0.72, vPend + 0.09*(n2-0.5));\n"+
        "  float roca   = smoothstep(0.85, 1.25, vPend + 0.08*(n3-0.5));\n"+
        "  vec3 suelo = mix(verde, uTierra*(0.86+0.26*n3), tierra);\n"+
        "  suelo = mix(suelo, uRoca*(0.82+0.34*n3), roca);\n"+
        /* la franja sin levantar va tintada y rayada: no es lo mismo saber que suponer */
        "  float raya = step(0.5, fract((vMundo.x+vMundo.z)*0.16));\n"+
        "  suelo = mix(suelo, mix(uDecl*0.85, uDecl*1.10, raya), vDecl*0.20);\n"+
        /* Las vías, las fajas de protección y los linderos NO son geometría
           pegada encima —eso pelea con el terreno y parpadea—: son una máscara
           dibujada del DXF y proyectada sobre la malla, así se amoldan a cada
           ondulación del suelo sin un solo z-fighting. */
        "  vec2 uv = vec2((vMundo.x+uExt.x*0.5)/uExt.x, (vMundo.z+uExt.y*0.5)/uExt.y);\n"+
        "  vec4 mk = texture2D(uMask, uv);\n"+
        "  suelo = mix(suelo, uBosque*(0.80+0.30*n2), mk.g*0.85);\n"+
        "  vec3 asf = uAsf*(0.88+0.24*vnoise(q*7.0));\n"+
        "  suelo = mix(suelo, asf, mk.r);\n"+
        "  vec4 lt = texture2D(uLote, uv);\n"+
        "  suelo = mix(suelo, lt.rgb, lt.a*0.26*(1.0-mk.r));\n"+
        "  suelo = mix(suelo, vec3(0.97,0.96,0.90), mk.b*0.70);\n"+
        "  diffuseColor.rgb *= suelo;\n");
    matTerreno.userData.sh=sh;
  };
  gTerreno=new THREE.Mesh(geo, matTerreno);
  gTerreno.receiveShadow=true;
  gTerreno.castShadow=true;
  mundo.add(gTerreno);
}

/* -----------------------------------------------------------------------------
   EL ENTORNO, Y LO QUE NO ES
   El levantamiento termina en el lindero. Si la malla se corta ahí, el predio
   queda flotando como una baldosa en el aire y no se entiende ni la ladera ni
   hacia dónde cae el agua. Se le pone entonces: una FALDA que baja del borde,
   para tapar el canto, y una EXPLANADA lejana a la cota más baja medida, que
   la niebla se traga antes de que llegue al horizonte.
   Ni la falda ni la explanada son levantamiento y no se leen como terreno: no
   llevan pendiente, no llevan curvas y ninguna cifra del informe sale de ahí.
   Están para que el ojo tenga suelo, nada más.
   --------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
   CORDILLERA DE FONDO
   Ambientación, no dato: es un perfil de montañas generado con una semilla
   fija, no el perfil real de la Cordillera Central. Está para que la loma no
   termine en el vacío y para dar escala; nadie debe medir nada sobre ella.
   Tres cadenas a distinta distancia, cada una más pálida y más baja que la de
   adelante, teñidas con el mismo color del horizonte para que la niebla las
   integre sin costura.
   --------------------------------------------------------------------------- */
function construirCordillera(){
  gCordillera=new THREE.Group();
  gCordillera.position.y = (isFinite(ZMIN)?ZMIN:1200)*ve;   /* apoyada en el horizonte del predio */
  esc.add(gCordillera);
  let semilla=20260911;
  const azar=()=>{ semilla=(semilla*1664525+1013904223)&0x7fffffff; return semilla/0x7fffffff; };
  const CADENAS=[
    {r:5700, alto:1500, base:-160, seg:220, tono:0.42, op:0.85, picos:9},
    {r:5000, alto:1150, base:-140, seg:200, tono:0.66, op:0.92, picos:13},
    {r:4300, alto:820,  base:-120, seg:180, tono:0.88, op:1.00, picos:17}
  ];
  CADENAS.forEach(c=>{
    const pos=[], idx=[];
    /* perfil: suma de lomas de coseno repartidas por el anillo */
    const centros=[];
    for(let k=0;k<c.picos;k++) centros.push({a:azar()*Math.PI*2, w:0.18+azar()*0.42, h:0.35+azar()*0.65});
    const perfil=a=>{
      let h=0.18;
      centros.forEach(q=>{
        let d=Math.abs(((a-q.a+Math.PI*3)%(Math.PI*2))-Math.PI);
        if(d<q.w) h+=q.h*0.5*(1+Math.cos(Math.PI*d/q.w));
      });
      return Math.min(1.15,h);
    };
    for(let i=0;i<=c.seg;i++){
      const a=i/c.seg*Math.PI*2;
      const x=Math.cos(a)*c.r, z=Math.sin(a)*c.r;
      const h=c.base + c.alto*perfil(a);
      pos.push(x,c.base,z, x,h,z);
    }
    for(let i=0;i<c.seg;i++){
      const b=i*2;
      idx.push(b,b+1,b+3, b,b+3,b+2);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos,3));
    g.setIndex(idx);
    const col=COL.horizonte.clone().lerp(new THREE.Color("#3C5A66"), c.tono);
    const m=new THREE.MeshBasicMaterial({color:col, side:THREE.DoubleSide,
      depthWrite:false, fog:false, transparent:true, opacity:c.op});
    const malla=new THREE.Mesh(g,m);
    malla.renderOrder=-1+c.tono*0.01;
    malla.frustumCulled=false;
    malla.userData.cordillera=true;
    gCordillera.add(malla);
  });
}

function construirEntorno(){
  const matLejos=new THREE.MeshStandardMaterial({color:0x7E9455, roughness:1.0, metalness:0});
  const plano=new THREE.Mesh(new THREE.CircleGeometry(3900, 64), matLejos);   /* se corta antes de la cordillera */
  plano.rotation.x=-Math.PI/2;
  plano.position.y=ZMIN-5;
  plano.receiveShadow=false;
  mundo.add(plano);

  /* LA FALDA. Antes recorría el borde del RECTÁNGULO de la malla, y como fuera
     del lindero no hay levantamiento, la mitad de esos nodos no tenía cota: el
     resultado era una empalizada de tablones marrones colgando en el vacío, no
     un canto de terreno. Ahora la falda se levanta donde de verdad termina la
     malla: en cada arista donde una celda dibujada toca una que no lo está.
     Cae 5 m bajo el terreno, no hasta la cota más baja del predio. */
  const cellOK=(i,j)=>{
    if(i<0||j<0||i>=NX-1||j>=NY-1) return false;
    return !isNaN(hNodo(i,j)) && !isNaN(hNodo(i+1,j)) &&
           !isNaN(hNodo(i,j+1)) && !isNaN(hNodo(i+1,j+1));
  };
  const P=[], idx=[];
  const CAIDA=5;
  const pared=(i0,j0,i1,j1)=>{                 /* arista entre dos nodos */
    const z0=hNodo(i0,j0), z1=hNodo(i1,j1);
    if(isNaN(z0)||isNaN(z1)) return;
    const x0=TER.x+i0*S-CX, y0=TER.y+j0*S-CY;
    const x1=TER.x+i1*S-CX, y1=TER.y+j1*S-CY;
    const b=P.length/3;
    P.push(x0,z0,y0,  x0,z0-CAIDA,y0,  x1,z1,y1,  x1,z1-CAIDA,y1);
    idx.push(b,b+1,b+2, b+1,b+3,b+2);
  };
  for(let j=0;j<NY-1;j++) for(let i=0;i<NX-1;i++){
    if(!cellOK(i,j)) continue;
    if(!cellOK(i,j-1)) pared(i,j,   i+1,j);      /* arriba  */
    if(!cellOK(i,j+1)) pared(i,j+1, i+1,j+1);    /* abajo   */
    if(!cellOK(i-1,j)) pared(i,j,   i,j+1);      /* izquierda */
    if(!cellOK(i+1,j)) pared(i+1,j, i+1,j+1);    /* derecha */
  }
  const gf=new THREE.BufferGeometry();
  gf.setAttribute("position", new THREE.Float32BufferAttribute(P,3));
  gf.setIndex(idx); gf.computeVertexNormals();
  const falda=new THREE.Mesh(gf, new THREE.MeshStandardMaterial(
    {color:0xA08D6D, roughness:1.0, side:THREE.DoubleSide}));
  mundo.add(falda);
}

/* -----------------------------------------------------------------------------
   4 · LA MÁSCARA DEL PLANO
   Vías, fajas de protección y linderos se dibujan una sola vez sobre un lienzo
   que cubre exactamente el predio y se proyecta sobre la malla. Van del DXF
   georreferenciado, no calcadas sobre una foto.
      rojo  = calzada          verde = faja de protección
      azul  = lindero y lote   (el color de estado va en su propio lienzo)
   --------------------------------------------------------------------------- */
const MASK_T=2048, LOTE_T=1024;
let texMask=null, texLote=null, cvMask=null, cvLote=null;
const aMask = x => (x-(CX-ANCHO/2))/ANCHO*MASK_T;      /* metros locales -> píxel */
const bMask = y => (y-(CY-ALTO/2))/ALTO*MASK_T;
const aLote = x => (x-(CX-ANCHO/2))/ANCHO*LOTE_T;
const bLote = y => (y-(CY-ALTO/2))/ALTO*LOTE_T;

function lienzos(){
  if(texMask) return;
  cvMask=document.createElement("canvas"); cvMask.width=cvMask.height=MASK_T;
  const g=cvMask.getContext("2d");
  g.fillStyle="#000"; g.fillRect(0,0,MASK_T,MASK_T);
  const camino=(ring,A,B)=>{ g.beginPath();
    ring.forEach((p,i)=>{ const q=PX(p); const x=A(q[0]), y=B(q[1]); i?g.lineTo(x,y):g.moveTo(x,y); });
    g.closePath(); };

  /* faja de protección: canal verde */
  g.globalCompositeOperation="lighter"; g.fillStyle="#008000";
  (DATA.prot||[]).forEach(r=>{ camino(r,aMask,bMask); g.fill(); });

  /* zonas comunes: mismo canal, más suave */
  g.fillStyle="#004000";
  (DATA.soc||[]).forEach(z=>{ const r=z&&z.g?z.g:z;
    if(Array.isArray(r)&&Array.isArray(r[0])){ camino(r,aMask,bMask); g.fill(); } });

  /* Calzada: canal rojo, del corredor vial real. El corredor NO es un anillo
     suelto: trae el contorno exterior y, dentro, un hueco por cada manzana de
     lotes. Hay que pintarlo con regla par-impar y todos los anillos en el mismo
     trazo; si se pinta sólo el primero, la vía se traga las manzanas enteras. */
  g.fillStyle="#FF0000";
  if(VIAP&&VIAP.corredor) VIAP.corredor.forEach(poli=>{
    const anillos = Array.isArray(poli[0][0][0]) ? poli : [poli];
    anillos.forEach(grupo=>{
      const rs = Array.isArray(grupo[0][0]) ? grupo : [grupo];
      g.beginPath();
      rs.forEach(r=>{
        r.forEach((pt,i)=>{ const q=PX(pt); const x=aMask(q[0]), y=bMask(q[1]);
                            i?g.lineTo(x,y):g.moveTo(x,y); });
        g.closePath();
      });
      g.fill("evenodd");
    });
  });

  /* lindero y lotes: canal azul, línea fina */
  g.strokeStyle="#0000FF"; g.lineJoin="round";
  g.lineWidth=Math.max(1.6, MASK_T/ANCHO*1.0);
  (DATA.lotes||[]).forEach(L=>{ camino(L.g,aMask,bMask); g.stroke(); });
  g.lineWidth=Math.max(2.6, MASK_T/ANCHO*2.2);
  if(DATA.lind){ camino(DATA.lind,aMask,bMask); g.stroke(); }
  g.globalCompositeOperation="source-over";

  texMask=new THREE.CanvasTexture(cvMask);
  texMask.colorSpace=THREE.NoColorSpace;
  texMask.anisotropy=4; texMask.needsUpdate=true;

  cvLote=document.createElement("canvas"); cvLote.width=cvLote.height=LOTE_T;
  texLote=new THREE.CanvasTexture(cvLote);
  texLote.colorSpace=THREE.SRGBColorSpace;
  pintarLotes();
}

/* El color de cada lote lo manda el mapa: aquí no hay una segunda verdad sobre
   el estado de un lote, se lee la misma tabla y se repinta cuando cambia. */
/* Los estados traen el color en variable CSS ("var(--disp)"), que un lienzo 2D
   no entiende. Se resuelve una vez contra la hoja de estilos: así el relieve usa
   exactamente el mismo verde, ocre y rojo que el plano, sin una segunda tabla. */
const COLOR_CACHE={};
function resolver(c){
  if(!c) return "#8A8F82";
  c=(""+c).trim();
  if(c[0]==="#") return c;
  const m=/^var\(\s*(--[\w-]+)\s*\)$/.exec(c);
  if(!m) return c;
  if(COLOR_CACHE[m[1]]) return COLOR_CACHE[m[1]];
  let v="";
  try{ v=getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim(); }catch(e){}
  return (COLOR_CACHE[m[1]] = v || "#8A8F82");
}
function colorLote(L){
  try{
    const M=window.__MAPA;
    if(M&&M.ESTADOS&&M.LOTES){
      const f=M.LOTES.features.find(x=>x.properties.lote===L.n);
      if(f){ const E=M.ESTADOS[f.properties.estado]; if(E) return resolver(E.c); }
    }
  }catch(e){}
  const E=EXT.EST&&EXT.EST[EXT.estadoDe(L)];
  return resolver(E&&E.c);
}
function visible(L){
  try{ const M=window.__MAPA;
       if(M){ const f=M.LOTES.features.find(x=>x.properties.lote===L.n);
              return f ? M.pasa(f.properties) : true; } }catch(e){}
  return true;
}
function pintarLotes(){
  if(!cvLote) return;
  const g=cvLote.getContext("2d");
  g.clearRect(0,0,LOTE_T,LOTE_T);
  const sel=(EXT.state&&EXT.state.sel)||null;
  (DATA.lotes||[]).forEach(L=>{
    if(!visible(L)) return;
    g.beginPath();
    L.g.forEach((p,i)=>{ const q=PX(p); const x=aLote(q[0]), y=bLote(q[1]); i?g.lineTo(x,y):g.moveTo(x,y); });
    g.closePath();
    g.globalAlpha = (sel===L.n) ? 0.95 : 0.55;
    g.fillStyle = (sel===L.n) ? "#C9A467" : colorLote(L);
    g.fill();
  });
  g.globalAlpha=1;
  if(texLote) texLote.needsUpdate=true;
}

/* -----------------------------------------------------------------------------
   5 · EL BOSQUE
   Los árboles se siembran SÓLO dentro de las fajas de protección del plano: es
   la ronda de cañada, el guadual que ya está ahí y que no se puede talar. La
   cantidad sale de la superficie real de la faja, a razón de un árbol cada 42 m²,
   que es lo que da un guadual cerrado. Dentro de la faja la posición es al azar
   con semilla fija, así el bosque no cambia de sitio cada vez que se abre.
   --------------------------------------------------------------------------- */
const DENSIDAD=42;                 /* m² de faja por árbol */
let semilla=20260911;
function azar(){ semilla=(semilla*1664525+1013904223)>>>0; return semilla/4294967296; }
function dentroAnillo(x,y,ring){
  let d=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) d=!d;
  }
  return d;
}
function construirArboles(){
  const anillos=(DATA.prot||[]).map(r=>r.map(PX));
  if(!anillos.length) return;
  const puestos=[];
  anillos.forEach(r=>{
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9, a2=0;
    r.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    for(let i=0,j=r.length-1;i<r.length;j=i++) a2+=r[j][0]*r[i][1]-r[i][0]*r[j][1];
    const area=Math.abs(a2)/2;
    const n=Math.min(4000, Math.round(area/DENSIDAD));
    let puestosR=0, intentos=0;
    while(puestosR<n && intentos<n*14){
      intentos++;
      const x=x0+azar()*(x1-x0), y=y0+azar()*(y1-y0);
      if(!dentroAnillo(x,y,r)) continue;
      const z=alturaEn(x,y);
      if(isNaN(z)) continue;
      puestos.push([x,y,z, 9+azar()*13, 0.72+azar()*0.55, azar()*6.283]);
      puestosR++;
    }
  });
  if(!puestos.length) return;

  /* Un árbol de gran porte, en pocos polígonos para que quepan miles: tronco
     alto y limpio, copa en dos masas irregulares. No es una especie botánica;
     es el porte que tiene el guadual y el bosque de cañada del predio. */
  const gTronco=new THREE.CylinderGeometry(0.16,0.30,1,6,1,false);
  gTronco.translate(0,0.5,0);
  const gCopa=new THREE.IcosahedronGeometry(1,1);
  const mTronco=new THREE.MeshStandardMaterial({color:0x6B5A43, roughness:0.95});
  const mCopa=new THREE.MeshStandardMaterial({color:0x7FA85E, roughness:0.86, flatShading:true});

  const iT=new THREE.InstancedMesh(gTronco,mTronco,puestos.length);
  const iC=new THREE.InstancedMesh(gCopa,mCopa,puestos.length*2);
  iT.castShadow=iC.castShadow=true; iC.receiveShadow=true;
  const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), P=new THREE.Vector3(), E=new THREE.Vector3();
  const col=new THREE.Color();
  puestos.forEach((t,i)=>{
    const [x,y,z,alt,anch,rot]=t;
    Q.setFromAxisAngle(new THREE.Vector3(0,1,0), rot);
    P.set(x-CX, z, y-CY); E.set(anch,alt,anch);
    M.compose(P,Q,E); iT.setMatrixAt(i,M);
    /* dos masas de copa, desplazadas, para que no se vea una bola repetida */
    for(let k=0;k<2;k++){
      const r=anch*(2.1+0.9*((i*7+k*13)%5)/5);
      P.set(x-CX + (k?anch*1.5*Math.cos(rot):0), z+alt*(k?0.78:0.95),
            y-CY + (k?anch*1.5*Math.sin(rot):0));
      E.set(r, r*(k?0.62:0.80), r);
      M.compose(P,Q,E); iC.setMatrixAt(i*2+k,M);
      /* verde de guadual y de bosque de cañada: el tono se mueve poco, la
         claridad bastante, que es lo que da volumen a una masa de árboles */
      col.setHSL(0.245+0.045*((i*11+k*5)%7)/7, 0.40+0.16*((i*3)%5)/5, 0.34+0.16*((i*5+k)%6)/6);
      iC.setColorAt(i*2+k, col);
    }
  });
  iT.instanceMatrix.needsUpdate=true; iC.instanceMatrix.needsUpdate=true;
  if(iC.instanceColor) iC.instanceColor.needsUpdate=true;
  iT.frustumCulled=iC.frustumCulled=false;
  iT.userData.arboles=iC.userData.arboles=puestos;
  mundo.add(iT); mundo.add(iC);
  gArboles=[iT,iC];
}

/* -----------------------------------------------------------------------------
   6 · LAS CASAS
   Tres tipos reales del proyecto —199,6 · 228,7 · 316 m², todos con 35,5 m² de
   parqueadero— y, sólo en los siete lotes de ladera, los dos modelos en terraza.

   IMPORTANTE, y va dicho en la interfaz: esto es un VOLUMEN, no la planta del
   arquitecto. El área construida y el parqueadero son las cifras rotuladas en
   los planos de cada tipo; la altura de 4,00 m la fijó la gerencia para la
   simulación; la HUELLA es la envolvente que el análisis ya había ajustado a
   cada lote respetando retiros y antejardín, reescalada al área del tipo. Sirve
   para juzgar tamaño, escala e implantación. Cuando llegue el DXF de cada casa,
   esta huella se reemplaza por la planta exacta y las cifras no cambian.
   --------------------------------------------------------------------------- */
const ALTO_CASA=4.00, ALTO_CAR=2.60, ALTO_PISO=3.00;
const TIPOS=[
  {k:"199", area:199.6, car:35.5, ref:"200", et:"199,6 m²"},
  {k:"228", area:228.7, car:35.5, ref:"250", et:"228,7 m²"},
  {k:"316", area:316.0, car:35.5, ref:"300", et:"316 m²"}
];
const TIPOS_TERRAZA=[
  {k:"T1", et:"T1 · Bancal"},
  {k:"T2", et:"T2 · Mirador"}
];
const LOTES_TERRAZA=[47,48,49,50,51,52,53];
const esTerraza = n => LOTES_TERRAZA.indexOf(+n)>=0;
let tipoCasa=(function(){ try{ const v=localStorage.getItem("laureles.tipoCasa");
  return v||"228"; }catch(e){ return "228"; } })();

function tipoDe(k){ return TIPOS.find(t=>t.k===k) || TIPOS[1]; }

/* la implantación que el análisis calculó para este lote, en el tamaño más
   cercano al tipo escogido: de ahí salen el origen, los ejes y la plataforma */
function baseImplante(n, ref){
  const A=IMPL[String(n)]; if(!A) return null;
  if(A.ks && A.ks[ref]) return A.ks[ref];
  if(A.ks){ for(const q of ["300","250","200"]) if(A.ks[q]) return A.ks[q]; }
  return A.k||null;
}
function prisma(cx,cy,ang,L,A,z0,alt,color,op){
  const g=new THREE.BoxGeometry(L,alt,A);
  const m=new THREE.MeshStandardMaterial({color:color, roughness:0.72, metalness:0.02,
    transparent:op<1, opacity:op});
  const o=new THREE.Mesh(g,m);
  o.position.set(cx-CX, z0+alt/2, cy-CY);
  o.rotation.y=ang;
  o.castShadow=true; o.receiveShadow=true;
  return o;
}
function quitarCasa(){
  if(gCasa&&mundo){ mundo.remove(gCasa); gCasa.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); }
  gCasa=null; loteCasa=null; pedir();
}
/* Los modelos en terraza no dependen de la implantación de la casa tipo: en el
   lote 48 esa casa sencillamente no cabe, y era justo el lote donde más falta
   hace enseñar la alternativa. Así que para T1 y T2 el asiento se calcula aquí,
   del propio lote: el eje largo de la casa va PARALELO a las curvas de nivel y
   la casa baja siguiendo la máxima pendiente, que es lo que hace que un bancal
   sea un bancal y no una excavación. */
function baseTerraza(n, fondo, ancho){
  const L=DATA.lotes.find(x=>x.n===n); if(!L) return null;
  const g=L.g.map(PX);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  g.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  let dx=0, dy=0, cx=0, cy=0, nn=0;
  for(let x=x0;x<=x1;x+=3) for(let y=y0;y<=y1;y+=3){
    if(!dentroAnillo(x,y,g)) continue;
    const zx=alturaEn(x+2,y)-alturaEn(x-2,y), zy=alturaEn(x,y+2)-alturaEn(x,y-2);
    if(isNaN(zx)||isNaN(zy)) continue;
    const m=Math.hypot(zx,zy); if(m>1e-9){ dx+=-zx/m; dy+=-zy/m; }
    cx+=x; cy+=y; nn++;
  }
  if(!nn) return null;
  cx/=nn; cy/=nn;
  let m=Math.hypot(dx,dy); if(m<1e-6){ dx=1; dy=0; m=1; }
  const uv=[dx/m, dy/m];              /* hacia donde baja */
  const ux=[-uv[1], uv[0]];           /* paralelo a las curvas */
  const ox=cx-ux[0]*(ancho/2)-uv[0]*(fondo/2);
  const oy=cy-ux[1]*(ancho/2)-uv[1]*(fondo/2);
  return {o:[ox,oy], ux:ux, uv:uv};
}

function ponerCasa(n){
  quitarCasa();
  const terraza = esTerraza(n) && (tipoCasa==="T1"||tipoCasa==="T2");
  let B=baseImplante(n, tipoDe(tipoCasa).ref);
  if(terraza){
    const Dt = window.__DATOS_TERRAZA ? window.__DATOS_TERRAZA(n) : null;
    if(!Dt) return;
    const fondo = tipoCasa==="T1" ? Dt.t1.p*3 : Dt.t2.F;
    const ancho = tipoCasa==="T1" ? Dt.t1.a   : Dt.t2.a;
    B = baseTerraza(n, fondo, ancho) || B;
  }
  if(!B || !B.o || !B.ux) return;
  const grupo=new THREE.Group();
  const ox=B.o[0], oy=B.o[1], ux=B.ux, uv=B.uv;
  const ang=Math.atan2(ux[1], ux[0]);
  const T=tipoDe(tipoCasa);
  if(terraza){
    const D=window.__DATOS_TERRAZA ? window.__DATOS_TERRAZA(n) : null;
    if(D){
      if(tipoCasa==="T1"){
        for(let k2=0;k2<3;k2++){
          const av=(k2+0.5)*D.t1.p;
          const cx=ox+ux[0]*(D.t1.a/2)+uv[0]*av, cy=oy+ux[1]*(D.t1.a/2)+uv[1]*av;
          const z=alturaEn(cx,cy);
          if(isNaN(z)) continue;
          grupo.add(prisma(cx,cy,-ang,D.t1.a,D.t1.p,z-0.25,ALTO_PISO,0xE8E4D8,1));
        }
      } else {
        const cx=ox+ux[0]*(D.t2.a/2)+uv[0]*(D.t2.F/2), cy=oy+ux[1]*(D.t2.a/2)+uv[1]*(D.t2.F/2);
        const z=alturaEn(ox+uv[0]*0.5, oy+uv[1]*0.5);
        if(!isNaN(z)){
          grupo.add(prisma(cx,cy,-ang,D.t2.a,D.t2.F,z-ALTO_PISO,ALTO_PISO,0xD8D4C6,1));
          grupo.add(prisma(cx,cy,-ang,D.t2.a,D.t2.F,z,ALTO_PISO,0xE8E4D8,1));
        }
      }
    }
  } else {
    /* la huella del tamaño de referencia, reescalada al área del tipo */
    const f=Math.sqrt(T.area/(B.ac||B.an||T.area));
    const L=(B.L||16)*f, A=(B.A||12)*f;
    const cx=ox+ux[0]*(L/2)+uv[0]*(A/2), cy=oy+ux[1]*(L/2)+uv[1]*(A/2);
    /* El zócalo: entre la plataforma y el terreno natural del lado bajo hay un
       desnivel real —es el lleno que se hace para nivelar—. Sin dibujarlo, la
       casa parece flotar sobre el aire y el cliente no ve lo que cuesta
       aplanar. Se busca la cota más baja del terreno bajo la huella y se cierra
       el hueco hasta ahí. */
    let zMin=B.z;
    for(let a2=0;a2<=1;a2+=0.25) for(let b2=0;b2<=1;b2+=0.25){
      const px3=ox+ux[0]*(L*a2)+uv[0]*(A*b2), py3=oy+ux[1]*(L*a2)+uv[1]*(A*b2);
      const z3=alturaEn(px3,py3);
      if(!isNaN(z3)) zMin=Math.min(zMin,z3);
    }
    if(B.z-zMin>0.35)
      grupo.add(prisma(cx,cy,-ang,L,A,zMin-0.2,B.z-zMin+0.2,0xB9B2A0,1));
    grupo.add(prisma(cx,cy,-ang,L,A,B.z,ALTO_CASA,0xE8E4D8,1));
    /* el parqueadero, 35,5 m², como cuerpo aparte contra el frente */
    const lc=Math.sqrt(T.car*1.35), ac2=T.car/lc;
    const px2=ox+ux[0]*(L+lc/2+1.2)+uv[0]*(ac2/2), py2=oy+ux[1]*(L+lc/2+1.2)+uv[1]*(ac2/2);
    const zc=alturaEn(px2,py2);
    grupo.add(prisma(px2,py2,-ang,lc,ac2,isNaN(zc)?B.z:Math.max(zc,B.z-0.6),ALTO_CAR,0xCFCBBE,1));
  }
  if(!grupo.children.length) return;
  mundo.add(grupo); gCasa=grupo; loteCasa=n;
  pedir();
}

/* -----------------------------------------------------------------------------
   7 · EL SOL
   Posición astronómica real para la latitud y longitud del predio, en la fecha
   y la hora que se escojan. De ahí salen la dirección de la luz, la sombra
   proyectada y el color: al amanecer y al atardecer la luz se pone cálida y
   baja, al mediodía es blanca y vertical. Nada de esto es decoración: es lo que
   decide si una terraza recibe sol a las cuatro de la tarde.
   --------------------------------------------------------------------------- */
function ponerSol(f,h){
  if(f!=null) fechaSol=f;
  if(h!=null) horaSol=h;
  let alt=52, azi=110;
  if(SOL){
    const F=SOL.FECHAS[fechaSol]||SOL.FECHAS[1];
    SOLPOS=SOL.posicion(ANIO,F.m,F.d,horaSol,lat0,lon0);
    alt=SOLPOS.alt; azi=SOLPOS.az;
  }
  const A=Math.max(alt,2.2)*Math.PI/180, Z=azi*Math.PI/180;
  /* azimut 0 = norte y crece hacia el oriente; en el mundo Z crece hacia el sur */
  const D=Math.hypot(ANCHO,ALTO);
  const dx=Math.cos(A)*Math.sin(Z), dz=-Math.cos(A)*Math.cos(Z), dy=Math.sin(A);
  if(luzSol){
    /* El terreno vive en cotas absolutas —1.197 a 1.237 m sobre el nivel del
       mar—, así que el sol NO puede colgarse del origen del mundo: quedaría
       seiscientos metros bajo tierra y no habría una sola sombra. Se cuelga del
       centro del predio, a su cota, y desde ahí se aleja en la dirección real
       del sol. */
    const cyM=(ZMIN+ZMAX)/2*ve;
    luzSol.target.position.set(0, cyM, 0);
    luzSol.target.updateMatrixWorld();
    luzSol.position.set(dx*D, cyM + dy*D, dz*D);
    luzSol.shadow.camera.updateProjectionMatrix();
    luzSol.shadow.needsUpdate=true;
    /* luz cálida y débil cuando el sol está bajo; blanca y fuerte en lo alto */
    const t=Math.min(Math.max((alt-1)/38,0),1);
    luzSol.intensity=0.45+2.35*t;
    luzSol.color.setHSL(0.09-0.035*t, 0.55-0.45*t, 0.55+0.03*t);
  }
  if(luzCielo) luzCielo.intensity=0.42+0.55*Math.min(Math.max(alt/40,0),1);
  if(cielo){
    const t=Math.min(Math.max(alt/35,0),1);
    cielo.material.uniforms.arriba.value.setHSL(0.575, 0.34+0.16*t, 0.40+0.20*t);
    cielo.material.uniforms.abajo.value.setHSL(0.105+0.02*t, 0.38-0.14*t, 0.70+0.10*t);
    if(esc.fog) esc.fog.color.copy(cielo.material.uniforms.abajo.value);
    ren.setClearColor(cielo.material.uniforms.arriba.value, 1);
  }
  pedir();
}

/* -----------------------------------------------------------------------------
   8 · CÁMARA, RÓTULOS Y BUCLE
   --------------------------------------------------------------------------- */
function colocarCamara(){
  const cy=ZMIN+(ZMAX-ZMIN)*0.35;
  const D=[-Math.cos(az), Math.sin(az)];
  const bx=panX, bz=panY, by=cy*ve;
  cam.position.set(bx + Math.cos(elv)*Math.cos(az)*dist,
                   by + Math.sin(elv)*dist,
                   bz + Math.cos(elv)*Math.sin(az)*dist);
  cam.lookAt(bx,by,bz);
  cielo.position.copy(cam.position);
}
function medir(){
  const r=cv.getBoundingClientRect();
  const w=Math.max(2,Math.round(r.width)), h=Math.max(2,Math.round(r.height));
  if(cv.width!==w*ren.getPixelRatio()||cv.height!==h*ren.getPixelRatio()){
    ren.setSize(w,h,false);
    cam.aspect=w/h; cam.updateProjectionMatrix();
  }
}
function pedir(){ if(!raf && activo) raf=requestAnimationFrame(dibujar); }
function dibujar(){
  raf=0;
  if(!activo||!listo) return;
  medir();
  colocarCamara();
  ren.render(esc,cam);
  rotulos();
}

/* los rótulos de lote son HTML encima del lienzo: se leen siempre bien y se
   pueden tocar, cosa que un texto dibujado dentro del 3D no permite */
function rotulos(){
  if(!capa) return;
  const r=cv.getBoundingClientRect();
  const sel=(EXT.state&&EXT.state.sel)||null;
  const V=new THREE.Vector3();
  (DATA.lotes||[]).forEach(L=>{
    let d=globos[L.n];
    if(!d){
      d=document.createElement("div"); d.className="rotulo3d";
      d.textContent=L.n;
      d.onclick=()=>{ try{ abrirLote(L.n); }catch(e){ try{ EXT.state.sel=L.n; }catch(e2){} } };
      capa.appendChild(d); globos[L.n]=d;
    }
    if(!visible(L)){ d.style.display="none"; return; }
    const c=PX(L.c); const z=alturaEn(c[0],c[1]);
    if(isNaN(z)){ d.style.display="none"; return; }
    V.set(c[0]-CX, z*ve, c[1]-CY).project(cam);
    if(V.z>1||Math.abs(V.x)>1.25||Math.abs(V.y)>1.25){ d.style.display="none"; return; }
    d.style.display="";
    d.style.left=((V.x*0.5+0.5)*r.width).toFixed(1)+"px";
    d.style.top =((-V.y*0.5+0.5)*r.height-8).toFixed(1)+"px";
    d.classList.toggle("sel", sel===L.n);
  });
}

/* ---- controles: girar, mover, acercar ---- */
let arr=null;
function pointerdown(e){
  cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
  arr={x:e.clientX,y:e.clientY,az,elv,px:panX,py:panY,
       pan:(modoMano ? !e.shiftKey : (e.shiftKey||e.button===2))};
}
function pointermove(e){
  if(!arr) return;
  const dx=e.clientX-arr.x, dy=e.clientY-arr.y;
  if(arr.pan){
    const k=dist*0.0016;
    const D=[-Math.cos(az), -Math.sin(az)], P=[-Math.sin(az), Math.cos(az)];
    panX=arr.px + (P[0]*dx + D[0]*dy)*k;
    panY=arr.py + (P[1]*dx + D[1]*dy)*k;
  } else {
    az=arr.az - dx*0.005;
    elv=Math.max(0.06, Math.min(1.45, arr.elv + dy*0.004));
  }
  pedir();
}
function pointerup(){ arr=null; }
function rueda(e){
  e.preventDefault();
  dist=Math.max(90, Math.min(4200, dist*Math.exp(e.deltaY*0.0012)));
  pedir();
}

/* -----------------------------------------------------------------------------
   9 · LO QUE EL RESTO DEL PLANO LE PIDE AL RELIEVE
   Misma interfaz que el motor anterior: quien lo usa no se entera del cambio.
   --------------------------------------------------------------------------- */
function encuadrar(){
  az=-0.62; elv=0.50; panX=0; panY=0;
  const r=cv.getBoundingClientRect();
  if(!r.width){ dist=1050; pedir(); return; }
  const reserva=el=>{
    if(!el) return 16;
    const g=getComputedStyle(el);
    if(g.display==="none"||g.visibility==="hidden"||+g.opacity===0) return 16;
    const c=el.getBoundingClientRect();
    if(!c.width||!c.height) return 16;
    if(c.width>r.width*0.6) return 16;
    if(c.bottom<r.top+10||c.top>r.bottom-10) return 16;
    return Math.min(c.width+28, r.width*0.4);
  };
  const izq=reserva(document.getElementById("rail"));
  const der=reserva(document.querySelector(".panel, .ficha.on"));
  const availW=Math.max(r.width-izq-der,180), availH=Math.max(r.height-90,180);
  const RAD=Math.hypot(ANCHO,ALTO)/2, fov=cam.fov*Math.PI/180, asp=r.width/r.height;
  const dV=RAD/Math.tan(fov/2)*(r.height/availH);
  const dH=RAD/(Math.tan(fov/2)*asp)*(r.width/availW);
  dist=Math.max(260, Math.min(3600, Math.max(dV,dH)*0.78));
  const centroLibre=(izq+(r.width-der))/2;
  const off=(centroLibre-r.width/2)/r.width;
  const mundoW=2*dist*Math.tan(fov/2)*asp;
  const desp=-off*mundoW;
  panX=-Math.cos(az)*desp; panY=Math.sin(az)*desp;
  pedir();
}
function irA(n, alto){
  const L=(DATA.lotes||[]).find(x=>x.n===n); if(!L) return;
  const c=PX(L.c), z=alturaEn(c[0],c[1]);
  panX=c[0]-CX; panY=c[1]-CY;
  dist=alto||210; elv=Math.max(elv,0.34);
  pedir();
}
function activar(v){
  if(v){
    crear();
    cv.hidden=false; activo=true;
    if(capa) capa.hidden=false;
    encuadrar(); pedir();
  } else {
    activo=false; cv.hidden=true;
    if(capa) capa.hidden=true;
    cancelAnimationFrame(raf); raf=0;
  }
  const st=document.querySelector(".stage")||document.querySelector("main");
  if(st) st.classList.toggle("en3d", !!v);
  return activo;
}
cv.addEventListener("pointerdown", pointerdown);
addEventListener("pointermove", pointermove);
addEventListener("pointerup", pointerup);
cv.addEventListener("wheel", rueda, {passive:false});
cv.addEventListener("contextmenu", e=>e.preventDefault());
addEventListener("resize", ()=>{ if(activo){ medir(); pedir(); } });

window.__R3D = {
  hay: ()=>true,
  activo: ()=>activo,
  activar,
  refrescar(){ pintarLotes(); pedir(); },
  exagerar(v){ ve=+v||1; if(mundo) mundo.scale.y=ve;
    if(gCordillera) gCordillera.position.y=(isFinite(ZMIN)?ZMIN:1200)*ve;
    if(listo) ponerSol(null,null);        /* la sombra cuelga de la cota del predio */
    pedir(); return ve; },
  ve: ()=>ve,
  mano(v){ modoMano=!!v; cv.style.cursor=modoMano?"grab":"move"; return modoMano; },
  haciaMano: ()=>modoMano,
  sol(f,h){ if(listo) ponerSol(f,h); else { fechaSol=f!=null?f:fechaSol; horaSol=h!=null?h:horaSol; } },
  casa(n,f,h){ if(!listo) crear(); if(f!=null||h!=null) ponerSol(f,h); ponerCasa(n); },
  quitarCasa,
  irA, encuadrar,
  /* la bóveda solar del motor anterior todavía no está portada: se dice, no se finge */
  domoSolar(){ return false; },
  haciaDomo(){ return false; },
  /* el tipo de casa que se está simulando, compartido con la barra y el análisis */
  tipos: ()=>TIPOS.slice(),
  tiposTerraza: ()=>TIPOS_TERRAZA.slice(),
  tipo: ()=>tipoCasa,
  ponerTipo(k){
    tipoCasa=k;
    try{ localStorage.setItem("laureles.tipoCasa",k); }catch(e){}
    if(loteCasa!=null) ponerCasa(loteCasa);
    return tipoCasa;
  },
  esTerraza,
  _dbg:()=>({esc,cam,ren,luzSol,mundo,gTerreno,gCasa,gArboles,ZMIN,ZMAX,ve})
};
})();
