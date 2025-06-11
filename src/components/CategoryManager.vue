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

      <div class="carousel-wrapper" ref="carouselWrapper">
        <div
          :class="['carousel-track', { 'is-scrolling-manual': isManualScroll, 'animate-loop': !isManualScroll }]"
          ref="carouselTrack"
        >
          <div
            v-for="(category, index) in duplicatedCategories"
            :key="`${category._id}-${index}`"
            class="category-card"
            @click="goToCategoryProducts(category)"
            :style="{ 'animation-delay': `${(index % categories.length) * 0.1}s` }"
            data-aos="fade-up" 
            data-aos-offset="50"
            data-aos-once="true"
          >
            <q-img
              :src="category.img"
              :alt="category.name"
              fit="cover"
              class="category-img"
            >
              <div class="category-img-overlay flex flex-center">
                </div>
            </q-img>
            <div class="category-info">
              <div class="text-subtitle2 text-bold q-mb-xs">{{ category.name }}</div>
              <span class="text-caption text-grey-7">{{ category.description }}</span>
            </div>
          </div>
          <div v-if="categories.length > 0" class="carousel-track-clone" ref="carouselTrackClone">
            <div
              v-for="(category, index) in categories"
              :key="`clone-${category._id}-${index}`"
              class="category-card"
              @click="goToCategoryProducts(category)"
            >
              <q-img
                :src="category.img"
                :alt="category.name"
                fit="cover"
                class="category-img"
              >
                <div class="category-img-overlay flex flex-center"></div>
              </q-img>
              <div class="category-info">
                <div class="text-subtitle2 text-bold q-mb-xs">{{ category.name }}</div>
                <span class="text-caption text-grey-7">{{ category.description }}</span>
              </div>
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
import { ref, onMounted, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getData } from '../services/apiclient';

const categories = ref([]);
const router = useRouter();

const carouselWrapper = ref(null); // Referencia al contenedor con overflow: hidden
const carouselTrack = ref(null);    // Referencia al div que se va a mover (carousel-track)
const carouselTrackClone = ref(null); // Ref for the clone track

const isManualScroll = ref(false); // Flag para indicar que el usuario está desplazando manualmente
const currentScrollPos = ref(0); // Posición de scroll para el movimiento JS (se mantiene para scroll manual)

let manualScrollTimeout = null;
let autoScrollAnimationTimer = null; // Para controlar la duración de la animación CSS

const SCROLL_AMOUNT = 224; // Ancho de la tarjeta (200px) + gap (24px)

const fetchCategories = async () => {
  try {
    const res = await getData('categorias');
    categories.value = res;
    // Asegurarse de que el DOM se haya actualizado antes de iniciar el auto-scroll
    await nextTick(); 
    startAutoScroll(); 
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

// Duplicamos las categorías para el bucle infinito
const duplicatedCategories = computed(() => {
  if (categories.value.length === 0) return [];
  // Duplicamos el array para que haya suficiente contenido para el scroll continuo
  return [...categories.value, ...categories.value, ...categories.value];
});

const goToCategoryProducts = (category) => {
  router.push({
    name: 'CategoryProducts', 
    params: { categoryId: category._id },
    query: { categoryName: category.name }
  });
  stopAutoScroll(); 
};

// --- Lógica de Auto-Scroll CSS ---
const startAutoScroll = () => {
  if (isManualScroll.value) return; // No iniciar auto-scroll si hay scroll manual activo

  if (carouselTrack.value && categories.value.length > 0) {
    // Calculamos el ancho de un set completo de categorías
    const categoryCardWidth = 200 + 24; // Width + gap
    const totalContentWidth = categories.value.length * categoryCardWidth;
    
    // La animación CSS moverá una cantidad equivalente a un set completo de categorías
    carouselTrack.value.style.animationDuration = `${totalContentWidth / 50}s`; // 50px/segundo (ajusta la velocidad)
    carouselTrack.value.classList.add('animate-loop');
  }
};

const stopAutoScroll = () => {
  carouselTrack.value?.classList.remove('animate-loop');
  // Al detener, la animación se detiene en su posición actual.
  // Es importante resetear o ajustar si es necesario para el scroll manual.
  // Si usas transform, esto se vuelve complejo.
  // Para este enfoque, la animación se "congela" y el JS toma el control.
};

const handleManualScroll = () => {
  if (isManualScroll.value) { // Si ya estamos en modo manual, solo reiniciamos el timeout
    clearTimeout(manualScrollTimeout);
  } else { // Si pasamos de auto a manual
    isManualScroll.value = true;
    stopAutoScroll(); // Detener la animación CSS
    // Capturar la posición actual del track para el scroll manual
    const computedTransform = getComputedStyle(carouselTrack.value).transform;
    currentScrollPos.value = parseFloat(computedTransform.split(',')[4] || 0); // Extrae translateX value
  }

  // Reiniciar el timeout para volver al auto-scroll
  manualScrollTimeout = setTimeout(() => {
    isManualScroll.value = false;
    startAutoScroll(); // Reiniciar auto-scroll después de un tiempo de inactividad
  }, 3000); // 3 segundos sin interacción
};

const scrollLeft = () => {
  if (carouselWrapper.value) {
    handleManualScroll();
    currentScrollPos.value += SCROLL_AMOUNT;
    // Asegurar que no nos pasemos demasiado al inicio
    if (currentScrollPos.value > 0) {
      currentScrollPos.value = 0; // O un valor que asegure un inicio suave
    }
    carouselTrack.value.style.transform = `translateX(${currentScrollPos.value}px)`;
    carouselTrack.value.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Aplicar transición
  }
};

const scrollRight = () => {
  if (carouselWrapper.value) {
    handleManualScroll();
    currentScrollPos.value -= SCROLL_AMOUNT;
    // Asegurar que no nos pasemos demasiado al final
    // Necesitarías calcular el ancho real del track para limitar esto
    const trackWidth = carouselTrack.value.scrollWidth / 3; // Ancho de un set
    if (Math.abs(currentScrollPos.value) > trackWidth * 2) { // Limitar a dos sets para no ir muy lejos
      currentScrollPos.value = -trackWidth; // Volver al inicio del segundo set
    }
    carouselTrack.value.style.transform = `translateX(${currentScrollPos.value}px)`;
    carouselTrack.value.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Aplicar transición
  }
};

onMounted(() => {
  fetchCategories();
  // No necesitamos el listener de scroll en el wrapper si el auto-scroll es CSS y el manual es por flechas
});

onBeforeUnmount(() => {
  stopAutoScroll(); 
  if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
});

// Watcher para eliminar la transición de transform cuando no sea scroll manual,
// para que el loop CSS pueda tomar el control sin interferencia.
watch(isManualScroll, (newVal) => {
  if (!newVal) { // Si ya no es scroll manual, quitar la transición JS
    if (carouselTrack.value) {
      carouselTrack.value.style.transition = 'none'; // Quitar transición para que la animación CSS actúe
      // Resetear la posición para que la animación CSS comience desde un punto conocido
      // Esto es crucial para un loop CSS suave. Podrías necesitar un pequeño timeout.
      // O ajustar la animación CSS para que tome la posición actual.
      // Para este enfoque, la animación CSS debería ser la dominante para el loop.
      // Si el usuario hace scroll manual, la animación CSS se detiene.
      // Cuando la animación CSS se reanuda, debe tomar la posición en la que el CSS la dejó.
    }
  }
});
</script>
<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box; // Asegurarse de que el box-sizing sea border-box
}

.category-section {
  padding: 50px 20px; // Aumentar padding
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%); // Fondo más suave y moderno
  border-radius: 20px; // Bordes más redondeados
  margin: 40px auto; // Mayor margen
  position: relative;
  overflow: hidden;
  max-width: 1400px; // Asegurarse de que no se extienda demasiado en pantallas muy grandes
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); // Sombra más prominente
}

/* Efecto de fondo tecnológico */
.category-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 10% 20%, rgba(6, 143, 255, 0.07) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(6, 143, 255, 0.07) 0%, transparent 30%);
  animation: circuitPulse 8s ease-in-out infinite alternate; // Más lento y alternado
  z-index: 0;
}

@keyframes circuitPulse {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.02); }
  100% { opacity: 0.3; transform: scale(1); }
}

h6 {
  font-size: 3em; // Tamaño más grande
  font-weight: 800; // Más negrita
  text-align: center;
  margin-bottom: 50px; // Más espacio abajo
  color: #068FFF;
  text-transform: uppercase;
  letter-spacing: 2px; // Más espacio entre letras
  position: relative;
  padding-bottom: 20px; // Más padding para la línea
  font-family: 'Montserrat', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); // Sombra sutil
}

h6::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 120px; // Línea más ancha
  height: 5px; // Línea más gruesa
  background: linear-gradient(90deg, #068FFF, #0052a3);
  border-radius: 3px;
  animation: underlineGrow 1s ease-out forwards; // Animación de crecimiento
}

@keyframes underlineGrow {
  from { width: 0; opacity: 0; }
  to { width: 120px; opacity: 1; }
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 40px; // Más padding para las flechas
  z-index: 1;
}

.carousel-wrapper {
  overflow: hidden;
  width: 100%;
  /* max-width: 100%; (ya no es tan necesario si el padre .category-section tiene max-width) */
}

.carousel-track {
  display: flex;
  gap: 24px;
  padding: 8px 0;
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); // Transición para scroll manual

  // ESTA ES LA ANIMACIÓN CSS PARA EL LOOP CONTINUO
  &.animate-loop {
    animation: scroll-left var(--scroll-duration) linear infinite; // Usamos una variable CSS para la duración
  }
  // Estado para cuando el scroll es manual, desactiva la animación
  &.is-scrolling-manual {
    animation: none !important;
  }
}

// Keyframes para el scroll automático continuo
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.3333%); } /* Mover 1/3 del track (un set de categorías duplicado) */
}


.category-card {
  flex: 0 0 200px;
  min-width: 200px; // Asegura que no se encoja menos de 200px
  height: 280px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95); // Fondo más blanco
  border-radius: 18px; // Más redondeado
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); // Sombra más definida
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); // Transición más suave y ligeramente más larga
  border: 1px solid rgba(6, 143, 255, 0.15); // Borde más visible
  position: relative;
  // Animación de entrada de cada tarjeta (si no usas AOS)
  /*
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
  */
}

// Animación de entrada de cada tarjeta (si no usas AOS)
/*
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
*/

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(6, 143, 255, 0.15) 0%, transparent 100%); // Degradado más prominente
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none; // Asegura que no interfiera con el click
}

.category-card:hover {
  transform: translateY(-12px) scale(1.02); // Mayor elevación y ligero crecimiento
  box-shadow: 0 20px 40px rgba(6, 143, 255, 0.25); // Sombra más dramática
  border-color: rgba(6, 143, 255, 0.4); // Borde se vuelve más azul
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
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); // Transición más suave
}

.category-card:hover .category-img { // Aplicar el zoom a la imagen al hover de la tarjeta
  transform: scale(1.1);
}

.category-img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px; // Reducir un poco el padding
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); // Overlay más oscuro abajo
  color: white;
  font-size: 1.1em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  opacity: 0; // Ocultar por defecto
  transition: opacity 0.3s ease;
}

.category-card:hover .category-img-overlay {
  opacity: 1; // Mostrar overlay al hover
}

.category-info {
  padding: 15px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  z-index: 1; // Asegurar que el texto esté sobre el before
}

.category-info .text-subtitle2 {
  font-size: 1.15em; // Ligeramente más grande
  margin-bottom: 5px;
  color: #0a1b47;
  font-weight: 700; // Más negrita
  font-family: 'Montserrat', sans-serif;
  line-height: 1.2;
}

.category-info .text-caption {
  font-size: 0.9em; // Ligeramente más grande
  line-height: 1.4;
  color: #555; // Color más oscuro
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
  background: rgba(255, 255, 255, 0.98); // Casi blanco
  box-shadow: 0 6px 20px rgba(6, 143, 255, 0.2); // Sombra más suave
  color: #068FFF; // Color de ícono de Quasar
  width: 55px; // Más grande
  height: 55px; // Más grande
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(6, 143, 255, 0.3); // Borde más notorio
}

.nav-arrow:hover {
  background: linear-gradient(135deg, #068FFF, #0052a3);
  color: white;
  transform: translateY(-50%) scale(1.15); // Mayor escala al hover
  box-shadow: 0 10px 30px rgba(6, 143, 255, 0.4); // Sombra más intensa
  border-color: transparent; // Quitar el borde al hover
}

.nav-arrow.left {
  left: 0;
}

.nav-arrow.right {
  right: 0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .category-section {
    padding: 40px 15px;
  }
  h6 {
    font-size: 2.8em;
  }
  .carousel-container {
    padding: 0 30px;
  }
}

@media (max-width: 1024px) {
  .category-section {
    padding: 30px 10px;
  }
  h6 {
    font-size: 2.4em;
    margin-bottom: 40px;
  }
  .carousel-container {
    padding: 0 20px;
  }
  .category-card {
    flex: 0 0 180px;
    min-width: 180px;
    height: 260px;
  }
  .category-img {
    height: 160px;
  }
  .nav-arrow {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 768px) {
  .category-section {
    padding: 25px 5px;
  }
  h6 {
    font-size: 2em;
    margin-bottom: 30px;
  }
  .carousel-container {
    padding: 0 10px;
  }
  .category-card {
    flex: 0 0 150px; /* Más pequeñas en tablet */
    min-width: 150px;
    height: 220px;
    border-radius: 14px;
  }
  .category-img {
    height: 130px;
  }
  .nav-arrow {
    display: none; /* Ocultar flechas en pantallas pequeñas para dar más espacio */
  }
  .category-info {
    padding: 10px;
  }
  .category-info .text-subtitle2 {
    font-size: 1em;
  }
  .category-info .text-caption {
    font-size: 0.8em;
  }
}

@media (max-width: 576px) {
  .category-section {
    padding: 20px 0px; // Padding horizontal a 0 para que las tarjetas toquen el borde
  }
  h6 {
    font-size: 1.7em;
    margin-bottom: 25px;
  }
  .carousel-container {
    padding: 0; // Quitar padding para que el carousel-wrapper ocupe todo el ancho
  }
  .carousel-wrapper {
    overflow-x: scroll; // Asegurar scroll si las tarjetas no caben
    -webkit-overflow-scrolling: touch; // Mejor scroll en iOS
    scrollbar-width: none; // Ocultar scrollbar en Firefox
    &::-webkit-scrollbar { // Ocultar scrollbar en Chrome/Safari
      display: none;
    }
  }
  .carousel-track {
    gap: 12px; // Menos espacio entre tarjetas en móvil
    padding: 8px 10px; // Padding interno para que las tarjetas no peguen al borde
  }
  .category-card {
    flex: 0 0 130px; /* Aún más pequeñas en móvil */
    min-width: 130px;
    height: 200px;
    border-radius: 12px;
  }
  .category-img {
    height: 110px;
  }
}

@media (max-width: 400px) {
  h6 {
    font-size: 1.4em;
  }
  .category-card {
    flex: 0 0 110px;
    min-width: 110px;
    height: 180px;
  }
  .category-img {
    height: 90px;
  }
  .category-info .text-subtitle2 {
    font-size: 0.9em;
  }
  .category-info .text-caption {
    font-size: 0.75em;
    -webkit-line-clamp: 1; // Menos líneas para descripciones cortas en pantallas muy pequeñas
  }
}
</style>