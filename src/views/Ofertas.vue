<template>
  <q-page class="q-pa-md ofertas-bg">
    <div class="ofertas-header">
      <q-icon name="local_fire_department" color="red-5" size="2.2em" class="q-mr-md" />
      <div>
        <div class="ofertas-title">Ofertas Especiales</div>
        <div class="ofertas-subtitle">¡Aprovecha los mejores descuentos en tecnología!</div>
      </div>
    </div>
    <div v-if="loading" class="text-center q-my-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <div class="q-mt-md text-primary">Cargando ofertas...</div>
    </div>
    <div v-else-if="productosStore.productos.length === 0" class="text-center text-grey-7 q-my-xl">
      <q-icon name="sentiment_dissatisfied" size="4em" class="q-mb-md" />
      <div class="text-h6">No hay ofertas disponibles en este momento.</div>
      <p class="q-mt-sm">Vuelve más tarde para ver nuestras promociones.</p>
    </div>
    <div v-else class="row q-col-gutter-md ofertas-list">
      <div v-for="product in productosStore.productos" :key="product._id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <ProductCard :product="product" />
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
import { useProductosStore } from '@/store/store'
import { getData } from '../services/apiClient.js'
import FavoriteButton from '../components/FavoriteButton.vue';
import RatingStars from '../components/RatingStars.vue';
import ProductCard from '../components/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const productosStore = useProductosStore()

const loading = ref(true);
const currentPage = ref(1);
const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
});

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  return price.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const calculateDiscount = (originalPrice, offerPrice) => {
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const { page } = route.query;
    const params = {
      page: page || 1,
      limit: 12
    };

    console.log('Fetching products with params:', params);
    const response = await getData('productos/ofertas', params);
    console.log('API Response:', response);
    
    // Handle both array and object responses
    let productosArray;
    if (Array.isArray(response)) {
      productosArray = response;
    } else if (response && Array.isArray(response.productos)) {
      productosArray = response.productos;
    } else {
      productosArray = [];
    }
    
    // Ya no necesitamos filtrar aquí porque la API ya nos devuelve solo productos en oferta
    productosStore.productos = productosArray;
    
    console.log('Total productos en oferta:', productosArray.length);
    
    // Set pagination data
    pagination.value = {
      total: productosArray.length,
      page: page || 1,
      limit: 12,
      totalPages: Math.ceil(productosArray.length / 12)
    };
    currentPage.value = pagination.value.page;

  } catch (error) {
    console.error('Error al obtener productos en oferta:', error);
    console.error('Error details:', error.response?.data);
    productosStore.productos = [];
    // Reset pagination on error
    pagination.value = {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1
    };
    currentPage.value = 1;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts()
})
watch(() => route.query, fetchProducts, { deep: true });

const changePage = (newPage) => {
  router.push({ query: { ...route.query, page: newPage } });
};

const getDetailsPath = (slug) => {
  if (!slug) {
    console.error('Slug no proporcionado para la navegación')
    return '/'
  }
  return `/Details/${encodeURIComponent(slug.trim())}`
}
</script>

<style scoped>
.ofertas-bg {
  background: linear-gradient(135deg, #fafdff 60%, #e3f0ff 100%);
  min-height: 100vh;
}
.ofertas-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 18px 0 10px 0;
  border-radius: 18px;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 2px 12px 0 rgba(25, 118, 210, 0.07);
}
.ofertas-title {
  font-size: 2.2em;
  font-weight: 800;
  color: #1976d2;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.ofertas-subtitle {
  font-size: 1.1em;
  color: #333;
  font-weight: 500;
  letter-spacing: 0.2px;
}
.ofertas-list {
  margin-top: 10px;
}
.my-card {
  width: 100%;
  max-width: 300px;
  margin: auto;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.my-card:hover {
  transform: translateY(-5px);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 3em;
}

.offer-badge {
  font-size: 1.1em;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
}
</style> 