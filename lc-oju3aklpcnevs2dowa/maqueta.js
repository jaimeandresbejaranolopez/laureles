/* =============================================================================
   MAQUETA — el predio como una maqueta de estudio, con el terreno real
   -----------------------------------------------------------------------------
   Sobre el relieve del levantamiento (r3d.js) y la ortofoto del dron
   (paisaje.js) arma la vista "de maqueta":
     · el predio recortado por su borde, sobre un fondo de estudio, con su
       sombra en la mesa;
     · el canto del bloque con capas de suelo (dibujadas: el corte no es un
       estudio de suelos, es la manera de leer que el bloque es tierra);
     · luz de tarde, lente cerrado (poca perspectiva) y desenfoque arriba y
       abajo, como una foto de maqueta;
     · el color de venta sobre los lotes y la sombra de cada árbol de la ronda.
   Lo que se ve del predio es real: topografía, ortofoto, lotes y vías. Lo
   dibujado (capas del canto, árboles) se dice en la leyenda. El relieve va
   exagerado 2 veces y también se dice.
   Usa: window.__R3D (ext), window.PAISAJE, window.__MAPA, window.colorLote.
   ============================================================================= */
(function(){
"use strict";
const R3D = window.__R3D;
if(!R3D || !R3D.ext) return;
const X = R3D.ext;

const FOV = 0.42;                 /* lente de la maqueta (la órbita normal usa 0,85) */
const VE  = 2;                    /* exageración del relieve en la maqueta */
const HONDO = 24;                 /* metros de "tierra" bajo la cota más baja del borde */
const LUZ = (()=>{ const A=38*Math.PI/180, Z=245*Math.PI/180;      /* tarde, desde el oeste-suroeste */
  return [Math.cos(A)*Math.sin(Z), Math.cos(A)*Math.cos(Z), Math.sin(A)]; })();

let on=false, gl=null, D=null, progF=null, progP=null, progS=null;
let fondoB=null, pared=null, sombra=null, antes=null;

/* ---------------- sombreadores ---------------- */
/* fondo de estudio: degradé radial, cálido, con un grano fino para que no se vean escalones */
const VS_F=`attribute vec2 p;varying vec2 q;void main(){q=p;gl_Position=vec4(p,0.9999,1.0);}`;
const FS_F=`precision mediump float;varying vec2 q;uniform vec2 AS;
float h(vec2 v){return fract(sin(dot(v,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 r=vec2(q.x*AS.x,q.y)*vec2(0.62,0.8);float d=length(r-vec2(0.0,0.08));
vec3 c=mix(vec3(0.957,0.945,0.918),vec3(0.835,0.812,0.765),smoothstep(0.15,1.25,d));
c+= (h(gl_FragCoord.xy)-0.5)/255.0*1.6;
gl_FragColor=vec4(c,1.0);}`;
/* el canto: capas de suelo según la profundidad bajo la superficie de esa columna */
const VS_P=`attribute vec3 p;attribute vec3 n;attribute float top;
uniform mat4 M;varying vec3 vP;varying vec3 vN;varying float vT;
void main(){vP=p;vN=n;vT=top;gl_Position=M*vec4(p,1.0);}`;
const FS_P=`precision mediump float;varying vec3 vP;varying vec3 vN;varying float vT;
uniform vec3 L;uniform float VE;uniform float ZB;
float h(vec2 v){return fract(sin(dot(v,vec2(12.9898,78.233)))*43758.5453);}
vec3 capa(float d){
  vec3 c=vec3(0.36,0.47,0.24);
  c=mix(c,vec3(0.26,0.19,0.13),smoothstep(0.25,0.45,d));
  c=mix(c,vec3(0.45,0.29,0.18),smoothstep(1.5,1.9,d));
  c=mix(c,vec3(0.60,0.42,0.25),smoothstep(4.2,4.8,d));
  c=mix(c,vec3(0.70,0.55,0.36),smoothstep(8.5,9.2,d));
  c=mix(c,vec3(0.53,0.46,0.38),smoothstep(13.0,13.8,d));
  c=mix(c,vec3(0.40,0.33,0.27),smoothstep(18.0,19.0,d));
  return c;}
void main(){
  float s=vP.x+vP.y*0.7;
  float w=sin(s*0.021)*1.1+sin(s*0.067+1.3)*0.45+sin(s*0.19)*0.15;
  float d=(vT-vP.z)/VE;
  float dd=d+w*smoothstep(0.6,3.0,d);
  vec3 c=capa(dd);
  float g=h(floor(vec2(s*1.6,vP.z*1.6)));
  c*=0.93+0.12*g;
  float pied=h(floor(vec2(s*0.55,vP.z*0.55)));
  if(dd>4.5 && pied>0.93) c*=0.78;
  float luz=max(dot(normalize(vN),normalize(L)),0.0);
  c*=0.62+0.48*luz;
  c*=mix(0.78,1.0,smoothstep(0.0,2.2,(vP.z-ZB)/VE));
  gl_FragColor=vec4(c,1.0);}`;
/* la sombra sobre la mesa */
const VS_S=`attribute vec3 p;attribute vec2 uv;uniform mat4 M;varying vec2 vUv;
void main(){vUv=uv;gl_Position=M*vec4(p,1.0);}`;
const FS_S=`precision mediump float;varying vec2 vUv;uniform sampler2D T;
void main(){float a=texture2D(T,vUv).a;gl_FragColor=vec4(0.20,0.17,0.12,a*0.62);}`;

function programa(vs,fs){
  const c=(t,s)=>{ const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const p=gl.createProgram(); gl.attachShader(p,c(gl.VERTEX_SHADER,vs)); gl.attachShader(p,c(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
const uni=(p,n)=>gl.getUniformLocation(p,n);
function buf(tipo,datos){ const b=gl.createBuffer(); gl.bindBuffer(tipo,b); gl.bufferData(tipo,datos,gl.STATIC_DRAW); return b; }

/* ---------------- el canto del bloque ---------------- */
function hacerPared(){
  const B=X.borde(); if(!B) return null;
  const ve=B.ve, zb=(B.zmin-HONDO)*ve, sg=B.sgn;
  const V=[];                      /* p(3) n(3) top(1) */
  const I=[];
  B.tramos.forEach(([x1,y1,z1,x2,y2,z2,nx,ny])=>{
    const k=V.length/7, ax=nx*sg, ay=ny*sg;
    V.push(x1,y1,z1, ax,ay,0.12, z1,  x2,y2,z2, ax,ay,0.12, z2,  x2,y2,zb, ax,ay,0.12, z2,  x1,y1,zb, ax,ay,0.12, z1);
    I.push(k,k+1,k+2, k,k+2,k+3);
  });
  if(V.length/7>65535) return null;
  return {v:buf(gl.ARRAY_BUFFER,new Float32Array(V)), i:buf(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(I)), c:I.length, ve, zb};
}
/* ---------------- la sombra en la mesa ---------------- */
function desenfocar(a,W,H,r){                   /* tres pasadas de caja: casi gaussiana */
  const t=new Float32Array(W*H);
  for(let pasada=0;pasada<3;pasada++){
    for(let j=0;j<H;j++){ let s=0; for(let i=-r;i<=r;i++) s+=a[j*W+Math.max(0,Math.min(W-1,i))];
      for(let i=0;i<W;i++){ t[j*W+i]=s/(2*r+1); s+=a[j*W+Math.min(W-1,i+r+1)]-a[j*W+Math.max(0,i-r)]; } }
    for(let i=0;i<W;i++){ let s=0; for(let j=-r;j<=r;j++) s+=t[Math.max(0,Math.min(H-1,j))*W+i];
      for(let j=0;j<H;j++){ a[j*W+i]=s/(2*r+1); s+=t[Math.min(H-1,j+r+1)*W+i]-t[Math.max(0,j-r)*W+i]; } }
  }
}
function hacerSombra(zb){
  const paso=4, marg=0.22;
  const x0=D.TER.x-D.ANCHO*marg, y0=D.TER.y-D.ALTO*marg, AW=D.ANCHO*(1+2*marg), AH=D.ALTO*(1+2*marg);
  const W=Math.ceil(AW/paso), H=Math.ceil(AH/paso);
  /* la sombra cae corrida hacia donde no está el sol */
  const kx=-LUZ[0]/Math.hypot(LUZ[0],LUZ[1]), ky=-LUZ[1]/Math.hypot(LUZ[0],LUZ[1]);
  const corr=HONDO*1.4;                         /* metros */
  const dentro=new Float32Array(W*H);
  for(let j=0;j<H;j++) for(let i=0;i<W;i++){
    const wx=x0+(i+0.5)*paso - kx*corr, wy=y0+(j+0.5)*paso + ky*corr;
    dentro[j*W+i]=isNaN(X.alturaEn(wx,wy))?0:1; }
  const chica=Float32Array.from(dentro), grande=Float32Array.from(dentro);
  desenfocar(chica,W,H,2); desenfocar(grande,W,H,9);
  const c=document.createElement("canvas"); c.width=W; c.height=H;
  const cx=c.getContext("2d"), im=cx.createImageData(W,H);
  for(let k=0;k<W*H;k++){ const a=Math.min(1,0.55*chica[k]+0.45*grande[k]); im.data[k*4+3]=Math.round(a*255); }
  cx.putImageData(im,0,0);
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
  /* el cuadro en la escena: x hacia el este, y hacia el norte */
  const z=zb-0.4, ax=x0-D.CX, bx=x0+AW-D.CX, ay=D.CY-y0, by=D.CY-(y0+AH);
  const V=new Float32Array([ax,ay,z,0,0, bx,ay,z,1,0, bx,by,z,1,1, ax,by,z,0,1]);
  return {v:buf(gl.ARRAY_BUFFER,V), i:buf(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3])), tex};
}

/* ---------------- pintar ---------------- */
function pintarFondo(ctx){
  gl.useProgram(progF); gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
  const a=gl.getAttribLocation(progF,"p");
  gl.bindBuffer(gl.ARRAY_BUFFER,fondoB); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  gl.uniform2f(uni(progF,"AS"),ctx.w/ctx.h,1);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.disableVertexAttribArray(a);
  gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
}
function pintarBloque(ctx){
  if(!pared || pared.ve!==ctx.ve){ pared=hacerPared(); if(pared){ sombra=hacerSombra(pared.zb); } }
  if(!pared) return;
  /* el canto */
  gl.useProgram(progP);
  const L=["p","n","top"].map(n=>gl.getAttribLocation(progP,n));
  gl.bindBuffer(gl.ARRAY_BUFFER,pared.v);
  gl.enableVertexAttribArray(L[0]); gl.vertexAttribPointer(L[0],3,gl.FLOAT,false,28,0);
  gl.enableVertexAttribArray(L[1]); gl.vertexAttribPointer(L[1],3,gl.FLOAT,false,28,12);
  gl.enableVertexAttribArray(L[2]); gl.vertexAttribPointer(L[2],1,gl.FLOAT,false,28,24);
  gl.uniformMatrix4fv(uni(progP,"M"),false,ctx.M);
  gl.uniform3fv(uni(progP,"L"),LUZ); gl.uniform1f(uni(progP,"VE"),ctx.ve); gl.uniform1f(uni(progP,"ZB"),pared.zb);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,pared.i); gl.drawElements(gl.TRIANGLES,pared.c,gl.UNSIGNED_SHORT,0);
  L.forEach(l=>gl.disableVertexAttribArray(l));
  /* la sombra en la mesa: debajo de todo, sin escribir profundidad */
  if(sombra){
    gl.useProgram(progS); gl.depthMask(false);
    const S=["p","uv"].map(n=>gl.getAttribLocation(progS,n));
    gl.bindBuffer(gl.ARRAY_BUFFER,sombra.v);
    gl.enableVertexAttribArray(S[0]); gl.vertexAttribPointer(S[0],3,gl.FLOAT,false,20,0);
    gl.enableVertexAttribArray(S[1]); gl.vertexAttribPointer(S[1],2,gl.FLOAT,false,20,12);
    gl.uniformMatrix4fv(uni(progS,"M"),false,ctx.M);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D,sombra.tex); gl.uniform1i(uni(progS,"T"),3);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sombra.i); gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    S.forEach(l=>gl.disableVertexAttribArray(l));
    gl.activeTexture(gl.TEXTURE0); gl.depthMask(true);
  }
}

/* ---------------- sobre la piel: venta más marcada y sombra de los árboles ---------------- */
function piel(x, k){
  const M=window.__MAPA;
  /* lotes no disponibles: el color de venta (rojo; con la bandera del canal si es administrador) */
  if(M){
    x.save();
    k.DATA.lotes.forEach(L=>{
      const f=M.LOTES.features.find(o=>o.properties.lote===L.n); if(!f) return;
      const e=f.properties.estado; if(!e || e==="disponible") return;
      const col=(typeof window.colorLote==="function") ? window.colorLote(f.properties) : "#C0392B";
      k.traza(L.g,1); x.globalAlpha=.34; x.fillStyle=col; x.fill();
      x.globalAlpha=.9; x.lineWidth=Math.max(2,k.M(0.7)); x.strokeStyle="#FFFFFF"; x.stroke();
    });
    x.restore();
  }
  /* la sombra de cada árbol, corrida hacia donde no da el sol. Se dibujan en un
     lienzo a un cuarto del tamaño y se agrandan: el agrandado las difumina
     (un filtro de desenfoque sobre 4096 px es demasiado lento en un celular) */
  const A=(window.PAISAJE && PAISAJE.arbolesPos && PAISAJE.arbolesPos()) || [];
  if(A.length){
    const h=Math.hypot(LUZ[0],LUZ[1]), ux=-LUZ[0]/h, uy=-LUZ[1]/h, tg=LUZ[2]/h, q4=4;
    const c=document.createElement("canvas"); c.width=Math.ceil(k.T/q4); c.height=Math.ceil(k.T/q4);
    const s2=c.getContext("2d"); s2.fillStyle="#18210F";
    A.forEach(([lon,lat,r,alto])=>{
      const largo=alto*0.55/tg;                  /* la copa proyectada, no la punta */
      const q=k.P([lon+ux*largo*0.5/D.KX, lat+uy*largo*0.5/D.KY]);
      s2.beginPath();
      s2.ellipse(q[0]/q4,q[1]/q4,k.M(r*1.05+largo*0.25)/q4,k.M(r*0.95)/q4,Math.atan2(-uy,ux),0,6.2832); s2.fill();
    });
    x.save(); x.globalAlpha=.30; x.imageSmoothingEnabled=true; x.drawImage(c,0,0,k.T,k.T); x.restore();
  }
}

/* ---------------- interfaz ---------------- */
function css(){
  if(document.getElementById("maqCss")) return;
  const s=document.createElement("style"); s.id="maqCss";
  s.textContent=`
.maqTS{position:absolute;inset:0;z-index:3;pointer-events:none;display:none}
main.maqueta .maqTS,.stage.maqueta .maqTS{display:block}
.maqTS i{position:absolute;left:0;right:0;-webkit-backdrop-filter:blur(2.6px) saturate(1.05);backdrop-filter:blur(2.6px) saturate(1.05)}
.maqTS .a{top:0;height:30%;-webkit-mask-image:linear-gradient(#000 0%,#000 25%,transparent 100%);mask-image:linear-gradient(#000 0%,#000 25%,transparent 100%)}
.maqTS .b{bottom:0;height:30%;-webkit-mask-image:linear-gradient(transparent 0%,#000 75%,#000 100%);mask-image:linear-gradient(transparent 0%,#000 75%,#000 100%)}
.maqTS .v{inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 58%,rgba(60,50,35,.16) 100%);-webkit-backdrop-filter:none;backdrop-filter:none}
main.maqueta #c3d,.stage.maqueta #c3d{filter:saturate(1.12) contrast(1.05)}
.maqCard{position:absolute;top:14px;right:16px;z-index:6;display:none;width:min(300px,calc(100% - 32px));
  background:rgba(250,248,242,.92);border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:14px 16px 12px;
  box-shadow:0 10px 30px rgba(40,34,20,.16);color:#23291F;font:13px/1.45 var(--sans,system-ui,sans-serif);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
main.maqueta .maqCard,.stage.maqueta .maqCard{display:block}
body:has(#ficha.on) .maqCard{display:none!important}
.maqCard small{display:block;font:600 10px var(--sans,sans-serif);letter-spacing:.2em;text-transform:uppercase;color:#9B7A48}
.maqCard b.t{display:block;font:500 21px/1.15 var(--serif,Georgia,serif);color:#32402F;margin:3px 0 8px}
.maqCard .ley{display:flex;flex-wrap:wrap;gap:6px 12px;margin:2px 0 8px;font-weight:600;font-size:12.5px}
.maqCard .ley span{display:inline-flex;align-items:center;gap:6px}
.maqCard .ley i{width:11px;height:11px;border-radius:3px;display:inline-block}
.maqCard p{margin:0;color:#5E655A;font-size:11.5px}
.maqCard button{margin-top:10px;border:0;border-radius:999px;padding:8px 14px;font:600 12.5px var(--sans,sans-serif);
  background:#32402F;color:#F4F2EA;cursor:pointer}
.maqCard button:hover{background:#4E6247}
main.maqueta .fondos,.stage.maqueta .fondos{display:none!important}
@media (max-width:820px){.maqCard{top:auto;bottom:62px;right:12px;left:12px;width:auto;padding:9px 12px;
    display:none;grid-template-columns:1fr auto;align-items:center;column-gap:10px}
  main.maqueta .maqCard,.stage.maqueta .maqCard{display:grid}
  .maqCard small,.maqCard p{display:none}
  .maqCard b.t{font-size:15px;margin:0 0 3px;grid-column:1}
  .maqCard .ley{grid-column:1;margin:0;font-size:11.5px;gap:4px 10px}
  .maqCard button{grid-column:2;grid-row:1 / span 2;margin:0;padding:8px 12px;font-size:12px}}
@media (prefers-reduced-motion:reduce){.maqTS i{-webkit-backdrop-filter:none;backdrop-filter:none}}
`;
  document.head.appendChild(s);
}
let ts=null, card=null, bM=null;
function montarCapas(){
  const cv=X.lienzo(), padre=cv && cv.parentElement; if(!padre || ts) return;
  ts=document.createElement("div"); ts.className="maqTS"; ts.setAttribute("aria-hidden","true");
  ts.innerHTML='<i class="a"></i><i class="b"></i><i class="v"></i>';
  padre.insertBefore(ts, cv.nextSibling);
  card=document.createElement("div"); card.className="maqCard";
  padre.appendChild(card);
}
function conteo(){
  const M=window.__MAPA; const c={disponible:0, separado:0, vendido:0};
  if(M) M.LOTES.features.forEach(f=>{ const e=f.properties.estado; if(c[e]!=null) c[e]++; else if(e) c.vendido++; });
  return c;
}
function pintarCard(){
  if(!card) return;
  const c=conteo();
  card.innerHTML='<small>Laureles Campestre</small><b class="t">Maqueta del terreno real</b>'+
    '<div class="ley"><span><i style="background:#4C8862"></i>Disponibles '+c.disponible+'</span>'+
    (c.separado?'<span><i style="background:#C48A2A"></i>Separados '+c.separado+'</span>':'')+
    '<span><i style="background:#C0392B"></i>Vendidos '+c.vendido+'</span></div>'+
    '<p>Topografía del levantamiento y ortofoto del dron. Relieve exagerado 2 veces; las capas del canto y la forma de los árboles son ilustrativas.</p>'+
    '<button type="button" id="maqFoto">Descargar imagen</button>';
  card.querySelector("#maqFoto").onclick=descargar;
}

/* ---------------- encender y apagar ---------------- */
async function poner(v){
  v=!!v; if(v===on) return;
  if(v && !R3D.activo()){ const b=document.getElementById("b3d"); if(b) b.click(); }
  if(v && !R3D.activo()) return;
  gl=X.gl(); D=X.datos();
  if(!progF){
    try{ progF=programa(VS_F,FS_F); progP=programa(VS_P,FS_P); progS=programa(VS_S,FS_S); }
    catch(e){ console.warn("maqueta:",e); try{ avisar("Este dispositivo no puede mostrar la maqueta."); }catch(_){} return; }
    fondoB=buf(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, -1,1, 1,1]));
  }
  css(); montarCapas();
  const st=X.lienzo().parentElement;
  if(v){
    on=true; pintarBoton(true);
    antes={ paisaje: !!(window.PAISAJE && PAISAJE.activo()), ve:R3D.ve(), orb:X.orbita() };
    /* la ortofoto y los árboles vienen del paisaje: se enciende (sin el entorno ni el cielo) */
    if(window.PAISAJE){ PAISAJE.maqueta(true);
      /* si el paisaje todavía está cargando, se espera: al terminar pone su propia luz, cielo y escala */
      if(!PAISAJE.activo()) await PAISAJE.poner(true); else { await PAISAJE.esperar(); await PAISAJE.poner(true); } }
    if(!on) return;                                   /* la apagaron mientras cargaba */
    R3D.exagerar(VE); marcarVe(VE);
    X.fondo(pintarFondo); X.agregar(pintarBloque); X.sinFalda(true);
    X.niebla(0,0,0,0); X.lejos(30000); X.luz(LUZ); X.fov(FOV);
    X.textura(piel);
    st.classList.add("maqueta"); pintarCard();
    /* encuadre: el mismo de "Encuadrar", con el lente más cerrado y un poco más de altura */
    R3D.encuadrar();
    const o=X.orbita(), k=Math.tan(0.425)/Math.tan(FOV/2), r=X.lienzo().getBoundingClientRect();
    /* en un celular parado el predio se gira para que lo largo quede de arriba a abajo */
    if(r.height>r.width*1.15) X.fijarOrbita({az:0.58, panX:0, panY:0, dist:o.dist*k*0.55, elv:0.64});
    else X.fijarOrbita({dist:o.dist*k*0.98, elv:0.64});
    pintarBoton(false);
  } else {
    on=false;
    X.quitar(pintarBloque); X.sinFalda(false); X.fov(0.85); X.textura(null);
    st.classList.remove("maqueta");
    if(window.PAISAJE){ PAISAJE.maqueta(false);
      if(antes && !antes.paisaje) await PAISAJE.poner(false); else await PAISAJE.poner(true); }
    else { X.fondo(null); X.niebla(0.8,0.85,0.9,0); X.lejos(6000); X.luz([-0.42,0.46,0.78]); }
    if(antes){
      /* con el paisaje encendido la escala la pone él (real); si no, se vuelve a la de antes */
      const v0 = (window.PAISAJE && PAISAJE.activo()) ? 1 : antes.ve;
      R3D.exagerar(v0); marcarVe(v0); X.fijarOrbita(antes.orb); }
    R3D.refrescar();
    pintarBoton(false);
  }
}
function marcarVe(v){ document.querySelectorAll("#ve3d [data-ve]").forEach(y=>y.classList.toggle("on", +y.dataset.ve===v)); }
function pintarBoton(cargando){ if(bM){ bM.classList.toggle("on",on); bM.textContent = cargando ? "Maqueta…" : "Maqueta"; } }

/* ---------------- la imagen para redes ---------------- */
function descargar(){
  if(!on) return;
  X.pintarYa();
  const cv=X.lienzo(), W=cv.width, H=cv.height;
  const out=document.createElement("canvas"); out.width=W; out.height=H;
  const o=out.getContext("2d");
  o.filter="saturate(1.12) contrast(1.05)";
  o.drawImage(cv,0,0); o.filter="none";
  /* desenfoque arriba y abajo: se achica y se vuelve a agrandar (sirve en todos los navegadores) */
  const k=6, chico=document.createElement("canvas"); chico.width=Math.ceil(W/k); chico.height=Math.ceil(H/k);
  chico.getContext("2d").drawImage(out,0,0,chico.width,chico.height);
  const borroso=document.createElement("canvas"); borroso.width=W; borroso.height=H;
  const bx=borroso.getContext("2d"); bx.imageSmoothingQuality="high"; bx.drawImage(chico,0,0,W,H);
  bx.globalCompositeOperation="destination-in";
  const g=bx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"rgba(0,0,0,1)"); g.addColorStop(0.08,"rgba(0,0,0,1)"); g.addColorStop(0.30,"rgba(0,0,0,0)");
  g.addColorStop(0.70,"rgba(0,0,0,0)"); g.addColorStop(0.92,"rgba(0,0,0,1)"); g.addColorStop(1,"rgba(0,0,0,1)");
  bx.fillStyle=g; bx.fillRect(0,0,W,H);
  o.drawImage(borroso,0,0);
  /* viñeta */
  const vg=o.createRadialGradient(W/2,H*0.46,Math.min(W,H)*0.35,W/2,H*0.46,Math.max(W,H)*0.75);
  vg.addColorStop(0,"rgba(60,50,35,0)"); vg.addColorStop(1,"rgba(60,50,35,.18)"); o.fillStyle=vg; o.fillRect(0,0,W,H);
  /* rótulo */
  const c=conteo(), u=Math.max(1,W/1400);
  o.fillStyle="rgba(250,248,242,.93)"; const bw=430*u, bh=118*u, px=36*u, py=H-bh-36*u;
  if(o.roundRect){ o.beginPath(); o.roundRect(px,py,bw,bh,14*u); o.fill(); } else o.fillRect(px,py,bw,bh);
  o.fillStyle="#9B7A48"; o.font=`600 ${12*u}px system-ui,sans-serif`; o.fillText("LAURELES CAMPESTRE · LA TEBAIDA, QUINDÍO", px+18*u, py+28*u);
  o.fillStyle="#32402F"; o.font=`500 ${26*u}px Georgia,serif`; o.fillText("Maqueta del terreno real", px+18*u, py+60*u);
  o.font=`600 ${14*u}px system-ui,sans-serif`;
  let xx=px+18*u; const yy=py+92*u;
  [["#4C8862","Disponibles "+c.disponible],["#C0392B","Vendidos "+(c.vendido+c.separado)]].forEach(([col,t])=>{
    o.fillStyle=col; o.fillRect(xx,yy-11*u,12*u,12*u); o.fillStyle="#23291F"; o.fillText(t,xx+18*u,yy); xx+=o.measureText(t).width+44*u; });
  o.fillStyle="rgba(35,41,31,.55)"; o.font=`500 ${11*u}px system-ui,sans-serif`;
  o.fillText("Topografía y ortofoto reales · relieve ×2 · laurelescampestre.co", px+18*u, py+bh+20*u > H-6*u ? H-10*u : py+bh+20*u);
  out.toBlob(b=>{ if(!b) return; const a=document.createElement("a"); a.href=URL.createObjectURL(b);
    a.download="Laureles_maqueta.jpg"; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },800); }, "image/jpeg", 0.92);
}

/* ---------------- botón en la barra del relieve ---------------- */
function montar(){
  const ctl=document.getElementById("ve3d"); if(!ctl || document.getElementById("ve3dMaqueta")) return;
  bM=document.createElement("button"); bM.id="ve3dMaqueta"; bM.type="button";
  bM.title="El predio como maqueta de estudio, con el terreno y la foto reales";
  bM.onclick=()=>poner(!on);
  const et=ctl.querySelector(".et"); ctl.insertBefore(bM, et);
  pintarBoton(false);
  /* al apagar el 3D, la maqueta también */
  const b3=document.getElementById("b3d");
  if(b3) b3.addEventListener("click",()=>{ setTimeout(()=>{ if(on && !R3D.activo()){ on=true; poner(false); } },30); });
  /* si cambian los estados (sincronización), se repinta la piel y la leyenda */
  if(typeof window.refrescar==="function"){
    const prev=window.refrescar;
    window.refrescar=function(){ const r=prev.apply(this,arguments); if(on){ pintarCard(); } return r; };
  }
}
window.MAQUETA={ poner, activo:()=>on, descargar,
  info:()=>({on, pared:pared?pared.c/6:0, zb:pared&&pared.zb, sombra:!!sombra, arboles:(window.PAISAJE&&PAISAJE.arbolesPos)?PAISAJE.arbolesPos().length:0, orb:X.orbita()}) };
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",montar); else montar();
})();
