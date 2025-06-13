<template>
  <div class="main-container">
    <!-- Contenedor de productos del carrito -->
    <div class="cart-items-container">
      <h2 class="section-title">Mi Carrito ({{ totalItems }} producto{{ totalItems !== 1 ? 's' : '' }})</h2>
      
      <div v-if="cartItems.length === 0" class="empty-cart-message">
        <div class="empty-cart-icon">🛒</div>
        <div class="empty-cart-text">Tu carrito está vacío</div>
        <button class="continue-btn" @click="continueShopping">Ir a la tienda</button>
      </div>
      
      <!-- Contenedor de productos con scroll -->
      <div v-else class="products-scroll-container">
        <!-- Lista de productos -->
        <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
          <!-- Product image -->
          <div class="product-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          
          <!-- Product details -->
          <div class="product-info">
            <div>
              <h3 class="product-name">{{ item.name }}</h3>
              <p class="product-series">{{ item.description || 'Sin descripción' }}</p>
              <p class="product-seller">Vendido por {{ typeof item.seller === 'string' ? item.seller : (item.seller?.nombre || 'Vendedor oficial') }}</p>
              
              <div class="product-tags">
                <span v-if="item.expressDelivery" class="tag express-tag">🚀 Envío Express</span>
                <span v-if="item.discountPercentage > 0" class="tag discount-tag">🔥 {{ item.discountPercentage }}% OFF</span>
              </div>
            </div>
          </div>
          
          <!-- Price and quantity -->
          <div class="price-container">
            <div>
              <div class="current-price">{{ formatCurrency(getItemPrice(item)) }}</div>
              <div v-if="item.originalPrice && item.originalPrice > getItemPrice(item)" class="original-price">{{ formatCurrency(item.originalPrice) }}</div>
              <div v-if="item.originalPrice && item.originalPrice > getItemPrice(item)" class="savings">💰 Ahorras: {{ formatCurrency(item.originalPrice - getItemPrice(item)) }}</div>
            </div>
            
            <div class="quantity-selector">
              <button class="quantity-btn minus" @click="decreaseQuantity(index)">-</button>
              <input type="text" class="quantity-input" :value="item.quantity" readonly />
              <button class="quantity-btn plus" @click="increaseQuantity(index)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Resumen del pedido -->
    <div v-if="cartItems.length > 0" class="order-summary">
      <h2 class="summary-title">Resumen del Pedido</h2>
      
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

      <q-btn to="/payments" class="checkout-btn">
        <span>Proceder al pago</span>
        <q-icon name="arrow_forward" size="sm" />
      </q-btn>

      <button class="continue-btn" @click="continueShopping">Seguir comprando</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/store.js'; 
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
const router = useRouter();
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

// Función para obtener el precio correcto del item
const getItemPrice = (item) => {
  // Si hay un precio con descuento, usarlo
  if (item.discountPrice && !isNaN(item.discountPrice)) {
    return item.discountPrice;
  }
  // Si no, usar el precio normal
  if (item.price && !isNaN(item.price)) {
    return item.price;
  }
  // Si no hay precio válido, devolver 0
  return 0;
};

const subtotal = computed(() => {
  return authStore.cartItems.reduce((total, item) => {
    const price = getItemPrice(item);
    return total + (price * item.quantity);
  }, 0);
});

const totalDiscount = computed(() => {
  return authStore.cartItems.reduce((total, item) => {
    if (item.originalPrice && item.discountPrice) {
      return total + ((item.originalPrice - item.discountPrice) * item.quantity);
    }
    return total;
  }, 0);
});

const shipping = computed(() => {
  // Lógica para calcular envío
  return 0; 
});

const total = computed(() => {
  return subtotal.value + shipping.value;
});

// Métodos para los botones de cantidad
const increaseQuantity = (index) => {
  authStore.cartItems[index].quantity++;
};

const decreaseQuantity = (index) => {
  if (authStore.cartItems[index].quantity > 1) {
    authStore.cartItems[index].quantity--;
  } else {
    Swal.fire({
      title: '¿Deseas eliminar este producto del carrito?',
      text: "Si continúas, este producto será removido de tu cesta.",
      icon: 'warning', // Un ícono de advertencia es apropiado aquí
      showCancelButton: true,
      confirmButtonColor: '#3085d6', // Color azul por defecto de SweetAlert (puedes personalizarlo)
      cancelButtonColor: '#d33',   // Color rojo por defecto para cancelar
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, mantener'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, elimina el producto del carrito
        authStore.cartItems.splice(index, 1);
        Swal.fire(
          '¡Eliminado!',
          'El producto ha sido eliminado de tu carrito.',
          'success' // Ícono de éxito para confirmar la eliminación
        );
      }
      
    });
  }
};


// Métodos para los botones
const proceedToCheckout = () => {
  console.log('Procediendo al pago', { total: total.value });
  router.push('/checkout');
};

const continueShopping = () => {
  console.log('Continuar comprando');
  router.push('/');
};

// Formateo de moneda
const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value).replace('CLP', '').trim();
};
</script>

<style scoped>
@import '../styles/car.css';
@import '../css/variables.css';



</style>
