/* =============================================================================
   laureles-ia — configurador de casas con IA para Laureles Campestre
   -----------------------------------------------------------------------------
   Recibe la descripción en palabras de lo que quiere el cliente y la ficha REAL
   del lote (área útil, 30 % construible, envolvente que cupo tras aislamientos,
   pendiente, hacia dónde mira) y devuelve una configuración de bloques en
   metros, que el motor 3D del sitio dibuja sobre el terreno medido.

   La llave de Anthropic vive aquí como secreto (ANTHROPIC_API_KEY); nunca en la
   página. Sólo entra quien tenga sesión de administrador (JWT de Supabase Auth)
   y cada persona tiene un cupo diario; el proyecto entero tiene un tope mensual.

   Secretos / variables (Edge Functions → Secrets):
     ANTHROPIC_API_KEY_LAURELES  obligatoria (o ANTHROPIC_API_KEY)
     LAURELES_IA_MODELO       opcional, por defecto "claude-sonnet-4-5"
     LAURELES_IA_CUPO_DIA     opcional, llamadas por persona y día (40)
     LAURELES_IA_CUPO_MES     opcional, llamadas de todo el proyecto por mes (1500)
   SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY las pone Supabase.
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

const MODELO = Deno.env.get("LAURELES_IA_MODELO") || "claude-sonnet-4-5";
const CUPO_DIA = +(Deno.env.get("LAURELES_IA_CUPO_DIA") || 40);
const CUPO_MES = +(Deno.env.get("LAURELES_IA_CUPO_MES") || 1500);

/* La herramienta que Claude está obligado a usar: así la respuesta es siempre
   un JSON con la forma que el motor 3D entiende, nunca prosa suelta. */
const HERRAMIENTA = {
  name: "configurar_casa",
  description: "Devuelve la configuración de la casa como bloques rectangulares en metros dentro de la envolvente del lote.",
  input_schema: {
    type: "object",
    required: ["bloques", "resumen", "cabe"],
    properties: {
      bloques: {
        type: "array",
        maxItems: 14,
        items: {
          type: "object",
          required: ["nombre", "u0", "v0", "u1", "v1", "clase"],
          properties: {
            nombre: { type: "string", description: "Uso del bloque: social, alcobas, cocina, estudio, carport, terraza, piscina…" },
            u0: { type: "number" }, v0: { type: "number" },
            u1: { type: "number" }, v1: { type: "number" },
            alto: { type: "number", description: "Altura libre en metros. 3,40 normal; hasta 5,00 en un solo bloque de doble altura. 0 para patio, deck y piscina." },
            clase: { type: "string", enum: ["muro", "porche", "patio", "deck", "piscina"] },
            nivel: { type: "integer", enum: [1, 2], description: "1 = planta baja. 2 = piso alto, sólo encima de un bloque muro de nivel 1." },
          },
        },
      },
      espacios: {
        type: "array",
        maxItems: 26,
        description: "La planta esquemática: los espacios de la casa como rectángulos en metros que TESELAN cada bloque muro de su nivel (sin traslapes, sin dejar huecos). Obligatorio cuando hay bloques muro.",
        items: {
          type: "object",
          required: ["nombre", "tipo", "u0", "v0", "u1", "v1"],
          properties: {
            nombre: { type: "string", description: "Rótulo: Sala, Comedor, Cocina, Alcoba principal, Alcoba 2, Baño 1, Vestier, Estudio, Ropas, Hall, Circulación…" },
            tipo: { type: "string", enum: ["sala", "comedor", "cocina", "alcoba_principal", "alcoba", "bano", "vestier", "estudio", "ropas", "circulacion", "hall", "deposito", "terraza_cubierta"] },
            u0: { type: "number" }, v0: { type: "number" }, u1: { type: "number" }, v1: { type: "number" },
            nivel: { type: "integer", enum: [1, 2] },
          },
        },
      },
      resumen: { type: "string", description: "Dos a cuatro frases, tuteo, en el idioma del mensaje, con los números del lote: qué se propuso, cuánto construye contra el 30 % y por qué va orientada así." },
      advertencias: { type: "array", items: { type: "string" } },
      cabe: { type: "boolean", description: "false si lo pedido no cabe en el 30 % o en la envolvente aunque se haya propuesto la mejor aproximación." },
    },
  },
};

function sistema(f: Record<string, unknown>): string {
  return `Eres el arquitecto configurador de Laureles Campestre, una parcelación campestre de 86 lotes en El Caimo, Armenia (Quindío, Colombia). Conviertes lo que pide un cliente en una casa de bloques rectangulares implantada en SU lote, con los datos reales que te doy. Nunca inventes datos del lote: si algo no está aquí, dilo.

REGLAS DEL PROYECTO (no negociables)
- Área construible máxima = 30 % del área útil del lote. Cuenta como construida la suma de los bloques "muro" de todos los niveles más los bloques "porche" (carport y corredores cubiertos). Patio, deck y piscina no cuentan.
- La casa va dentro de la ENVOLVENTE que ya cupo tras los aislamientos: un rectángulo de L (ancho, eje u) por Dc (fondo, eje v) metros. Coordenadas en metros reales: u de 0 a L, v de 0 a Dc. v = 0 es el borde hacia la vía (el antejardín ya está descontado); v crece hacia el fondo del lote.
- Los bloques de un mismo nivel no se traslapan. Un bloque de nivel 2 va completamente encima de un bloque "muro" de nivel 1.
- Alturas: 3,40 m normal; un solo bloque puede ir a 5,00 m (doble altura). Carport/porche 3,20 m.
- Piscina: si la piden, un rectángulo clase "piscina" entre 3×7 y 5×12 m, separada al menos 1,5 m de cualquier muro, con un "deck" alrededor si cabe.
- ZONIFICACIÓN OBLIGATORIA: hacia la vía (v entre 0 y unos 6 m) van SOLAMENTE el carport/parqueadero y el acceso. La casa se desarrolla hacia el fondo. La piscina, el deck, las terrazas, el jacuzzi, la cabaña y la zona social van en la franja del fondo (v mayor que Dc/2), lo más lejos posible de la vía y mirando a la vista. Nunca pongas piscina, deck ni zona social en la mitad delantera de la envolvente.
- Si el programa que pide el cliente no cabe en un piso dentro de la envolvente, propón DOS PISOS antes de recortar el programa (el 30 % cuenta la suma de los niveles). Sólo recorta si ni en dos pisos cabe, y di exactamente qué recortaste y por qué.
- Máximo 14 bloques. Prefiere pocas piezas claras a muchas pequeñas.

PLANTA ESQUEMÁTICA (obligatoria): además de los bloques, reparte los ESPACIOS dentro de cada bloque "muro", como rectángulos en las mismas coordenadas (metros reales), que cubran el bloque completo sin traslaparse (una partición: cada punto del bloque pertenece a un solo espacio). Reglas:
- Medidas mínimas: alcoba principal 3,6 × 3,6 m; alcoba 3,0 × 3,0 m; baño 1,6 × 2,4 m; vestier 1,6 × 2,0 m; cocina ancho ≥ 2,8 m; sala y comedor ancho ≥ 3,6 m; circulación entre 1,0 y 1,5 m de ancho (nunca más ancha: el resto es desperdicio); hall 2,0 × 2,0 m mínimo.
- Toda alcoba abre a una circulación o al hall; todo baño toca su alcoba (los de alcoba) o una circulación (el social). Pon una circulación que toque todas las alcobas.
- La alcoba principal lleva su baño y su vestier contiguos. Cada alcoba secundaria tiene un baño contiguo o comparte uno que toque la circulación.
- Sala, comedor y cocina contiguos entre sí, hacia el fondo y la vista; baños, ropas y depósitos hacia el lado sin vista o interior. El hall toca el borde del bloque más cercano a la vía o al carport.
- Un espacio nunca sale de su bloque ni cruza a otro bloque. El piso alto (nivel 2) se reparte igual dentro de sus bloques.
- Los rótulos van numerados cuando se repiten (Alcoba 2, Alcoba 3, Baño 2).
- Si lo pedido no cabe en el 30 %, propón la mejor versión que sí cabe, di exactamente cuántos m² sobran y marca cabe=false.
- Orientación: usa los rumbos que te doy. La vista principal del lote es hacia "${f.vista_hacia}". Pon la zona social y las alcobas principales mirando a esa vista cuando el cliente no diga otra cosa; el sol de la tarde entra por el occidente (4°28' N: el sol pasa casi por el cenit, las fachadas norte y sur reciben poco sol directo).
- Responde en el idioma del mensaje del cliente. Tutea. Sé concreto y con números; sin adornos.

DATOS REALES DEL LOTE
${JSON.stringify(f, null, 1)}

Siempre responde usando la herramienta configurar_casa.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Sólo POST" }, 405);

  const llave = Deno.env.get("ANTHROPIC_API_KEY_LAURELES") || Deno.env.get("ANTHROPIC_API_KEY");
  if (!llave) return json({ error: "Falta el secreto ANTHROPIC_API_KEY_LAURELES en Supabase (Edge Functions → Secrets)." }, 500);

  /* --- quién llama: sesión de administrador --- */
  const auth = req.headers.get("Authorization") || "";
  const jwt = auth.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Hace falta una sesión de administrador." }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const servicio = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sbUser = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
  const { data: u, error: eU } = await sbUser.auth.getUser(jwt);
  if (eU || !u?.user) return json({ error: "La sesión no es válida o venció." }, 401);
  const usuario = u.user.id, correo = u.user.email || "";

  /* --- cupos --- */
  const sb = createClient(url, servicio);
  const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
  const mes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));
  const [{ count: nDia }, { count: nMes }] = await Promise.all([
    sb.from("laureles_ia_uso").select("*", { count: "exact", head: true }).eq("usuario", usuario).gte("creado", hoy.toISOString()),
    sb.from("laureles_ia_uso").select("*", { count: "exact", head: true }).gte("creado", mes.toISOString()),
  ]);
  if ((nDia ?? 0) >= CUPO_DIA) return json({ error: `Llegaste al cupo de ${CUPO_DIA} consultas por día.`, uso: { hoy: nDia, cupo_dia: CUPO_DIA } }, 429);
  if ((nMes ?? 0) >= CUPO_MES) return json({ error: `El proyecto llegó al tope de ${CUPO_MES} consultas este mes.`, uso: { mes: nMes, cupo_mes: CUPO_MES } }, 429);

  /* --- cuerpo --- */
  let b: any;
  try { b = await req.json(); } catch { return json({ error: "Cuerpo inválido." }, 400); }
  const lote = +b.lote;
  const ficha = b.ficha;
  const mensaje = String(b.mensaje || "").trim().slice(0, 2000);
  if (!lote || !ficha || typeof ficha !== "object") return json({ error: "Falta la ficha del lote." }, 400);
  if (!mensaje) return json({ error: "Escribe qué casa quieres." }, 400);

  /* historial corto para poder decir "hazla más pequeña" */
  const msgs: { role: "user" | "assistant"; content: any }[] = [];
  const hist = Array.isArray(b.historial) ? b.historial.slice(-6) : [];
  for (const h of hist) {
    if (h && h.rol === "usuario" && h.texto) msgs.push({ role: "user", content: String(h.texto).slice(0, 2000) });
    else if (h && h.rol === "asistente" && h.config) {
      msgs.push({ role: "assistant", content: [{ type: "tool_use", id: "toolu_prev_" + msgs.length, name: "configurar_casa", input: h.config }] });
      msgs.push({ role: "user", content: [{ type: "tool_result", tool_use_id: "toolu_prev_" + (msgs.length - 1), content: "Configuración aplicada en el 3D." }] });
    }
  }
  msgs.push({ role: "user", content: mensaje });

  /* --- Anthropic --- */
  const t0 = Date.now();
  let r: Response;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": llave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODELO, max_tokens: 4000, temperature: 0.3,
        system: sistema(ficha),
        tools: [HERRAMIENTA], tool_choice: { type: "tool", name: "configurar_casa" },
        messages: msgs,
      }),
    });
  } catch (e) {
    await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: MODELO, ok: false, error: "red: " + String(e).slice(0, 300) });
    return json({ error: "No se pudo llegar a la API de Anthropic." }, 502);
  }
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = j?.error?.message || `${r.status} ${r.statusText}`;
    await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: MODELO, ok: false, error: msg.slice(0, 300) });
    return json({ error: "Anthropic respondió con error: " + msg }, 502);
  }
  const uso = j.usage || {};
  const tu = (j.content || []).find((c: any) => c.type === "tool_use" && c.name === "configurar_casa");
  if (!tu) {
    await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: MODELO, tokens_entrada: uso.input_tokens || 0, tokens_salida: uso.output_tokens || 0, ok: false, error: "sin tool_use" });
    return json({ error: "La respuesta no trajo una configuración." }, 502);
  }
  await sb.from("laureles_ia_uso").insert({ usuario, correo, lote, modelo: MODELO, tokens_entrada: uso.input_tokens || 0, tokens_salida: uso.output_tokens || 0, ok: true });

  return json({
    config: tu.input,
    modelo: MODELO,
    ms: Date.now() - t0,
    uso: { hoy: (nDia ?? 0) + 1, cupo_dia: CUPO_DIA, mes: (nMes ?? 0) + 1, cupo_mes: CUPO_MES, tokens_entrada: uso.input_tokens, tokens_salida: uso.output_tokens },
  });
});
