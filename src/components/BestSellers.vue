<template>
  <div class="bestsellers-wrapper q-px-md q-mt-lg">
    <h6>Lo más vendido</h6>
    <div v-if="loading" class="row justify-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>
    <div v-else-if="bestSellers.length === 0" class="row justify-center q-pa-md">
      <p>No hay productos disponibles en este momento</p>
    </div>
    <div v-else class="q-gutter-md row items-stretch justify-around">
      <router-link
        v-for="product in bestSellers"
        :key="product._id"
        :to="`/Details/${product._id}`"
        class="product-card col-6 col-sm-4 col-md-2 col-lg-2"
        style="text-decoration: none; color: inherit;"
      >
        <q-card flat>
            <!-- Badges -->
            <div class="q-pa-sm">
                <q-badge  color="primary" floating class="q-ml-sm">
                  {{ product.marca }}
                </q-badge>
              </div>
          <div 
            class="img-wrapper"
            @mouseenter="startImageRotation(product)"
            @mouseleave="stopImageRotation"
          >
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
              <div class="product-title">{{ product.nombre || 'Producto sin nombre' }}</div>
            </div>
            <q-rating
              size="14px"
              v-model="ratingValue"
              :max="5"
              color="amber"
              readonly
              class="q-mb-xs"
            />
           
          </div>
        </q-card>
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
const ratingValue = ref(5)
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
    const res = await getData('productos', { 
      sort: 'popular', 
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

<style scoped>
.product-card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.img-wrapper {
  position: relative;
  object-fit: contain;
}

.favorite-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  background: white;
}
 
.product-title {
  font-size: 13px;
  font-weight: 600;
  margin: 4px 0;
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
</style>