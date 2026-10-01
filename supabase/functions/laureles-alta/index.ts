/* =============================================================================
   laureles-alta — un asesor autorizado crea SU propia contraseña.
   Gerencia deja el correo autorizado en laureles_equipo_pendiente (con la
   cédula cifrada con bcrypt). El asesor escribe correo + cédula + contraseña;
   si correo y cédula coinciden, se crea la cuenta ya confirmada y el trigger
   laureles_activar_pendiente la pasa al equipo con su rol, canal y nombre.
     · 5 intentos fallidos bloquean ese correo 30 minutos (lo cuenta la base).
     · La respuesta de error es la misma si el correo no está autorizado o si
       la cédula no coincide: no se puede averiguar quién está en la lista.
     · Nunca devuelve ni guarda la contraseña: va directo a Supabase Auth.
   Pública (verify_jwt = false): la usa alguien que todavía no tiene cuenta.
   ============================================================================= */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGENES = ["https://www.laurelescampestre.co", "https://laurelescampestre.co"];
function cors(req: Request) {
  const o = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGENES.includes(o) || o.startsWith("http://localhost") ? o : ORIGENES[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
  };
}
const NO = "El correo no está autorizado o la cédula no coincide. Revísalos o pídele a gerencia que te autorice.";

Deno.serve(async (req: Request) => {
  const h = { ...cors(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  const res = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: h });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "POST") return res(405, { error: "Sólo POST" });

  let b: { correo?: string; cedula?: string; clave?: string } = {};
  try { b = await req.json(); } catch (_) { return res(400, { error: "Datos no válidos." }); }
  const correo = String(b.correo || "").replace(/ /g, " ").trim().toLowerCase();
  const cedula = String(b.cedula || "").replace(/\D/g, "");
  const clave = String(b.clave || "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return res(400, { error: "Escribe un correo válido." });
  if (cedula.length < 5) return res(400, { error: "Escribe tu número de cédula, sólo números." });
  if (clave.length < 8) return res(400, { error: "La contraseña debe tener mínimo 8 caracteres." });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: v, error: e1 } = await sb.rpc("laureles_verificar_alta", { p_correo: correo, p_doc: cedula });
  if (e1) return res(500, { error: "No se pudo verificar en este momento. Intenta de nuevo." });
  if (v === "bloqueado") return res(429, { error: "Demasiados intentos con este correo. Espera 30 minutos e intenta de nuevo." });
  if (v === "ya") return res(409, { error: "Este correo ya tiene cuenta. Entra con tu contraseña o usa 'Olvidé mi contraseña'." });
  if (v === "sin_doc") return res(403, { error: "Tu alta la tiene que completar gerencia. Escríbele a Jaime Andrés Bejarano." });
  if (v !== "ok") return res(403, { error: NO });

  const { error: e2 } = await sb.auth.admin.createUser({ email: correo, password: clave, email_confirm: true });
  if (e2) {
    const m = String(e2.message || "");
    if (/already|registered|exists/i.test(m)) return res(409, { error: "Este correo ya tiene cuenta. Entra con tu contraseña o usa 'Olvidé mi contraseña'." });
    if (/password/i.test(m)) return res(400, { error: "Esa contraseña no la acepta el sistema. Usa una más larga, con letras y números." });
    return res(500, { error: "No se pudo crear la cuenta. Intenta de nuevo." });
  }
  return res(200, { ok: true });
});
