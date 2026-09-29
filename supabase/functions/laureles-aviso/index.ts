/* =============================================================================
   laureles-aviso — correo al equipo cada vez que alguien se registra en la
   página (laureles_visitantes) o pide una visita (laureles_visitas).

   La llaman los disparadores de la base de datos (pg_net) justo después de
   cada inserción. No es para el navegador: exige la cabecera x-aviso-token,
   que debe coincidir con laureles_config.aviso_token (tabla privada).
   El correo sale por Resend con la llave del secreto RESEND_API_KEY
   (Supabase → Edge Functions → Secrets). Ninguna llave vive en el código.
   Destinatarios: laureles_config.aviso_correo (uno o varios, separados por coma).
   Remitente: laureles_config.aviso_remitente, o el de pruebas de Resend.
   ============================================================================= */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
async function cfg(clave: string): Promise<string> {
  const { data } = await sb().from("laureles_config").select("valor").eq("clave", clave).maybeSingle();
  return String(data?.valor || "");
}
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const fila = (k: string, v: unknown) => v === null || v === undefined || v === "" ? "" :
  `<tr><td style="padding:8px 14px 8px 0;color:#67705F;font-size:13px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:8px 0;font-size:15px;color:#1C221B">${esc(v)}</td></tr>`;
const fecha = (iso: string) => { try { return new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "long", timeStyle: "short" }); } catch { return iso; } };
const soloDigitos = (t: string) => String(t || "").replace(/\D/g, "");

function correo(tipo: string, r: Record<string, unknown>) {
  const visita = tipo === "visita";
  const titulo = visita ? "Nueva solicitud de visita" : "Nueva persona registrada";
  const tel = soloDigitos(String(r.telefono || ""));
  const wa = tel ? `https://wa.me/${tel.length === 10 ? "57" + tel : tel}` : "";
  const filas = visita
    ? fila("Nombre", r.nombre) + fila("Teléfono", r.telefono) + fila("Correo", r.correo) + fila("Lote de interés", r.lote) +
      fila("Fecha pedida", r.fecha) + fila("Franja", r.franja) + fila("Notas", r.notas) + fila("Registrado", fecha(String(r.creado || "")))
    : fila("Nombre", r.nombre) + fila("Teléfono", r.telefono) + fila("Correo", r.correo) + fila("Idioma", r.idioma) +
      fila("Llegó desde", r.origen) + fila("Aceptó la política", r.acepta_politica ? "Sí" : "No") + fila("Registrado", fecha(String(r.creado || "")));
  const html = `<div style="background:#F4F2EA;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#FFFDF7;border:1px solid #DDD6C4;border-radius:14px;overflow:hidden">
    <div style="background:#32402F;color:#F6F4EC;padding:18px 24px">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#EBD9AE">Laureles Campestre</div>
      <div style="font-size:22px;margin-top:4px">${titulo}</div></div>
    <div style="padding:18px 24px"><table style="border-collapse:collapse;width:100%">${filas}</table>
      ${wa ? `<p style="margin:18px 0 4px"><a href="${wa}" style="display:inline-block;background:#32402F;color:#F6F4EC;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:bold">Escribirle por WhatsApp</a></p>` : ""}
      ${r.correo ? `<p style="margin:8px 0 0;font-size:13px"><a href="mailto:${esc(r.correo)}" style="color:#9B7A48">Responder por correo</a></p>` : ""}
    </div>
    <div style="padding:12px 24px;border-top:1px solid #DDD6C4;font-size:11px;color:#67705F">Aviso automático de www.laurelescampestre.co</div>
  </div></div>`;
  const texto = `${titulo}\n` + Object.entries(r).filter(([k, v]) => v !== null && v !== "" && !["id", "navegador", "version_politica"].includes(k)).map(([k, v]) => `${k}: ${v}`).join("\n");
  const asunto = visita ? `Visita solicitada: ${r.nombre || "sin nombre"}${r.fecha ? " · " + r.fecha : ""}` : `Nuevo registro en Laureles: ${r.nombre || "sin nombre"}`;
  return { asunto, html, texto };
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
  const de = (await cfg("aviso_remitente")) || "Laureles Campestre <onboarding@resend.dev>";
  const { asunto, html, texto } = correo(tipo, r);
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": "Bearer " + llave, "Content-Type": "application/json" },
    body: JSON.stringify({ from: de, to: para, subject: asunto, html, text: texto, ...(r.correo ? { reply_to: String(r.correo) } : {}) }),
  });
  const detalle = await resp.text();
  return new Response(JSON.stringify({ ok: resp.ok, estado: resp.status, detalle: detalle.slice(0, 300) }),
    { status: resp.ok ? 200 : 502, headers: { "Content-Type": "application/json" } });
});
