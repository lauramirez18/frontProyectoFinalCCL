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
import { getData } from '../services/apiClient'
import { useThousandsFormat } from '../composables/useThousandFormat'

const router = useRouter()
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const recommended = ref([])
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
  if (recommended.value.length === 0) {
    return [];
  }
  return [...recommended.value, ...recommended.value, ...recommended.value];
});

const calculateCarouselDimensions = () => {
  if (carouselWrapper.value && carouselTrack.value && recommended.value.length > 0) {
    const wrapperWidth = carouselWrapper.value.offsetWidth;
    const firstProductCard = carouselTrack.value.querySelector('.product-card-wrapper');
    if (firstProductCard) {
      itemWidth.value = firstProductCard.offsetWidth;
      visibleItems.value = Math.floor(wrapperWidth / itemWidth.value);
    }
  }
};

const resetCarouselPosition = () => {
  const numProducts = recommended.value.length;
  if (numProducts === 0 || itemWidth.value === 0) return;
  if (currentIndex.value >= numProducts) {
    currentIndex.value -= numProducts;
    trackTranslateX.value = -currentIndex.value * itemWidth.value;
  } else if (currentIndex.value < 0) {
    currentIndex.value += numProducts;
    trackTranslateX.value = -currentIndex.value * itemWidth.value;
  }
};

const scrollCarousel = () => {
  if (recommended.value.length === 0 || itemWidth.value === 0) return;
  currentIndex.value++;
  trackTranslateX.value = -currentIndex.value * itemWidth.value;
  if (currentIndex.value >= recommended.value.length * 2) {
    isManualScroll.value = true;
    trackTranslateX.value = -recommended.value.length * itemWidth.value;
    currentIndex.value = recommended.value.length;
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
    trackTranslateX.value = -(recommended.value.length * 2 + currentIndex.value) * itemWidth.value;
    currentIndex.value = recommended.value.length * 2 + currentIndex.value;
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
  if (currentIndex.value >= recommended.value.length * 3) {
    trackTranslateX.value = -recommended.value.length * itemWidth.value;
    currentIndex.value = recommended.value.length;
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
  return recommended.value.filter(product => {
    return product &&
           typeof product === 'object' &&
           !Array.isArray(product) &&
           product._id &&
           product.nombre &&
           typeof product.nombre === 'string' &&
           product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0;
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
}

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return product.imagenes[0]
  }
  return '/placeholder.png'
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

const fetchRecommended = async () => {
  loading.value = true
  try {
    // Puedes ajustar el endpoint según tu backend
    const res = await getData('productos', { sort: 'rating_desc', limit: 8 })
    let productos = []
    if (Array.isArray(res)) {
      productos = res
    } else if (res.productos && Array.isArray(res.productos)) {
      productos = res.productos
    } else {
      productos = []
    }
    recommended.value = productos
  } catch (e) {
    recommended.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecommended()
  window.addEventListener('resize', calculateCarouselDimensions)
})

onBeforeUnmount(() => {
  stopAutoScroll()
  window.removeEventListener('resize', calculateCarouselDimensions)
})

</script>
<style scoped lang="scss">

@import '../css/variables.css';

// Fuente para títulos
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Montserrat:wght@400;500;600;700;800&display=swap');

@import '../styles/RecommendedProducts.css';
</style>