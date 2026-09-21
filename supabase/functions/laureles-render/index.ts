/* =============================================================================
   laureles-render — "así se vería": render ilustrativo de la casa propuesta
   -----------------------------------------------------------------------------
   Recibe la CAPTURA del 3D del sitio (la casa de bloques implantada en el
   terreno medido, a escala real) y se la pasa a un modelo de imagen de Google
   (Gemini, "Nano Banana") para que la vista como una fotografía, conservando
   la volumetría. La imagen queda en Storage (bucket laureles-renders) y la URL
   en la propuesta (laureles_ia_casas.render_url).

   Secretos:
     GEMINI_API_KEY_LAURELES   obligatoria
     LAURELES_RENDER_MODELO    opcional, por defecto "gemini-3.1-flash-image"
     LAURELES_RENDER_CUPO_DIA  opcional, renders por persona y día (15)
     LAURELES_RENDER_CUPO_MES  opcional, renders del proyecto por mes (300)
     LAURELES_RENDER_ESTILO    opcional, reemplaza las premisas del lenguaje arquitectónico
   ============================================================================= */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const MODELO = Deno.env.get("LAURELES_RENDER_MODELO") || "gemini-3.1-flash-image";
const CUPO_DIA = +(Deno.env.get("LAURELES_RENDER_CUPO_DIA") || 15);
const CUPO_MES = +(Deno.env.get("LAURELES_RENDER_CUPO_MES") || 300);

/* -----------------------------------------------------------------------
   EL LENGUAJE ARQUITECTÓNICO DE LAURELES (premisas fijas, como el manual de
   una PH): todos los renders salen con este mismo lenguaje, sea cual sea la
   casa que el cliente arme. Nace de la Casa 30JB (cubiertas planas con
   parapeto, el arco de acceso a doble altura, patio interior, lamas) llevada
   a una arquitectura brutalista de materiales naturales: concreto a la
   vista, acero negro, vidrio, piedra local y teca. Se puede afinar sin
   redesplegar con el secreto LAURELES_RENDER_ESTILO (reemplaza este texto).
   ----------------------------------------------------------------------- */
const ESTILO_LAURELES = Deno.env.get("LAURELES_RENDER_ESTILO") || `
ARCHITECTURAL LANGUAGE (mandatory, identical in every image):
- Volumes: pure prisms with flat roofs and thin parapets; one taller double-height entrance volume with a semicircular concrete arch (the signature of the project); strong horizontality; cantilevered slabs of 1.5-2.5 m shading the terraces; an inner patio with a single tree.
- Materials, closed palette: board-formed exposed concrete (warm grey, wood-grain texture) for the main walls and slabs; matte black steel for window frames, pergolas, railings and the carport structure; floor-to-ceiling clear glass towards the back and the view; local river stone in plinths, retaining walls and the pool coping; teak wood in decks, terrace ceilings and sun louvers; gravel and lawn.
- Colors: concrete grey, black steel, honey teak, deep green landscape. NO white stucco, NO clay roof tiles, NO pitched roofs, NO ceramic cladding, NO bright colors, NO PVC, NO ornamental mouldings.
- Openings: large floor-to-ceiling glazing towards the back and the view; the street facade is closed and massive with few high slot windows; wooden or steel louvers on the west side for sun control.
- Pool: infinity edge towards the view, dark grey lining (green-blue water), stone coping, teak deck flush with the social floor level.
- Ground: the house sits on a platform; concrete or stone retaining walls; exterior stone stairs; gardens with yellow guayacán trees, palms, coffee plants and heliconias; hedges instead of fences.
- Light and camera: late afternoon (16:30), long soft shadows, warm interior light through the glass; the camera and framing of the input image are kept exactly.
`.trim();

function promptRender(f: any, extra: string): string {
  const vista = f?.vista_hacia ? `The main view of the lot is towards the ${f.vista_hacia}.` : "";
  return `Turn this 3D massing image into a photorealistic architectural rendering, keeping EXACTLY the same camera, the same position, proportions, number of storeys and footprint of every volume, the pool and the deck. Do not add, move or remove buildings. No text, no logos, no people in the foreground. Setting: the Colombian coffee region (Eje Cafetero, Quindío), the Cordillera Central mountains in the background. ${vista}
${ESTILO_LAURELES}
${extra ? "Client wishes (only where they do not contradict the architectural language above): " + extra : ""}`.trim();
}

/* busca la imagen en cualquier forma de respuesta */
function buscarImagen(o: any, prof = 0): { data: string; mime: string } | null {
  if (!o || prof > 8) return null;
  if (typeof o === "object") {
    if (typeof o.data === "string" && o.data.length > 1000 && (o.type === "image" || o.mime_type || o.mimeType))
      return { data: o.data, mime: o.mime_type || o.mimeType || "image/jpeg" };
    if (o.inlineData && typeof o.inlineData.data === "string") return { data: o.inlineData.data, mime: o.inlineData.mimeType || "image/jpeg" };
    if (o.inline_data && typeof o.inline_data.data === "string") return { data: o.inline_data.data, mime: o.inline_data.mime_type || "image/jpeg" };
    if (typeof o.output_image === "string" && o.output_image.length > 1000) return { data: o.output_image, mime: "image/jpeg" };
    for (const k of Object.keys(o)) { const r = buscarImagen(o[k], prof + 1); if (r) return r; }
  }
  if (Array.isArray(o)) for (const x of o) { const r = buscarImagen(x, prof + 1); if (r) return r; }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Sólo POST" }, 405);
  const llave = Deno.env.get("GEMINI_API_KEY_LAURELES");
  if (!llave) return json({ error: "Falta el secreto GEMINI_API_KEY_LAURELES en Supabase." }, 500);

  const auth = req.headers.get("Authorization") || "";
  const jwt = auth.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Hace falta una sesión de administrador." }, 401);
  const url = Deno.env.get("SUPABASE_URL")!, anon = Deno.env.get("SUPABASE_ANON_KEY")!, servicio = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sbUser = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
  const { data: u, error: eU } = await sbUser.auth.getUser(jwt);
  if (eU || !u?.user) return json({ error: "La sesión no es válida o venció." }, 401);
  const usuario = u.user.id, correo = u.user.email || "";

  const sb = createClient(url, servicio);
  const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
  const mes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));
  const [{ count: nDia }, { count: nMes }] = await Promise.all([
    sb.from("laureles_ia_uso").select("*", { count: "exact", head: true }).eq("usuario", usuario).like("modelo", "gemini%").gte("creado", hoy.toISOString()),
    sb.from("laureles_ia_uso").select("*", { count: "exact", head: true }).like("modelo", "gemini%").gte("creado", mes.toISOString()),
  ]);
  if ((nDia ?? 0) >= CUPO_DIA) return json({ error: `Llegaste al cupo de ${CUPO_DIA} renders por día.` }, 429);
  if ((nMes ?? 0) >= CUPO_MES) return json({ error: `El proyecto llegó al tope de ${CUPO_MES} renders este mes.` }, 429);

  let b: any;
  try { b = await req.json(); } catch { return json({ error: "Cuerpo inválido." }, 400); }
  const lote = +b.lote, casaId = b.casa_id ? +b.casa_id : null;
  const img = String(b.imagen || "");                    /* dataURL o base64 */
  const m = img.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
  const mime = m ? m[1] : "image/jpeg", data = m ? m[2] : img;
  if (!lote || data.length < 1000) return json({ error: "Falta la captura del 3D." }, 400);
  if (data.length > 6_000_000) return json({ error: "La captura es demasiado grande." }, 413);
  const extra = String(b.extra || "").slice(0, 600);
  const prompt = promptRender(b.ficha || {}, extra);

  const t0 = Date.now();
  let salida: { data: string; mime: string } | null = null, via = "", detalle = "";
  /* 1. Interactions API (la documentada hoy) */
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST", headers: { "x-goog-api-key": llave, "content-type": "application/json" },
      body: JSON.stringify({ model: MODELO, input: [{ type: "text", text: prompt }, { type: "image", mime_type: mime, data }],
        response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "16:9", image_size: "2K" } }),
    });
    const j: any = await r.json().catch(() => ({}));
    if (r.ok) { salida = buscarImagen(j); via = "interactions"; if (!salida) detalle = "interactions sin imagen"; }
    else detalle = "interactions " + r.status + " " + (j?.error?.message || "").slice(0, 200);
  } catch (e) { detalle = "interactions: " + String(e).slice(0, 200); }
  /* 2. generateContent, por si el proyecto/clave no tiene la otra */
  if (!salida) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": llave, "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data } }] }],
          generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9", imageSize: "2K" } } }),
      });
      const j: any = await r.json().catch(() => ({}));
      if (r.ok) { salida = buscarImagen(j); via = "generateContent"; if (!salida) detalle += " | generateContent sin imagen"; }
      else detalle += " | generateContent " + r.status + " " + (j?.error?.message || "").slice(0, 200);
    } catch (e) { detalle += " | generateContent: " + String(e).slice(0, 200); }
  }
  if (!salida) {
    await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: "gemini:" + MODELO, ok: false, error: detalle.slice(0, 300) });
    return json({ error: "Gemini no devolvió imagen. " + detalle }, 502);
  }
  /* 3. a Storage */
  const bytes = Uint8Array.from(atob(salida.data), c => c.charCodeAt(0));
  const ext = salida.mime.includes("png") ? "png" : salida.mime.includes("webp") ? "webp" : "jpg";
  const ruta = `lote-${lote}/${Date.now()}-${usuario.slice(0, 8)}.${ext}`;
  const up = await sb.storage.from("laureles-renders").upload(ruta, bytes, { contentType: salida.mime, upsert: false });
  if (up.error) {
    await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: "gemini:" + MODELO, ok: false, error: "storage: " + up.error.message.slice(0, 250) });
    return json({ error: "No se pudo guardar el render: " + up.error.message }, 500);
  }
  const pub = sb.storage.from("laureles-renders").getPublicUrl(ruta).data.publicUrl;
  if (casaId) await sb.from("laureles_ia_casas").update({ render_url: pub, render_prompt: prompt }).eq("id", casaId);
  await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: "gemini:" + MODELO, ok: true });
  return json({ url: pub, via, modelo: MODELO, ms: Date.now() - t0, mime: salida.mime, uso: { hoy: (nDia ?? 0) + 1, cupo_dia: CUPO_DIA } });
});
