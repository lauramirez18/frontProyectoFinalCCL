<template>
  <div class="bestsellers-section">
    <div class="section-header text-center">
      <h6 class="glowing-text">
        <div class="stars-wrapper">
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
        </div>
        <q-icon name="trending_up" class="q-mr-sm" />
        Lo Más Recomendado
        <div class="stars-wrapper">
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
        </div>
      </h6>
      <p class="animated-subtitle text-caption text-grey-7">
        Descubre la excelencia tecnológica mejor valorada
      </p>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <div class="tech-loader">
        <q-spinner-dots color="primary" size="40px" />
        <div class="loading-text">Cargando innovación...</div>
      </div>
    </div>

    <div v-else-if="sortedProducts.length === 0" class="text-center q-pa-xl text-grey-7">
      <q-icon name="devices" size="4em" color="grey-5" class="pulse-animation" />
      <p class="q-mt-sm">No hay productos disponibles en este momento</p>
    </div>

    <div v-else class="carousel-container" @mouseenter="stopAutoScroll" @mouseleave="startAutoScroll">
      <q-btn
        round
        dense
        flat
        icon="chevron_left"
        class="nav-arrow left-arrow"
        @click="scrollLeft"
      />

      <div class="carousel-wrapper" ref="carouselWrapper">
        <div
          :class="['carousel-track', { 'is-scrolling-manual': isManualScroll, 'animate-loop': !isManualScroll }]"
          ref="carouselTrack"
          :style="{ transform: `translateX(${trackTranslateX}px)` }"
        >
          <div
            v-for="(product, index) in duplicatedProducts"
            :key="`main-${product._id}-${index}`"
            class="product-card-wrapper"
          >
            <q-card
              class="product-card tech-card"
              flat
              @click="goToProduct(product._id)"
            >
              <div class="img-wrapper">
                <q-img
                  :src="getProductImage(product)"
                  :alt="product.nombre"
                  ratio="1"
                  class="product-image"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-3">
                      <q-icon name="devices_other" size="3em" color="grey-7" class="pulse-slow" />
                    </div>
                  </template>

                  <div class="brand-badge" v-if="product.marca">
                    <q-chip dense class="brand-chip" size="sm">
                      <q-icon name="verified" size="xs" class="brand-icon" />
                      <span class="brand-name-text">
                        {{ typeof product.marca === 'object' ? product.marca.nombre : product.marca }}
                      </span>
                    </q-chip>
                  </div>

                  <div class="absolute-top-right q-ma-sm">
                    <q-btn
                      round
                      flat
                      :icon="favorites.has(product._id) ? 'favorite' : 'favorite_border'"
                      class="favorite-btn tech-btn"
                      :class="{ 'is-favorite': favorites.has(product._id) }"
                      :color="favorites.has(product._id) ? 'red-5' : 'grey-5'"
                      @click.stop="toggleFavorite(product)"
                    >
                      <q-tooltip>
                        {{ favorites.has(product._id) ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
                      </q-tooltip>
                    </q-btn>
                  </div>

                  <div class="tech-overlay">
                    <div class="rating-container">
                      <div class="rating-stars tech-rating">
                        <q-rating
                          v-model="product.promedioCalificacion"
                          max="5"
                          size="1.2em"
                          color="yellow"
                          icon="star"
                          readonly
                        />
                        <span class="rating-count text-white q-ml-sm">
                          ({{ product.totalResenas || 0 }})
                        </span>
                      </div>
                    </div>
                  </div>
                </q-img>
              </div>

              <q-card-section class="product-info">
                <div class="brand-caption" v-if="product.marca">
                  {{ typeof product.marca === 'object' ? product.marca.nombre : product.marca }}
                </div>
                <div class="product-title">{{ product.nombre }}</div>

                <div class="price-section">
                  <div class="price-container">
                    <template v-if="product.enOferta">
                      <div class="original-price">
                        ${{ formatThousands(product.precio) }}
                      </div>
                      <div class="offer-price">
                        ${{ formatThousands(product.precioOferta) }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="current-price">
                        ${{ formatThousands(product.precio) }}
                      </div>
                    </template>
                  </div>

                  <q-btn
                    round
                    flat
                    class="cart-btn"
                    @click.stop="addToCart(product)"
                  >
                    <q-icon name="add_shopping_cart" size="sm" />
                    <q-tooltip>Agregar al carrito</q-tooltip>
                  </q-btn>
                </div>

                
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <q-btn
        round
        dense
        flat
        icon="chevron_right"
        class="nav-arrow right-arrow"
        @click="scrollRight"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '../services/apiclient'
import { reviewsService } from '../services/resenias'
import { useThousandsFormat } from '../composables/useThousandFormat'

const router = useRouter()
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const bestSellers = ref([])
const favorites = ref(new Set())

// --- Carousel Logic ---
const carouselWrapper = ref(null)
const carouselTrack = ref(null)
const trackTranslateX = ref(0)
const itemWidth = ref(0)
const visibleItems = ref(0)
const currentIndex = ref(0)
const scrollInterval = ref(null)
const isManualScroll = ref(false) // To control animation
const animationDuration = 500; // ms for manual scroll animation

const duplicatedProducts = computed(() => {
  // Only duplicate if there are actual products
  if (sortedProducts.value.length === 0) {
    return [];
  }
  // Duplicate the array to create the infinite loop effect
  return [...sortedProducts.value, ...sortedProducts.value, ...sortedProducts.value];
});

const calculateCarouselDimensions = () => {
  if (carouselWrapper.value && carouselTrack.value && sortedProducts.value.length > 0) {
    const wrapperWidth = carouselWrapper.value.offsetWidth;
    // Assuming each card takes similar width + gap
    // Adjust this calculation based on your CSS grid/flex setup for .product-card-wrapper
    // A simple way is to measure the first actual product card if available
    const firstProductCard = carouselTrack.value.querySelector('.product-card-wrapper');
    if (firstProductCard) {
      itemWidth.value = firstProductCard.offsetWidth; // Includes margin/padding from CSS
      visibleItems.value = Math.floor(wrapperWidth / itemWidth.value);
      console.log('Carousel Dimensions:', { wrapperWidth, itemWidth: itemWidth.value, visibleItems: visibleItems.value });
    } else {
      console.warn('First product card not found for dimension calculation.');
    }
  }
};

const resetCarouselPosition = () => {
  const numProducts = sortedProducts.value.length;
  if (numProducts === 0 || itemWidth.value === 0) return;

  // If we are at the end of the first 'real' set of items, jump back to the middle 'real' set
  if (currentIndex.value >= numProducts) {
    currentIndex.value -= numProducts;
    trackTranslateX.value = -currentIndex.value * itemWidth.value;
  }
  // If we scrolled back into the 'cloned' beginning, jump to the middle 'real' set
  else if (currentIndex.value < 0) {
    currentIndex.value += numProducts;
    trackTranslateX.value = -currentIndex.value * itemWidth.value;
  }
};

const scrollCarousel = () => {
  if (sortedProducts.value.length === 0 || itemWidth.value === 0) return;

  currentIndex.value++;
  trackTranslateX.value = -currentIndex.value * itemWidth.value;

  // Reset position to create infinite loop illusion
  if (currentIndex.value >= sortedProducts.value.length * 2) { // When we reach the end of the second set
    isManualScroll.value = true; // Temporarily disable animation
    trackTranslateX.value = -sortedProducts.value.length * itemWidth.value; // Jump to the start of the middle set
    currentIndex.value = sortedProducts.value.length; // Update index
    // Use setTimeout to re-enable animation after a brief moment, simulating a jump
    setTimeout(() => {
      isManualScroll.value = false;
    }, 50); // Small delay to allow DOM to render the jump
  }
};

const startAutoScroll = () => {
  stopAutoScroll(); // Clear any existing interval
  const delay = 3000; // Scroll every 3 seconds
  scrollInterval.value = setInterval(() => {
    scrollCarousel();
  }, delay);
};

const stopAutoScroll = () => {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value);
    scrollInterval.value = null;
  }
};

const scrollLeft = () => {
  stopAutoScroll();
  isManualScroll.value = true;
  currentIndex.value--;
  trackTranslateX.value = -currentIndex.value * itemWidth.value;

  if (currentIndex.value < 0) {
    // Jump to the end of the second set of cloned items
    trackTranslateX.value = -(sortedProducts.value.length * 2 + currentIndex.value) * itemWidth.value;
    currentIndex.value = sortedProducts.value.length * 2 + currentIndex.value;
    // Set a timeout to allow the transition to complete before resetting
    setTimeout(() => {
        isManualScroll.value = false;
        startAutoScroll();
    }, animationDuration); // Match CSS transition duration
  } else {
    // Set a timeout to allow the transition to complete before re-enabling auto-scroll
    setTimeout(() => {
        isManualScroll.value = false;
        startAutoScroll();
    }, animationDuration); // Match CSS transition duration
  }
};


const scrollRight = () => {
  stopAutoScroll();
  isManualScroll.value = true;
  currentIndex.value++;
  trackTranslateX.value = -currentIndex.value * itemWidth.value;

  if (currentIndex.value >= sortedProducts.value.length * 3) { // Adjusted to handle 3 sets
    // If we've scrolled past the end of the duplicated set, jump back to the middle
    trackTranslateX.value = -sortedProducts.value.length * itemWidth.value;
    currentIndex.value = sortedProducts.value.length;
    // Set a timeout to allow the transition to complete before resetting
    setTimeout(() => {
        isManualScroll.value = false;
        startAutoScroll();
    }, 50); // Small delay for the "jump"
  } else {
    // Set a timeout to allow the transition to complete before re-enabling auto-scroll
    setTimeout(() => {
        isManualScroll.value = false;
        startAutoScroll();
    }, animationDuration); // Match CSS transition duration
  }
};


// --- Product Data Logic ---
const validProducts = computed(() => {
  return bestSellers.value.filter(product => {
    return product &&
           typeof product === 'object' &&
           !Array.isArray(product) &&
           product._id &&
           product.nombre &&
           typeof product.nombre === 'string' &&
           product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0; // Ensure product has at least one image
  });
});

const sortedProducts = computed(() => {
  return [...validProducts.value].sort((a, b) => {
    if (b.promedioCalificacion !== a.promedioCalificacion) {
      return b.promedioCalificacion - a.promedioCalificacion;
    }
    return b.totalResenas - a.totalResenas;
  });
});

const toggleFavorite = (product) => {
  if (favorites.value.has(product._id)) {
    favorites.value.delete(product._id)
  } else {
    favorites.value.add(product._id)
  }
}

const addToCart = (product) => {
  console.log('Añadir al carrito:', product)
  // Implement actual add to cart logic here (e.g., using a store like Pinia/Vuex)
}

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return product.imagenes[0]
  }
  return '/placeholder.png' // Ensure you have a generic placeholder image in your public folder
}

const goToProduct = (productId) => {
  if (productId) {
    router.push(`/Details/${productId}`)
  }
}

const fetchBestSellers = async () => {
  loading.value = true
  try {
    console.log('Bestsellers: Iniciando fetch de productos...')
    const response = await getData('productos')

    console.log('Bestsellers: Respuesta completa del servidor (RAW):', response)

    if (!response) {
      console.error('Bestsellers: No se recibió respuesta del servidor')
      bestSellers.value = []
      return
    }

    const productos = Array.isArray(response) ? response : []

    if (productos.length === 0) {
      console.log('Bestsellers: No hay productos disponibles')
      bestSellers.value = []
      return
    }

    const productosConCalificaciones = await Promise.all(
      productos.map(async (product) => {
        if (!product || !product._id) {
          console.error('Bestsellers: Producto inválido en la lista:', product)
          return null
        }

        try {
          // console.log(`Bestsellers: Procesando producto para rating: ${product._id}`)
          const ratings = await reviewsService.getProductRatings(product._id)
          // console.log(`Bestsellers: Calificaciones obtenidas para ${product._id}:`, ratings)

          return {
            _id: product._id,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion: product.descripcion || 'Sin descripción',
            precio: parseFloat(product.precio) || 0,
            precioOferta: product.precioOferta ? parseFloat(product.precioOferta) : null,
            enOferta: Boolean(product.enOferta),
            marca: product.marca || null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
            promedioCalificacion: ratings?.promedioTotal || 0,
            totalResenas: ratings?.totalReseñas || 0
          }
        } catch (error) {
          console.error(`Bestsellers: Error al obtener calificaciones para producto ${product._id}:`, error)
          return { // Return product with default ratings to avoid breaking the list
            _id: product._id,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion: product.descripcion || 'Sin descripción',
            precio: parseFloat(product.precio) || 0,
            precioOferta: product.precioOferta ? parseFloat(product.precioOferta) : null,
            enOferta: Boolean(product.enOferta),
            marca: product.marca || null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
            promedioCalificacion: 0,
            totalResenas: 0
          }
        }
      })
    )

    bestSellers.value = productosConCalificaciones.filter(product => product !== null)

    console.log('Bestsellers: Productos procesados y asignados a bestSellers.value:', bestSellers.value.length)

    // Wait for the DOM to update after data is loaded and rendered
    await nextTick();
    calculateCarouselDimensions(); // Calculate dimensions after products are rendered
    // Set initial position to the start of the second set for seamless loop
    if (sortedProducts.value.length > 0) {
      currentIndex.value = sortedProducts.value.length; // Start at the beginning of the middle set
      trackTranslateX.value = -currentIndex.value * itemWidth.value;
      startAutoScroll(); // Start auto-scrolling
    }


  } catch (error) {
    console.error('Bestsellers: Error al obtener o procesar productos:', error)
    bestSellers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBestSellers()
  window.addEventListener('resize', calculateCarouselDimensions); // Recalculate on resize
})

onBeforeUnmount(() => {
  stopAutoScroll();
  window.removeEventListener('resize', calculateCarouselDimensions);
})

// Cleanup unused variables
// const currentImages = reactive({})
// const productRatings = ref({})
// const calculateDiscount = (originalPrice, offerPrice) => { /* ... */ }
// const getBrandColor = (brandName) => { /* ... */ }
</script>
<style scoped lang="scss">
// Importa las variables CSS si es necesario, asegúrate de que existen
@import '../css/variables.css';

// Fuente para títulos
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Montserrat:wght@400;500;600;700;800&display=swap');

// === Keyframes ===
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glowText {
  0% { text-shadow: 0 0 8px var(--q-color-primary-blue-light); }
  50% { text-shadow: 0 0 25px var(--q-color-primary-blue), 0 0 40px var(--q-color-primary-blue-lighter); }
  100% { text-shadow: 0 0 8px var(--q-color-primary-blue-light); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes starTwinkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  25% { transform: scale(1.3) rotate(10deg); opacity: 0.9; }
  50% { transform: scale(1) rotate(0deg); opacity: 1; }
  75% { transform: scale(1.1) rotate(-5deg); opacity: 0.95; }
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-5px) scale(1.1); }
  50% { transform: translateY(0); }
}

// === General Section Styles ===
.bestsellers-section {
 
 background-color: transparent;
 
  margin: 40px auto;

 
  position: relative;
  overflow: hidden; // Ensure children don't overflow rounded corners
}

.section-header {
  margin-bottom: 50px;
  position: relative;
  z-index: 2; // Above any background effects
}

h6 {
 font-size: 3em;
  font-weight: 800;
  text-align: center;
  margin-bottom: 50px;
  color: #0056b3; // Azul más oscuro y fuerte
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  padding-bottom: 20px;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1; // Asegurar que el título esté sobre el fondo
}

.glowing-text {
  animation: glowText 3s infinite ease-in-out;
}

h6::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  border-radius: 2px;
  animation: underlineGrow 1.5s ease-out forwards;
}

@keyframes underlineGrow {
  from { width: 0; opacity: 0; }
  to { width: 120px; opacity: 1; }
}

.stars-wrapper {
  display: inline-flex;
  align-items: center;
  margin: 0 10px; // Aumentar espacio
}

.star-icon {
  margin: 0 3px; // Espacio entre estrellas
  animation: starTwinkle 2s infinite ease-in-out;

  background-color: var(--q-color-primary-blue);
  border-radius: 50%;
}
.star-icon:nth-child(1) { animation-delay: 0.2s; }
.star-icon:nth-child(2) { animation-delay: 0.7s; }


.animated-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1em;
  color: var(--q-color-text-grey);
  animation: fadeIn 1s ease-out forwards;
  animation-delay: 0.5s;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// === Loader Styles ===
.tech-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 15px;
  color: var(--q-color-primary-blue);
  font-weight: 500;
  font-size: 1.1em;
}

.loading-text {
  margin-top: 10px;
  animation: pulse 1.5s infinite ease-in-out;
}

// === No Products Available Styles ===
.pulse-animation {
  animation: pulse 2s infinite;
}
.pulse-slow {
  animation: pulse 3s infinite ease-in-out;
}

// === Carousel Styles ===
.carousel-container {
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px; // Espacio para las flechas

 
 // Fondo blanco para el carrusel
  
}

.carousel-wrapper {
  overflow: hidden;
  position: relative;

}

.carousel-track {
  display: flex;
  /* Adjust based on itemWidth if you want a smooth CSS transition */
  transition: transform 0.5s ease-in-out; // Default animation for smooth scroll
}

.carousel-track.is-scrolling-manual {
  transition: transform 0.5s ease-in-out; // Apply transition for manual scrolls
}

.carousel-track.animate-loop {
  transition: transform 0.5s linear; // Linear transition for auto-scroll loop
}

.product-card-wrapper {
  flex: 0 0 auto; // Prevent cards from growing or shrinking
  width: 280px; // Fixed width for each card
  padding: 20px; // AÑADIDO: Espacio interno para que la tarjeta se vea separada. Esto crea el "gap".
  box-sizing: border-box; // Asegura que el padding no aumente el ancho total de 280px
}

.product-card {
  height: 100%;
  border-radius: 12px; // MÁS GRANDE: Bordes más suaves para un look de card
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); // MÁS PRONUNCIADA: Sombra para levantar la tarjeta
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(6, 143, 255, 0.1); // MÁS VISIBLE: Borde sutil
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.tech-card {
  position: relative;
  z-index: 1;
  &:hover::before {
    opacity: 1;
    transform: scale(1.02); // Slightly grow background on hover
  }
}

.tech-card::before {
  content: '';
  position: absolute;
  top: -5px; // Slightly outside the card
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 20px; // LIGERAMENTE MÁS GRANDE para el glow
  background: rgba(33, 150, 243, 0.05); // Subtle blue tint
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3); // MÁS FUERTE: Soft blue glow
  z-index: 0;
  transition: all 0.3s ease-out;
  opacity: 0;
}



.product-card:hover {
  transform: translateY(-8px) scale(1.03); // MÁS PRONUNCIADO: Más lift y escala
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); // MUCHO MÁS PRONUNCIADA: Sombra más fuerte
  border-color: rgba(6, 143, 255, 0.3); // Borde más visible
}

.product-card:hover .product-image {
  transform: scale(1.05); // More zoom on image
}

.img-wrapper {
  position: relative;
  overflow: hidden;
  // Increased padding
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:10px;

  flex-grow: 1; // Allows image area to take available space
  border-radius: 16px 16px 0 0; /* Match card border-radius for top corners */
}

.product-image {
  max-width: 100%;
  height: auto;

  transition: transform 0.4s ease-in-out;
}

:deep(.q-img) {
  width: 100%;
  height: auto !important;
}

:deep(.q-img__content) {
  position: relative !important;
  display: flex; // To center the inner image content
  align-items: center;
  justify-content: center;
  height: 100%;
}

:deep(.q-img__content > div) {
  background-size: contain !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.tech-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.6), // Darker black tint
    rgba(0, 0, 0, 0.2) 70%,
    transparent
  );
  padding: 12px; // More padding
  transition: background 0.3s ease;
  transform: translateY(0); // Always visible
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 2px; // Gap between stars for better visual
}

.rating-count {
  font-size: 0.85rem; // Slightly larger
  font-weight: 500;
  color: white;
  text-shadow: 0 0 5px rgba(0,0,0,0.5); // Add text shadow for readability
}

.product-info {
  padding: 18px !important; // Increased padding
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 0; // Prevent info section from growing
}

.product-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem; // Slightly larger
  line-height: 1.3;
  height: 2.6em; // Accommodate 2 lines
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--q-color-text-dark);
  font-weight: 600; // Bolder
  transition: color 0.3s ease;
  letter-spacing: -0.3px; // Tighter spacing
}

.product-card:hover .product-title {
  color: var(--q-color-primary-blue);
}

.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(6, 143, 255, 0.05); // Stronger blue tint
  padding: 10px 15px; // Increased padding
  border-radius: 10px; // More rounded
  border: 1px solid rgba(6, 143, 255, 0.12); // Stronger border
  margin-top: 10px; // Separación del título
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 4px; // Increased gap
}

.original-price {
  font-size: 0.8rem; // Slightly larger
  text-decoration: line-through;
  color: var(--q-color-text-grey-light);
}

.offer-price,
.current-price {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.3rem; // Más grandes
  background: linear-gradient(45deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700; // Más bold
  letter-spacing: -0.5px;
}

.cart-btn {
  width: 40px; // Más grande
  height: 40px;
  background: linear-gradient(135deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  color: white;
  box-shadow: 0 4px 10px rgba(6, 143, 255, 0.3); // Sombra más prominente
  border-radius: 12px; // Más redondeado
  border: 1px solid rgba(255,255,255,0.2); // Borde blanco
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  .q-icon { font-size: 1.2em; } // Icono más grande
}

.cart-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%; // Start further left
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg); // More pronounced skew
  transition: transform 0.7s ease; // Slower, smoother transition
}

.cart-btn:hover::before {
  transform: translateX(150%) skewX(-25deg); // End further right
}

.cart-btn:hover {
  background: linear-gradient(135deg, var(--q-color-dark-blue), #003870);
  transform: scale(1.1); // Más crecimiento
  box-shadow: 0 6px 15px rgba(6, 143, 255, 0.4); // Sombra más fuerte
}

.tech-details-btn {
  background: rgba(33, 150, 243, 0.02); // Muy sutil
  color: var(--q-color-text-dark);
  font-size: 0.9rem; // Más grande
  font-weight: 600; // Más bold
  padding: 12px; // Más padding
  border-top: 1px solid rgba(6, 143, 255, 0.1); // Borde más visible
  border-radius: 0 0 16px 16px; // AUMENTADO: Esquinas inferiores más redondas
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; // Más espacio
}

.tech-details-btn:hover {
  color: var(--q-color-primary-blue);
  background: rgba(6, 143, 255, 0.08); // Un poco más oscuro en hover
  box-shadow: 0 2px 8px rgba(6, 143, 255, 0.1);
}

.tech-details-btn .q-icon {
  font-size: 1.2rem; // Icono más grande
  transition: transform 0.3s ease;
}

.tech-details-btn:hover .q-icon.arrow-icon {
  transform: translateX(5px); // Más desplazamiento
}

.brand-badge {
  position: absolute;
  top: 12px; // Ajustado
  right: 12px; // Ajustado
  z-index: 2;
}

.brand-chip {
  background: rgba(6, 143, 255, 0.1) !important; // Más opaco
  backdrop-filter: blur(5px); // Más blur
  border: 1px solid rgba(6, 143, 255, 0.2); // Más visible
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); // Más sombra
  padding: 0 10px; // Más padding
  height: 28px; // Más alto
}

.brand-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(6, 143, 255, 0.2);
  background: white !important;
  border-color: rgba(6, 143, 255, 0.3);
}

.brand-name-text {
  font-size: 0.75rem; // Más grande
  font-weight: 600; // Más bold
  color: var(--q-color-text-dark);
  letter-spacing: 0.5px; // Más espaciado
  text-transform: uppercase;
}

.brand-icon {
  color: var(--q-color-primary-blue) !important;
  margin-right: 5px;
  font-size: 1em; // Tamaño ajustado para armonía
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.8); // Fondo sutil blanco
  backdrop-filter: blur(3px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.favorite-btn.is-favorite {
  color: var(--q-color-red-favorite) !important; // Usa tu color de favorito
  animation: pulse .8s ease-out;
}

.brand-caption {
  font-size: 0.7rem; // Ligeramente más grande
  color: var(--q-color-text-grey-light);
  text-transform: uppercase;
  letter-spacing: 0.8px; // Más espaciado
  margin-bottom: 5px; // Ajustado
  font-weight: 600; // Más bold
  opacity: 0.8;
}

// === Navigation Arrows ===
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.8); // Fondo blanco translúcido
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  color: var(--q-color-dark-blue); // Color de flecha
  transition: all 0.3s ease;
  width: 45px; // Tamaño de las flechas
  height: 45px;
  font-size: 1.5em;
  border: 1px solid rgba(6, 143, 255, 0.1);

  &:hover {
    background: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
    color: var(--q-color-primary-blue);
    transform: translateY(-50%) scale(1.1); // Ligeramente más grande
    border-color: rgba(6, 143, 255, 0.3);
  }
}

.left-arrow {
  left: 0px; // Pegado al borde
}

.right-arrow {
  right: 0px; // Pegado al borde
}

// === Responsive ===
@media (max-width: 1024px) {
  .product-card-wrapper {
    width: 250px; // Smaller width for tablets
    padding: 8px; // Ajustado padding
  }
  .product-card {
    border-radius: 14px;
  }
  h6 { font-size: 2.4em; }
  .animated-subtitle { font-size: 1em; }
  .price-section { padding: 8px 12px; }
  .offer-price, .current-price { font-size: 1.2rem; }
  .cart-btn { width: 38px; height: 38px; }
  .tech-details-btn { font-size: 0.8rem; padding: 10px; border-radius: 0 0 14px 14px; }
}

@media (max-width: 768px) {
  .bestsellers-section {
    padding: 40px 10px;
    margin: 30px auto;
  }
  h6 { font-size: 2em; margin-bottom: 30px; }
  .stars-wrapper { margin: 0 5px; }
  .animated-subtitle { font-size: 0.9em; }
  .product-card-wrapper {
    width: 220px; // Further reduction for smaller screens
    padding: 6px; // Ajustado padding
  }
  .product-card {
    border-radius: 12px;
  }
  .tech-overlay { padding: 8px; }
  .rating-count { font-size: 0.75rem; }
  .product-info { padding: 12px !important; gap: 8px; }
  .product-title { font-size: 0.9rem; }
  .price-section { padding: 6px 10px; }
  .original-price { font-size: 0.7rem; }
  .offer-price, .current-price { font-size: 1.1rem; }
  .cart-btn { width: 35px; height: 35px; }
  .tech-details-btn { font-size: 0.75rem; padding: 8px; border-radius: 0 0 12px 12px; }
  .brand-chip { height: 22px; padding: 0 6px; }
  .brand-name-text { font-size: 0.65rem; }
  .nav-arrow { width: 40px; height: 40px; font-size: 1.3em; }
}

@media (max-width: 576px) {
  .bestsellers-section {
    padding: 30px 5px;
    margin: 20px auto;
  }
  h6 { font-size: 1.6em; }
  .animated-subtitle { font-size: 0.85em; }
  .product-card-wrapper {
    width: 180px; // Even smaller for mobile
    padding: 5px; // Ajustado padding
  }
  .product-card {
    border-radius: 10px;
  }
  .img-wrapper { padding: 0.8rem; }
  .tech-overlay { padding: 6px; }
  .rating-stars .q-rating { size: 1em; }
  .rating-count { font-size: 0.7rem; }
  .product-info { padding: 10px !important; gap: 6px; }
  .product-title { font-size: 0.85rem; }
  .price-section { padding: 5px 8px; }
  .offer-price, .current-price { font-size: 1rem; }
  .cart-btn { width: 32px; height: 32px; .q-icon { font-size: 1em; } }
  .tech-details-btn { font-size: 0.7rem; padding: 6px; gap: 4px; border-radius: 0 0 10px 10px; }
  .brand-badge { top: 6px; right: 6px; }
  .brand-chip { height: 20px; padding: 0 5px; }
  .brand-name-text { font-size: 0.6rem; }
  .nav-arrow { width: 35px; height: 35px; font-size: 1.1em; }
  .brand-caption { font-size: 0.6rem; }
}
</style>