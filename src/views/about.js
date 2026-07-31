export function renderAbout() {
  return `
    <section class="panel about">
      <h1>Una SPA académica con IA vía Gemini</h1>

      <div class="about-hero">
        <div class="about-hero__badge">Homer + Gemini SDK</div>
        <p class="about-hero__text">Proyecto educativo para practicar SPA, consumo de APIs y despliegue seguro, manteniendo una experiencia visual clara y responsive.</p>
      </div>

      <div class="about-grid">
        <article>
          <h2>Objetivo</h2>
          <p>Permite conversar con personajes de Los Simpson en una SPA sin recargas, con foco en UX responsive y arquitectura frontend/backend separada.</p>
        </article>

        <article>
          <h2>IA que se usa</h2>
          <p>La app consume Gemini desde una Vercel Function (endpoint <strong>/api/chat</strong>). El modelo se define con <strong>GEMINI_MODEL</strong> y puede cambiarse sin tocar el frontend.</p>
        </article>

        <article>
          <h2>API key (dato crítico)</h2>
          <p>La clave es <strong>GEMINI_API_KEY</strong> y se guarda solo en variables de entorno (Vercel y/o .env local del backend). Nunca debe ir en el código del cliente ni en archivos públicos.</p>
        </article>

        <article>
          <h2>Flujo de seguridad</h2>
          <p>Frontend -&gt; <strong>/api/chat</strong> -&gt; Gemini SDK. El navegador no conoce la key; solo envía mensajes y recibe la respuesta procesada por el servidor.</p>
        </article>

        <article>
          <h2>Servicios externos</h2>
          <p>The Simpsons API aporta personajes, imágenes y descripciones para iniciar el chat con contexto real.</p>
        </article>

        <article>
          <h2>Stack técnico</h2>
          <p>HTML5, CSS3, JavaScript vanilla, Fetch API, Vitest y Vercel Serverless Functions.</p>
        </article>
      </div>
    </section>
  `;
}
