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

// Datos de ejemplo con múltiples productos
const cartItems = ref([
  {
    id: 1,
    name: 'Smart TV 4K UHD 55"',
    description: 'Premium Series',
    seller: 'TechShop',
    image: '/api/placeholder/160/120',
    originalPrice: 1199990,
    discountPrice: 899990,
    quantity: 1,
    expressDelivery: true,
    discountPercentage: 25
  },
  {
    id: 2,
    name: 'Smartphone X9 Pro',
    description: '128GB RAM - Negro',
    seller: 'MobileWorld',
    image: '/api/placeholder/160/120',
    originalPrice: 599990,
    discountPrice: 499990,
    quantity: 2,
    expressDelivery: false,
    discountPercentage: 17
  },
  {
    id: 3,
    name: 'Audífonos Inalámbricos',
    description: 'Cancelación de Ruido',
    seller: 'AudioTech',
    image: '/api/placeholder/160/120',
    originalPrice: 199990,
    discountPrice: 199990,
    quantity: 1,
    expressDelivery: true,
    discountPercentage: 0
  },
  {
    id: 4,
    name: 'Tablet Pro 10.5"',
    description: '256GB - WiFi + LTE',
    seller: 'TechShop',
    image: '/api/placeholder/160/120',
    originalPrice: 399990,
    discountPrice: 349990,
    quantity: 1,
    expressDelivery: true,
    discountPercentage: 13
  },
  {
    id: 5,
    name: 'Smartwatch Fitness',
    description: 'Monitor de ritmo cardíaco',
    seller: 'GadgetWorld',
    image: '/api/placeholder/160/120',
    originalPrice: 149990,
    discountPrice: 129990,
    quantity: 3,
    expressDelivery: false,
    discountPercentage: 13
  }
]);

const showNotification = ref(false);
const notificationMessage = ref('');

// Totales calculados
const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
});

const totalDiscount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + ((item.originalPrice - item.discountPrice) * item.quantity);
  }, 0);
});

const shipping = computed(() => {
  // Envío gratis si hay al menos un producto con envío express
  const hasExpress = cartItems.value.some(item => item.expressDelivery);
  return hasExpress ? 0 : 4990; // $4.990 de envío estándar
});

const total = computed(() => {
  return subtotal.value - totalDiscount.value + shipping.value;
});

// Métodos para cantidad
const increaseQuantity = (index) => {
  cartItems.value[index].quantity++;
  showNotificationFn(`Añadido 1 ${cartItems.value[index].name}`);
};

const decreaseQuantity = (index) => {
  if (cartItems.value[index].quantity > 1) {
    cartItems.value[index].quantity--;
    showNotificationFn(`Eliminado 1 ${cartItems.value[index].name}`);
  }
};

const removeItem = (index) => {
  const removedItem = cartItems.value[index].name;
  cartItems.value.splice(index, 1);
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