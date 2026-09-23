/* =============================================================================
   Laureles Campestre — puerta de entrada, registro de visitantes,
   recuperación de contraseña y agendamiento de visitas.

   QUIÉN ENTRA. Al dar "Comenzar el recorrido" la página pregunta si la persona
   es visitante o administrador.
     · Visitante: deja nombre, correo y teléfono y AUTORIZA el tratamiento de
       sus datos (Ley 1581 de 2012 y Decreto 1377 de 2013). Sin esa
       autorización marcada no entra nada a la base: lo exige la propia tabla
       (RLS) y no sólo este formulario. El visitante puede leer la política
       antes de marcar la casilla; el enlace abre politica-datos.html.
     · Administrador: correo y contraseña contra Supabase Auth. Es el mismo rol
       que la página llamaba "ventas": puede cambiar el estado de los lotes y
       guardar prospectos. Si olvidó la clave, pide un enlace al correo; al
       volver por ese enlace la página le pide la clave nueva.

   Todo lo que se guarda va a Supabase con la llave publicable. Lo que protege
   los datos no es la llave sino la RLS: el visitante sólo puede INSERTAR su
   propio registro y nunca leer los de los demás.

   AGENDAR VISITA. Si en Ajustes hay una URL de agenda (la página de citas de
   Google Calendar), se abre ahí mismo. Si no la hay todavía, un formulario
   guarda la solicitud en laureles_visitas y abre WhatsApp con el mensaje
   listo, para que ninguna solicitud se pierda mientras se conecta la agenda.
   ============================================================================= */
"use strict";
const ACCESO = (()=>{
  const V_POLITICA = "2026-09-20";        /* fecha de la política vigente */
  const velo = document.getElementById("velo");
  /* el idioma vive en el módulo de análisis; armazon.js lo lee igual */
  const idioma = ()=>{ try{ return (window.ANALISIS && ANALISIS.lang) ? ANALISIS.lang() : "es"; }catch(e){ return "es"; } };
  const tt = (es,en,fr)=>{ const L=idioma(); return L==="en" ? en : L==="fr" ? fr : es; };
  const esc = s => String(s||"").replace(/[<>&"]/g, c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  const base = ()=> (CFG.supabaseUrl||"").replace(/\/$/,"");
  const cab  = ()=>({ "apikey":CFG.supabaseKey, "Authorization":"Bearer "+CFG.supabaseKey,
                      "Content-Type":"application/json", "Prefer":"return=minimal" });

  const visitante   = ()=> leer("laureles.visitante", null);
  const identificado= ()=> ROL.esVentas() || !!(visitante() && visitante().correo);

  function hojaBase(titulo, cuerpo, pie){
    document.getElementById("hojaTit").textContent = titulo;
    document.getElementById("hojaCuerpo").innerHTML = cuerpo;
    document.getElementById("hojaPie").innerHTML = pie;
    velo.classList.add("on");
  }
  const cerrar = ()=> velo.classList.remove("on");

  /* ------------------------------ la puerta ------------------------------ */
  function puerta(alTerminar){
    hojaBase(tt("¿Quién entra?","Who is entering?","Qui entre ?"),
      '<p>'+tt("Antes de recorrer el plano, díganos quién es usted.",
               "Before touring the plan, tell us who you are.",
               "Avant de parcourir le plan, dites-nous qui vous êtes.")+'</p>'+
      '<div class="puerta">'+
        '<button class="opc" id="pVis"><b>'+tt("Soy visitante","I am a visitor","Je suis visiteur")+'</b>'+
          '<span>'+tt("Recorra el plano, abra cualquier lote y descargue su ficha. Sólo pedimos su nombre y cómo contactarlo.",
                      "Tour the plan, open any lot and download its sheet. We only ask your name and how to reach you.",
                      "Parcourez le plan, ouvrez n'importe quel lot et téléchargez sa fiche. Nous demandons seulement votre nom et vos coordonnées.")+'</span></button>'+
        '<button class="opc" id="pAdm"><b>'+tt("Soy administrador","I am an administrator","Je suis administrateur")+'</b>'+
          '<span>'+tt("Gerencia: cambia el estado de los lotes y ve los prospectos.",
                      "Management: changes lot status and sees prospects.",
                      "Direction : change l'état des lots et voit les prospects.")+'</span></button>'+
      '</div>',
      '');
    document.getElementById("pVis").onclick = ()=> formVisitante(alTerminar);
    document.getElementById("pAdm").onclick = ()=> formAdmin(alTerminar);
  }

  /* ---------------------------- el visitante ----------------------------- */
  function formVisitante(alTerminar){
    const v = visitante() || {};
    hojaBase(tt("Bienvenido","Welcome","Bienvenue"),
      '<p>'+tt("Déjenos sus datos para poder atenderlo. Es lo único que pedimos para entrar.",
               "Leave us your details so we can assist you. It is all we ask to enter.",
               "Laissez-nous vos coordonnées pour pouvoir vous répondre. C'est tout ce que nous demandons.")+'</p>'+
      '<label>'+tt("Nombre","Name","Nom")+'</label>'+
      '<input type="text" id="vNom" autocomplete="name" value="'+esc(v.nombre)+'" placeholder="'+tt("Nombre y apellido","First and last name","Prénom et nom")+'">'+
      '<label>'+tt("Correo","Email","Courriel")+'</label>'+
      '<input type="text" id="vMail" autocomplete="email" inputmode="email" value="'+esc(v.correo)+'" placeholder="nombre@correo.com">'+
      '<label>'+tt("Teléfono","Phone","Téléphone")+'</label>'+
      '<input type="text" id="vTel" autocomplete="tel" inputmode="tel" value="'+esc(v.telefono)+'" placeholder="+57 300 000 0000">'+
      '<label class="chk"><input type="checkbox" id="vOk"> <span>'+
        tt('Autorizo a Laureles Campestre el tratamiento de mis datos personales para contactarme e informarme sobre el proyecto, conforme a la Ley 1581 de 2012. ',
           'I authorise Laureles Campestre to process my personal data to contact me and inform me about the project, under Colombian Law 1581 of 2012. ',
           'J\'autorise Laureles Campestre à traiter mes données personnelles pour me contacter et m\'informer sur le projet, conformément à la loi colombienne 1581 de 2012. ')+
        '<a href="politica-datos.html" target="_blank" rel="noopener">'+
        tt("Leer la política de tratamiento de datos","Read the data-processing policy","Lire la politique de traitement des données")+'</a>.</span></label>'+
      '<div class="pista" id="vErr" style="color:#A3543F"></div>'+
      '<div class="pista">'+tt("Puede conocer, actualizar, rectificar o suprimir sus datos, y revocar esta autorización, escribiendo al correo que aparece en la política.",
                              "You may access, update, correct or delete your data, and revoke this authorisation, by writing to the address in the policy.",
                              "Vous pouvez consulter, mettre à jour, rectifier ou supprimer vos données, et révoquer cette autorisation, en écrivant à l'adresse indiquée dans la politique.")+'</div>',
      '<button class="sec" id="vAtras">'+tt("Atrás","Back","Retour")+'</button>'+
      '<button class="pri" id="vIr">'+tt("Entrar","Enter","Entrer")+'</button>');
    document.getElementById("vAtras").onclick = ()=> puerta(alTerminar);
    const err = document.getElementById("vErr");
    const ir = async ()=>{
      const d = { nombre: document.getElementById("vNom").value.trim(),
                  correo: document.getElementById("vMail").value.trim().toLowerCase(),
                  telefono: document.getElementById("vTel").value.trim().replace(/[^\d+]/g,"") || null,
                  acepta_politica: document.getElementById("vOk").checked };
      if(d.nombre.length<2){ err.textContent=tt("Falta el nombre.","Name is missing.","Le nom manque."); return; }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.correo)){ err.textContent=tt("Ese correo no se ve bien.","That email does not look right.","Ce courriel semble incorrect."); return; }
      if(d.telefono && (d.telefono.length<7 || d.telefono.length>20)){ err.textContent=tt("Ese teléfono no se ve bien.","That phone does not look right.","Ce téléphone semble incorrect."); return; }
      if(!d.acepta_politica){ err.textContent=tt("Para entrar hace falta autorizar el tratamiento de los datos.","You need to authorise data processing to enter.","Il faut autoriser le traitement des données pour entrer."); return; }
      const bt=document.getElementById("vIr"); bt.disabled=true; bt.textContent=tt("Un momento…","One moment…","Un instant…"); err.textContent="";
      const registro = Object.assign({}, d, { version_politica:V_POLITICA, idioma:idioma(), origen:"web",
                                              navegador:(navigator.userAgent||"").slice(0,180) });
      let guardado = false;
      try{
        const r = await fetch(base()+"/rest/v1/laureles_visitantes", {method:"POST", headers:cab(), body:JSON.stringify([registro])});
        guardado = r.ok;
        if(!r.ok){ const j=await r.json().catch(()=>({})); console.warn("visitante no guardado:", r.status, j.message||""); }
      }catch(e){ console.warn("visitante no guardado:", e.message); }
      /* Con o sin red la persona entra: lo que dejó queda en el dispositivo y
         se reintenta la próxima vez que abra la página. */
      guardar("laureles.visitante", { nombre:d.nombre, correo:d.correo, telefono:d.telefono,
                                      cuando:new Date().toISOString(), guardado:guardado, version_politica:V_POLITICA });
      cerrar(); if(alTerminar) alTerminar();
      avisar(tt("Bienvenido, ","Welcome, ","Bienvenue, ")+d.nombre.split(" ")[0]+".");
    };
    document.getElementById("vIr").onclick = ir;
    ["vNom","vMail","vTel"].forEach(id=>document.getElementById(id).onkeydown=ev=>{ if(ev.key==="Enter") ir(); });
    setTimeout(()=>{ const i=document.getElementById("vNom"); if(i) i.focus(); }, 60);
  }

  /* reintento silencioso de un registro que no alcanzó a subir */
  async function reintentarVisitante(){
    const v = visitante(); if(!v || v.guardado || !v.correo || !base()) return;
    try{
      const r = await fetch(base()+"/rest/v1/laureles_visitantes", {method:"POST", headers:cab(),
        body:JSON.stringify([{ nombre:v.nombre, correo:v.correo, telefono:v.telefono, acepta_politica:true,
                               version_politica:v.version_politica||V_POLITICA, idioma:idioma(), origen:"web-reintento" }])});
      if(r.ok){ v.guardado=true; guardar("laureles.visitante", v); }
    }catch(e){}
  }

  /* -------------------------- el administrador --------------------------- */
  function formAdmin(alTerminar){
    hojaBase(tt("Administración","Administration","Administration"),
      '<p>'+tt("Entre con el correo y la contraseña de gerencia.","Sign in with the management email and password.","Connectez-vous avec le courriel et le mot de passe de la direction.")+'</p>'+
      '<label>'+tt("Correo","Email","Courriel")+'</label>'+
      '<input type="text" id="aMail" autocomplete="username" inputmode="email" placeholder="gerencia@…">'+
      '<label>'+tt("Contraseña","Password","Mot de passe")+'</label>'+
      '<input type="password" id="aClave" autocomplete="current-password" placeholder="••••••••">'+
      '<div class="pista" id="aErr" style="color:#A3543F"></div>'+
      '<div class="pista" style="margin-top:12px"><a href="#" id="aOlvide">'+tt("Olvidé mi contraseña","I forgot my password","J'ai oublié mon mot de passe")+'</a></div>',
      '<button class="sec" id="aAtras">'+tt("Atrás","Back","Retour")+'</button>'+
      '<button class="pri" id="aIr">'+tt("Entrar","Enter","Entrer")+'</button>');
    document.getElementById("aAtras").onclick = ()=> puerta(alTerminar);
    const err = document.getElementById("aErr");
    const ir = async ()=>{
      const e=document.getElementById("aMail").value.trim(), c=document.getElementById("aClave").value;
      if(!e||!c){ err.textContent=tt("Falta el correo o la contraseña.","Email or password missing.","Courriel ou mot de passe manquant."); return; }
      const bt=document.getElementById("aIr"); bt.disabled=true; bt.textContent=tt("Entrando…","Signing in…","Connexion…"); err.textContent="";
      try{ await ROL.entrar(e,c); cerrar(); if(alTerminar) alTerminar(); }
      catch(ex){ err.textContent = /Invalid login/i.test(ex.message)
                   ? tt("Correo o contraseña incorrectos.","Wrong email or password.","Courriel ou mot de passe incorrect.") : ex.message;
                 bt.disabled=false; bt.textContent=tt("Entrar","Enter","Entrer"); }
    };
    document.getElementById("aIr").onclick = ir;
    document.getElementById("aClave").onkeydown = ev=>{ if(ev.key==="Enter") ir(); };
    document.getElementById("aOlvide").onclick = ev=>{ ev.preventDefault(); formRecuperar(alTerminar, document.getElementById("aMail").value.trim()); };
    setTimeout(()=>{ const i=document.getElementById("aMail"); if(i) i.focus(); }, 60);
  }

  /* Olvidé mi contraseña: Supabase manda un correo con un enlace que vuelve a
     esta página con #type=recovery; ahí se pide la clave nueva. */
  function formRecuperar(alTerminar, correo){
    hojaBase(tt("Recuperar la contraseña","Recover password","Récupérer le mot de passe"),
      '<p>'+tt("Escriba el correo de la cuenta. Le llegará un enlace para poner una contraseña nueva.",
               "Enter the account email. You will receive a link to set a new password.",
               "Saisissez le courriel du compte. Vous recevrez un lien pour définir un nouveau mot de passe.")+'</p>'+
      '<label>'+tt("Correo","Email","Courriel")+'</label>'+
      '<input type="text" id="rMail" inputmode="email" value="'+esc(correo)+'" placeholder="gerencia@…">'+
      '<div class="pista" id="rErr" style="color:#A3543F"></div>',
      '<button class="sec" id="rAtras">'+tt("Atrás","Back","Retour")+'</button>'+
      '<button class="pri" id="rIr">'+tt("Enviar enlace","Send link","Envoyer le lien")+'</button>');
    document.getElementById("rAtras").onclick = ()=> formAdmin(alTerminar);
    document.getElementById("rIr").onclick = async ()=>{
      const e=document.getElementById("rMail").value.trim(); const err=document.getElementById("rErr");
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){ err.textContent=tt("Ese correo no se ve bien.","That email does not look right.","Ce courriel semble incorrect."); return; }
      const bt=document.getElementById("rIr"); bt.disabled=true; err.textContent="";
      try{
        const destino = location.origin + location.pathname;
        const r = await fetch(base()+"/auth/v1/recover?redirect_to="+encodeURIComponent(destino),
          {method:"POST", headers:{ "apikey":CFG.supabaseKey, "Content-Type":"application/json" }, body:JSON.stringify({email:e})});
        if(!r.ok){ const j=await r.json().catch(()=>({})); throw new Error(j.msg||j.error_description||j.message||(r.status+"")); }
        document.getElementById("hojaCuerpo").innerHTML = '<p>'+tt("Listo. Si ese correo tiene cuenta de administración, en un momento le llega el enlace. Revise también la carpeta de correo no deseado.",
          "Done. If that email has an administration account, the link is on its way. Check your spam folder too.",
          "C'est fait. Si ce courriel a un compte d'administration, le lien arrive. Vérifiez aussi les indésirables.")+'</p>';
        document.getElementById("hojaPie").innerHTML = '<button class="pri" id="rOk">'+tt("Cerrar","Close","Fermer")+'</button>';
        document.getElementById("rOk").onclick = cerrar;
      }catch(ex){ err.textContent = ex.message; bt.disabled=false; }
    };
  }

  /* La vuelta por el enlace del correo: #access_token=…&type=recovery */
  function atenderRecuperacion(){
    const h = location.hash || "";
    if(!/type=recovery/.test(h)) return false;
    const q = new URLSearchParams(h.replace(/^#/,""));
    const tok = q.get("access_token"), ref = q.get("refresh_token");
    if(!tok) return false;
    history.replaceState(null, "", location.pathname + location.search);
    const pedir = ()=>{
      hojaBase(tt("Contraseña nueva","New password","Nouveau mot de passe"),
        '<p>'+tt("Escriba la contraseña nueva dos veces. Mínimo 6 caracteres.","Type the new password twice. At least 6 characters.","Saisissez deux fois le nouveau mot de passe. 6 caractères minimum.")+'</p>'+
        '<label>'+tt("Contraseña nueva","New password","Nouveau mot de passe")+'</label>'+
        '<input type="password" id="nClave1" autocomplete="new-password">'+
        '<label>'+tt("Repítala","Repeat it","Répétez-le")+'</label>'+
        '<input type="password" id="nClave2" autocomplete="new-password">'+
        '<div class="pista" id="nErr" style="color:#A3543F"></div>',
        '<button class="pri" id="nIr">'+tt("Guardar","Save","Enregistrer")+'</button>');
      document.getElementById("nIr").onclick = async ()=>{
        const a=document.getElementById("nClave1").value, b=document.getElementById("nClave2").value, err=document.getElementById("nErr");
        if(a.length<6){ err.textContent=tt("Mínimo 6 caracteres.","At least 6 characters.","6 caractères minimum."); return; }
        if(a!==b){ err.textContent=tt("No coinciden.","They do not match.","Ils ne correspondent pas."); return; }
        const bt=document.getElementById("nIr"); bt.disabled=true; err.textContent="";
        try{
          const r = await fetch(base()+"/auth/v1/user", {method:"PUT",
            headers:{ "apikey":CFG.supabaseKey, "Authorization":"Bearer "+tok, "Content-Type":"application/json" },
            body:JSON.stringify({password:a})});
          if(!r.ok){ const j=await r.json().catch(()=>({})); throw new Error(j.msg||j.error_description||j.message||(r.status+"")); }
          const u = await r.json().catch(()=>({}));
          /* deja la sesión abierta con el token del enlace */
          if(ref) guardar("laureles.sesion", { ref:ref, exp:Date.now()+50*60*1000, correo:(u&&u.email)||"" });
          cerrar(); avisar(tt("Contraseña cambiada. Vuelva a entrar si la página se la pide.","Password changed. Sign in again if asked.","Mot de passe modifié. Reconnectez-vous si demandé."), 5000);
          try{ location.reload(); }catch(e){}
        }catch(ex){ err.textContent=ex.message; bt.disabled=false; }
      };
    };
    /* la intro puede estar corriendo: se corta y se pide la clave encima */
    try{ if(typeof cerrarIntro==="function") cerrarIntro(); }catch(e){}
    setTimeout(pedir, 200);
    return true;
  }

  /* ----------------------------- agendar visita -------------------------- */
  function agenda(){
    const v = visitante() || {};
    const p = (S && S.sel!=null) ? S.sel : null;
    if(CFG.agendaUrl){
      hojaBase(tt("Agendar visita presencial","Book a site visit","Prendre rendez-vous"),
        '<p>'+tt("Elija el día y la hora que le convengan. La cita queda en la agenda del equipo comercial.",
                 "Pick the day and time that suit you. The appointment goes straight to the sales team's calendar.",
                 "Choisissez le jour et l'heure qui vous conviennent. Le rendez-vous est inscrit dans l'agenda de l'équipe.")+'</p>'+
        '<iframe class="agenda" src="'+esc(CFG.agendaUrl)+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
        '<button class="sec" id="gCerrar">'+tt("Cerrar","Close","Fermer")+'</button>');
      document.getElementById("gCerrar").onclick = cerrar;
      return;
    }
    const hoy = new Date(); hoy.setDate(hoy.getDate()+1);
    const min = hoy.toISOString().slice(0,10);
    hojaBase(tt("Agendar visita presencial","Book a site visit","Prendre rendez-vous"),
      '<p>'+tt("Díganos qué día quiere conocer el proyecto y un asesor le confirma la hora.",
               "Tell us which day you would like to visit and an advisor will confirm the time.",
               "Dites-nous quel jour vous souhaitez visiter et un conseiller confirmera l'heure.")+'</p>'+
      '<label>'+tt("Nombre","Name","Nom")+'</label><input type="text" id="gNom" value="'+esc(v.nombre)+'">'+
      '<label>'+tt("Correo","Email","Courriel")+'</label><input type="text" id="gMail" inputmode="email" value="'+esc(v.correo)+'">'+
      '<label>'+tt("Teléfono","Phone","Téléphone")+'</label><input type="text" id="gTel" inputmode="tel" value="'+esc(v.telefono)+'">'+
      '<div class="dos">'+
        '<div><label>'+tt("Fecha","Date","Date")+'</label><input type="date" id="gFecha" min="'+min+'"></div>'+
        '<div><label>'+tt("Franja","Time","Créneau")+'</label><select id="gFranja">'+
          '<option value="manana">'+tt("Mañana (8 a 12)","Morning (8–12)","Matin (8h–12h)")+'</option>'+
          '<option value="tarde">'+tt("Tarde (2 a 5)","Afternoon (2–5)","Après-midi (14h–17h)")+'</option></select></div>'+
      '</div>'+
      '<label>'+tt("Lote de interés (opcional)","Lot of interest (optional)","Lot d'intérêt (facultatif)")+'</label>'+
      '<input type="text" id="gLote" inputmode="numeric" value="'+(p!=null?p:"")+'" placeholder="'+tt("p. ej. 30","e.g. 30","p. ex. 30")+'">'+
      '<div class="pista" id="gErr" style="color:#A3543F"></div>',
      '<button class="sec" id="gCerrar">'+tt("Cancelar","Cancel","Annuler")+'</button>'+
      '<button class="pri" id="gIr">'+tt("Solicitar la visita","Request the visit","Demander la visite")+'</button>');
    document.getElementById("gCerrar").onclick = cerrar;
    document.getElementById("gIr").onclick = async ()=>{
      const err=document.getElementById("gErr");
      const d={ nombre:document.getElementById("gNom").value.trim(),
                correo:document.getElementById("gMail").value.trim().toLowerCase(),
                telefono:document.getElementById("gTel").value.trim().replace(/[^\d+]/g,"")||null,
                fecha:document.getElementById("gFecha").value,
                franja:document.getElementById("gFranja").value,
                lote: parseInt(document.getElementById("gLote").value,10)||null };
      if(d.nombre.length<2){ err.textContent=tt("Falta el nombre.","Name is missing.","Le nom manque."); return; }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.correo)){ err.textContent=tt("Ese correo no se ve bien.","That email does not look right.","Ce courriel semble incorrect."); return; }
      if(!d.fecha){ err.textContent=tt("Elija la fecha.","Pick a date.","Choisissez la date."); return; }
      const bt=document.getElementById("gIr"); bt.disabled=true; err.textContent="";
      let ok=false;
      try{ const r=await fetch(base()+"/rest/v1/laureles_visitas",{method:"POST",headers:cab(),body:JSON.stringify([d])}); ok=r.ok; }catch(e){}
      const franja = d.franja==="manana" ? tt("en la mañana","in the morning","le matin") : tt("en la tarde","in the afternoon","l'après-midi");
      const msg = tt("Hola, quiero agendar una visita a Laureles Campestre el "+d.fecha+" "+franja+
                     (d.lote?" (me interesa el lote "+d.lote+")":"")+". Soy "+d.nombre+".",
                     "Hi, I would like to book a visit to Laureles Campestre on "+d.fecha+" "+franja+
                     (d.lote?" (interested in lot "+d.lote+")":"")+". I am "+d.nombre+".",
                     "Bonjour, je souhaite visiter Laureles Campestre le "+d.fecha+" "+franja+
                     (d.lote?" (lot "+d.lote+")":"")+". Je suis "+d.nombre+".");
      cerrar();
      avisar(ok ? tt("Solicitud registrada. Un asesor le confirma la hora.","Request saved. An advisor will confirm the time.","Demande enregistrée. Un conseiller confirmera l'heure.")
                : tt("No se pudo guardar la solicitud; le abrimos WhatsApp para que no se pierda.","Could not save the request; opening WhatsApp so it is not lost.","Impossible d'enregistrer ; ouverture de WhatsApp."), 5000);
      if(CFG.telefono && CFG.telefono!=="573000000000")
        open("https://wa.me/"+CFG.telefono+"?text="+encodeURIComponent(msg),"_blank");
    };
  }

  /* --------------------------------- arranque ---------------------------- */
  function instalar(){
    /* la puerta se abre al dar "Comenzar el recorrido" si nadie se ha identificado */
    const sb = document.getElementById("startBtn");
    if(sb){
      const seguir = ()=>{ const w=document.getElementById("welcome"); if(w) w.hidden=true; if(typeof fit==="function") fit(); };
      sb.onclick = ()=>{ if(identificado()) seguir(); else puerta(seguir); };
    }
    /* el botón de la barra */
    const bv = document.getElementById("bVisita");
    if(bv) bv.onclick = ()=>{ document.querySelectorAll("#nav button").forEach(c=>c.classList.remove("on")); agenda(); };
    reintentarVisitante();
    atenderRecuperacion();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", instalar); else instalar();

  return { puerta, agenda, visitante, identificado, formAdmin };
})();
