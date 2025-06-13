<template>
  <div class="q-pa-md bg-white category-section">
    <h6>Explora Nuestras Categorías</h6>

    <div class="carousel-container" @mouseenter="stopAutoScroll" @mouseleave="startAutoScroll">
      <q-btn
        round
        dense
        flat
        icon="chevron_left"
        class="nav-arrow left"
        @click="scrollLeft"
      />

      <div
        class="carousel-wrapper"
        ref="carouselWrapper"
      >
        <div
          :class="['carousel-track', { 'is-scrolling': isManualScroll, 'animate-loop': isAutoScroll }]"
          :style="{ transform: `translateX(${currentScrollPos}px)` }"
          ref="carouselTrack"
        >
          <div
            v-for="(category, index) in duplicatedCategories"
            :key="`${category._id}-${index}`"
            class="category-card"
            @click="goToCategoryProducts(category)"
            :style="{ 'animation-delay': `${index * 0.05}s` }"
          >
            <q-img
              :src="category.img"
              :alt="category.name"
              fit="cover"
              class="category-img"
            >
              <div class="category-img-overlay flex flex-center">
               <!--  <span class="text-white text-bold text-uppercase">{{ category.name }}</span> -->
              </div>
            </q-img>
            <div class="category-info">
              <div class="text-subtitle2 text-bold q-mb-xs">{{ category.name }}</div>
              <span class="text-caption text-grey-7">{{ category.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <q-btn
        round
        dense
        flat
        icon="chevron_right"
        class="nav-arrow right"
        @click="scrollRight"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getData } from '../services/apiclient';

const categories = ref([]);
const router = useRouter();

const carouselWrapper = ref(null); // Referencia al contenedor con overflow: hidden
const carouselTrack = ref(null);    // Referencia al div que se va a mover (carousel-track)

const isAutoScroll = ref(true); // Controla la animación CSS de auto-scroll
const isManualScroll = ref(false); // Flag para indicar que el usuario está desplazando manualmente
const currentScrollPos = ref(0); // Posición de scroll para el movimiento JS

let autoScrollInterval = null;
let manualScrollTimeout = null;

const SCROLL_AMOUNT = 224; // Ancho de la tarjeta (200px) + gap (24px)
const AUTOSCROLL_SPEED_MS = 25; // Milisegundos por frame para auto-scroll suave
const AUTOSCROLL_STEP = 1; // Píxeles a mover por frame

const fetchCategories = async () => {
  try {
    const res = await getData('categorias');
    categories.value = res;
    startAutoScroll(); // Iniciar auto-scroll después de cargar
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

// Duplicamos las categorías para el bucle infinito
const duplicatedCategories = computed(() => {
  if (categories.value.length === 0) return [];
  // Duplicamos más de una vez para asegurar un loop suave al menos con 2-3 duplicados
  return [...categories.value, ...categories.value, ...categories.value];
});

const goToCategoryProducts = (category) => {
  if (!category || !category.name) return
  
  // Generar slug a partir del nombre de la categoría
  const slug = category.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  router.push({
    name: 'CategoryProducts',
    params: { slug }
  })
}

const startAutoScroll = () => {
  stopAutoScroll(); // Limpiar cualquier intervalo existente
  isManualScroll.value = false;
  isAutoScroll.value = true; // Activa la animación CSS si usas el enfoque de animación CSS

  autoScrollInterval = setInterval(() => {
    if (carouselTrack.value) {
      currentScrollPos.value -= AUTOSCROLL_STEP;
      const trackWidth = carouselTrack.value.scrollWidth / 3; // Ancho de un conjunto de categorías
      // Si hemos pasado la mitad del track (un duplicado completo), reseteamos la posición
      if (Math.abs(currentScrollPos.value) >= trackWidth) {
        currentScrollPos.value = 0; // Vuelve al inicio del primer duplicado
      }
    }
  }, AUTOSCROLL_SPEED_MS);
};

const stopAutoScroll = () => {
  clearInterval(autoScrollInterval);
  isAutoScroll.value = false;
};

const handleManualScroll = () => {
  isManualScroll.value = true;
  stopAutoScroll(); // Detener el auto-scroll en interacción manual

  if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
  manualScrollTimeout = setTimeout(() => {
    isManualScroll.value = false;
    startAutoScroll(); // Reiniciar auto-scroll después de un tiempo de inactividad
  }, 3000); // 3 segundos sin interacción
};

const scrollLeft = () => {
  if (carouselWrapper.value) {
    carouselWrapper.value.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    handleManualScroll();
  }
};

const scrollRight = () => {
  if (carouselWrapper.value) {
    carouselWrapper.value.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    handleManualScroll();
  }
};

onMounted(() => {
  fetchCategories();
  // Añadir un listener para los eventos de scroll manual del wrapper
  if (carouselWrapper.value) {
    carouselWrapper.value.addEventListener('scroll', handleManualScroll);
  }
});

onBeforeUnmount(() => {
  stopAutoScroll(); // Limpiar intervalo al destruir el componente
  if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
  if (carouselWrapper.value) {
    carouselWrapper.value.removeEventListener('scroll', handleManualScroll);
  }
});

// Watch para cuando el carrusel se mueva manualmente (p.ej. con el scroll del mouse/trackpad)
watch(currentScrollPos, (newPos) => {
  if (carouselTrack.value) {
    carouselTrack.value.style.transform = `translateX(${newPos}px)`;
  }
});
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.category-section {
  padding: 30px 20px;
  border-radius: 12px;
  margin: 20px auto;
  position: relative;
  overflow: hidden;
}

/* Efecto de fondo tecnológico similar al login */
.category-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(6, 143, 255, 0.587) 0%, transparent 35%),
    radial-gradient(circle at 80% 70%, rgb(6, 143, 255) 0%, transparent 35%);
  animation: circuitPulse 6s ease-in-out infinite;
  z-index: 0;
}

@keyframes circuitPulse {
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
}

h6 {
  font-size: 3em;
  font-weight: 800;
  text-align: center;
  margin-bottom: 50px;
  color: #0056b3;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  padding-bottom: 20px;
  font-family: 'Montserrat', sans-serif;
   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1;
}


h6::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 150px;
  height: 5px;
  background: linear-gradient(90deg, #068FFF, #0052a3);
  border-radius: 3px;
  animation: underlineGrow 1s ease-out forwards;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 60px;
  z-index: 1;
}

.carousel-wrapper {
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.carousel-track {
  display: flex;
  gap: 24px;
  padding: 8px 0;
  /* Transición para el movimiento JS */
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Animación de loop continuo (alternativa, si el JS no lo controla) */
/* .carousel-track.animate-loop {
   animation: scroll-left 25s linear infinite;
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
} */

.category-card {
  flex: 0 0 200px;
  height: 280px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); /* Sombra más suave y moderna */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(6, 143, 255, 0.1);
  position: relative;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(6, 143, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(6, 143, 255, 0.15);
}

.category-card:hover::before {
  opacity: 1;
}

.category-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-position: center;
  position: relative;
  transition: transform 0.3s ease;
}

.category-img:hover {
  transform: scale(1.05);
}

.category-img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: 1.1em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.category-info {
  padding: 15px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
}

.category-info .text-subtitle2 {
  font-size: 1.1em;
  margin-bottom: 5px;
  color: #0a1b47;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}

.category-info .text-caption {
  font-size: 0.85em;
  line-height: 1.4;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.nav-arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(6, 143, 255, 0.15);
  color: #0a1b47;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(6, 143, 255, 0.2);
}

.nav-arrow:hover {
  background: linear-gradient(135deg, #068FFF, #0052a3);
  color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 25px rgba(6, 143, 255, 0.3);
}

.nav-arrow.left {
  left: 0;
}

.nav-arrow.right {
  right: 0;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .category-section {
    padding: 25px 15px;
  }
  h6 {
    font-size: 2.2em;
    margin-bottom: 30px;
  }
  .carousel-container {
    padding: 0 30px;
  }
  .category-card {
    flex: 0 0 180px;
    height: 260px;
  }
  .category-img {
    height: 160px;
  }
  .nav-arrow {
    font-size: 2em;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .category-section {
    padding: 20px 10px;
  }
  h6 {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  .carousel-container {
    padding: 0 20px;
  }
  .category-card {
    flex: 0 0 160px; /* Más pequeñas en tablet */
    height: 240px;
  }
  .category-img {
    height: 140px;
  }
  .nav-arrow {
    display: none; /* Ocultar flechas en pantallas pequeñas para dar más espacio */
  }
}

@media (max-width: 576px) {
  .category-section {
    padding: 15px 5px;
  }
  h6 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }
  .carousel-track {
    gap: 16px; /* Menos espacio entre tarjetas en móvil */
  }
  .category-card {
    flex: 0 0 140px; /* Aún más pequeñas en móvil */
    height: 220px;
    padding: 10px;
  }
  .category-img {
    height: 120px;
  }
  .category-info .text-subtitle2 {
    font-size: 1em;
  }
  .category-info .text-caption {
    font-size: 0.8em;
  }
}

</style>
