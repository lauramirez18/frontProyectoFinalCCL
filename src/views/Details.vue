<template>  <div class="product-detail-container">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <p>Cargando detalles del producto...</p>
    </div>

    <div v-else-if="error" class="text-center text-negative q-pa-md">
      <p>Error al cargar los detalles del producto.</p>
      <q-btn label="Reintentar" color="primary" @click="fetchProduct" />
    </div>

    <div v-else class="product-content">
      <div class="product-main-section">
        <div class="product-gallery">
          <div class="main-image-container">
            <img
              :src="mainImage"
              :alt="producto.nombre"
              class="main-image"
            />
          </div>
          <div v-if="producto.imagenes && producto.imagenes.length > 1" class="thumbnail-gallery">
            <button class="gallery-nav prev" @click="prevImage">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="thumbnails">
              <img
                v-for="(img, index) in producto.imagenes"
                :key="index"
                :src="img"
                :alt="`Vista ${index + 1}`"
                class="thumbnail"
                :class="{ active: index === activeImageIndex }"
                @click="changeMainImage(index)"
              />
            </div>
            <button class="gallery-nav next" @click="nextImage">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-title">{{ producto.nombre }}</h1>
          <p class="text-caption text-grey-7">{{ typeof producto.marca === 'object' ? producto.marca.nombre : (producto.marca || 'Sin marca') }}</p>
          <p class="product-description">{{ producto.descripcion }}</p>

          <div class="product-pricing">
            <div class="price-label">PRECIO</div>
            <div class="product-price q-mt-md">
              <div v-if="producto.enOferta" class="row items-center">
                <div class="text-h4 text-negative">
                  ${{ formatThousands(producto.precioOferta) }}
                </div>
                <div class="text-h6 text-grey q-ml-md text-line-through">
                  ${{ formatThousands(producto.precio) }}
                </div>
                <q-badge color="negative" class="q-ml-md oferta-badge">
                  {{ producto.porcentajeDescuento }}% OFF
                </q-badge>
              </div>
              <div v-else class="text-h4">
                ${{ formatThousands(producto.precio) }}
              </div>
              
              <!-- Si hay fechas de oferta, mostrarlas -->
              <div v-if="producto.enOferta && producto.fechaFinOferta" class="text-caption text-grey q-mt-xs">
                Oferta válida hasta el {{ formatDate(producto.fechaFinOferta) }}
              </div>
            </div>
            <div class="stock-info">Disponibles: {{ producto.stock }} unidades</div>
            
            <div class="product-actions flex items-center gap-4 mt-6">
              <q-btn 
                @click="addToCart" 
                class="cart-btn flex-grow-1"
                color="primary"
                icon="shopping_cart"
                label="Agregar al carrito"
                :loading="loading"
                :disable="loading"
              >
                <q-tooltip>
                  Agregar al carrito
                </q-tooltip>
              </q-btn>
              
              <FavoriteButton
                :product="producto"
                class="favorite-btn-details"
                :flat="false"
                :round="false"
                @update:favorite="handleFavoriteUpdate"
              />
            </div>
          </div>
          <div class="product-rating">
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(averageRating) }">★</span>
            </div>
            <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
            <span class="rating-count">({{ reviews.length }} reseñas)</span>
          </div>
        </div>
      </div>

      <div class="product-specs-section">
        <h2 class="section-title">DETALLES DEL PRODUCTO</h2>
        <div class="specs-grid">
          <div class="spec-item" v-for="(value, key) in parsedDetails" :key="key">
            <div class="spec-label">{{ formatKey(key) }}</div>
            <div class="spec-value">{{ value }}</div>
          </div>
        </div>
      </div>

      <div class="product-reviews-section">
        <h2 class="section-title">RESEÑAS</h2>

        <div class="review-form">
          <div class="form-header">
            <q-avatar
              color="primary"
              text-color="white"
              font-size="1.2rem"
              v-if="authStore.user && authStore.user.name"
            >
              {{ getInitial(authStore.user.name) }}
            </q-avatar>
            <q-avatar
              color="grey-5"
              text-color="white"
              font-size="1.2rem"
              v-else
            >
              ?
            </q-avatar>
            <div class="form-title">
              {{ isEditingReview ? 'EDITAR TU RESEÑA' : 'ESCRIBE UNA RESEÑA' }}
            </div>
          </div>
          <div class="star-rating">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ filled: star <= newReview.rating }"
              @click="newReview.rating = star"
            >★</span>
          </div>
          <textarea
            v-model="newReview.comment"
            placeholder="Escribe tu opinión"
            class="review-textarea"
          ></textarea>
          <button class="submit-review" @click="submitReview" :disabled="reviewSubmitting">
            {{ reviewSubmitting ? 'Enviando...' : 'Enviar Reseña' }}
          </button>
        </div>

        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">
            No hay reseñas para este producto. ¡Sé el primero en opinar!
          </div>
          <div class="review-item" v-for="review in reviews" :key="review._id">
            <div class="reviewer-info">
              <div class="reviewer-avatar">
                <q-avatar
                  color="primary"
                  text-color="white"
                  font-size="1.2rem"
                >
                  {{ getInitial(review.usuario?.name || review.nombreUsuario || 'U') }}
                </q-avatar>
              </div>
              <div class="reviewer-name">
                {{ review.usuario?.name || review.nombreUsuario || 'Usuario anónimo' }}
              </div>
            </div>
            <div class="review-content">
              <div class="review-header">
                <div class="review-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.calificacion }">★</span>
                </div>
                <div class="review-date">{{ formatDate(review.createdAt || review.fecha) }}</div>
                <q-btn
                  v-if="authStore.user && review.usuario?._id === authStore.user._id"
                  icon="delete"
                  flat
                  round
                  color="negative"
                  size="sm"
                  @click="confirmDeleteReview(review._id)"
                >
                  <q-tooltip>Eliminar reseña</q-tooltip>
                </q-btn>
              </div>
              <p class="review-text">{{ review.comentario }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Barra lateral del carrito mejorada -->
    <div class="cart-sidebar" :class="{ 'visible': showCartSidebar, 'fade-out': isHiding }">
      <div class="sidebar-header">
        <h3> Carrito</h3>
        <button class="close-sidebar" @click="hideCartSidebar">&times;</button>
      </div>
      
      <div class="sidebar-content">
        <div v-if="authStore.cartItems.length === 0" class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <div class="empty-cart-text">Tu carrito está vacío</div>
          <button class="btn-continue-shopping" @click="hideCartSidebar">Seguir comprando</button>
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
        <button class="btn-continue-shopping" @click="hideCartSidebar">
          Seguir comprando
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../store/store.js'
import api from '../plugins/axios'
import { showNotification } from '../utils/notifications'
import { useThousandsFormat } from '../composables/useThousandFormat' // Importar el composable
import FavoriteButton from '../components/FavoriteButton.vue'
import { storeToRefs } from 'pinia'

const route = useRoute() 
const router = useRouter() 
const $q = useQuasar() 
const { formatThousands } = useThousandsFormat() // Extraer la función formatThousands

const producto = ref({
  _id: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  marca: '',
  imagenes: [],
  especificaciones: {},
  stock: 0,
  state: '1',
  promedioCalificacion: 0 // Initialize this for clarity
})

const showCartSidebar = ref(false)
const authStore = useAuthStore()
const { favorites } = storeToRefs(authStore)

const loading = ref(true)
const error = ref(false)
const activeImageIndex = ref(0)
const placeholderImage = 'https://via.placeholder.com/600x400?text=Imagen+no+disponible'

const newReview = ref({
  rating: 0,
  comment: ''
})

const reviews = ref([])
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.calificacion, 0);
  return total / reviews.value.length;
});
const reviewSubmitting = ref(false) // State for review submission button
const isEditingReview = ref(false) // For future editing functionality

const parsedDetails = computed(() => {
  if (producto.value.especificaciones && typeof producto.value.especificaciones === 'object') {
    return producto.value.especificaciones;
  }
  return {};
})

const formatKey = (key) => {
  // Convert camelCase to space-separated words and capitalize first letter
  const words = key.replace(/([A-Z])/g, ' $1')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const formatPrice = (price) => {
  if (!price) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  try {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Fecha inválida';
  }
}

const mainImage = computed(() => {
  return producto.value.imagenes && producto.value.imagenes.length > 0
    ? producto.value.imagenes[activeImageIndex.value]
    : placeholderImage
})

const fetchProduct = async () => {
  try {
    loading.value = true;
    error.value = false;
    const productId = route.params.id;

    if (!productId || productId === 'favorites' || productId === 'undefined') {
      throw new Error('ID de producto inválido');
    }

    const productResponse = await api.get(`/productos/${productId}`);
    if (!productResponse.data) {
      throw new Error('Producto no encontrado');
    }

    producto.value = productResponse.data;

    if (!producto.value.imagenes || producto.value.imagenes.length === 0) {
      producto.value.imagenes = [placeholderImage];
    }

    // Fetch reviews only if we have a valid product
    try {
      const reviewsResponse = await api.get(`/resenas/producto/${productId}`);
      reviews.value = reviewsResponse.data;
    } catch (reviewError) {
      console.error('Error al cargar reseñas:', reviewError);
      reviews.value = [];
    }

  } catch (err) {
    console.error('Error al cargar el producto:', err);
    error.value = true;
    producto.value = {
      _id: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      marca: '',
      imagenes: [placeholderImage],
      especificaciones: {},
      stock: 0,
      state: '1',
      promedioCalificacion: 0
    };
    
    $q.notify({
      type: 'negative',
      message: err.message || 'No se pudo cargar los detalles del producto.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProduct();
});

const changeMainImage = (index) => {
  activeImageIndex.value = index
}

const nextImage = () => {
  if (producto.value.imagenes && producto.value.imagenes.length > 0) {
    activeImageIndex.value = (activeImageIndex.value + 1) % producto.value.imagenes.length
  }
}

const prevImage = () => {
  if (producto.value.imagenes && producto.value.imagenes.length > 0) {
    activeImageIndex.value = (activeImageIndex.value - 1 + producto.value.imagenes.length) % producto.value.imagenes.length
  }
}

const submitReview = async () => {
  if (!authStore.token || !authStore.user) {
    $q.notify({
      type: 'warning',
      message: 'Debes iniciar sesión para enviar reseñas.',
      position: 'top'
    });
    return;
  }

  if (newReview.value.rating === 0 || !newReview.value.comment.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecciona una calificación y escribe un comentario.',
      position: 'top'
    });
    return;
  }

  reviewSubmitting.value = true;
  try {
    const requestData = {
      productoId: producto.value._id,
      calificacion: newReview.value.rating,
      comentario: newReview.value.comment.trim(),
    };

    const response = await api.post('/resenas', requestData);

    
    const createdReview = response.data.reseña; 

    reviews.value.unshift(createdReview);

 
    newReview.value = { rating: 0, comment: '' };

    $q.notify({
      type: 'positive',
      message: response.data.msg || 'Reseña enviada correctamente.',
      position: 'top'
    });

  
    await fetchProduct();

  } catch (error) {
    console.error('Error al enviar reseña:', error.response?.data || error.message);
    $q.notify({
      type: 'negative',
      message: 'Error al enviar la reseña.',
      caption: error.response?.data?.msg || error.message,
      position: 'top'
    });
  } finally {
    reviewSubmitting.value = false;
  }
};

const confirmDeleteReview = (reviewId) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que quieres eliminar esta reseña?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteReview(reviewId);
  });
};

const deleteReview = async (reviewId) => {
  try {
    await api.delete(`/resenas/${reviewId}`);
    reviews.value = reviews.value.filter(r => r._id !== reviewId);
    showNotification('success', 'Reseña eliminada correctamente.')
    await fetchProduct();
  } catch (error) {
    console.error('Error al eliminar reseña:', error.response?.data || error.message);
    showNotification('error', 'Error al eliminar la reseña.', error.response?.data?.msg || error.message)
  }
};

const getInitial = (name) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return '?';
  }
  return name.trim().charAt(0).toUpperCase();
};

const addToCart = () => {
  if (!authStore.token) {
    showNotification('warning', 'Debes iniciar sesión para agregar productos al carrito.')
    return;
  }


  const price = producto.value.enOferta ? producto.value.precioOferta : producto.value.precio
  
  const cartItem = {
    id: producto.value._id,
    name: producto.value.nombre,
    price: price,
    image: mainImage.value,
    quantity: 1,
    seller: producto.value.marca || 'Vendedor oficial'
  };
  
  // Verificamos que los datos sean válidos antes de enviarlos
  if (!cartItem.id || !cartItem.name || !cartItem.price) {
    console.error('Datos de producto incompletos:', cartItem);
    showNotification('error', 'Error al agregar el producto al carrito.')
    return;
  }
  
  console.log('Agregando al carrito:', cartItem);
  authStore.addToCart(cartItem);

  showSidebar();
  showNotification('positive', `${producto.value.nombre} agregado al carrito.`)
}

const goToCart = () => {
  router.push('/car'); 
  hideCartSidebar()
}


const isHiding = ref(false)
const autoHideTimer = ref(null)
const shippingCost = ref(10) 


const hideCartSidebar = () => {
  isHiding.value = true
  setTimeout(() => {
    showCartSidebar.value = false
    isHiding.value = false
  }, 500) 
}


const showSidebar = () => {
  showCartSidebar.value = true
  
  
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }
  

  autoHideTimer.value = setTimeout(() => {
    hideCartSidebar()
  }, 5000) 
}


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


const resetAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }
  
  autoHideTimer.value = setTimeout(() => {
    hideCartSidebar()
  }, 5000) 
}


const calculateSubtotal = () => {
  return authStore.cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

const handleFavoriteUpdate = (isFavorite) => {
  // Opcional: puedes usar este evento para mostrar una notificación o actualizar algo en la UI
  showNotification(
    'success',
    isFavorite ? 'Producto agregado a favoritos' : 'Producto eliminado de favoritos'
  );
};

const isFavorite = computed(() => {
  if (!producto.value) return false;
  return favorites.value.includes(producto.value._id);
});

const toggleFavorite = async () => {
  if (!producto.value) return;
  
  try {
    if (isFavorite.value) {
      await authStore.removeFromFavorites(producto.value._id);
    } else {
      await authStore.addToFavorites(producto.value._id);
    }
  } catch (err) {
    console.error('Error al modificar favoritos:', err);
  }
};
</script>

<style scoped>

@import url('../styles/Details.css');

.reviewer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  min-width: 80px;
}

.reviewer-avatar {
  margin-bottom: 10px;
}

.reviewer-name {
  font-size: 0.9rem;
  text-align: center;
  color: #555;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Add some styles for the new elements */
.q-btn { /* Style for Quasar buttons if not already covered */
  margin-left: 8px; /* Example spacing */
}

/* Style for the review form textarea and submit button */
.review-textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 1rem;
  box-sizing: border-box; /* Include padding in width */
}

.submit-review {
  background-color: #2196f3; /* Quasar primary color */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.submit-review:hover:not(:disabled) {
  background-color: #1976d2; /* Darker primary */
}

.submit-review:disabled {
  background-color: #9e9e9e; /* Greyed out when disabled */
  cursor: not-allowed;
}

.no-reviews {
  text-align: center;
  color: #777;
  padding: 20px;
  font-style: italic;
}

.review-item {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.review-content {
  flex-grow: 1;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-stars .star {
  color: #ccc;
  font-size: 1.1rem;
}

.review-stars .star.filled {
  color: #ffc107; /* Gold star color */
}

.review-date {
  font-size: 0.85rem;
  color: #888;
}

.review-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.cart-btn {
  background: linear-gradient(135deg, #068FFF, #0052a3);
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 12px 24px;
}

.cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 143, 255, 0.3);
}

.cart-btn:active {
  transform: translateY(0);
}

.favorite-btn-details {
  min-width: 48px;
  height: 48px;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
