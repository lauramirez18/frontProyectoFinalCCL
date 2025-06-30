<template>
  <div class="bestsellers-section">
    <div class="section-header">
      <h2 class="title">Lo más Recomendado</h2>
      <div class="title-underline"></div>
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner-dots color="primary" size="4em" />
    </div>

    <div v-else-if="bestSellers.length === 0" class="empty-state q-pa-xl">
      <q-icon name="inventory_2" size="4em" color="grey-5" />
      <p>No hay productos disponibles en este momento</p>
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
            <router-link
              :to="`/Details/${product.slug}`"
              class="product-link"
            >
              <q-card class="product-card tech-card" flat>
                <div class="img-wrapper"
                  @mouseenter="startImageRotation(product)"
                  @mouseleave="stopImageRotation(product)"
                  :data-product-id="product._id"
                >
                  <q-img
                    :src="getProductImage(product)"
                    :alt="product.nombre"
                    ratio="1"
                    class="product-image"
                  >
                    <template v-slot:loading>
                      <q-spinner-dots color="white" size="40px" />
                    </template>

                    <div class="tech-overlay">
                      <div class="rating-container">
                        <div class="rating-stars tech-rating">
                          <q-rating
                            v-model="product.promedioCalificacion"
                            max="5"
                            size="1.2em"
                            color="yellow"
                            icon="star"
                            icon-selected="star"
                            icon-half="star_half"
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
                  <div class="product-title">{{ product.nombre || 'Producto sin nombre' }}</div>

                  <div class="price-section">
                    <div class="price-container">
                      <div class="current-price">
                        ${{ formatThousands(product.precio) }}
                      </div>
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
            </router-link>

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
import { useCart } from '../composables/useCart'

const {addToCart} = useCart()
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const bestSellers = ref([])
const favorites = ref(new Set())
const currentImages = reactive({})
const imageIntervals = reactive({})

// Carousel Logic
const carouselWrapper = ref(null)
const carouselTrack = ref(null)
const trackTranslateX = ref(0)
const itemWidth = ref(0)
const visibleItems = ref(0)
const currentIndex = ref(0)
const scrollInterval = ref(null)
const isManualScroll = ref(false)
const animationDuration = 500

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
    const firstProductCard = carouselTrack.value.querySelector('.product-card-wrapper');
    if (firstProductCard) {
      itemWidth.value = firstProductCard.offsetWidth;
      visibleItems.value = Math.floor(wrapperWidth / itemWidth.value);
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
    }, 50);
  }
};

const startAutoScroll = () => {
  stopAutoScroll();
  const delay = 3000;
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
    }, animationDuration);
  } else {
    setTimeout(() => {
      isManualScroll.value = false;
      startAutoScroll();
    }, animationDuration);
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
    }, 50);
  } else {
    setTimeout(() => {
      isManualScroll.value = false;
      startAutoScroll();
    }, animationDuration);
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

const startImageRotation = (product) => {
  if (!product || !product.imagenes || product.imagenes.length <= 1) return;

  let currentIndex = product.imagenes.indexOf(currentImages[product._id] || product.imagenes[0]);

  imageIntervals[product._id] = setInterval(() => {
    currentIndex = (currentIndex + 1) % product.imagenes.length;
    currentImages[product._id] = product.imagenes[currentIndex];
  }, 1200);
};

const stopImageRotation = (product) => {
  if (imageIntervals[product._id]) {
    clearInterval(imageIntervals[product._id]);
    delete imageIntervals[product._id];
    if (product && product.imagenes && product.imagenes.length > 0) {
      currentImages[product._id] = product.imagenes[0];
    }
  }
};

const toggleFavorite = (product) => {
  if (favorites.value.has(product._id)) {
    favorites.value.delete(product._id)
  } else {
    favorites.value.add(product._id)
  }
}

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return currentImages[product._id] || product.imagenes[0]
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
  stopAutoScroll()
  window.removeEventListener('resize', calculateCarouselDimensions)
})


</script>

<style scoped>
@import '../css/variables.css';
@import '../styles/RecommendedProducts.css';

.bestsellers-section {
  padding: 2rem;
  
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.title {
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

.title::after {
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



.product-link {
  text-decoration: none;
  color: inherit;
}











.tech-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.1) 70%,
    transparent
  );
  padding: 10px;
  transition: background 0.3s ease;
}












@media (max-width: 600px) {
  .bestsellers-section {
    padding: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .title {
    font-size: 2rem;
  }
}

:deep(.q-img__image) {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
}

.product-container {
  position: relative;
  display: flex;
  flex-direction: column;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 0 40px;
}

.carousel-wrapper {
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-track.is-scrolling-manual {
  transition: transform 0.5s ease-in-out;
}

.carousel-track.animate-loop {
  transition: transform 0.5s linear;
}

.product-card-wrapper {
  flex: 0 0 auto;
  width: 280px;
  padding: 20px;
  box-sizing: border-box;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  color: var(--q-color-dark-blue);
  transition: all 0.3s ease;
  width: 45px;
  height: 45px;
  font-size: 1.5em;
  border: 1px solid rgba(6, 143, 255, 0.1);
}

.nav-arrow:hover {
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
  color: var(--q-color-primary-blue);
  transform: translateY(-50%) scale(1.1);
  border-color: rgba(6, 143, 255, 0.3);
}

.left-arrow {
  left: 0;
}

.right-arrow {
  right: 0;
}

@media (max-width: 1024px) {
  .product-card-wrapper {
    width: 250px;
    padding: 8px;
  }
  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.3em;
  }
}

@media (max-width: 768px) {
  .product-card-wrapper {
    width: 220px;
    padding: 6px;
  }
  .nav-arrow {
    width: 35px;
    height: 35px;
    font-size: 1.1em;
  }
}

@media (max-width: 576px) {
  .product-card-wrapper {
    width: 180px;
    padding: 5px;
  }
  .nav-arrow {
    width: 30px;
    height: 30px;
    font-size: 1em;
  }
}
</style>
