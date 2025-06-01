<template>
  <div class="bestsellers-wrapper q-px-md q-mt-lg">
    <div class="section-header q-mb-xl text-center">
      <h6 class="text-h5 text-weight-bold q-mb-sm glowing-text">
        <div class="stars-wrapper">

        </div>
        <q-icon name="trending_up" class="q-mr-sm" />
        Lo Más Recomendado
        <div class="stars-wrapper">
          
        </div>
      </h6>
      <p class="text-grey-7 text-subtitle1 animated-subtitle">
        Descubre la excelencia tecnológica mejor valorada
      </p>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <div class="tech-loader">
        <q-spinner-dots color="primary" size="40px" />
        <div class="loading-text">Cargando innovación...</div>
      </div>
    </div>

    <div v-else-if="validProducts.length === 0" class="text-center q-pa-xl text-grey-7">
      <q-icon name="devices" size="4em" color="grey-5" class="pulse-animation" />
      <p class="q-mt-sm">No hay productos disponibles en este momento</p>
    </div>

    <div v-else class="row q-col-gutter-xl">
      <div 
        v-for="(product, index) in sortedProducts" 
        :key="product._id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        :style="{ animationDelay: index * 0.1 + 's' }"
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

              <div class="brand-badge absolute-top-left" v-if="product.marca">
                <q-badge 
                  rounded 
                  class="brand-name tech-badge"
                  :style="{ backgroundColor: getBrandColor(product.marca?.nombre) }"
                >
                  <q-icon name="verified" size="xs" class="q-mr-xs" />
                  {{ typeof product.marca === 'object' ? product.marca.nombre : product.marca }}
                </q-badge>
              </div>

              <div class="absolute-top-right q-ma-sm">
                <q-btn
                  round
                  flat
                  :icon="favorites.has(product._id) ? 'favorite' : 'favorite_border'"
                  class="favorite-btn tech-btn"
                  :class="{ 'is-favorite': favorites.has(product._id) }"
                  :color="favorites.has(product._id) ? 'red-5' : 'grey-7'"
                  @click.stop="toggleFavorite(product)"
                >
                  <q-tooltip>
                    {{ favorites.has(product._id) ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
                  </q-tooltip>
                </q-btn>
              </div>

              <div class="tech-overlay">
                <div class="rating-container q-pa-md">
                  <div class="rating-stars tech-rating">
                    <div class="stars-background">
                      <q-rating
                        v-model="product.promedioCalificacion"
                        max="5"
                        size="1.4em"
                        color="yellow-3"
                        icon="star"
                        readonly
                      />
                    </div>
                    <div class="stars-foreground" :style="{ width: (product.promedioCalificacion / 5 * 100) + '%' }">
                      <q-rating
                        :value="5"
                        max="5"
                        size="1.4em"
                        color="yellow"
                        icon="star"
                        readonly
                      />
                    </div>
                    <div class="rating-info">
                      <span class="rating-value text-white text-weight-bold">
                        {{ (product.promedioCalificacion || 0).toFixed(1) }}
                      </span>
                      <span class="rating-count text-blue-2">
                        {{ product.totalResenas || 0 }} valoraciones
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </q-img>
          </div>

          <q-card-section class="product-info">
            <div class="product-title text-weight-bold tech-text">{{ product.nombre }}</div>
            <div class="product-description text-grey-7">{{ product.descripcion }}</div>

            <div class="price-section q-mt-md">
              <div class="price-container">
                <template v-if="product.enOferta">
                  <div class="price-tag">
                    <div class="original-price text-grey-6">
                      ${{ formatThousands(product.precio) }}
                    </div>
                    <div class="offer-price text-negative text-weight-bold glow-text">
                      ${{ formatThousands(product.precioOferta) }}
                    </div>
                    <q-badge color="negative" class="discount-badge tech-badge pulse-badge">
                      -{{ calculateDiscount(product.precio, product.precioOferta) }}%
                    </q-badge>
                  </div>
                </template>
                <template v-else>
                  <div class="current-price text-weight-bold tech-price">
                    ${{ formatThousands(product.precio) }}
                  </div>
                </template>
              </div>

              <q-btn
                round
                color="primary"
                icon="shopping_cart"
                class="cart-btn tech-btn q-ml-sm"
                @click.stop="addToCart(product)"
              >
                <q-tooltip>Agregar al carrito</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-card-actions align="center" class="q-pa-md">
            <q-btn 
              flat 
              color="primary"
              class="tech-details-btn full-width"
              @click.stop="goToProduct(product._id)"
            >
              <div class="row items-center justify-center full-width">
                <span class="q-mr-sm">Ver detalles</span>
                <q-icon name="arrow_forward" class="arrow-icon" />
              </div>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '../services/apiclient'
import { reviewsService } from '../services/resenias'
import { useThousandsFormat } from '../composables/useThousandFormat'

const router = useRouter()
const currentImages = reactive({})
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const bestSellers = ref([])
const productRatings = ref({})
const favorites = ref(new Set())

const validProducts = computed(() => {
  return bestSellers.value.filter(product => {
    return product && 
           typeof product === 'object' && 
           !Array.isArray(product) &&
           product._id && 
           product.nombre &&
           typeof product.nombre === 'string'
  })
})

const sortedProducts = computed(() => {
  return [...validProducts.value].sort((a, b) => {
    // Primero por calificación
    if (b.promedioCalificacion !== a.promedioCalificacion) {
      return b.promedioCalificacion - a.promedioCalificacion;
    }
    // Si tienen la misma calificación, por número de reseñas
    return b.totalResenas - a.totalResenas;
  });
});

const calculateDiscount = (originalPrice, offerPrice) => {
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
}

const getBrandColor = (brandName) => {
  if (!brandName) return 'rgba(52, 152, 219, 0.95)'
  
  let hash = 0
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsla(${hue}, 70%, 50%, 0.95)`
}

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

const goToProduct = (productId) => {
  if (productId) {
    router.push(`/Details/${productId}`)
  }
}

const fetchBestSellers = async () => {
  loading.value = true
  try {
    console.log('Frontend: Iniciando fetch de productos...')
    const response = await getData('productos')
    
    console.log('Frontend: Contenido de response:', response)

    if (response && response.productos && Array.isArray(response.productos)) {
      bestSellers.value = response.productos.map(product => ({
        _id: product._id,
        nombre: product.nombre || 'Producto sin nombre',
        descripcion: product.descripcion || 'Sin descripción',
        precio: parseFloat(product.precio) || 0,
        precioOferta: product.precioOferta ? parseFloat(product.precioOferta) : null,
        enOferta: Boolean(product.enOferta),
        marca: product.marca || null,
        imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
        promedioCalificacion: parseFloat(product.promedioCalificacion) || 0,
        totalResenas: parseInt(product.totalResenas) || 0
      }))
    } else {
      console.log('Frontend: No se encontraron productos en la respuesta')
      bestSellers.value = []
    }
  } catch (error) {
    console.error('Frontend: Error al obtener productos:', error)
    bestSellers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBestSellers()
})
</script>

<style scoped>
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
  0% { text-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
  50% { text-shadow: 0 0 20px rgba(33, 150, 243, 0.8); }
  100% { text-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
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

.section-header h6 {
  font-family: 'Montserrat', sans-serif;
  color: #1976D2;
}

.glowing-text {
  animation: glowText 2s infinite;
  letter-spacing: 1px;
}

.animated-subtitle {
  opacity: 0;
  animation: fadeInUp 0.8s forwards;
  animation-delay: 0.3s;
}

.tech-loader {
  text-align: center;
}

.loading-text {
  margin-top: 10px;
  color: #1976D2;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.product-card {
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.tech-card {
  position: relative;
}

.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  background: linear-gradient(45deg, transparent, rgba(33, 150, 243, 0.1));
  z-index: 0;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.tech-card:hover::before {
  opacity: 1;
}

.product-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.img-wrapper {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image {
  transform: scale(1.15);
}

.tech-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.7) 50%,
    transparent
  );
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .tech-overlay {
  transform: translateY(0);
}

.tech-badge {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.tech-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.tech-btn {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tech-btn:hover {
  transform: scale(1.15) rotate(5deg);
}

.tech-btn.is-favorite {
  animation: pulse 1s infinite;
}

.tech-rating {
  position: relative;
  display: inline-block;
}

.stars-background {
  opacity: 0.3;
}

.stars-foreground {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.rating-value {
  font-size: 1.2rem;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tech-text {
  background: linear-gradient(45deg, #2196F3, #1976D2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.2rem;
}

.tech-price {
  font-size: 1.5rem;
  background: linear-gradient(45deg, #2196F3, #1976D2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glow-text {
  text-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

.pulse-badge {
  animation: pulse 2s infinite;
}

.tech-details-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.tech-details-btn:hover .arrow-icon {
  animation: slideIn 0.5s forwards;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.tech-details-btn:hover .arrow-icon {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .product-card {
    border-radius: 16px;
  }

  .tech-text {
    font-size: 1.1rem;
  }

  .tech-price {
    font-size: 1.3rem;
  }

  .rating-value {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .product-card {
    border-radius: 14px;
  }

  .tech-text {
    font-size: 1rem;
  }

  .tech-price {
    font-size: 1.2rem;
  }

  .tech-badge {
    font-size: 0.8rem;
  }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

.pulse-slow {
  animation: pulse 3s infinite;
}

.stars-wrapper {
  display: inline-flex;
  align-items: center;
  margin: 0 8px;
}

.star-icon {
  margin: 0 2px;
  animation: starTwinkle 1.5s infinite ease-in-out;
}

.star-icon:nth-child(1) { animation-delay: 0s; }
.star-icon:nth-child(2) { animation-delay: 0.5s; }
.star-icon:nth-child(3) { animation-delay: 1s; }

@keyframes starTwinkle {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>