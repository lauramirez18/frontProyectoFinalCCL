<template>
  <div class="product-detail-container">
    <!-- Cargando -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <p>Cargando detalles del producto...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-negative q-pa-md">
      <p>Error al cargar los detalles del producto.</p>
      <q-btn label="Reintentar" color="primary" @click="fetchProduct" />
    </div>

    <!-- Contenido -->
    <div v-else class="product-content">
      <!-- Sección principal del producto -->
      <div class="product-main-section">
        <!-- Galería de imágenes -->
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

        <!-- Información del producto -->
        <div class="product-info">
          <h1 class="product-title">{{ producto.nombre }}</h1>
          <p class="product-brand">Marca: {{ producto.marca }}</p>
          <p class="product-description">{{ producto.descripcion }}</p>
          
          <div class="product-pricing">
            <div class="price-label">PRECIO</div>
            <p class="product-price">$ {{ formatPrice(producto.precio) }}</p>
            <div class="stock-info">Disponibles: {{ producto.stock }} unidades</div>
            <button class="add-to-cart-btn">Agregar al Carrito</button>
          </div>
        </div>
      </div>

      <!-- Especificaciones del producto -->
      <div class="product-specs-section">
        <h2 class="section-title">DETALLES DEL PRODUCTO</h2>
        <div class="specs-grid">
          <div class="spec-item" v-for="(value, key) in parsedDetails" :key="key">
            <div class="spec-label">{{ formatKey(key) }}</div>
            <div class="spec-value">{{ value }}</div>
          </div>
        </div>
      </div>

      <!-- Reseñas del producto -->
      <div class="product-reviews-section">
        <h2 class="section-title">RESEÑAS</h2>
        
        <!-- Formulario de reseña -->
        <div class="review-form">
          <div class="form-title">TÍTULO</div>
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
        
        <!-- Lista de reseñas -->
        <div class="reviews-list">
          <div class="review-item" v-for="(review, idx) in reviews" :key="idx">
            <div class="reviewer-info">
              <div class="reviewer-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="reviewer-name">{{ review.usuario }}</div>
            </div>
            <div class="review-content">
              <div class="review-header">
                <div class="review-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.estrellas }">★</span>
                </div>
              </div>
              <p class="review-text">{{ review.comentario }}</p>
              <div class="review-actions">
                <button class="like-btn" @click="likeReview(idx)">
                  <i class="fas fa-thumbs-up"></i> {{ review.likes || 0 }}
                </button>
                <button class="dislike-btn" @click="dislikeReview(idx)">
                  <i class="fas fa-thumbs-down"></i> {{ review.dislikes || 0 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router' // Importa useRoute en lugar de createRouter
import { useQuasar } from 'quasar'
import api from '../plugins/axios'

// Obtener la ruta actual
const route = useRoute()
const $q = useQuasar()

// Resto de tu código permanece igual...
const producto = ref({
  _id: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  marca: '',
  imagenes: [],
  detalles: '{}',
  stock: 0,
  state: '1'
})
const loading = ref(true)
const error = ref(false)
const activeImageIndex = ref(0)
const placeholderImage = 'https://via.placeholder.com/600x400?text=Imagen+no+disponible'

const newReview = ref({
  rating: 0,
  comment: ''
})

// Reseñas iniciales
const reviews = ref([])

// Parsear los detalles del producto
const parsedDetails = computed(() => {
  try {
    return JSON.parse(producto.value.detalles || '{}')
  } catch (e) {
    console.error('Error parsing product details:', e)
    return {}
  }
})

// Formatear claves para mostrarlas mejor
const formatKey = (key) => {
  const words = key.replace(/([A-Z])/g, ' $1')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// Formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO').format(price)
}

// Obtener imagen principal
const mainImage = computed(() => {
  return producto.value.imagenes && producto.value.imagenes.length > 0 
    ? producto.value.imagenes[activeImageIndex.value] 
    : placeholderImage
})

// Obtener datos del producto
const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = false
    const { id } = route.params
    
    const response = await api.get(`/productos/${id}`)
    producto.value = response.data
    
    // Si no hay imágenes, agregamos una placeholder
    if (!producto.value.imagenes || producto.value.imagenes.length === 0) {
      producto.value.imagenes = [placeholderImage]
    }
    
    // Cargar reseñas (puedes hacer otra llamada API aquí si es necesario)
    reviews.value = [
      { usuario: 'Cliente Satisfecho', estrellas: 5, comentario: 'Excelente producto, cumple con todas mis expectativas.', likes: 12, dislikes: 0 },
      { usuario: 'Usuario Verificado', estrellas: 4, comentario: 'Muy buen producto, lo recomiendo.', likes: 5, dislikes: 1 }
    ]
    
  } catch (err) {
    console.error('Error al cargar el producto:', err)
    error.value = true
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los detalles del producto'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})

// Cambiar imagen principal
const changeMainImage = (index) => {
  activeImageIndex.value = index
}

// Navegación de imágenes
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

// Enviar reseña
const submitReview = () => {
  if (newReview.value.rating > 0 && newReview.value.comment.trim()) {
    reviews.value.unshift({
      usuario: 'Tú',
      estrellas: newReview.value.rating,
      comentario: newReview.value.comment,
      likes: 0,
      dislikes: 0
    })
    newReview.value = { rating: 0, comment: '' }
    $q.notify({
      type: 'positive',
      message: '¡Gracias por tu reseña!'
    })
  } else {
    $q.notify({
      type: 'warning',
      message: 'Por favor califica el producto y escribe un comentario'
    })
  }
}

// Like/dislike reseñas
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
</script>


<style scoped>
/* Estilos generales */
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

/* Sección principal del producto */
.product-main-section {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 40px;
}

.product-gallery {
  flex: 1;
  min-width: 300px;
}

.main-image-container {
  width: 100%;
  height: 400px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail-gallery {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gallery-nav {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 5px 10px;
}

.gallery-nav:hover {
  color: #0066cc;
}

.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  flex: 1;
  padding: 5px 0;
}

.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.thumbnail:hover, .thumbnail.active {
  border-color: #0066cc;
}

.product-info {
  flex: 1;
  min-width: 300px;
}

.product-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 10px;
  color: #222;
}

.product-brand {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 20px;
}

.product-pricing {
  margin-top: 20px;
}

.price-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.product-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #d32f2f;
  margin: 0 0 20px;
}

.add-to-cart-btn {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
  background-color: #0052a3;
}

/* Especificaciones del producto */
.product-specs-section {
  margin-bottom: 40px;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.spec-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9f9f9;
}

.spec-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.spec-value {
  font-size: 1rem;
}

/* Reseñas del producto */
.product-reviews-section {
  margin-bottom: 40px;
}

.review-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.star-rating {
  margin-bottom: 15px;
}

.star {
  font-size: 1.5rem;
  color: #ccc;
  cursor: pointer;
  margin-right: 5px;
}

.star.filled {
  color: #ffc107;
}

.review-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  font-family: inherit;
  resize: vertical;
}

.submit-review {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.submit-review:hover {
  background-color: #3d8b40;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.reviewer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: #666;
}

.reviewer-name {
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-title {
  font-weight: 600;
}

.review-text {
  margin: 0 0 15px;
  line-height: 1.5;
}

.review-actions {
  display: flex;
  gap: 15px;
}

.like-btn, .dislike-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.like-btn:hover {
  color: #4caf50;
}

.dislike-btn:hover {
  color: #f44336;
}

/* Responsive */
@media (max-width: 768px) {
  .product-main-section {
    flex-direction: column;
  }
  
  .main-image-container {
    height: 300px;
  }
  
  .review-item {
    flex-direction: column;
  }
  
  .reviewer-info {
    flex-direction: row;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
  }
}
</style>