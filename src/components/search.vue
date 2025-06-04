<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Resultados de Búsqueda</div>

    <div v-if="loading" class="text-center q-my-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <div class="q-mt-md text-primary">Cargando productos...</div>
    </div>
    <div v-else-if="products.length === 0" class="text-center text-grey-7 q-my-xl">
      <q-icon name="sentiment_dissatisfied" size="4em" class="q-mb-md" />
      <div class="text-h6">No se encontraron productos que coincidan con tu búsqueda.</div>
      <p class="q-mt-sm">Intenta con otros términos o filtros.</p>
    </div>
    <div v-else class="products-grid">
      <div v-for="product in products" :key="product._id">
        <q-card class="product-card tech-card" flat>
          <div class="img-wrapper">
            <q-img 
              :src="product.imagenes?.[0] || 'https://via.placeholder.com/300'" 
              :alt="product.nombre"
              ratio="1"
              class="product-image"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-icon name="error_outline" size="3em" color="grey-7" class="pulse-slow" />
                </div>
              </template>


              <div class="tech-overlay">
                <div class="rating-container">
                  <div class="rating-stars tech-rating">
                    <RatingStars
                      :rating="product.promedioCalificacion"
                      :review-count="product.totalResenas"
                      size="1.2em"
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
                    ${{ formatPrice(product.precioOriginal) }}
                  </div>
                  <div class="offer-price">
                    ${{ formatPrice(product.precio) }}
                  </div>
                </template>
                <template v-else>
                  <div class="current-price">
                    ${{ formatPrice(product.precio) }}
                  </div>
                </template>
              </div>

              <div class="actions-container">
                <FavoriteButton :product="product" class="action-btn favorite-btn" />
                <q-btn
                  round
                  flat
                  class="action-btn cart-btn"
                  icon="add_shopping_cart"
                  color="primary"
                >
                  <q-tooltip>Agregar al carrito</q-tooltip>
                </q-btn>
              </div>
            </div>

            <q-btn
              flat
              class="tech-details-btn"
              :to="`/Details/${product._id}`"
            >
              <q-icon name="visibility" size="sm" />
              <span>Ver detalles</span>
              <q-icon name="chevron_right" class="arrow-icon" />
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="pagination.totalPages > 1" class="q-mt-lg flex flex-center">
      <q-pagination
        v-model="currentPage"
        :max="pagination.totalPages"
        :max-pages="6"
        direction-links
        @update:model-value="changePage"
        color="primary"
        active-color="secondary"
        size="md"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getData } from '../services/apiClient.js';
import FavoriteButton from './FavoriteButton.vue';
import RatingStars from './RatingStars.vue';

const route = useRoute();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  return price.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const { search, category, page } = route.query;

    const params = {
      page: page || 1,
      ...(search && { search }),
      ...(category && { category }),
    };

    const response = await getData('productos', params);

    products.value = response.productos;
    pagination.value = response.pagination;
    currentPage.value = response.pagination.page;

  } catch (error) {
    console.error('Error al obtener productos:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProducts);

watch(() => route.query, fetchProducts, { deep: true });

const changePage = (newPage) => {
  router.push({ query: { ...route.query, page: newPage } });
};
</script>

<style scoped>
@import '../css/variables.css';

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
  z-index: 1;
}

.product-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 8px 20px var(--q-color-card-shadow-hover);
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

.tech-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.1) 70%,
    transparent
  );
  padding: 10px;
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

.brand-caption {
  font-size: 0.65rem;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-weight: 500;
  opacity: 0.7;
}

.product-title {
  font-size: 0.9rem;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--q-color-text-dark);
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
  color: var(--q-color-text-grey-light);
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

.actions-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.cart-btn {
  background: rgba(6, 143, 255, 0.1);
}

.cart-btn:hover {
  background: rgba(6, 143, 255, 0.2);
}



.tech-details-btn {
  background: transparent;
  color: var(--q-color-text-dark);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 10px;
  border-top: 1px solid rgba(6, 143, 255, 0.08);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.tech-details-btn:hover {
  color: var(--q-color-primary-blue);
  background: rgba(6, 143, 255, 0.04);
}

.tech-details-btn .arrow-icon {
  transition: transform 0.3s ease;
}

.tech-details-btn:hover .arrow-icon {
  transform: translateX(3px);
}
</style>