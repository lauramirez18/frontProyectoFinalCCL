<template>
  <div class="favorites-container">
    <div class="favorites-header" v-if="authStore.favorites.length > 0">
      <div class="header-content">
        <h1 class="favorites-title">Mis Favoritos</h1>
        <q-select
          v-model="sortOption"
          :options="sortOptions"
          dense
          outlined
          class="sort-select"
          options-dense
          borderless
          style="width: 180px;"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="sort" size="xs" />
          </template>
        </q-select>
      </div>
    </div>
    
    <div v-if="!authStore.token" class="empty-favorites">
      <div class="empty-favorites-icon">🔒</div>
      <p class="empty-favorites-text">Debes iniciar sesión para ver tus favoritos</p>
      <router-link 
        to="/login" 
        class="btn-explore"
      >
        Iniciar sesión
      </router-link>
    </div>

    <div v-else>
      <div v-if="authStore.isLoading" class="loading-spinner">
        <q-spinner-dots size="60px" />
      </div>

      <div v-else-if="authStore.error" class="error-message">
        <p>Error al cargar los favoritos. Intenta de nuevo más tarde.</p>
        <q-btn color="primary" label="Reintentar" @click="retryLoading" />
      </div>

      <div v-else-if="authStore.favorites.length === 0" class="empty-favorites">
        <div class="empty-favorites-icon">
          <q-icon name="favorite_border" size="60px" />
        </div>
        <h2 class="empty-favorites-title">No tienes productos favoritos</h2>
        <p class="empty-favorites-text">Explora nuestra tienda y añade tus productos favoritos</p>
        <router-link 
          to="/products" 
          class="btn-explore"
        >
          Explorar productos
        </router-link>
      </div>

      <div v-else class="favorites-container">

        <transition-group 
          name="fade-staggered" 
          tag="div" 
          class="favorites-grid-inner"
          :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }"
        >
          <div 
            v-for="(product, index) in filteredFavorites" 
            :key="getProductId(product)" 
            class="favorite-card"
            :style="`--i: ${index % 10};`"
            @mouseenter="hoveredCard = getProductId(product)"
            @mouseleave="hoveredCard = null"
          >
            <div class="favorite-image-container">
              <img 
                :src="getProductImage(product)" 
                :alt="getProductName(product)" 
                class="favorite-image"
                loading="lazy"
              />
            </div>
            
            <div class="favorite-content">
              <div class="brand-tag" v-if="product.marca">
                {{ getBrandName(product.marca.nombre) }}
              </div>
              <h2 class="favorite-name line-clamp-2">{{ getProductName(product) }}</h2>
              
              <div class="favorite-rating">
                <q-rating
                  :model-value="product.rating || 0"
                  size="1.2em"
                  color="yellow-7"
                  readonly
                  :max="5"
                />
                <span class="rating-count">({{ product.reviewCount || 0 }})</span>
              </div>
              
              <div class="favorite-price-container">
                <div v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
                  ${{ formatPrice(product.originalPrice) }}
                </div>
                <div class="current-price">
                  ${{ formatPrice(getProductPrice(product)) }}
                  <span v-if="product.originalPrice && product.originalPrice > product.price" class="discount-badge">
                    {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
                  </span>
                </div>
                <div v-if="product.installments" class="installments">
                  Hasta {{ product.installments }}x sin interés
                </div>
              </div>
              
              <div class="favorite-actions">
                <q-btn
                  color="primary"
                  label="Añadir al carrito"
                  class="btn-add-cart"
                  :loading="addingToCart === getProductId(product)"
                  @click="addToCart(product)"
                  icon="shopping_cart"
                  no-caps
                />
                <q-btn
                  flat
                  round
                  color="red"
                  icon="favorite"
                  class="btn-remove"
                  :loading="removingFromFavorites === getProductId(product)"
                  @click="confirmRemove(product)"
                >
                  <q-tooltip>Eliminar de favoritos</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../store/store'
import { storeToRefs } from 'pinia'
import { showNotification } from '../utils/notifications'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const { favorites, isLoading, error } = storeToRefs(authStore)
const searchQuery = ref('')
const loadingProductId = ref(null)
const sortOption = ref('name-asc')
const sortOptions = [
  { label: 'Nombre (A-Z)', value: 'name-asc' },
  { label: 'Nombre (Z-A)', value: 'name-desc' },
  { label: 'Precio (menor a mayor)', value: 'price-asc' },
  { label: 'Precio (mayor a menor)', value: 'price-desc' },
  { label: 'Mejor valorados', value: 'rating-desc' }
]

onMounted(async () => {
  if (authStore.token) {
    await loadFavorites()
  }
})

const loadFavorites = async () => {
  try {
    await authStore.getFavorites()
  } catch (error) {
    console.error('Error al cargar favoritos:', error)
  }
}

const retryLoading = () => {
  loadFavorites()
}

const getProductId = (product) => {
  if (typeof product === 'string') return product
  if (product._id) return product._id
  if (product.producto && product.producto._id) return product.producto._id
  return null
}

const getProductName = (product) => {
  if (typeof product === 'string') return 'Producto'
  if (product.nombre) return product.nombre
  if (product.producto && product.producto.nombre) return product.producto.nombre
  return 'Producto sin nombre'
}

const getProductDescription = (product) => {
  if (product.descripcion) return product.descripcion
  if (product.producto && product.producto.descripcion) return product.producto.descripcion
  return 'Sin descripción'
}

const getProductPrice = (product) => {
  if (product.precio) return product.precio
  if (product.producto && product.producto.precio) return product.producto.precio
  return 0
}

const getProductImage = (product) => {
  if (product.imagenes && product.imagenes.length > 0) return product.imagenes[0]
  if (product.producto && product.producto.imagenes && product.producto.imagenes.length > 0) {
    return product.producto.imagenes[0]
  }
  return '/placeholder-product.png'
}

const formatPrice = (price) => {
  return price?.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) || '0'
}

// Mapeo de IDs de marcas a nombres
const brandNames = {
  '1': 'Apple',
  '2': 'Samsung',
  '3': 'Xiaomi',
  '4': 'Huawei',
  '5': 'Oppo',
  '6': 'OnePlus',
  '7': 'Google',
  '8': 'Sony',
  '9': 'LG',
  '10': 'Motorola'
}

const getBrandName = (brandId) => {
  return brandNames[brandId] || 'Marca desconocida'
}

const filteredFavorites = computed(() => {
  let result = [...authStore.favorites]
  
  // Ordenar según la opción seleccionada
  if (sortOption.value) {
    const [field, order] = sortOption.value.split('-')
    
    result.sort((a, b) => {
      let valueA, valueB
      
      if (field === 'name') {
        valueA = getProductName(a).toLowerCase()
        valueB = getProductName(b).toLowerCase()
        return order === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      } else if (field === 'price') {
        valueA = getProductPrice(a)
        valueB = getProductPrice(b)
        return order === 'asc' 
          ? valueA - valueB 
          : valueB - valueA
      } else if (field === 'rating') {
        valueA = a.rating || 0
        valueB = b.rating || 0
        return order === 'asc' 
          ? valueA - valueB 
          : valueB - valueA
      }
      return 0
    })
  }

  return result
})

const sortBy = (field, order = 'asc') => {
  sortField.value = field
  sortOrder.value = order
}

const confirmRemove = (product) => {
  $q.dialog({
    title: 'Eliminar de favoritos',
    message: `¿Estás seguro de que deseas eliminar "${getProductName(product)}" de tus favoritos?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'primary',
      flat: true
    }
  }).onOk(async () => {
    await removeFromFavorites(getProductId(product))
  })
}

const removeFromFavorites = async (productId) => {
  if (!productId) {
    showNotification('error', 'ID de producto inválido')
    return
  }

  try {
    await authStore.removeFromFavorites(productId)
    showNotification('positive', 'Producto eliminado de favoritos')
  } catch (error) {
    showNotification('negative', 'Error al eliminar de favoritos')
  }
}

const addToCart = async (product) => {
  if (!authStore.token) {
    showLoginDialog.value = true
    return
  }

  const productId = getProductId(product)
  loadingProductId.value = productId

  try {
    const cartItem = {
      id: productId,
      name: getProductName(product),
      price: getProductPrice(product),
      quantity: 1,
      image: getProductImage(product),
      stock: product.stock || 10
    }
    
    await authStore.addToCart(cartItem)
    showNotification('positive', 'Producto agregado al carrito')
  } catch (error) {
    console.error('Error adding to cart:', error)
    showNotification('negative', 'Error al agregar al carrito')
  } finally {
    loadingProductId.value = null
  }
}
</script>

<style scoped>
@import '../styles/Favorites.css';
</style>
