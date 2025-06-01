<template>
  <div class="favorites-container">
    <div class="favorites-header">
      <h1 class="favorites-title">Mis Favoritos</h1>
      <p class="favorites-subtitle">Aquí encontrarás todos los productos que has marcado como favoritos</p>
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

      <div 
        v-else-if="authStore.error" 
        class="empty-favorites"
      >
        <div class="empty-favorites-icon">⚠️</div>
        <p class="empty-favorites-text">{{ authStore.error }}</p>
        <button 
          @click="retryLoading" 
          class="btn-explore"
        >
          Intentar de nuevo
        </button>
      </div>

      <div v-else-if="authStore.favorites.length === 0" class="empty-favorites">
        <div class="empty-favorites-icon">❤️</div>
        <p class="empty-favorites-text">No tienes productos favoritos aún</p>
        <router-link 
          to="/productos" 
          class="btn-explore"
        >
          Explorar productos
        </router-link>
      </div>

      <div v-else class="favorites-grid">
        <div 
          v-for="product in authStore.favorites" 
          :key="getProductId(product)" 
          class="favorite-card"
        >
          <div class="favorite-image-container">
            <img 
              :src="getProductImage(product)" 
              :alt="getProductName(product)" 
              class="favorite-image"
            >
          </div>
          
          <div class="favorite-content">
            <h2 class="favorite-name line-clamp-2">{{ getProductName(product) }}</h2>
            <p class="favorite-description line-clamp-2">{{ getProductDescription(product) }}</p>
            
            <div class="favorite-price">
              <span class="favorite-price-currency">$</span>
              {{ formatPrice(getProductPrice(product)) }}
            </div>
            
            <div class="favorite-actions">
              <router-link 
                :to="'/Details/' + getProductId(product)" 
                class="btn-details"
              >
                <q-icon name="visibility" size="1.2em" />
                Ver detalles
              </router-link>
              
              <button 
                @click="removeFromFavorites(getProductId(product))"
                class="btn-remove"
              >
                <q-icon name="delete" size="1.2em" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../store/store'
import { storeToRefs } from 'pinia'
import { showNotification } from '../utils/notifications'

const authStore = useAuthStore()
const { favorites, isLoading, error } = storeToRefs(authStore)

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

const removeFromFavorites = async (productId) => {
  if (!productId) {
    showNotification('error', 'ID de producto inválido')
    return
  }

  try {
    await authStore.removeFromFavorites(productId)
    showNotification('success', 'Producto eliminado de favoritos')
  } catch (error) {
    showNotification('error', 'Error al eliminar de favoritos')
  }
}
</script>

<style scoped>
@import '../styles/Favorites.css';
</style>
