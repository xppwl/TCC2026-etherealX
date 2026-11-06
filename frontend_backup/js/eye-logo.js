// ============================================================
// OLHO ETHEREAL — logo animado
// - a pupila (espiral) acompanha a posição do cursor na tela
// - o olho pisca sozinho em intervalos aleatórios
// ============================================================

// Gera o markup do SVG do olho. Usada pelo components.js para
// desenhar o logo tanto na sidebar quanto na tela de login.
function eyeLogoSVG(extraClass = ''){
  return `
  <svg class="eye-logo ${extraClass}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Logo Ethereal X">
    <g class="eye-lid">
      <!-- cílios / raios no topo do olho -->
      <g stroke="var(--violet-glow)" stroke-width="2.2" stroke-linecap="round" opacity="0.85">
        <line x1="50" y1="6"  x2="50" y2="16" />
        <line x1="32" y1="9"  x2="36" y2="18" />
        <line x1="68" y1="9"  x2="64" y2="18" />
        <line x1="16" y1="18" x2="23" y2="25" />
        <line x1="84" y1="18" x2="77" y2="25" />
      </g>
      <!-- contorno amendoado do olho -->
      <path d="M8,50 C22,26 40,20 50,20 C60,20 78,26 92,50 C78,74 60,80 50,80 C40,80 22,74 8,50 Z"
            fill="none" stroke="url(#eyeGrad)" stroke-width="2.6" stroke-linejoin="round" />
    </g>
    <!-- pupila em espiral: este grupo é o que se move com o cursor -->
    <g class="eye-pupil-group">
      <path d="M 50.60,50.00 L 50.71,50.10 L 50.80,50.23 L 50.87,50.39 L 50.91,50.56 L 50.91,50.76 L 50.87,50.97 L 50.80,51.17 L 50.68,51.38 L 50.52,51.57 L 50.32,51.74 L 50.08,51.89 L 49.80,52.00 L 49.50,52.06 L 49.18,52.08 L 48.84,52.05 L 48.49,51.96 L 48.15,51.82 L 47.82,51.61 L 47.52,51.35 L 47.24,51.03 L 47.01,50.67 L 46.83,50.26 L 46.71,49.81 L 46.65,49.33 L 46.67,48.83 L 46.76,48.33 L 46.93,47.83 L 47.17,47.34 L 47.49,46.89 L 47.89,46.47 L 48.35,46.10 L 48.88,45.80 L 49.46,45.57 L 50.08,45.42 L 50.74,45.36 L 51.41,45.39 L 52.08,45.53 L 52.74,45.76 L 53.38,46.09 L 53.98,46.52 L 54.52,47.04 L 54.99,47.65 L 55.38,48.33 L 55.68,49.07 L 55.87,49.87 L 55.95,50.70 L 55.91,51.54 L 55.74,52.39 L 55.46,53.23 L 55.05,54.03 L 54.52,54.77 L 53.88,55.45 L 53.15,56.04 L 52.32,56.53 L 51.41,56.90 L 50.45,57.15 L 49.45,57.26 L 48.42,57.22 L 47.39,57.04 L 46.39,56.72 L 45.42,56.25 L 44.52,55.63 L 43.69,54.89 L 42.98,54.03 L 42.38,53.06 L 41.91,52.00 L 41.60,50.87 L 41.44,49.69 L 41.45,48.49 L 41.63,47.28 L 41.98,46.09 L 42.51,44.96 L 43.19,43.89 L 44.03,42.91 L 45.01,42.05 L 46.11,41.33 L 47.32,40.76 L 48.61,40.36 L 49.96,40.15 L 51.34,40.12 L 52.73,40.29 L 54.10,40.65 L 55.41,41.21 L 56.65,41.96 L 57.79,42.88 L 58.80,43.96 L 59.66,45.19 L 60.34,46.54 L 60.84,47.98 L 61.13,49.50 L 61.21,51.06 L 61.07,52.63 L 60.71,54.18 L 60.12,55.68 L 59.33,57.11 L 58.34,58.41 L 57.16,59.58 L 55.82,60.59 L 54.34,61.40 L 52.74,62.01 L 51.06,62.39 L 49.32,62.53 L 47.57,62.43 L 45.83,62.08 L 44.14,61.49 L 42.54,60.67 L 41.05,59.61 L 39.71,58.35 L 38.55,56.91 L 37.60,55.30 L 36.87,53.56 L 36.39,51.72 L 36.16,49.81 L 36.21,47.88 L 36.52,45.95 L 37.11,44.07 L 37.96,42.28 L 39.05,40.61 L 40.38,39.09 L 41.93,37.77 L 43.65,36.66 L 45.53,35.80 L 47.52,35.20 L 49.59,34.88 L 51.71,34.85 L 53.82,35.12 L 55.89,35.69 L 57.88,36.54 L 59.74,37.67 L 61.44,39.06 L 62.94,40.69 L 64.21,42.52 L 65.22,44.52 L 65.95,46.66 L 66.38,48.90 L 66.49,51.19 L 66.28,53.49 L 65.75,55.75 L 64.90,57.93 L 63.75,59.99"
            fill="none" stroke="url(#eyeGrad)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <linearGradient id="eyeGrad" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stop-color="#b98bff" />
        <stop offset="100%" stop-color="#6a1fc9" />
      </linearGradient>
    </defs>
  </svg>`;
}

// Faz a(s) pupila(s) seguirem o cursor. Chame depois de inserir o(s) SVG(s) no DOM.
function iniciarRastreioDoOlho(){
  const RAIO_MAX = 7; // o quanto a pupila pode se afastar do centro (em unidades do viewBox)

  document.addEventListener('mousemove', (evento) => {
    document.querySelectorAll('.eye-logo').forEach((olho) => {
      const pupila = olho.querySelector('.eye-pupil-group');
      if(!pupila) return;

      const retangulo = olho.getBoundingClientRect();
      const centroX = retangulo.left + retangulo.width / 2;
      const centroY = retangulo.top + retangulo.height / 2;

      const anguloParaCursor = Math.atan2(evento.clientY - centroY, evento.clientX - centroX);
      const deslocX = Math.cos(anguloParaCursor) * RAIO_MAX;
      const deslocY = Math.sin(anguloParaCursor) * RAIO_MAX;

      pupila.setAttribute('transform', `translate(${deslocX.toFixed(2)} ${deslocY.toFixed(2)})`);
    });
  });

  // em telas de toque, a pupila faz um giro lento constante em vez de seguir o dedo
  if(window.matchMedia('(hover: none)').matches){
    let angulo = 0;
    setInterval(() => {
      angulo += 0.04;
      document.querySelectorAll('.eye-logo .eye-pupil-group').forEach((pupila) => {
        const x = Math.cos(angulo) * RAIO_MAX;
        const y = Math.sin(angulo) * RAIO_MAX;
        pupila.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      });
    }, 40);
  }
}

// Faz o(s) olho(s) piscarem sozinhos, em intervalos aleatórios (entre 3s e 7s)
function iniciarPiscarDoOlho(){
  function agendarPiscada(){
    const espera = 3000 + Math.random() * 4000;
    setTimeout(() => {
      document.querySelectorAll('.eye-logo').forEach((olho) => olho.classList.add('is-blinking'));
      setTimeout(() => {
        document.querySelectorAll('.eye-logo').forEach((olho) => olho.classList.remove('is-blinking'));
      }, 160);
      agendarPiscada();
    }, espera);
  }
  agendarPiscada();
}

function iniciarLogoEthereal(){
  iniciarRastreioDoOlho();
  iniciarPiscarDoOlho();
}