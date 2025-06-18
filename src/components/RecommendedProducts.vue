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
              @click="goToProduct(product)"
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

const goToProduct = (product) => {
  if (!product.slug) {
    console.error('Slug no proporcionado para la navegación')
    return
  }
  router.push(`/Details/${encodeURIComponent(product.slug.trim())}`)
}

const getDetailsPath = (slug) => {
  if (!slug) {
    console.error('Slug no proporcionado para la navegación')
    return '/'
  }
  return `/Details/${encodeURIComponent(slug.trim())}`
}

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

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
          const ratings = await reviewsService.getProductRatings(product._id)
          const slug = product.slug || generateSlug(product.nombre)

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
            totalResenas: ratings?.totalReseñas || 0,
            slug: slug
          }
        } catch (error) {
          console.error(`Bestsellers: Error al obtener calificaciones para producto ${product._id}:`, error)
          const slug = product.slug || generateSlug(product.nombre)
          return {
            _id: product._id,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion: product.descripcion || 'Sin descripción',
            precio: parseFloat(product.precio) || 0,
            precioOferta: product.precioOferta ? parseFloat(product.precioOferta) : null,
            enOferta: Boolean(product.enOferta),
            marca: product.marca || null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
            promedioCalificacion: 0,
            totalResenas: 0,
            slug: slug
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


</script>
<style scoped lang="scss">

@import '../css/variables.css';

// Fuente para títulos
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Montserrat:wght@400;500;600;700;800&display=swap');

@import '../styles/RecommendedProducts.css';
</style>