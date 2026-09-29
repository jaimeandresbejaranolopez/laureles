/* =============================================================================
   laureles-aviso — dos correos por cada registro de la página:

   1. AL EQUIPO: cada vez que alguien se registra (laureles_visitantes) o pide
      una visita (laureles_visitas). Destinatarios: laureles_config.aviso_correo
      (uno o varios, separados por coma).
   2. AL CLIENTE (respuesta automática): bienvenida con el brochure, el mapa
      dinámico y el WhatsApp; o la confirmación de que su solicitud de visita
      llegó. Sólo sale si laureles_config.respuesta_cliente = 'si' y hay un
      remitente de dominio propio (laureles_config.aviso_remitente, p. ej.
      "Laureles Campestre <info@laurelescampestre.co>", verificado en Resend).
      Mientras tanto sólo se manda cuando el cliente es alguien de aviso_correo
      (sirve para probar). A la misma persona se le da la bienvenida una sola vez.

   La llaman los disparadores de la base (pg_net) justo después de cada
   inserción. No es para el navegador: exige la cabecera x-aviso-token, que
   debe coincidir con laureles_config.aviso_token (tabla privada).
   El correo sale por Resend con el secreto RESEND_API_KEY
   (Supabase → Edge Functions → Secrets). Ninguna llave vive en el código.
   ============================================================================= */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITIO = "https://www.laurelescampestre.co";
const BROCHURE = SITIO + "/medios/Laureles_Campestre_Brochure.pdf";
const WA = (t: string) => (Deno.env.get("SUPABASE_URL") || "") + "/functions/v1/laureles-wa?c=portada&t=" + encodeURIComponent(t);

const sb = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
async function cfg(clave: string): Promise<string> {
  const { data } = await sb().from("laureles_config").select("valor").eq("clave", clave).maybeSingle();
  return String(data?.valor || "");
}
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const fila = (k: string, v: unknown) => v === null || v === undefined || v === "" ? "" :
  `<tr><td style="padding:8px 14px 8px 0;color:#67705F;font-size:13px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:8px 0;font-size:15px;color:#1C221B">${esc(v)}</td></tr>`;
const fecha = (iso: string) => { try { return new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "long", timeStyle: "short" }); } catch { return iso; } };
const dia = (d: string, l = "es") => { try { return new Date(d + "T12:00:00-05:00").toLocaleDateString(l === "en" ? "en-US" : l === "fr" ? "fr-FR" : "es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long" }); } catch { return d; } };
const hora12 = (h: unknown) => { const m = String(h || "").match(/^(\d{2}):(\d{2})$/); if (!m) return ""; const n = +m[1]; return `${n > 12 ? n - 12 : n}:${m[2]} ${n < 12 ? "a. m." : n === 12 ? "m." : "p. m."}`; };
const franjaTxt = (f: unknown) => f === "manana" ? "Mañana (7 a. m. a 12 m.)" : f === "tarde" ? "Tarde (1 a 4 p. m.)" : String(f || "");
const soloDigitos = (t: string) => String(t || "").replace(/\D/g, "");

/* ------------------------------ 1. al equipo ------------------------------ */
function correoEquipo(tipo: string, r: Record<string, unknown>) {
  const visita = tipo === "visita";
  const titulo = visita ? "Nueva solicitud de visita" : "Nueva persona registrada";
  const tel = soloDigitos(String(r.telefono || ""));
  const wa = tel ? `https://wa.me/${tel.length === 10 ? "57" + tel : tel}` : "";
  const filas = visita
    ? fila("Nombre", r.nombre) + fila("Teléfono", r.telefono) + fila("Correo", r.correo) + fila("Lote de interés", r.lote) +
      fila("Fecha pedida", r.fecha ? dia(String(r.fecha)) : "") + fila("Hora", hora12(r.hora) || franjaTxt(r.franja)) + fila("Notas", r.notas) +
      fila("Registrado", fecha(String(r.creado || "")))
    : fila("Nombre", r.nombre) + fila("Teléfono", r.telefono) + fila("Correo", r.correo) + fila("Idioma", r.idioma) +
      fila("Llegó desde", r.origen) + fila("Aceptó la política", r.acepta_politica ? "Sí" : "No") + fila("Registrado", fecha(String(r.creado || "")));
  const html = marco(titulo, `<table style="border-collapse:collapse;width:100%">${filas}</table>
      ${wa ? boton(wa, "Escribirle por WhatsApp") : ""}
      ${r.correo ? `<p style="margin:8px 0 0;font-size:13px"><a href="mailto:${esc(r.correo)}" style="color:#9B7A48">Responder por correo</a></p>` : ""}
      <p style="margin:14px 0 0;font-size:13px"><a href="${SITIO}/?panel=1" style="color:#9B7A48">Abrir el panel de prospectos</a></p>`,
    "Aviso automático de www.laurelescampestre.co");
  const texto = `${titulo}\n` + Object.entries(r).filter(([k, v]) => v !== null && v !== "" && !["id", "navegador", "version_politica"].includes(k)).map(([k, v]) => `${k}: ${v}`).join("\n");
  const asunto = visita ? `Visita solicitada: ${r.nombre || "sin nombre"}${r.fecha ? " · " + r.fecha : ""}${r.hora ? " " + hora12(r.hora) : ""}`
                        : `Nuevo registro en Laureles: ${r.nombre || "sin nombre"}`;
  return { asunto, html, texto };
}

const boton = (href: string, txt: string, claro = false) =>
  `<p style="margin:16px 0 4px"><a href="${href}" style="display:inline-block;background:${claro ? "#EBD9AE" : "#32402F"};color:${claro ? "#32402F" : "#F6F4EC"};text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;font-size:15px">${txt}</a></p>`;
const marco = (titulo: string, cuerpo: string, pie: string, sobre = "Laureles Campestre") =>
  `<div style="background:#F4F2EA;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#FFFDF7;border:1px solid #DDD6C4;border-radius:14px;overflow:hidden">
    <div style="background:#32402F;color:#F6F4EC;padding:20px 24px">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#EBD9AE">${sobre}</div>
      <div style="font-size:22px;margin-top:4px;font-family:Georgia,serif">${titulo}</div></div>
    <div style="padding:18px 24px;font-size:15px;line-height:1.55;color:#1C221B">${cuerpo}</div>
    <div style="padding:12px 24px;border-top:1px solid #DDD6C4;font-size:11px;line-height:1.5;color:#67705F">${pie}</div>
  </div></div>`;

/* ------------------------------ 2. al cliente ----------------------------- */
const TX: Record<string, Record<string, string>> = {
  es: {
    hola: "Hola", gracias: "Gracias por registrarte en Laureles Campestre.",
    intro: "Te dejamos a la mano lo que necesitas para conocer el proyecto: 86 lotes campestres en El Caimo, Armenia, Quindío.",
    broT: "Brochure del proyecto", broP: "Ubicación, urbanismo, áreas, precios por etapa y formas de pago, en PDF.", broB: "Descargar el brochure",
    mapT: "Mapa dinámico", mapP: "Disponibilidad en vivo, la ficha de cada lote, el terreno en 3D y el análisis de pendientes.", mapB: "Abrir el mapa",
    waT: "¿Hablamos?", waP: "Un asesor te responde por WhatsApp y te ayuda a escoger lote o a agendar la visita al predio.", waB: "Escribir por WhatsApp",
    waTxt: "Hola, me registré en la página de Laureles Campestre y quiero más información.",
    firma: "Equipo comercial · Laureles Campestre",
    pie: "Recibes este correo porque te registraste en www.laurelescampestre.co y autorizaste el tratamiento de tus datos. Si no quieres recibir más información, responde a este correo y te retiramos de la lista.",
    asunto: "Bienvenido a Laureles Campestre: brochure y mapa dinámico",
    visT: "Recibimos tu solicitud de visita", visP: "Un asesor te escribe para confirmar la cita. Esto es lo que nos pediste:",
    visF: "Fecha", visH: "Hora", visL: "Lote de interés", visAs: "Solicitud de visita recibida",
    visWa: "Hola, pedí una visita a Laureles Campestre y quiero confirmarla.",
  },
  en: {
    hola: "Hi", gracias: "Thank you for registering at Laureles Campestre.",
    intro: "Here is everything you need to get to know the project: 86 country lots in El Caimo, Armenia, Quindío (Colombia).",
    broT: "Project brochure", broP: "Location, layout, areas, prices by phase and payment plans, as a PDF (in Spanish).", broB: "Download the brochure",
    mapT: "Interactive map", mapP: "Live availability, a sheet for every lot, the terrain in 3D and the slope analysis.", mapB: "Open the map",
    waT: "Shall we talk?", waP: "An advisor will answer on WhatsApp and help you choose a lot or book a site visit.", waB: "Message us on WhatsApp",
    waTxt: "Hi, I registered on the Laureles Campestre website and would like more information.",
    firma: "Sales team · Laureles Campestre",
    pie: "You are receiving this email because you registered at www.laurelescampestre.co and authorised the processing of your data. To stop receiving information, reply to this email.",
    asunto: "Welcome to Laureles Campestre: brochure and interactive map",
    visT: "We received your visit request", visP: "An advisor will contact you to confirm. This is what you asked for:",
    visF: "Date", visH: "Time", visL: "Lot of interest", visAs: "Visit request received",
    visWa: "Hi, I requested a visit to Laureles Campestre and would like to confirm it.",
  },
  fr: {
    hola: "Bonjour", gracias: "Merci de vous être inscrit sur Laureles Campestre.",
    intro: "Voici tout ce qu'il faut pour découvrir le projet : 86 terrains à la campagne à El Caimo, Armenia, Quindío (Colombie).",
    broT: "Brochure du projet", broP: "Situation, plan, surfaces, prix par étape et modalités de paiement, en PDF (en espagnol).", broB: "Télécharger la brochure",
    mapT: "Carte interactive", mapP: "Disponibilité en direct, la fiche de chaque terrain, le relief en 3D et l'analyse des pentes.", mapB: "Ouvrir la carte",
    waT: "On en parle ?", waP: "Un conseiller vous répond sur WhatsApp et vous aide à choisir un terrain ou à planifier une visite.", waB: "Écrire sur WhatsApp",
    waTxt: "Bonjour, je me suis inscrit sur le site de Laureles Campestre et je souhaite plus d'informations.",
    firma: "Équipe commerciale · Laureles Campestre",
    pie: "Vous recevez ce courriel parce que vous vous êtes inscrit sur www.laurelescampestre.co et avez autorisé le traitement de vos données. Pour ne plus recevoir d'informations, répondez à ce courriel.",
    asunto: "Bienvenue à Laureles Campestre : brochure et carte interactive",
    visT: "Nous avons reçu votre demande de visite", visP: "Un conseiller vous contactera pour confirmer. Voici votre demande :",
    visF: "Date", visH: "Heure", visL: "Terrain", visAs: "Demande de visite reçue",
    visWa: "Bonjour, j'ai demandé une visite à Laureles Campestre et je souhaite la confirmer.",
  },
};
const bloque = (t: string, p: string, b: string) =>
  `<div style="border-top:1px solid #E6E0CF;padding-top:14px;margin-top:16px"><div style="font-family:Georgia,serif;font-size:18px;color:#32402F">${t}</div><div style="color:#4A5246;font-size:14px;margin-top:4px">${p}</div>${b}</div>`;

function correoCliente(tipo: string, r: Record<string, unknown>) {
  const l = ["es", "en", "fr"].includes(String(r.idioma)) ? String(r.idioma) : "es";
  const t = TX[l];
  const nombre = esc(String(r.nombre || "").trim().split(/\s+/)[0] || "");
  const mapa = SITIO + (r.lote ? `/lote/${r.lote}/` : "/");
  if (tipo === "visita") {
    const filas = fila(t.visF, r.fecha ? dia(String(r.fecha), l) : "") + fila(t.visH, hora12(r.hora) || franjaTxt(r.franja)) + fila(t.visL, r.lote);
    const html = marco(t.visT, `<p style="margin:0 0 10px">${t.hola}${nombre ? " " + nombre : ""},</p><p style="margin:0 0 6px">${t.visP}</p>
      <table style="border-collapse:collapse;width:100%">${filas}</table>
      ${boton(WA(t.visWa), t.waB)}
      ${bloque(t.broT, t.broP, boton(BROCHURE, t.broB, true))}
      <p style="margin:18px 0 0;color:#4A5246">${t.firma}</p>`, t.pie);
    const texto = `${t.hola} ${nombre},\n${t.visP}\n${t.visF}: ${r.fecha || ""}\n${t.visH}: ${hora12(r.hora) || franjaTxt(r.franja)}\n${r.lote ? t.visL + ": " + r.lote + "\n" : ""}\n${t.waB}: ${WA(t.visWa)}\n${t.broB}: ${BROCHURE}\n\n${t.firma}`;
    return { asunto: t.visAs + " · Laureles Campestre", html, texto };
  }
  const html = marco(t.gracias, `<p style="margin:0 0 10px">${t.hola}${nombre ? " " + nombre : ""},</p><p style="margin:0">${t.intro}</p>
      ${bloque(t.broT, t.broP, boton(BROCHURE, t.broB))}
      ${bloque(t.mapT, t.mapP, boton(mapa, t.mapB, true))}
      ${bloque(t.waT, t.waP, boton(WA(t.waTxt), t.waB))}
      <p style="margin:20px 0 0;color:#4A5246">${t.firma}</p>`, t.pie);
  const texto = `${t.hola} ${nombre},\n${t.gracias}\n${t.intro}\n\n${t.broB}: ${BROCHURE}\n${t.mapB}: ${mapa}\n${t.waB}: ${WA(t.waTxt)}\n\n${t.firma}\n\n${t.pie}`;
  return { asunto: t.asunto, html, texto };
}

async function enviar(llave: string, cuerpo: Record<string, unknown>) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { "Authorization": "Bearer " + llave, "Content-Type": "application/json" }, body: JSON.stringify(cuerpo),
  });
  return { ok: resp.ok, estado: resp.status, detalle: (await resp.text()).slice(0, 300) };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Sólo POST", { status: 405 });
  const token = req.headers.get("x-aviso-token") || "";
  const esperado = await cfg("aviso_token");
  if (!esperado || token !== esperado) return new Response("No autorizado", { status: 401 });
  const llave = Deno.env.get("RESEND_API_KEY");
  if (!llave) return new Response("Falta el secreto RESEND_API_KEY", { status: 503 });
  let cuerpo: { tipo?: string; registro?: Record<string, unknown> } = {};
  try { cuerpo = await req.json(); } catch { return new Response("JSON inválido", { status: 400 }); }
  const tipo = cuerpo.tipo === "visita" ? "visita" : "visitante";
  const r = cuerpo.registro || {};
  const para = (await cfg("aviso_correo")).split(",").map(s => s.trim()).filter(Boolean);
  if (!para.length) return new Response("Sin destinatario (laureles_config.aviso_correo)", { status: 503 });
  const remitente = await cfg("aviso_remitente");
  const de = remitente || "Laureles Campestre <onboarding@resend.dev>";

  /* 1. al equipo */
  const e = correoEquipo(tipo, r);
  const equipo = await enviar(llave, { from: de, to: para, subject: e.asunto, html: e.html, text: e.texto, ...(r.correo ? { reply_to: String(r.correo) } : {}) });

  /* 2. al cliente */
  let cliente: unknown = "no aplica";
  const dest = String(r.correo || "").trim().toLowerCase();
  const activa = (await cfg("respuesta_cliente")).toLowerCase() === "si" && !!remitente;
  const deprueba = para.map(s => s.toLowerCase()).includes(dest);
  if (dest && (activa || deprueba)) {
    let repetido = false;
    if (tipo === "visitante" && r.id) {
      const { count } = await sb().from("laureles_visitantes").select("id", { count: "exact", head: true }).ilike("correo", dest).lt("id", r.id as number);
      repetido = (count ?? 0) > 0 && !deprueba;
    }
    if (repetido) cliente = "ya recibió la bienvenida";
    else {
      const c = correoCliente(tipo, r);
      cliente = await enviar(llave, { from: de, to: [dest], subject: c.asunto, html: c.html, text: c.texto, reply_to: para[0] });
    }
  } else if (dest) cliente = "respuesta al cliente apagada (laureles_config.respuesta_cliente / aviso_remitente)";

  return new Response(JSON.stringify({ equipo, cliente }),
    { status: equipo.ok ? 200 : 502, headers: { "Content-Type": "application/json" } });
});
