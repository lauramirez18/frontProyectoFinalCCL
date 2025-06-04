<template>
  <div class="bestsellers-section">
    <div class="section-header text-center">
      <h6 class="text-h5 text-weight-bold q-mb-sm glowing-text">
        <div class="stars-wrapper">
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
        </div>
        <q-icon name="trending_up" class="q-mr-sm" />
        Lo Más Recomendado
        <div class="stars-wrapper">
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
          <q-icon name="star" size="xs" color="yellow-7" class="star-icon" />
        </div>
      </h6>
      <p class="text-grey-7 text-subtitle1 animated-subtitle">
        Descubre la excelencia tecnológica mejor valorada
      </p>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <div class="tech-loader">
        <q-spinner-dots color="primary" size="40px" />
        <div class="loading-text">Cargando innovación...</div>
      </div>
    </div>

    <div v-else-if="validProducts.length === 0" class="text-center q-pa-xl text-grey-7">
      <q-icon name="devices" size="4em" color="grey-5" class="pulse-animation" />
      <p class="q-mt-sm">No hay productos disponibles en este momento</p>
    </div>

    <div v-else class="products-grid">
      <div
        v-for="(product, index) in validProducts"
        :key="product._id"
        class="col-12 col-sm-6 col-md-3"
        :style="{ animationDelay: index * 0.1 + 's' }"
      >
        <q-card
          class="product-card tech-card"
          flat
          @click="goToProduct(product._id)"
        >
          <div class="img-wrapper">
            <q-img
              :src="getProductImage(product)"
              :alt="product.nombre"
              ratio="1"
              class="product-image"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-icon name="devices_other" size="3em" color="grey-7" class="pulse-slow" />
                </div>
              </template>

              <div class="brand-badge" v-if="product.marca">
                <q-chip
                  dense
                  class="brand-chip"
                  size="sm"
                >
                  <q-icon
                    name="verified"
                    size="xs"
                    class="brand-icon"
                  />
                  <span class="brand-name-text">
                    {{ typeof product.marca === 'object' ? product.marca.nombre : product.marca }}
                  </span>
                </q-chip>
              </div>

              <div class="absolute-top-right q-ma-sm">
                <q-btn
                  round
                  flat
                  :icon="favorites.has(product._id) ? 'favorite' : 'favorite_border'"
                  class="favorite-btn tech-btn"
                  :class="{ 'is-favorite': favorites.has(product._id) }"
                  :color="favorites.has(product._id) ? 'red-5' : 'grey-5'" @click.stop="toggleFavorite(product)"
                >
                  <q-tooltip>
                    {{ favorites.has(product._id) ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
                  </q-tooltip>
                </q-btn>
              </div>

              <div class="tech-overlay">
                <div class="rating-container">
                  <div class="rating-stars tech-rating">
                    <q-rating
                      v-model="product.promedioCalificacion"
                      max="5"
                      size="1.2em"
                      color="yellow"
                      icon="star"
                      readonly
                    />
                    <span class="rating-count text-white q-ml-sm">
                      ({{ product.totalResenas || 0 }})
                    </span>
                  </div>
                </div>
              </div>
            </q-img>
          </div>

          <q-card-section class="product-info">
            <div class="brand-caption" v-if="product.marca">
              {{ typeof product.marca === 'object' ? product.marca.nombre : product.marca }}
            </div>
            <div class="product-title">{{ product.nombre }}</div>

            <div class="price-section">
              <div class="price-container">
                <template v-if="product.enOferta">
                  <div class="original-price">
                    ${{ formatThousands(product.precio) }}
                  </div>
                  <div class="offer-price">
                    ${{ formatThousands(product.precioOferta) }}
                  </div>
                </template>
                <template v-else>
                  <div class="current-price">
                    ${{ formatThousands(product.precio) }}
                  </div>
                </template>
              </div>

              <q-btn
                round
                flat
                class="cart-btn"
                @click.stop="addToCart(product)"
              >
                <q-icon name="add_shopping_cart" size="sm" />
                <q-tooltip>Agregar al carrito</q-tooltip>
              </q-btn>
            </div>

            <q-btn
              flat
              class="tech-details-btn"
              @click.stop="goToProduct(product._id)"
            >
              <q-icon name="visibility" size="sm" />
              <span>Ver producto</span>
              <q-icon name="chevron_right" class="arrow-icon" />
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '../services/apiclient'
import { reviewsService } from '../services/resenias' // Ensure this is needed, or remove if not used
import { useThousandsFormat } from '../composables/useThousandFormat'

const router = useRouter()
const currentImages = reactive({}) // This variable doesn't seem to be used. Consider removing if not needed.
const { formatThousands } = useThousandsFormat()
const loading = ref(true)
const bestSellers = ref([])
const productRatings = ref({}) // This variable doesn't seem to be used. Consider removing if not needed.
const favorites = ref(new Set())

const validProducts = computed(() => {
  return bestSellers.value.filter(product => {
    return product &&
           typeof product === 'object' &&
           !Array.isArray(product) &&
           product._id &&
           product.nombre &&
           typeof product.nombre === 'string'
  })
})

const sortedProducts = computed(() => {
  return [...validProducts.value].sort((a, b) => {
    // Primero por calificación
    if (b.promedioCalificacion !== a.promedioCalificacion) {
      return b.promedioCalificacion - a.promedioCalificacion;
    }
    // Si tienen la misma calificación, por número de reseñas
    return b.totalResenas - a.totalResenas;
  });
});

// calculateDiscount is not used in the template, consider removing if not needed.
const calculateDiscount = (originalPrice, offerPrice) => {
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
}

// getBrandColor is not used in the template, consider removing if not needed.
const getBrandColor = (brandName) => {
  if (!brandName) return 'rgba(52, 152, 219, 0.95)'

  let hash = 0
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsla(${hue}, 70%, 50%, 0.95)`
}

const toggleFavorite = (product) => {
  if (favorites.value.has(product._id)) {
    favorites.value.delete(product._id)
  } else {
    favorites.value.add(product._id)
  }
}

const addToCart = (product) => {
  console.log('Añadir al carrito:', product)
  // Implement actual add to cart logic here (e.g., using a store like Pinia/Vuex)
}

const getProductImage = (product) => {
  if (product && product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
    return product.imagenes[0]
  }
  return '/placeholder.png' // Ensure you have a generic placeholder image
}

const goToProduct = (productId) => {
  if (productId) {
    router.push(`/Details/${productId}`)
  }
}

const fetchBestSellers = async () => {
  loading.value = true
  try {
    console.log('Frontend: Iniciando fetch de productos...')
    const response = await getData('productos')

    console.log('Frontend: Contenido de response:', response)

    if (response && response.productos && Array.isArray(response.productos)) {
      bestSellers.value = response.productos.map(product => ({
        _id: product._id,
        nombre: product.nombre || 'Producto sin nombre',
        descripcion: product.descripcion || 'Sin descripción',
        precio: parseFloat(product.precio) || 0,
        precioOferta: product.precioOferta ? parseFloat(product.precioOferta) : null,
        enOferta: Boolean(product.enOferta),
        marca: product.marca || null,
        imagenes: Array.isArray(product.imagenes) ? product.imagenes : [],
        promedioCalificacion: parseFloat(product.promedioCalificacion) || 0,
        totalResenas: parseInt(product.totalResenas) || 0
      }))
    } else {
      console.log('Frontend: No se encontraron productos en la respuesta')
      bestSellers.value = []
    }
  } catch (error) {
    console.error('Frontend: Error al obtener productos:', error)
    bestSellers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBestSellers()
})
</script>

<style scoped>
@import '../css/variables.css';

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glowText {
  0% { text-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
  50% { text-shadow: 0 0 20px rgba(33, 150, 243, 0.8); }
  100% { text-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.bestsellers-section {
  padding: 2rem;
  background: #f0f2f5;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 3rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.product-card {
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  box-shadow: 0 2px 8px var(--q-color-card-shadow-light);
  transition: all 0.3s ease-in-out;
  border: 1px solid var(--q-color-neutral-border);
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
}

.tech-card {
  position: relative;
  z-index: 1; /* Ensure card content is above potential ::before */
}

.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: linear-gradient(45deg, transparent, rgba(33, 150, 243, 0.03)); /* Very subtle tint */
  z-index: 0;
  transition: opacity 0.3s ease-out;
  opacity: 0;
}

.tech-card:hover::before {
  opacity: 1;
}

.product-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 8px 20px var(--q-color-card-shadow-hover);
}

.product-card:hover .product-image {
  transform: scale(1.03);
}

.img-wrapper {
  position: relative;
  overflow: hidden;
  padding: 1rem;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}

.product-image {
  transition: transform 0.4s ease-in-out;
}

:deep(.q-img) {
  width: 100%;
  height: auto !important;
}

:deep(.q-img__content) {
  position: relative !important;
}

:deep(.q-img__content > div) {
  background-size: contain !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.tech-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.3), /* Lighter black tint */
    rgba(0, 0, 0, 0.1) 70%,
    transparent
  );
  padding: 10px;
  /* Removed transform: translateY(100%); so it's always visible */
  transition: background 0.3s ease;
}

.rating-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.rating-count {
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.product-info {
  padding: 16px !important;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-title {
  font-size: 0.9rem;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--q-color-text-dark); /* Use variable */
  font-weight: 500;
  transition: color 0.3s ease;
  letter-spacing: -0.2px;
}

.product-card:hover .product-title {
  color: var(--q-color-primary-blue);
}

.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(6, 143, 255, 0.03);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(6, 143, 255, 0.08);
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.original-price {
  font-size: 0.75rem;
  text-decoration: line-through;
  color: var(--q-color-text-grey-light); /* Use variable */
}

.offer-price,
.current-price {
  font-size: 1.1rem;
  background: linear-gradient(45deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.cart-btn {
  width: 36px;
  height: 36px;
  min-height: unset;
  background: linear-gradient(135deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  color: white;
  box-shadow: 0 2px 6px rgba(6, 143, 255, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-in-out; /* Add transition for hover */
}

.cart-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.cart-btn:hover::before {
  transform: translateX(100%);
}

.cart-btn:hover {
  background: linear-gradient(135deg, var(--q-color-dark-blue), #003870); /* Darker on hover */
  transform: scale(1.05);
}

.tech-details-btn {
  background: transparent;
  color: var(--q-color-text-dark); /* Use variable */
  font-size: 0.85rem;
  font-weight: 500;
  padding: 10px;
  border-top: 1px solid rgba(6, 143, 255, 0.08);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tech-details-btn:hover {
  color: var(--q-color-primary-blue);
  background: rgba(6, 143, 255, 0.04);
}

.tech-details-btn .q-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.tech-details-btn:hover .q-icon {
  transform: translateX(3px);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

.pulse-slow {
  animation: pulse 3s infinite ease-in-out; /* Softer pulse */
}

.stars-wrapper {
  display: inline-flex;
  align-items: center;
  margin: 0 8px;
}

.star-icon {
  margin: 0 2px;
  animation: starTwinkle 1.5s infinite ease-in-out;
}

.star-icon:nth-child(1) { animation-delay: 0s; }
.star-icon:nth-child(2) { animation-delay: 0.5s; }

@keyframes starTwinkle {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.brand-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.brand-chip {
  background: rgba(6, 143, 255, 0.07) !important; /* Subtle brand blue tint */
  backdrop-filter: blur(4px);
  border: 1px solid rgba(6, 143, 255, 0.15); /* Aligned border color */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 8px;
  height: 24px;
  transition: all 0.3s ease;
}

.brand-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 143, 255, 0.15);
  background: white !important;
  border-color: rgba(6, 143, 255, 0.2);
}

.brand-name-text {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--q-color-text-dark); /* Use variable */
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.brand-icon {
  color: var(--q-color-primary-blue) !important;
  margin-right: 4px;
}

.favorite-btn {
  transition: color 0.3s ease, transform 0.2s ease;
}

.favorite-btn.is-favorite {
  color: #EF5350 !important; /* Standard red for favorite */
  animation: pulse .8s ease-out; /* Add a subtle pulse when becoming favorite */
}

.brand-caption {
  font-size: 0.65rem;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-weight: 500;
  opacity: 0.7;
}
</style>