/* =============================================================================
   VISTA 360° DESDE EL LOTE
   -----------------------------------------------------------------------------
   Las panorámicas esféricas que toma el dron sobre cada lote (8 m de altura,
   ver los términos de referencia del vuelo). Se publican en medios/360/ con un
   índice, medios/360/indice.json:
     { "panoramicas": [ { "lote": 27, "archivo": "lote-27.jpg",
                          "azimut": 123.4, "altura_m": 8, "fecha": "2026-10-15" } ] }
   azimut = rumbo, en grados desde el norte, del centro de la imagen.
   Mientras no haya fotos, no aparece nada: no se muestra ninguna vista que no
   sea la real.
   ============================================================================= */
(function(){
"use strict";
let indice=null, pedido=null;
function cargarIndice(){
  if(!pedido) pedido=fetch("medios/360/indice.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).catch(()=>null)
    .then(j=>{ indice=new Map(((j&&j.panoramicas)||[]).map(p=>[+p.lote,p])); return indice; });
  return pedido;
}

/* ---------------- visor WebGL ---------------- */
let ov=null, gl=null, prog=null, esfera=null, tex=null, yaw=0, pitch=0, fov=1.35, raf=0, actual=null;
const VS=`attribute vec3 p;attribute vec2 uv;uniform mat4 M;varying vec2 vUv;void main(){vUv=uv;gl_Position=M*vec4(p,1.0);}`;
const FS=`precision mediump float;varying vec2 vUv;uniform sampler2D T;void main(){gl_FragColor=texture2D(T,vUv);}`;
function css(){
  if(document.getElementById("v360Css")) return;
  const s=document.createElement("style"); s.id="v360Css";
  s.textContent=`
#v360{position:fixed;inset:0;z-index:80;background:#0E120D;display:flex;flex-direction:column}
#v360[hidden]{display:none}
#v360 canvas{flex:1;width:100%;height:100%;touch-action:none;cursor:grab;display:block}
#v360 .v360Top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:12px 14px;
  padding-top:calc(12px + env(safe-area-inset-top,0px));background:linear-gradient(rgba(14,18,13,.7),rgba(14,18,13,0));color:#F6F4EC}
#v360 .v360Top b{font-family:var(--serif,serif);font-size:20px;font-weight:600}
#v360 .v360Top span{font-size:12px;opacity:.8}
#v360 .v360Top .sp{flex:1}
#v360 button{border:1px solid rgba(246,244,236,.4);background:rgba(14,18,13,.35);color:#F6F4EC;border-radius:999px;padding:8px 14px;font:600 13px var(--sans,sans-serif);cursor:pointer}
#v360 .brujula{position:absolute;right:16px;bottom:calc(18px + env(safe-area-inset-bottom,0px));width:54px;height:54px;border-radius:50%;
  background:rgba(14,18,13,.55);border:1px solid rgba(246,244,236,.35);display:grid;place-items:center}
#v360 .brujula svg{width:40px;height:40px;transition:transform .05s linear}
#v360 .v360Pie{position:absolute;left:16px;bottom:calc(18px + env(safe-area-inset-bottom,0px));color:#F6F4EC;font-size:11.5px;opacity:.8;max-width:60%}`;
  document.head.appendChild(s);
}
function persp(f,a,n,fa){ const t=1/Math.tan(f/2), o=new Float32Array(16); o[0]=t/a;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa); return o; }
function vista(){ /* cámara en el centro mirando por yaw (desde el norte) y pitch */
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
  const f=[sy*cp, cy*cp, sp];                 /* adelante: x=este, y=norte, z=arriba */
  const r=[cy, -sy, 0];                       /* derecha */
  const u=[r[1]*f[2]-r[2]*f[1], r[2]*f[0]-r[0]*f[2], r[0]*f[1]-r[1]*f[0]];
  return new Float32Array([r[0],u[0],-f[0],0, r[1],u[1],-f[1],0, r[2],u[2],-f[2],0, 0,0,0,1]);
}
function mul(a,b){ const o=new Float32Array(16); for(let i=0;i<4;i++)for(let j=0;j<4;j++){ let s=0; for(let k=0;k<4;k++) s+=a[k*4+j]*b[i*4+k]; o[i*4+j]=s; } return o; }
function malla(azCentro){
  /* esfera con u = 0,5 en el azimut del centro de la foto */
  const V=[], I=[], NA=48, NB=96, a0=azCentro*Math.PI/180;
  for(let i=0;i<=NA;i++){ const el=Math.PI/2-Math.PI*i/NA;
    for(let j=0;j<=NB;j++){ const az=a0-Math.PI+2*Math.PI*j/NB;
      V.push(Math.cos(el)*Math.sin(az), Math.cos(el)*Math.cos(az), Math.sin(el), j/NB, i/NA); } }
  for(let i=0;i<NA;i++) for(let j=0;j<NB;j++){ const k=i*(NB+1)+j; I.push(k,k+NB+1,k+1, k+1,k+NB+1,k+NB+2); }
  const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(V),gl.STATIC_DRAW);
  const ib=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(I),gl.STATIC_DRAW);
  return {vb,ib,c:I.length};
}
function pintar(){
  raf=0; if(!gl||!esfera||!tex) return;
  const cv=gl.canvas, r=cv.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
  const w=Math.round(r.width*dpr), h=Math.round(r.height*dpr); if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
  gl.viewport(0,0,w,h); gl.clearColor(0.05,0.07,0.05,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(prog);
  const ap=gl.getAttribLocation(prog,"p"), au=gl.getAttribLocation(prog,"uv");
  gl.bindBuffer(gl.ARRAY_BUFFER,esfera.vb);
  gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap,3,gl.FLOAT,false,20,0);
  gl.enableVertexAttribArray(au); gl.vertexAttribPointer(au,2,gl.FLOAT,false,20,12);
  gl.uniformMatrix4fv(gl.getUniformLocation(prog,"M"),false,mul(persp(fov,w/h,0.05,10),vista()));
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex); gl.uniform1i(gl.getUniformLocation(prog,"T"),0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,esfera.ib); gl.drawElements(gl.TRIANGLES,esfera.c,gl.UNSIGNED_SHORT,0);
  const b=ov.querySelector(".brujula svg"); if(b) b.style.transform="rotate("+(-yaw*180/Math.PI)+"deg)";
}
const pedir=()=>{ if(!raf) raf=requestAnimationFrame(pintar); };
function montar(){
  css();
  ov=document.createElement("div"); ov.id="v360"; ov.hidden=true; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Vista 360° desde el lote");
  ov.innerHTML='<canvas></canvas><div class="v360Top"><div><b id="v360T"></b><br><span id="v360S"></span></div><div class="sp"></div><button id="v360X">Cerrar</button></div>'+
    '<div class="brujula" title="Norte"><svg viewBox="0 0 40 40"><path d="M20 4l6 16h-12z" fill="#C9A86B"/><path d="M20 36l-6-16h12z" fill="#F6F4EC" opacity=".55"/><text x="20" y="14" text-anchor="middle" font-size="7" font-weight="700" fill="#0E120D" font-family="sans-serif">N</text></svg></div>'+
    '<div class="v360Pie" id="v360P"></div>';
  document.body.appendChild(ov);
  const cv=ov.querySelector("canvas");
  gl=cv.getContext("webgl",{antialias:true});
  if(!gl) return false;
  const c=(t,s)=>{ const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); return o; };
  prog=gl.createProgram(); gl.attachShader(prog,c(gl.VERTEX_SHADER,VS)); gl.attachShader(prog,c(gl.FRAGMENT_SHADER,FS)); gl.linkProgram(prog);
  ov.querySelector("#v360X").onclick=cerrar;
  addEventListener("keydown",e=>{ if(e.key==="Escape" && !ov.hidden) cerrar(); });
  const pts=new Map(); let arr=null, pin=null;
  cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){ const [a,b]=[...pts.values()]; pin={d:Math.hypot(a.x-b.x,a.y-b.y),fov}; arr=null; }
    else arr={x:e.clientX,y:e.clientY,yaw,pitch}; });
  cv.addEventListener("pointermove",e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pin&&pts.size===2){ const [a,b]=[...pts.values()]; fov=Math.max(0.5,Math.min(1.8,pin.fov*pin.d/Math.hypot(a.x-b.x,a.y-b.y))); pedir(); return; }
    if(!arr) return; const k=fov/cv.getBoundingClientRect().height;
    yaw=arr.yaw-(e.clientX-arr.x)*k; pitch=Math.max(-1.4,Math.min(1.4,arr.pitch+(e.clientY-arr.y)*k)); pedir(); });
  ["pointerup","pointercancel"].forEach(t=>cv.addEventListener(t,e=>{ pts.delete(e.pointerId); if(pts.size<2) pin=null; arr=null; }));
  cv.addEventListener("wheel",e=>{ e.preventDefault(); fov=Math.max(0.5,Math.min(1.8,fov*(e.deltaY>0?1.08:0.93))); pedir(); },{passive:false});
  addEventListener("resize",()=>{ if(!ov.hidden) pedir(); });
  return true;
}
async function abrir(lote){
  await cargarIndice(); const P=indice&&indice.get(+lote); if(!P) return;
  if(!ov && !montar()) return;
  ov.hidden=false; actual=P;
  ov.querySelector("#v360T").textContent="Vista desde el lote "+lote;
  ov.querySelector("#v360S").textContent="Foto 360° del dron a "+String(P.altura_m||8).replace(".",",")+" m del suelo"+(P.fecha?" · "+P.fecha:"");
  ov.querySelector("#v360P").textContent="Arrastra para mirar alrededor · pellizca o usa la rueda para acercar";
  const im=new Image(); im.src="medios/360/"+P.archivo;
  await im.decode().catch(()=>{});
  if(!im.naturalWidth){ ov.querySelector("#v360P").textContent="No se pudo cargar la foto."; return; }
  /* WebGL 1 no repite texturas que no sean potencia de 2: se ajusta el tamaño */
  const max=gl.getParameter(gl.MAX_TEXTURE_SIZE), W=Math.min(max,8192,1<<Math.ceil(Math.log2(im.naturalWidth))), H=W/2;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H; cv.getContext("2d").drawImage(im,0,0,W,H);
  if(!tex) tex=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,cv);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  esfera=malla(+P.azimut||0);
  /* arranca mirando hacia donde mira la ladera del lote, si se sabe */
  const f=window.__MAPA && __MAPA.LOTES.features.find(x=>x.properties.lote===+lote);
  const rumbo={norte:0,nororiente:45,oriente:90,suroriente:135,sur:180,suroccidente:225,occidente:270,noroccidente:315};
  yaw=((f&&f.properties.topo_ok&&rumbo[f.properties.vista_hacia])||(+P.azimut||0))*Math.PI/180; pitch=-0.05; fov=1.35;
  pedir();
}
function cerrar(){ if(ov) ov.hidden=true; }

/* tarjeta en la ficha, sólo si ese lote ya tiene su foto */
const ICONO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><ellipse cx="12" cy="12" rx="9" ry="4"/><path d="M12 3v2M12 19v2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>';
(window.FICHA_EXTRAS=window.FICHA_EXTRAS||[]).push((p,caja)=>{
  if(!caja) return;
  cargarIndice().then(ix=>{
    if(!ix || !ix.has(+p.lote) || !caja.isConnected) return;
    const b=document.createElement("button"); b.className="fxCard"; b.type="button";
    b.innerHTML='<span class="ic">'+ICONO+'</span><span><b>Mira la vista desde este lote</b><span>Foto 360° real, tomada con el dron sobre el lote</span></span>';
    b.onclick=()=>abrir(p.lote);
    caja.insertBefore(b, caja.firstChild);
  });
});
window.VISOR360={abrir, cerrar, indice:()=>cargarIndice()};
})();
