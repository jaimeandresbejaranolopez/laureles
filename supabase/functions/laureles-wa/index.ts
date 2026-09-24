/* laureles-wa — "Escribir por WhatsApp" sin dejar el número en la página.
   El sitio abre /functions/v1/laureles-wa?t=<mensaje> y la función responde con
   una redirección a wa.me/<número de ventas>. El número vive en la tabla privada
   laureles_config (clave 'whatsapp_ventas'), que sólo se lee con la llave de
   servicio. Pública a propósito (verify_jwt = false) y sólo redirige a wa.me. */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

let cache: { num: string; t: number } | null = null;

async function numero(): Promise<string> {
  if (cache && Date.now() - cache.t < 5 * 60_000) return cache.num;
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await sb.from("laureles_config").select("valor").eq("clave", "whatsapp_ventas").maybeSingle();
  const num = String(data?.valor || "").replace(/\D/g, "");
  if (num) cache = { num, t: Date.now() };
  return num;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Sólo GET", { status: 405 });
  const u = new URL(req.url);
  const t = (u.searchParams.get("t") || "").slice(0, 1800);
  let num = "";
  try { num = await numero(); } catch (_) { num = ""; }
  if (!num) {
    return new Response("El contacto de WhatsApp no está disponible en este momento.", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
  const destino = "https://wa.me/" + num + (t ? "?text=" + encodeURIComponent(t) : "");
  return new Response(null, { status: 302, headers: { Location: destino, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
});
