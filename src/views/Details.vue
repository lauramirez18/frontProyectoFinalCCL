<template>
  <div class="product-detail-container">
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
          <p class="product-brand">Marca: {{ producto.marca }}</p>
          <p class="product-description">{{ producto.descripcion }}</p>
          
          <div class="product-pricing">
            <div class="price-label">PRECIO</div>
            <p class="product-price">$ {{ formatPrice(producto.precio) }}</p>
            <div class="stock-info">Disponibles: {{ producto.stock }} unidades</div>
            <button class="add-to-cart-btn" @click="addToCart">Agregar al Carrito</button>
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
              color="primary"
              text-color="white"
              font-size="1.2rem"
              v-else-if="authStore.user && authStore.user.email"
            >
              {{ getInitial(authStore.user.email) }}
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
          <button class="submit-review" @click="submitReview">Enviar Reseña</button>
        </div>
        
        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">
            No hay reseñas para este producto. ¡Sé el primero en opinar!
          </div>
          <div class="review-item" v-for="(review, idx) in reviews" :key="review._id || idx">
            <div class="reviewer-info">
              <div class="reviewer-avatar">
                <!-- Avatar con la inicial del nombre del usuario -->
                <q-avatar
                  color="primary"
                  text-color="white"
                  font-size="1.2rem"
                >
                  {{ getInitial(review.nombreUsuario || review.usuario?.nombre || 'Usuario') }}
                </q-avatar>
              </div>
              <div class="reviewer-name">
                {{ review.nombreUsuario || review.usuario?.nombre || 'Usuario anónimo' }}
              </div>
            </div>
            <div class="review-content">
              <div class="review-header">
                <div class="review-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.calificacion }">★</span>
                </div>
                <div class="review-date">{{ new Date(review.fecha).toLocaleDateString() }}</div>
              </div>
              <p class="review-text">{{ review.comentario }}</p>
              <!-- Botón de editar si la reseña es del usuario actual -->
            
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Sidebar del Carrito -->
<div class="cart-sidebar" :class="{ 'visible': showCartSidebar }">
  <div class="sidebar-header">
    <h3>Producto agregado</h3>
    <button class="close-sidebar" @click="showCartSidebar = false">&times;</button>
  </div>
  <div class="sidebar-content">
    <img :src="mainImage" :alt="producto.nombre" class="sidebar-product-image" />
    <div class="sidebar-product-info">
      <h4>{{ producto.nombre }}</h4>
      <p>$ {{ formatPrice(producto.precio) }}</p>
    </div>
  </div>
  <div class="sidebar-footer">
    <button class="btn-view-cart" @click="goToCart">Ver Carrito</button>
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

const router = useRoute()
const $q = useQuasar()

const producto = ref({
  _id: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  marca: '',
  imagenes: [],
  especificaciones: {}, 
  stock: 0,
  state: '1'
})

const showCartSidebar = ref(false);
const authStore = useAuthStore()

const addToCart = () => {

  if (!authStore.token) { 
    alert ('Debes iniciar sesión para agregar productos al carrito')
    return
  }

  authStore.addToCart({
    id: producto.value._id,
    name: producto.value.nombre,
    precio: producto.value.precio,
    image: mainImage.value
  })

  showCartSidebar.value = true
}

const loading = ref(true)
const error = ref(false)
const activeImageIndex = ref(0)
const placeholderImage = 'https://via.placeholder.com/600x400?text=Imagen+no+disponible'

const newReview = ref({
  rating: 0,
  comment: ''
})

const reviews = ref([])
const averageRating = ref(0)

const parsedDetails = computed(() => {
  
  if (producto.value.especificaciones && typeof producto.value.especificaciones === 'object') {
    return producto.value.especificaciones;
  }
  return {}; 
});




const formatKey = (key) => {
  const words = key.replace(/([A-Z])/g, ' $1')
  return words.charAt(0).toUpperCase() + words.slice(1)
}


const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO').format(price)
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
    const { id } = router.params;
    
    const response = await api.get(`/productos/${id}`);
    producto.value = response.data;
    
    if (!producto.value.imagenes || producto.value.imagenes.length === 0) {
      producto.value.imagenes = [placeholderImage];
    }
    
    // Obtener reseñas del producto
    const reviewsResponse = await api.get(`/resenas/producto/${id}`);
    
    // Procesar las reseñas para asegurarse de que tengan todos los campos necesarios
    reviews.value = reviewsResponse.data.map(review => {
      // Si no hay nombreUsuario, intentar obtenerlo de otras propiedades
      if (!review.nombreUsuario) {
        review.nombreUsuario = review.usuario?.nombre || 
                              review.usuario?.name || 
                              review.usuario?.email || 
                              'Usuario';
      }
      return review;
    });
    
    console.log('Reseñas procesadas:', reviews.value);
    
    // Calcular promedio de calificaciones
    if (reviews.value.length > 0) {
      averageRating.value = reviews.value.reduce((sum, review) => 
        sum + review.calificacion, 0) / reviews.value.length;
    } else {
      averageRating.value = 0;
    }
    
  } catch (err) {
    console.error('Error al cargar el producto:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProduct();
  
  // Depurar el objeto de usuario
  console.log('Auth store:', authStore);
  console.log('Usuario actual:', authStore.user);
  if (authStore.user) {
    console.log('Propiedades del usuario:', Object.keys(authStore.user));
  }
});


const changeMainImage = (index) => {
  activeImageIndex.value = index
}

// Navegación de imágenes (funciona igual)
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
  try {
    // Verificar si el usuario está autenticado
    if (!authStore.token) {
      alert('Debes iniciar sesión para enviar reseñas');
      return;
    }

    // Verificar que se hayan completado los campos
    if (newReview.value.rating === 0 || !newReview.value.comment.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    // 1. Depurar el token
    console.log('Token actual:', authStore.token);
    
    // 2. Verificar si el token ha expirado
    const isTokenExpired = (token) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        console.log('Token payload:', payload);
        console.log('Token expira en:', new Date(payload.exp * 1000));
        console.log('Tiempo actual:', new Date());
        console.log('Token expirado:', payload.exp < currentTime);
        return payload.exp < currentTime;
      } catch (error) {
        console.log('Error al decodificar token:', error);
        return true;
      }
    };

    if (isTokenExpired(authStore.token)) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      return;
    }

    // 3. Verificar headers que se van a enviar
    const headers = {
      'Authorization': `Bearer ${authStore.token}`,
      'Content-Type': 'application/json'
    };
    console.log('Headers que se enviarán:', headers);

    // 4. Verificar datos que se envían
    const requestData = {
      productoId: producto.value._id,
      calificacion: newReview.value.rating,
      comentario: newReview.value.comment,
      // Asegurarse de enviar el nombre del usuario
      nombreUsuario: authStore.user?.name || authStore.user?.nombre || authStore.user?.email || 'Usuario'
    };
    console.log('Datos de la reseña:', requestData);

    // 5. Hacer la petición con headers explícitos
    console.log('Enviando petición a:', '/resenas');
    
    const response = await api.post('/resenas', requestData, { headers });

    console.log('Reseña enviada exitosamente:', response.data);
    
    // Actualizar las reseñas localmente
    reviews.value.push(response.data);
    
    // Limpiar el formulario
    newReview.value = {
      rating: 0,
      comment: ''
    };
    
    // Recalcular promedio
    averageRating.value = reviews.value.reduce((sum, review) => 
      sum + review.calificacion, 0) / reviews.value.length;

    alert('Reseña enviada correctamente');
  } catch (error) {
    console.error('Error al enviar reseña:', error);
    alert('Error al enviar la reseña. Por favor, intenta nuevamente.');
  }
}; 



const likeReview = (index) => {
  if (!reviews.value[index].likes) {
    reviews.value[index].likes = 0
  }
  reviews.value[index].likes++
}

const dislikeReview = (index) => {
  if (!reviews.value[index].dislikes) {
    reviews.value[index].dislikes = 0
  }
  reviews.value[index].dislikes++
}

// Función mejorada para obtener la inicial del nombre
const getInitial = (name) => {
  // Verificar si name existe y no está vacío
  if (!name || typeof name !== 'string' || name.trim() === '') {
    console.log('Nombre no válido para avatar:', name);
    return '?';
  }
  
  // Obtener la primera letra y convertirla a mayúscula
  return name.trim().charAt(0).toUpperCase();
};

// Función para verificar si la reseña es del usuario actual
const isUserReview = (review) => {
  return authStore.user && review.usuarioId === authStore.user._id;
};

// Función para editar una reseña
const editReview = (review) => {
  isEditingReview.value = true;
  newReview.value = {
    rating: review.calificacion,
    comment: review.comentario
  };
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
</style>
