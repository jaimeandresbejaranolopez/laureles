/* =============================================================================
   Ilustraciones de los sitios de interés (tarjetas de arriba del mapa dinámico)
   -----------------------------------------------------------------------------
   Viñetas vectoriales pequeñas, dibujadas a mano para esta página, en la paleta
   de Laureles (bosque, dorado, crema). Son genéricas y representativas —la vía,
   el avión, las bodegas, la ciudad, el mirador del parque—, no reproducen fotos
   ni marcas. La clave es el nombre del sitio tal como está en window.POIS.
   ============================================================================= */
window.SITIO_ICONO = (()=>{
  const B="#32402F", G="#B8955C", C="#F6F1E4", V="#7F9A70", V2="#A9BD98", R="#A3543F";
  const s = cuerpo => `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
  return {
    /* la doble calzada que se pierde entre las montañas del Quindío */
    "Autopista del Café": s(`
      <rect width="48" height="48" fill="#E7EFE3"/>
      <path d="M-2 27 L9 16 L17 22 L27 11 L38 20 L50 13 V29 H-2Z" fill="${V2}"/>
      <path d="M-2 29 L12 21 L22 26 L33 18 L50 26 V31 H-2Z" fill="${V}"/>
      <path d="M-2 30 H50 V48 H-2Z" fill="#8FA27E"/>
      <path d="M21.5 29.5 H26.5 L41 48 H7Z" fill="#3F473D"/>
      <path d="M24 31.5 v2.6 M24 36.6 v3.4 M24 42.6 v5" stroke="${C}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M21.5 29.5 L7 48 M26.5 29.5 L41 48" stroke="${G}" stroke-width=".9"/>
      <circle cx="37" cy="9" r="3.2" fill="${G}" opacity=".85"/>`),
    /* avión despegando sobre la pista, con la torre de control */
    "Aeropuerto El Edén": s(`
      <rect width="48" height="48" fill="#E4ECF1"/>
      <path d="M-2 38 H50 V48 H-2Z" fill="${V}"/>
      <path d="M-2 41.5 H50 V45.5 H-2Z" fill="#4A5347"/>
      <path d="M2 43.5 h5 M11 43.5 h5 M20 43.5 h5 M29 43.5 h5 M38 43.5 h5" stroke="${C}" stroke-width=".9"/>
      <path d="M38 38 V27.5 h-1.6 l1.2-3.2 h6.8 l1.2 3.2 H44 V38Z" fill="${B}"/>
      <path d="M37.8 25.6 h6.4" stroke="${G}" stroke-width="1.2"/>
      <path d="M6 33.5 l4.5-1.6 M11.5 31.6 l4-1.4" stroke="${G}" stroke-width="1.1" stroke-linecap="round" opacity=".8"/>
      <g transform="translate(25 21) rotate(-24)">
        <path d="M-13 0 C-13 -1.7 -11.2 -2.1 -9 -2.1 H9.5 C13 -2.1 15.5 -1.1 15.5 0 C15.5 1.1 13 2.1 9.5 2.1 H-9 C-11.2 2.1 -13 1.7 -13 0Z" fill="${B}"/>
        <path d="M-10 -2 L-13.4 -8.6 H-10.8 L-6.2 -2Z" fill="${G}"/>
        <path d="M1.5 1.2 L-4.5 9 H-1.6 L7.2 1.2Z" fill="${B}"/>
        <path d="M-11.5 1.2 L-14 4.2 H-12.4 L-8.6 1.2Z" fill="${B}"/>
        <path d="M-4 -.7 H10" stroke="${C}" stroke-width=".8" stroke-dasharray="1.1 1.3"/>
      </g>`),
    /* bodegas de techo en diente de sierra y contenedores: la zona franca */
    "La Tebaida": s(`
      <rect width="48" height="48" fill="#EFEADB"/>
      <path d="M-2 37 H50 V48 H-2Z" fill="${V}"/>
      <path d="M4 37 V25 L10.5 19.5 V25 L17 19.5 V25 L23.5 19.5 V37Z" fill="${B}"/>
      <path d="M7 29.5 h3 M12.5 29.5 h3 M18 29.5 h3" stroke="${G}" stroke-width="1.6"/>
      <rect x="11" y="32" width="5.5" height="5" fill="${C}" opacity=".9"/>
      <path d="M31 10 V37 M31 11 H45 M31 11 L37 17 M42 11 V18" stroke="#4A5347" stroke-width="1.2" fill="none"/>
      <rect x="26.5" y="31" width="10" height="6" fill="${G}"/>
      <rect x="37" y="31" width="9" height="6" fill="${R}"/>
      <rect x="30.5" y="25" width="10" height="6" fill="#5E7A55"/>
      <rect x="39" y="18.5" width="6" height="3.6" fill="${G}"/>
      <path d="M29 31.5 v5 M31.5 31.5 v5 M34 31.5 v5 M39.5 31.5 v5 M42 31.5 v5 M44.5 31.5 v5 M33 25.5 v5 M35.5 25.5 v5 M38 25.5 v5" stroke="#00000026" stroke-width=".9"/>`),
    /* la ciudad: edificios con ventanas y una torre de iglesia entre ellos */
    "Armenia": s(`
      <rect width="48" height="48" fill="#F1E8D6"/>
      <circle cx="35" cy="13" r="5" fill="${G}" opacity=".55"/>
      <path d="M-2 26 L10 19 L20 24 L32 17 L50 24 V40 H-2Z" fill="${V2}"/>
      <rect x="4" y="24" width="8" height="16" fill="#5E7A55"/>
      <rect x="13" y="17" width="9" height="23" fill="${B}"/>
      <path d="M24 40 V19 L27.5 9.5 L31 19 V40Z" fill="${G}"/>
      <path d="M27.5 5.5 v4 M26 7 h3" stroke="${G}" stroke-width="1.1"/>
      <rect x="32.5" y="21" width="10" height="19" fill="#44513F"/>
      <path d="M-2 40 H50 V48 H-2Z" fill="${V}"/>
      <path d="M15.5 20.5 h1.5 M18.5 20.5 h1.5 M15.5 24.5 h1.5 M18.5 24.5 h1.5 M15.5 28.5 h1.5 M18.5 28.5 h1.5 M15.5 32.5 h1.5 M18.5 32.5 h1.5 M35 24.5 h1.6 M38.5 24.5 h1.6 M35 28.5 h1.6 M38.5 28.5 h1.6 M35 32.5 h1.6 M38.5 32.5 h1.6 M6.5 28 h1.4 M9 28 h1.4 M6.5 32 h1.4 M9 32 h1.4" stroke="${C}" stroke-width="1.5"/>
      <path d="M26.3 24 h2.4 v4 h-2.4Z" fill="${B}"/>`),
    /* el mirador sobre la loma y una rama de café con sus granos */
    "Parque del Café": s(`
      <rect width="48" height="48" fill="#EAF0E2"/>
      <path d="M-2 36 C8 27 18 25 26 27 C34 29 42 26 50 22 V48 H-2Z" fill="${V}"/>
      <path d="M-2 42 C10 37 24 37 50 40 V48 H-2Z" fill="#5E7A55"/>
      <path d="M17.5 28 L20.2 11.5 H25.8 L28.5 28" fill="none" stroke="${B}" stroke-width="1.5"/>
      <path d="M18.4 22.5 L27.6 16.8 M18.9 17.8 L27.1 22.5 M19.3 16.8 H26.7 M18.4 22.5 H27.6" stroke="${B}" stroke-width=".9"/>
      <path d="M17.6 11.6 H28.4 V13 H17.6Z" fill="${B}"/>
      <path d="M17 11.6 L23 6 L29 11.6Z" fill="${G}"/>
      <path d="M23 6 v-2" stroke="${B}" stroke-width="1"/>
      <g transform="translate(-5 -1)">
      <path d="M33 47 C35 40 38 35 44 32" stroke="#3F5A36" stroke-width="1.4" fill="none"/>
      <path d="M38 36.5 C35 33 35.5 29.5 38.5 28.5 C40 31.5 40 34 38 36.5Z" fill="#3F5A36"/>
      <path d="M41.5 33.6 C44.5 30.8 47.5 31.5 48.5 34 C45.8 35.6 43.4 35.4 41.5 33.6Z" fill="#4E6B44"/>
      <circle cx="35.2" cy="40.6" r="1.9" fill="${R}"/><circle cx="37.8" cy="41.6" r="1.7" fill="#C0643F"/><circle cx="36" cy="43.4" r="1.6" fill="${R}"/></g>`),
  };
})();
