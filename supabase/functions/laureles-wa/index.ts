/* =============================================================================
   laureles-wa — "Escribir por WhatsApp" sin dejar el número en la página.
   El sitio abre esta dirección con el mensaje (?t=...) y la función responde
   con una redirección a wa.me/<número>. Los números viven en la tabla privada
   laureles_config, que sólo se lee con la llave de servicio: no están en el
   código publicado ni en el navegador.
     · sin canal ............ clave 'whatsapp_ventas'
     · ?c=portada ........... clave 'whatsapp_portada' (botón de la portada);
                              si no existe, cae al de ventas
   Sólo se aceptan los canales de la lista: nadie puede pedir otra clave.
   Es pública a propósito (verify_jwt = false): la usan visitantes sin sesión.
   Sólo redirige a wa.me; no acepta otro destino.
   ============================================================================= */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CANALES: Record<string, string> = { portada: "whatsapp_portada" };
const cache = new Map<string, { num: string; t: number }>();

async function numero(clave: string): Promise<string> {
  const c = cache.get(clave);
  if (c && Date.now() - c.t < 5 * 60_000) return c.num;
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await sb.from("laureles_config").select("valor").eq("clave", clave).maybeSingle();
  const num = String(data?.valor || "").replace(/\D/g, "");
  if (num) cache.set(clave, { num, t: Date.now() });
  return num;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Sólo GET", { status: 405 });
  const u = new URL(req.url);
  const t = (u.searchParams.get("t") || "").slice(0, 1800);
  const canal = CANALES[u.searchParams.get("c") || ""];
  let num = "";
  try { num = canal ? await numero(canal) : ""; if (!num) num = await numero("whatsapp_ventas"); } catch (_) { num = ""; }
  if (!num) {
    return new Response("El contacto de WhatsApp no está disponible en este momento.", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
  const destino = "https://wa.me/" + num + (t ? "?text=" + encodeURIComponent(t) : "");
  return new Response(null, { status: 302, headers: { Location: destino, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
});
