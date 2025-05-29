<template>
  <div class="bestsellers-wrapper q-px-md q-mt-lg">
      <h6>lo más Recomendado</h6>
    <div class="q-gutter-md row items-stretch justify-around">
      
      <q-card
        v-for="product in bestSellers"
        :key="product._id"
        class="product-card col-6 col-sm-4 col-md-2 col-lg-2"
        flat
      >
        <div class="img-wrapper">
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
            <div class="text-caption text-grey-7">{{ product.brand }}</div>
            <q-btn
              flat
              dense
              icon="shopping_cart"
              size="sm"
              color="primary"
              class="cart-btn"
            />
          </div>
          <q-rating
            size="14px"
            :value="5"
            :max="5"
            color="amber"
            readonly
            class="q-mb-xs"
            
          />
          <div class="product-title">{{ product.nombre }}</div>
          
          <div class="text-caption text-grey-6 ellipsis-2-lines">{{ product.descripcion }}</div>
         
          <div class="text-negative text-subtitle2"><b>${{ formatThousands(product.precio) }}</b></div>
        </div>
      </q-card>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getData } from '../services/apiclient'
import { useThousandsFormat } from '../composables/useThousandFormat'
const currentImages = reactive({})
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const bestSellers = ref([])

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

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return currentImages[product._id] || product.imagenes[0]
  }
  return '/placeholder.png'
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


</style>


