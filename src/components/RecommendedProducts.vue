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
                  @mouseleave="stopImageRotation"
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
import { getData } from '../services/apiclient'
import { useThousandsFormat } from '../composables/useThousandFormat'
import { useCart } from '../composables/useCart'

const {addToCart} = useCart()
const { formatThousands } = useThousandsFormat()
const bestSellers = ref([])
const currentImages = reactive({})
const loading = ref(true)
let imageInterval = null

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
  if (bestSellers.value.length === 0) {
    return [];
  }
  return [...bestSellers.value, ...bestSellers.value, ...bestSellers.value];
});

const calculateCarouselDimensions = () => {
  if (carouselWrapper.value && carouselTrack.value && bestSellers.value.length > 0) {
    const wrapperWidth = carouselWrapper.value.offsetWidth;
    const firstProductCard = carouselTrack.value.querySelector('.product-card-wrapper');
    if (firstProductCard) {
      itemWidth.value = firstProductCard.offsetWidth;
      visibleItems.value = Math.floor(wrapperWidth / itemWidth.value);
    }
  }
};

const resetCarouselPosition = () => {
  const numProducts = bestSellers.value.length;
  if (numProducts === 0 || itemWidth.value === 0) return;

  if (currentIndex.value >= numProducts) {
    currentIndex.value -= numProducts;
    trackTranslateX.value = -currentIndex.value * itemWidth.value;
  }
  else if (currentIndex.value < 0) {
    currentIndex.value += numProducts;
    trackTranslateX.value = -currentIndex.value * itemWidth.value;
  }
};

const scrollCarousel = () => {
  if (bestSellers.value.length === 0 || itemWidth.value === 0) return;

  currentIndex.value++;
  trackTranslateX.value = -currentIndex.value * itemWidth.value;

  if (currentIndex.value >= bestSellers.value.length * 2) {
    isManualScroll.value = true;
    trackTranslateX.value = -bestSellers.value.length * itemWidth.value;
    currentIndex.value = bestSellers.value.length;
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
    trackTranslateX.value = -(bestSellers.value.length * 2 + currentIndex.value) * itemWidth.value;
    currentIndex.value = bestSellers.value.length * 2 + currentIndex.value;
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

  if (currentIndex.value >= bestSellers.value.length * 3) {
    trackTranslateX.value = -bestSellers.value.length * itemWidth.value;
    currentIndex.value = bestSellers.value.length;
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

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return currentImages[product._id] || product.imagenes[0]
  }
  return '/placeholder.png'
}

const startImageRotation = (product) => {
  if (!product || !product.imagenes || !Array.isArray(product.imagenes) || product.imagenes.length < 2) return
  stopImageRotation()
  
  let i = 0
  imageInterval = setInterval(() => {
    const imgWrapper = document.querySelector(`[data-product-id="${product._id}"] .product-image`)
    if (imgWrapper) {
      imgWrapper.style.opacity = '0'
      setTimeout(() => {
        i = (i + 1) % product.imagenes.length
        currentImages[product._id] = product.imagenes[i]
        setTimeout(() => {
          imgWrapper.style.opacity = '1'
        }, 50)
      }, 300)
    }
  }, 2000)
}

const stopImageRotation = () => {
  clearInterval(imageInterval)
  imageInterval = null
}

const fetchBestSellers = async () => {
  loading.value = true
  try {
    const res = await getData('/productos', { 
      sort: 'stock_asc',
      limit: 8 
    })
    
    if (res) {
      let productos = []
      
      if (Array.isArray(res)) {
        productos = res
      } else if (res.productos && Array.isArray(res.productos)) {
        productos = res.productos
      } else {
        console.error('Formato de respuesta no esperado:', res)
        productos = []
      }
      
      productos.sort((a, b) => {
        const stockA = a.stock || 0
        const stockB = b.stock || 0
        return stockA - stockB
      })
   
      bestSellers.value = productos.map(product => {
        return {
          ...product,
          _id: product._id || `temp-${Math.random()}`,
          nombre: product.nombre || 'Producto sin nombre',
          descripcion: product.descripcion || 'Sin descripción',
          precio: product.precio || 0,
          brand: product.brand || 'Sin marca',
          imagenes: Array.isArray(product.imagenes) ? product.imagenes : []
        }
      })
    } else {
      bestSellers.value = []
    }
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error)
    bestSellers.value = []
  } finally {
    loading.value = false
  }
}

const getDetailsPath = (slug) => {
  if (!slug) {
    console.error('Slug no proporcionado para la navegación')
    return '/'
  }
  return `/Details/${encodeURIComponent(slug.trim())}`
}

onMounted(() => {
  fetchBestSellers()
  window.addEventListener('resize', calculateCarouselDimensions)
  startAutoScroll()
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
