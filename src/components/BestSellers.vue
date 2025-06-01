<template>
  <div class="bestsellers-section">
    <div class="section-header">
      <h2 class="title">Lo más vendido</h2>
      <div class="title-underline"></div>
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner-dots color="primary" size="4em" />
    </div>

    <div v-else-if="bestSellers.length === 0" class="empty-state q-pa-xl">
      <q-icon name="inventory_2" size="4em" color="grey-5" />
      <p>No hay productos disponibles en este momento</p>
    </div>

    <div v-else class="products-grid">
      <router-link
        v-for="product in bestSellers"
        :key="product._id"
        :to="`/Details/${product._id}`"
        class="product-link"
      >
      
        <div class="product-card">
          <div class="card-content">
            <!-- Badge de marca -->
            <div class="brand-badge">
            
            </div>

            <!-- Imagen del producto -->
            <div 
              class="image-container"
              @mouseenter="startImageRotation(product)"
              @mouseleave="stopImageRotation"
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
              </q-img>

              <!-- Botón de favoritos -->
              <q-btn
                round
                flat
                class="favorite-btn"
                :icon="product.isFavorite ? 'favorite' : 'favorite_border'"
                color="red-6"
              >
                <q-tooltip>Agregar a favoritos</q-tooltip>
              </q-btn>
            </div>

            <!-- Información del producto -->
            <div class="product-info">
              <h3 class="product-name">{{ product.nombre || 'Producto sin nombre' }}</h3>
              <q-badge rounded color="primary" class="brand-badge-label text-weight-bold">
                {{ typeof product.marca === 'object' ? product.marca.nombre : (product.marca || 'Sin marca') }}
              </q-badge>
              
              <div class="rating-wrapper">
                <div class="rating-stars">
                  <q-rating
                    v-model="product.promedioCalificacion"
                    :max="5"
                    size="1.2em"
                    color="amber"
                    icon="star"
                    icon-selected="star"
                    icon-half="star_half"
                    readonly
                  />
                </div>
                <div class="rating-info">
                  <span class="rating-value">{{ (product.promedioCalificacion || 0).toFixed(1) }}</span>
                  <span class="rating-count">({{ product.totalResenas || 0 }} reseñas)</span>
                </div>
              </div>

              <div class="price-container" v-if="product.precio">
                <span class="currency">$</span>
                <span class="price">{{ formatThousands(product.precio) }}</span>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getData } from '../services/apiclient'
import { useThousandsFormat } from '../composables/useThousandFormat'

const { formatThousands } = useThousandsFormat()
const bestSellers = ref([])
const currentImages = reactive({})
const loading = ref(true)
let imageInterval = null

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
    i = (i + 1) % product.imagenes.length
    currentImages[product._id] = product.imagenes[i]
  }, 1000)
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

onMounted(() => {
  fetchBestSellers()
})
</script>

<style lang="scss" scoped>
.bestsellers-section {
  padding: 2rem;
  background: #f0f2f5;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: -0.5px;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  margin: 1rem auto;
  border-radius: 2px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-card {
  border-radius: 20px;
  background: #f0f2f5;
  box-shadow: 
    8px 8px 15px #d1d9e6,
    -8px -8px 15px #ffffff;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      12px 12px 20px #d1d9e6,
      -12px -12px 20px #ffffff;

    .product-image {
      transform: scale(1.05);
    }
  }
}

.card-content {
  padding: 1rem;
}

.brand-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  
  .q-badge {
    padding: 4px 12px;
    font-size: 0.8rem;
    backdrop-filter: blur(4px);
    background: rgba(52, 152, 219, 0.9);
  }
}

.image-container {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1rem;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0) 70%,
      rgba(0,0,0,0.1) 100%
    );
  }
}

.product-image {
  transition: transform 0.5s ease;
}

.favorite-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(4px);
  
  &:hover {
    transform: scale(1.1);
  }
}

.product-info {
  padding: 0.5rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rating-wrapper {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px 12px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rating-stars {
  display: flex;
  align-items: center;
  
  .q-rating {
    .q-icon {
      font-size: 1.4em;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1c40f;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.rating-count {
  font-size: 0.9rem;
  color: #666;
}

.brand-badge-label {
  padding: 6px 12px;
  margin: 8px 0;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
}

.price-container {
  margin-top: 1rem;
  font-family: 'Montserrat', sans-serif;
}

.currency {
  font-size: 1rem;
  color: #2c3e50;
  margin-right: 0.2rem;
}

.price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 3rem;
  
  p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
}

// Responsive adjustments
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

  .product-name {
    font-size: 1rem;
  }

  .price {
    font-size: 1.2rem;
  }
}
</style>