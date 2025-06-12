<template>
  <div>
    <div class="cart-overlay" :class="{ 'visible': modelValue }" @click="close"></div>
    <div class="cart-sidebar" :class="{ 'visible': modelValue, 'fade-out': isHiding }">
      <div class="sidebar-header">
        <h3>Carrito</h3>
        <button class="close-sidebar" @click="close">&times;</button>
      </div>
      
      <div class="sidebar-content">
        <div v-if="authStore.cartItems.length === 0" class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <div class="empty-cart-text">Tu carrito está vacío</div>
          <button class="btn-continue-shopping" @click="close">Seguir comprando</button>
        </div>
        
        <div v-else class="cart-items-container">
          <div v-for="(item, index) in authStore.cartItems" :key="index" class="cart-item">
            <img :src="item.image" :alt="item.name" class="cart-item-image">
            
            <div class="cart-item-details">
              <div class="cart-item-name" :title="item.name">{{ item.name }}</div>
              <div class="cart-item-price">$ {{ formatPrice(item.price) }}</div>
              
              <div class="cart-item-quantity">
                <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
                <span class="quantity-value">{{ item.quantity }}</span>
                <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
              </div>
            </div>
            
            <button class="remove-item" @click="removeFromCart(item)">
              <q-icon name="close" size="xs" />
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="authStore.cartItems.length > 0" class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>$ {{ formatPrice(calculateSubtotal()) }}</span>
        </div>
        <div class="summary-row">
          <span>Envío:</span>
          <span>$ {{ formatPrice(shippingCost) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>$ {{ formatPrice(calculateSubtotal() + shippingCost) }}</span>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <button v-if="authStore.cartItems.length > 0" class="btn-view-cart" @click="goToCart">
          Ir al carrito
        </button>
        <button class="btn-continue-shopping" @click="close">
          Seguir comprando
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/store'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  autoHideDelay: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['update:modelValue'])
const router = useRouter()
const authStore = useAuthStore()
const isHiding = ref(false)
const autoHideTimer = ref(null)
const shippingCost = ref(10)

const close = () => {
  isHiding.value = true
  document.body.classList.remove('cart-open')
  setTimeout(() => {
    emit('update:modelValue', false)
    isHiding.value = false
  }, 300)
}

const resetAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }

  if (props.autoHideDelay > 0) {
    autoHideTimer.value = setTimeout(() => {
      close()
    }, props.autoHideDelay)
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.classList.add('cart-open')
    resetAutoHideTimer()
  } else {
    document.body.classList.remove('cart-open')
  }
})

const increaseQuantity = (item) => {
  item.quantity++
  resetAutoHideTimer()
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  }
  resetAutoHideTimer()
}

const removeFromCart = (item) => {
  const index = authStore.cartItems.findIndex(i => i.id === item.id)
  if (index !== -1) {
    authStore.cartItems.splice(index, 1)
  }
  resetAutoHideTimer()
}

const calculateSubtotal = () => {
  return authStore.cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const goToCart = () => {
  router.push('/car')
  close()
}

onBeforeUnmount(() => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }
  document.body.classList.remove('cart-open')
})
</script>

<style scoped>
@import '../styles/CartSidebar.css';
</style> 