<template>
  <div class="bestsellers-wrapper q-px-md q-mt-lg">
    <h6>Lo más Recomendado</h6>
    <div class="q-gutter-md row items-stretch justify-around">
      <q-card
        v-for="product in validProducts"
        :key="product._id"
        class="product-card col-6 col-sm-4 col-md-2 col-lg-2"
        flat
        @click="goToProduct(product._id)"
      >
        <div class="img-wrapper">
          <div class="brand-badge">
            <q-badge rounded>
              {{ typeof product.marca === 'object' ? product.marca.nombre : (product.marca || 'Sin marca') }}
            </q-badge>
          </div>
          
          <q-img
            :src="getProductImage(product)"
            :alt="product.nombre"
            ratio="1"
            class="q-mb-sm"
          />
          <q-btn
            round
            dense
            flat
            icon="favorite_border"
            class="favorite-btn"
            color="red"
          />
        </div>

        <div class="q-pa-xs">
          <div class="row items-center justify-between">
            <q-btn
              flat
              dense
              icon="shopping_cart"
              size="sm"
              color="primary"
              class="cart-btn"
            />
          </div>

          <div class="rating-container q-mb-sm">
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(product.promedioCalificacion || 0) }">★</span>
            </div>
            <span class="rating-value">{{ (product.promedioCalificacion || 0).toFixed(1) }}</span>
            <span class="rating-count">({{ product.totalResenas || 0 }} reseñas)</span>
          </div>

          <div class="product-title">{{ product.nombre }}</div>
          <div class="text-caption text-grey-6 ellipsis-2-lines">{{ product.descripcion }}</div>
          <div class="text-negative text-subtitle2">
            <template v-if="product.enOferta">
              <span class="text-strike text-grey-6 text-caption q-mr-sm">${{ formatThousands(product.precio) }}</span>
              <b>${{ formatThousands(product.precioOferta) }}</b>
            </template>
            <template v-else>
              <b>${{ formatThousands(product.precio) }}</b>
            </template>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '../services/apiclient'
import { useThousandsFormat } from '../composables/useThousandFormat'

const router = useRouter()
const currentImages = reactive({})
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const bestSellers = ref([])
const reviews = ref([])
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.calificacion, 0);
  return total / reviews.value.length;
});
const reviewSubmitting = ref(false) 
const isEditingReview = ref(false) 

const parsedDetails = computed(() => {
  if (producto.value.especificaciones && typeof producto.value.especificaciones === 'object') {
    return producto.value.especificaciones;
  }
  return {};
})

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

const fetchBestSellers = async () => {
  loading.value = true
  try {
    const res = await getData('productos', { 
      sort: '-promedioCalificacion,-totalResenas',
      limit: 8
    })
    
    if (res) {
      let productos = []
      
      if (Array.isArray(res)) {
        productos = res
      } else if (res.productos && Array.isArray(res.productos)) {
        productos = res.productos
      } else if (res.data && Array.isArray(res.data)) {
        productos = res.data
      } else {
        console.error('Formato de respuesta no esperado:', res)
        productos = []
      }
      
      bestSellers.value = productos
        .filter(product => product && product._id && product.nombre)
        .map(product => ({
          _id: product._id,
          nombre: product.nombre || 'Producto sin nombre',
          descripcion: product.descripcion || 'Sin descripción',
          precio: parseFloat(product.precio) || 0,
          precioOferta: product.precioOferta ? parseFloat(product.precioOferta) : null,
          enOferta: Boolean(product.enOferta),
          marca: typeof product.marca === 'object' ? product.marca : { nombre: product.marca || 'Sin marca' },
          imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
          promedioCalificacion: parseFloat(product.promedioCalificacion) || 0,
          totalResenas: parseInt(product.totalResenas) || 0
        }))
        .sort((a, b) => {
          if (b.promedioCalificacion !== a.promedioCalificacion) {
            return b.promedioCalificacion - a.promedioCalificacion
          }
          return b.totalResenas - a.totalResenas
        })
    } else {
      bestSellers.value = []
    }
  } catch (error) {
    console.error('Error al obtener productos recomendados:', error)
    bestSellers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBestSellers()
})

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return currentImages[product._id] || product.imagenes[0]
  }
  return '/placeholder.png'
}

const goToProduct = (productId) => {
  if (productId) {
    router.push(`/Details/${productId}`)
  }
}
</script>

<style scoped>
.product-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.749);
  background-color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.img-wrapper {
  position: relative;
  object-fit: contain;
}

.brand-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.brand-badge .q-badge {
  padding: 6px 14px;
  font-size: 0.9rem;
  backdrop-filter: blur(4px);
  background: rgba(52, 152, 219, 0.95);
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.favorite-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  background: white;
}

.cart-btn {
  margin-left: auto;
}

.product-title {
  font-size: 13px;
  font-weight: 600;
  margin: 10px 0 4px;
  color: #222;
  line-height: 1.2;
}

h6 {
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
  font-family: 'Montserrat', sans-serif;
}

.text-strike {
  text-decoration: line-through;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0.5rem 0;
  flex-wrap: wrap;
}

.rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.star {
  color: #ddd;
  font-size: 14px;
  transition: color 0.3s ease;
  cursor: default;
  line-height: 1;
}

.star.filled {
  color: #ffd700;
}

.rating-value {
  font-weight: 600;
  color: #666;
  font-size: 12px;
  margin-left: 0.25rem;
}

.rating-count {
  color: #666;
  font-size: 10px;
  margin-left: 0.25rem;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .rating-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }
  
  .rating-stars {
    margin-bottom: 0.125rem;
  }
  
  .rating-value,
  .rating-count {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .star {
    font-size: 12px;
  }
  
  .rating-value,
  .rating-count {
    font-size: 10px;
  }
}
</style>