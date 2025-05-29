<template>
  <div class="cart-page">
   

    <!-- Notificación -->
    <transition name="fade">
      <div v-if="showNotification" class="notification">
        {{ notificationMessage }}
      </div>
    </transition>

    <!-- Main content -->
    <div class="main-container">
      <!-- Left column - Cart Items -->
      <div class="cart-items-container">
        <h2 class="section-title">Tu Carrito de Compras ({{ totalItems }} artículo{{ totalItems !== 1 ? 's' : '' }})</h2>
        <div class="divider"></div>
        
        <!-- Contenedor de productos con scroll -->
        <div class="products-scroll-container">
          <!-- Lista de productos -->
          <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
            <!-- Product image -->
            <div class="product-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            
            <!-- Product details -->
            <div class="product-info">
              <h3 class="product-name">{{ item.name }}</h3>
              <p class="product-series">{{ item.description }}</p>
              <p class="product-seller">Vendido por {{ item.seller }}</p>
              
              <div class="product-tags">
                <span v-if="item.expressDelivery" class="tag express-tag">🚀 Envío Express</span>
                <span v-if="item.discountPercentage > 0" class="tag discount-tag">🔥 {{ item.discountPercentage }}% OFF</span>
              </div>
            </div>
            
            <!-- Price and quantity -->
            <div class="price-container">
              <div class="current-price">{{ formatCurrency(item.discountPrice) }}</div>
              <div v-if="item.discountPrice < item.originalPrice" class="original-price">{{ formatCurrency(item.originalPrice) }}</div>
              <div v-if="item.discountPrice < item.originalPrice" class="savings">💰 Ahorras: {{ formatCurrency(item.originalPrice - item.discountPrice) }}</div>
              
              <div class="quantity-selector">
                <button class="quantity-btn minus" @click="decreaseQuantity(index)">-</button>
                <input type="text" class="quantity-input" :value="item.quantity" readonly />
                <button class="quantity-btn plus" @click="increaseQuantity(index)">+</button>
              </div>
              
              <button class="remove-btn" @click="removeItem(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right column - Order Summary -->
      <div class="summary-container">
        <h2 class="section-title">Resumen de Compra</h2>
        <div class="divider"></div>
        
        <div class="summary-items">
          <div class="summary-row">
            <span class="summary-label">Subtotal ({{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }})</span>
            <span class="summary-value">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div v-if="totalDiscount > 0" class="summary-row">
            <span class="summary-label">Descuento</span>
            <span class="summary-value discount">-{{ formatCurrency(totalDiscount) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Envío</span>
            <span class="summary-value">{{ shipping === 0 ? 'Gratis' : formatCurrency(shipping) }}</span>
          </div>
          <div class="divider"></div>
          <div class="summary-row total-row">
            <span class="total-label">Total</span>
            <span class="total-value">{{ formatCurrency(total) }}</span>
          </div>
        </div>
        
        <button class="checkout-btn" @click="proceedToCheckout">Proceder al pago</button>
        <button class="continue-btn" @click="continueShopping">Seguir comprando</button>
        
        <div v-if="totalDiscount > 0" class="savings-message">
          🎉 ¡Estás ahorrando {{ formatCurrency(totalDiscount) }} en esta compra!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/store.js'; 

const authStore = useAuthStore();

// Usamos los items del store
const cartItems = computed(() => authStore.cartItems);

// Notificación
const showNotification = ref(false);
const notificationMessage = ref('');

// Totales calculados
const totalItems = computed(() => {
  return authStore.cartItems.reduce((total, item) => total + item.quantity, 0);
});

const subtotal = computed(() => {
  return authStore.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const shipping = computed(() => {
  
  return 0; 
});

const total = computed(() => {
  return subtotal.value + shipping.value;
});


const increaseQuantity = (index) => {
  authStore.cartItems[index].quantity++;
  showNotificationFn(`Añadido 1 ${authStore.cartItems[index].name}`);
};

const decreaseQuantity = (index) => {
  if (authStore.cartItems[index].quantity > 1) {
    authStore.cartItems[index].quantity--;
    showNotificationFn(`Eliminado 1 ${authStore.cartItems[index].name}`);
  }
};

const removeItem = (index) => {
  const removedItem = authStore.cartItems[index].name;
  authStore.cartItems.splice(index, 1);
  showNotificationFn(`${removedItem} eliminado del carrito`);
};

const showNotificationFn = (message) => {
  notificationMessage.value = message;
  showNotification.value = true;
  setTimeout(() => showNotification.value = false, 2500);
};

// Métodos para los botones
const proceedToCheckout = () => {
  console.log('Procediendo al pago', { total: total.value });
  alert(`Redirigiendo a pago por $${formatCurrency(total.value)}`);
};

const continueShopping = () => {
  console.log('Continuar comprando');
  alert('Redirigiendo a la tienda');
};

// Formateo de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value).replace('CLP', '').trim();
};
</script>

<style scoped>
@import '../styles/car.css';



</style>