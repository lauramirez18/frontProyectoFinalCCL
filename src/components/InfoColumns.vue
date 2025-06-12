<template>
  <div class="q-pa-xl help-center-section">
    <div class="section-header text-center q-mb-xl">
      <h6 class="text-h4 q-mb-md">
        <q-icon name="support_agent" class="q-mr-sm trending-icon" />
        <span class="glowing-text">Central de Ayuda CCL</span>
        <q-icon name="info" class="q-ml-sm trending-icon" />
      </h6>
      <p class="animated-subtitle">Tu guía completa para una experiencia tecnológica sin límites.</p>
    </div>

    <div class="row q-col-gutter-lg items-stretch justify-center text-center">
      <div
        v-for="(service, index) in services"
        :key="index"
        class="service-card-wrapper col-12 col-sm-6 col-md-3 q-mb-lg"
      >
        <div class="service-card">
          <div class="icon-container q-mb-md">
            <q-icon
              :name="service.icon"
              size="72px"
              class="service-icon"
            />
          </div>
          <div class="text-h6 q-mb-sm service-title">{{ service.title }}</div>
          <div class="text-body2 q-mb-md service-description">{{ service.description }}</div>
          <a :href="service.link" class="action-link text-weight-medium">
            {{ service.linkText }}
            <q-icon name="arrow_forward" size="18px" class="q-ml-xs arrow-icon" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const services = [
  {
    icon: 'support_agent', // ícono válido
    title: 'Soporte Técnico 24/7',
    description: 'Contacta a nuestros expertos vía chat, email o teléfono para asistencia inmediata.',
    link: '#',
    linkText: 'Hablar con un Agente',
  },
  {
    icon: 'verified', // ícono válido
    title: 'Política de Garantía Extendida',
    description: 'Protege tu inversión con nuestra política de garantía y servicio post-venta integral.',
    link: '#',
    linkText: 'Conocer las Garantías',
  },
  {
    icon: 'auto_stories', // ícono válido
    title: 'Guías de Usuario Interactivas',
    description: 'Encuentra y descarga manuales detallados, tutoriales y videos para tu producto.',
    link: '#',
    linkText: 'Explorar Guías',
  },
  {
    icon: 'quiz', // ícono válido
    title: 'Preguntas Frecuentes (FAQ)',
    description: 'Resuelve tus dudas al instante con nuestra base de datos de preguntas y respuestas.',
    link: '#',
    linkText: 'Ver Preguntas Frecuentes',
  },
];

</script>

<style scoped lang="scss">
// Importa las variables CSS si es necesario, asegúrate de que existen
@import '../css/variables.css';

// Fuente para títulos
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Montserrat:wght@400;500;600;700;800&display=swap');

// === Keyframes ===
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes glowingText {
  0% { text-shadow: 0 0 8px var(--q-color-primary-blue-light); }
  50% { text-shadow: 0 0 25px var(--q-color-primary-blue), 0 0 40px var(--q-color-primary-blue-lighter); }
  100% { text-shadow: 0 0 8px var(--q-color-primary-blue-light); }
}

@keyframes iconGlow {
  0% { text-shadow: 0 0 5px var(--q-color-primary-blue-light); }
  50% { text-shadow: 0 0 15px var(--q-color-primary-blue), 0 0 25px var(--q-color-primary-blue-lighter); }
  100% { text-shadow: 0 0 5px var(--q-color-primary-blue-light); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

// === General Section Styles ===
.help-center-section {
  background: linear-gradient(180deg, #f0f8ff 0%, #e8f2fa 100%); // Fondo suave y claro
  padding: 80px 20px;
  border-radius: 20px;
  margin: 40px auto;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1); // Sombra más profunda para la sección
  animation: fadeIn 1s ease-out; // Animación de entrada para toda la sección
}

.section-header {
  margin-bottom: 60px;
}

h6 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.8rem; // Slightly larger
  line-height: 1.3;
  height: 2.6em; // Accommodate 2 lines
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  font-weight: 700;
  color: var(--q-color-primary-blue);
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 15px;
  text-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}

.glowing-text {
  animation: glowingText 3s infinite ease-in-out;
}

.trending-icon {
  animation: pulse 1.5s infinite ease-in-out;
  font-size: 1.1em;
}

.animated-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1em;
  color: var(--q-color-text-grey);
  animation: fadeIn 1s ease-out forwards;
  animation-delay: 0.5s;
  opacity: 0;
  max-width: 700px;
  margin: 0 auto;
}

// === Service Card Styles ===
.service-card-wrapper {
  padding: 10px; // Espacio entre tarjetas
  box-sizing: border-box;
}

.service-card {
  height: 100%; // Asegura que todas las tarjetas tengan la misma altura dentro del gutter
  padding: 35px; // Más padding para espacio interior
  border-radius: 20px; // Bordes más redondeados
  background: linear-gradient(145deg, #ffffff, #f0f0f0); // Degradado sutil
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); // Sombra pronunciada
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(6, 143, 255, 0.1);
  will-change: transform, box-shadow;
}

.service-card:hover {
  transform: translateY(-8px); // Elevación más notoria
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.18); // Sombra más fuerte
  border-color: var(--q-color-primary-blue); // Borde se ilumina
  background: linear-gradient(145deg, #f7f7f7, #e8e8e8); // Degradado ligeramente más oscuro
}

.icon-container {
  background: linear-gradient(45deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  margin-bottom: 25px; // Más espacio
}

.service-icon {
  animation: iconGlow 3s infinite ease-in-out; // Animación de brillo para el icono
  font-size: 80px !important; // Icono más grande
}

.service-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.6em; // Títulos de servicio más grandes
  font-weight: 700;
  color: var(--q-color-dark-blue);
  margin-bottom: 12px;
  line-height: 1.2;
}

.service-description {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
  color: var(--q-color-text-grey);
  line-height: 1.6;
  flex-grow: 1; // Permite que la descripción ocupe el espacio disponible
  margin-bottom: 25px;
}

.action-link {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
  color: var(--q-color-primary-blue);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  transition: color 0.3s ease, transform 0.3s ease;
  padding: 5px 0;
}

.action-link:hover {
  color: var(--q-color-dark-blue);
  transform: translateX(5px);
}

.action-link:hover .arrow-icon {
  animation: arrowPulse 0.6s infinite ease-in-out;
}

.arrow-icon {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

// === Responsive ===
@media (max-width: 1024px) {
  .help-center-section {
    padding: 60px 15px;
  }
  h6 { font-size: 2.4em; }
  .animated-subtitle { font-size: 1em; }
  .service-card {
    padding: 30px;
    border-radius: 18px;
  }
  .service-icon { font-size: 64px !important; }
  .service-title { font-size: 1.4em; }
  .service-description { font-size: 0.95em; }
  .action-link { font-size: 0.95em; }
}

@media (max-width: 768px) {
  .help-center-section {
    padding: 40px 10px;
  }
  h6 { font-size: 2em; margin-bottom: 40px; }
  .animated-subtitle { font-size: 0.9em; }
  .service-card-wrapper {
    margin-bottom: 20px; // Reducir un poco el margen entre tarjetas en tablet
  }
  .service-card {
    padding: 25px;
    border-radius: 16px;
  }
  .service-icon { font-size: 56px !important; }
  .service-title { font-size: 1.2em; }
  .service-description { font-size: 0.85em; }
  .action-link { font-size: 0.85em; }
}

@media (max-width: 576px) {
  .help-center-section {
    padding: 30px 5px;
    margin: 20px auto;
  }
  h6 { font-size: 1.6em; margin-bottom: 30px; }
  .animated-subtitle { font-size: 0.8em; }
  .service-card-wrapper {
    margin-bottom: 15px; // Ajustar aún más el margen en móviles
  }
  .service-card {
    padding: 20px;
    border-radius: 14px;
  }
  .icon-container { margin-bottom: 20px; }
  .service-icon { font-size: 48px !important; }
  .service-title { font-size: 1.1em; }
  .service-description { font-size: 0.8em; }
  .action-link { font-size: 0.8em; }
  .arrow-icon { margin-left: 5px; }
}
</style>