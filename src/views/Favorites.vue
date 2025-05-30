<template>
  <div class="favorites-page q-pa-md">
    <h4 class="favorites-title q-mb-lg">Mis Favoritos</h4>
    
    <div v-if="favorites.length === 0" class="empty-state q-pa-lg text-center">
      <q-icon name="favorite_border" size="5rem" color="primary" />
      <h5 class="q-mt-md">No tienes productos favoritos</h5>
      <p class="text-grey">Agrega productos a tus favoritos para verlos aquí</p>
      <q-btn 
        color="primary" 
        label="Explorar productos" 
        :to="{ name: 'Home' }" 
        class="q-mt-md explore-btn"
      />
    </div>
    
    <div v-else class="favorites-grid">
      <div v-for="item in favorites" :key="item.id" class="favorite-item">
        <q-card class="favorite-card">
          <div class="image-container">
            <q-img :src="item.image" :ratio="1" class="product-image" />
            <q-btn 
              flat 
              round 
              color="red" 
              icon="favorite" 
              class="favorite-btn"
              @click="removeFromFavorites(item.id)"
            />
          </div>
          
          <q-card-section class="product-info">
            <div class="text-subtitle1 product-name">{{ item.name }}</div>
            <div class="text-h6 product-price">{{ formatPrice(item.price) }}</div>
            <div class="text-caption seller">{{ item.seller }}</div>
          </q-card-section>
          
          <q-card-actions align="center" class="q-px-md q-pb-md">
            <q-btn 
              flat 
              color="primary" 
              label="Ver detalles" 
              :to="{ name: 'Details', params: { id: item.id } }"
              class="details-btn"
            />
            <q-btn 
              color="primary" 
              icon="shopping_cart" 
              label="Agregar"
              @click="addToCart(item)"
              class="cart-btn"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../store/store.js'
import { showNotification } from '../utils/notifications'

const authStore = useAuthStore()
const favorites = computed(() => authStore.favorites)

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price)
}

const removeFromFavorites = (productId) => {
  authStore.removeFromFavorites(productId)
  showNotification('success', 'Producto eliminado de favoritos')
}

const addToCart = (item) => {
  const cartItem = {
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: 1,
    seller: item.seller
  }
  
  authStore.addToCart(cartItem)
  showNotification('positive', `${item.name} agregado al carrito.`)
}
</script>

<style scoped>
.favorites-page {
  background-color: #f9f9f9;
  min-height: 100vh;
}

.favorites-title {
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  color: #0a1b47;
  margin-bottom: 30px;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  padding-bottom: 15px;
}

.favorites-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: #068FFF;
  border-radius: 3px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  padding: 10px;
}

.favorite-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.favorite-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.5s ease;
}

.favorite-card:hover .product-image {
  transform: scale(1.05);
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.product-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.product-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-weight: 700;
  color: #068FFF;
  margin: 8px 0;
}

.seller {
  color: #777;
  margin-top: auto;
}

.details-btn, .cart-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cart-btn {
  flex-grow: 1;
}

.empty-state {
  max-width: 500px;
  margin: 80px auto;
  padding: 40px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.explore-btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
}

@media (max-width: 600px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .product-name {
    font-size: 14px;
  }
  
  .product-price {
    font-size: 16px;
  }
}
</style>
