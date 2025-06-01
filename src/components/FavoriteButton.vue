<template>
  <q-btn
    :flat="flat"
    :round="round"
    :color="loading ? 'grey-6' : isFavorite ? 'red' : 'grey-6'"
    :icon="isFavorite ? 'favorite' : 'favorite_border'"
    :class="['favorite-btn', buttonClass]"
    @click.stop="handleClick"
    :loading="loading"
    :disable="loading"
  >
    <q-tooltip v-if="showTooltip">
      {{ isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
    </q-tooltip>
  </q-btn>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/store'
import { useRouter } from 'vue-router'
import { showNotification } from '../utils/notifications'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  flat: {
    type: Boolean,
    default: true
  },
  round: {
    type: Boolean,
    default: true
  },
  buttonClass: {
    type: String,
    default: ''
  },
  showTooltip: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:favorite'])
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const isFavorite = computed(() => {
  const productId = props.product._id || props.product.id
  return authStore.isFavorite(productId)
})

const handleClick = async (event) => {
  event.preventDefault()
  event.stopPropagation()

  if (!authStore.token || !authStore.userId) {
    showNotification('warning', 'Debes iniciar sesión para agregar productos a favoritos')
    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    return
  }

  try {
    loading.value = true
    const productId = props.product._id || props.product.id

    if (isFavorite.value) {
      await authStore.removeFromFavorites(productId)
      showNotification('success', 'Producto eliminado de favoritos')
    } else {
      await authStore.addToFavorites(productId)
      showNotification('success', 'Producto agregado a favoritos')
    }

    emit('update:favorite', !isFavorite.value)
  } catch (error) {
    console.error('Error managing favorites:', error)
    showNotification(
      'error', 
      'Error al gestionar favoritos',
      error.response?.data?.error || error.message
    )
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.favorite-btn {
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.q-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.q-btn:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 