<template>
  <div class="product-detail-container">
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="3em" />
      <p class="loading-text">Cargando la experiencia tecnológica definitiva...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">¡Error cósmico! No pudimos cargar los detalles del producto.</p>
      <q-btn label="Reintentar Misión" color="primary" @click="fetchProduct" />
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
          <div v-if="producto.imagenes && producto.imagenes.length > 1" class="thumbnail-gallery-nav">
            <button class="gallery-nav-btn prev" @click="prevImage">
              <q-icon name="chevron_left" size="28px" />
            </button>
            <div class="thumbnail-scroller">
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
            <button class="gallery-nav-btn next" @click="nextImage">
              <q-icon name="chevron_right" size="28px" />
            </button>
          </div>
        </div>

        <div class="product-info-panel">
          <p class="product-brand text-caption">{{ typeof producto.marca === 'object' ? producto.marca.nombre : (producto.marca || '') }}</p>
          <h1 class="product-title glowing-text">{{ producto.nombre }}</h1>
          <p class="product-short-description">{{ producto.descripcion }}</p>

          <div class="product-rating-area">
            <RatingStars
              :rating="averageRating"
              :review-count="reviews.length"
              size="1.4em"
            />
          </div>

          <div class="product-pricing">
            <div class="price-header">PRECIO FINAL</div>
            <div class="price-details">
              <div v-if="producto.enOferta" class="price-offer">
                <span class="offer-price"> ${{ formatThousands(producto.precioOferta) }}</span>
                <span class="original-price">$ {{ formatThousands(producto.precio) }}</span>
                <q-badge color="negative" class="discount-badge">
                  {{ producto.porcentajeDescuento }}% OFF
                </q-badge>
              </div>
              <div v-else class="current-price">${{ formatThousands(producto.precio) }}</div>

              <div v-if="producto.enOferta && producto.fechaFinOferta" class="offer-validity">
                Oferta válida hasta el <span class="date-highlight">{{ formatDate(producto.fechaFinOferta) }}</span>
              </div>
            </div>
            <div class="stock-info">
              <q-icon name="inventory_2" size="18px" class="q-mr-xs" />
              Disponibles:  <span class="stock-count">   {{ producto.stock  }}  </span>
              unidades
            </div>
          </div>

          <div class="product-actions">
            <q-btn
              @click="addToCart"
              class="add-to-cart-btn"
              icon="shopping_cart"
              label="Agregar al carrito"
              :loading="loading"
              :disable="loading"
            >
            </q-btn>

            <FavoriteButton
              :product="producto"
              class="favorite-toggle-btn"
              :flat="true"
              :round="true"
              @update:favorite="handleFavoriteUpdate"
            />
          </div>
        </div>
      </div>

      <div class="product-specs-section">
        <h2 class="section-title">ESPECIFICACIONES TÉCNICAS</h2>
        <div class="specs-grid">
          <div class="spec-item" v-for="(value, key) in parsedDetails" :key="key">
            <div class="spec-label">{{ formatKey(key) }}</div>
            <div class="spec-value">{{ value }}</div>
          </div>
        </div>
      </div>

      <div class="product-reviews-section">
        <h2 class="section-title">OPINIONES DE USUARIOS</h2>

        <div class="review-form-container">
          <div class="form-header-row">
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
            <div class="form-title-text">
              {{ isEditingReview ? 'MODIFICA TU RESEÑA' : 'COMPARTE TU EXPERIENCIA' }}
            </div>
          </div>
          <div class="star-rating-input">
            <q-rating
              v-model="newReview.rating"
              size="2em"
              color="amber"
              icon="star_border"
              icon-selected="star"
              icon-half="star_half"
            />
          </div>
          <q-input
            v-model="newReview.comment"
            type="textarea"
            placeholder="¡Cuéntanos tu opinión sobre este producto!"
            outlined
            dense
            rows="4"
            class="review-textarea-input"
          />
          <q-btn class="submit-review-btn" @click="submitReview" :loading="reviewSubmitting" :disable="reviewSubmitting">
            {{ reviewSubmitting ? 'Enviando Datos...' : 'Enviar Reseña' }}
          </q-btn>
        </div>

        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews-message">
            <q-icon name="rate_review" size="2em" class="q-mr-sm" />
            Todavía no hay reseñas para este producto. ¡Sé el primero en dejar una!
          </div>
          <div class="review-item" v-for="review in reviews" :key="review._id">
            <div class="reviewer-meta">
              <q-avatar
                color="blue-grey-7"
                text-color="white"
                font-size="1.2rem"
              >
                {{ getInitial(review.usuario?.name || review.nombreUsuario || 'U') }}
              </q-avatar>
              <div class="reviewer-name">{{ review.usuario?.name || review.nombreUsuario || 'Usuario Anónimo' }}</div>
            </div>
            <div class="review-content-body">
              <div class="review-header-details">
                <RatingStars
                  :rating="review.calificacion"
                  :review-count="0"
                  size="1.1em"
                  :show-count="false"
                />
                <div class="review-date-text">{{ formatDate(review.createdAt || review.fecha) }}</div>
                <q-btn
                  v-if="authStore.user && review.usuario?._id === authStore.user._id"
                  icon="delete"
                  flat
                  round
                  color="negative"
                  size="sm"
                  class="delete-review-btn"
                  @click="confirmDeleteReview(review._id)"
                >
                  <q-tooltip>Eliminar esta reseña</q-tooltip>
                </q-btn>
              </div>
              <p class="review-comment-text">{{ review.comentario }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CartSidebar v-model="showCartSidebar" :auto-hide-delay="5000" />
    <LoginDialog v-model="showLoginDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, Dialog } from 'quasar'
import { useAuthStore } from '../store/store.js'
import api from '../plugins/axios'
import { showNotification } from '../utils/notifications'
import { useThousandsFormat } from '../composables/useThousandFormat'
import FavoriteButton from '../components/FavoriteButton.vue'
import { storeToRefs } from 'pinia'
import RatingStars from '../components/RatingStars.vue'
import LoginDialog from '../components/LoginDialog.vue'
import CartSidebar from '../components/CartSidebar.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { formatThousands } = useThousandsFormat()

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
  promedioCalificacion: 0
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
const reviewSubmitting = ref(false)
const isEditingReview = ref(false)

const parsedDetails = computed(() => {
  if (producto.value.especificaciones && typeof producto.value.especificaciones === 'object') {
    return producto.value.especificaciones;
  }
  return {};
})

const formatKey = (key) => {
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

    await fetchProduct(); // Volver a cargar para actualizar el promedio si es necesario

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
    await fetchProduct(); // Volver a cargar para actualizar el promedio si es necesario
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
    $q.dialog({
      title: 'Iniciar sesión para añadir al carrito',
      message: 'Para añadir productos a tu carrito, por favor inicia sesión o regístrate.',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Iniciar sesión',
        color: 'primary'
      },
      cancel: {
        label: 'Ahora no',
        color: 'grey'
      }
    }).onOk(() => {
      showLoginDialog.value = true;
    });
    return;
  }

  const price = producto.value.enOferta ? producto.value.precioOferta : producto.value.precio

  const cartItem = {
    id: producto.value._id,
    name: producto.value.nombre,
    price: price,
    image: mainImage.value,
    quantity: 1,
    seller: typeof producto.value.marca === 'object' ? producto.value.marca.nombre : (producto.value.marca || 'Vendedor oficial')
  };

  if (!cartItem.id || !cartItem.name || !cartItem.price) {
    console.error('Datos de producto incompletos:', cartItem);
    showNotification('error', 'Error: Datos del producto incompletos. No se pudo agregar al carrito.')
    return;
  }

  authStore.addToCart(cartItem);
  showCartSidebar.value = true;
  showNotification('positive', `"${producto.value.nombre}" agregado al carrito.`)
}

const goToCart = () => {
  router.push('/car');
  hideCartSidebar()
}

const isHiding = ref(false)
const autoHideTimer = ref(null)
const shippingCost = ref(10) // Puedes hacer esto dinámico si lo necesitas

const hideCartSidebar = () => {
  isHiding.value = true
  document.body.classList.remove('cart-open')
  setTimeout(() => {
    showCartSidebar.value = false
    isHiding.value = false
  }, 300)
}

const showSidebar = () => {
  showCartSidebar.value = true
  document.body.classList.add('cart-open')

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
  showNotification(
    isFavorite ? 'positive' : 'negative',
    isFavorite ? 'Producto agregado a favoritos' : 'Producto eliminado de favoritos',
    
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

const showLoginDialog = ref(false)

// Limpiar el timer y la clase del body cuando el componente se desmonta
onBeforeUnmount(() => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }
  document.body.classList.remove('cart-open')
})
</script>

<style scoped lang="scss">
// Importa tus variables CSS y fuentes aquí
@import '../styles/Details.css';
@import '../css/variables.css';

</style>