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
  router.push({
    name: 'CategoryProducts', // Asegúrate de que esta ruta esté definida en tu router
    params: { categoryId: category._id },
    query: { categoryName: category.name }
  });
  stopAutoScroll(); // Detener el auto-scroll al navegar
};

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
  padding: 30px 20px; /* Aumentar el padding general */
  background-color: #f8f8f8; /* Un color de fondo más suave para la sección */
  border-radius: 12px;
  margin: 20px auto; /* Centrar y añadir margen exterior */
 
}

h6 {
  font-size: 2.5em;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px; /* Más espacio debajo del título */
  color: #333; /* Color de texto más oscuro */
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 10px;
}

h6::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background-color: #068FFF; /* Línea decorativa debajo del título */
  border-radius: 2px;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 20px; /* Espacio para las flechas */
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
  flex: 0 0 200px; /* Ancho fijo para cada tarjeta */
  height: 280px; /* Altura un poco mayor */
  cursor: pointer;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); /* Sombra más suave y moderna */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Para que el overlay no se salga */
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease; /* Para animación de entrada */
  opacity: 0; /* Inicialmente ocultas para la animación de entrada */
  transform: translateY(20px); /* Inicialmente un poco abajo */
  animation: fadeInMoveUp 0.6s forwards; /* Animación de entrada */
}

/* Animación de entrada para las tarjetas */
@keyframes fadeInMoveUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-card:hover {
  transform: scale(1.03) translateY(-5px); /* Efecto de elevación al hover */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada al hover */
}

.category-img {
  width: 100%;
  height: 200px; /* Mayor altura para la imagen */
  object-fit: cover;
  background-position: center;
  position: relative;
  overflow: hidden; /* Para contener el overlay */
}

/* Overlay para el nombre de la categoría en la imagen */
.category-img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0)); /* Degradado sutil */
  color: white;
  font-size: 1.1em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.category-info {
  padding: 15px;
  text-align: center;
  flex-grow: 1; /* Permite que la info ocupe el espacio restante */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-info .text-subtitle2 {
  font-size: 1.1em;
  margin-bottom: 5px;
  color: #444;
}

.category-info .text-caption {
  font-size: 0.85em;
  line-height: 1.3;
  color: #777;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita la descripción a 2 líneas */
  -webkit-box-orient: vertical;
}


.nav-arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9); /* Fondo semitransparente */
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  color: #333; /* Color de icono oscuro */
  font-size: 1.5em; /* Iconos más grandes */
  padding: 0; /* Quitar padding por defecto */
  width: 50px; /* Ancho fijo para los botones */
  height: 50px; /* Altura fija para los botones */
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-arrow:hover {
  background-color: #068FFF; /* Fondo azul al hover */
  color: white; /* Texto blanco al hover */
  transform: translateY(-50%) scale(1.1); /* Efecto de escala al hover */
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
