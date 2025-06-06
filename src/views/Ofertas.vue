<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Ofertas Especiales</div>

    <div v-if="loading" class="text-center q-my-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <div class="q-mt-md text-primary">Cargando ofertas...</div>
    </div>

    <div v-else-if="products.length === 0" class="text-center text-grey-7 q-my-xl">
      <q-icon name="sentiment_dissatisfied" size="4em" class="q-mb-md" />
      <div class="text-h6">No hay ofertas disponibles en este momento.</div>
      <p class="q-mt-sm">Vuelve más tarde para ver nuestras promociones.</p>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="product in products" :key="product._id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="my-card">
          <q-img 
            :src="product.imagenes?.[0] || 'https://via.placeholder.com/300'" 
            ratio="1"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-grey-3">
                <q-icon name="error_outline" size="2em" color="grey-7" />
              </div>
            </template>
            
            <!-- Badge de oferta -->
            <div class="absolute-top-right q-pa-sm">
              <q-badge color="red" class="offer-badge">
                {{ calculateDiscount(product.precio, product.precioOferta) }}% OFF
              </q-badge>
            </div>
          </q-img>
          
          <q-card-section>
            <div class="text-subtitle2 text-grey-8">{{ product.categoria }}</div>
            <div class="text-h6 ellipsis-2-lines">{{ product.nombre }}</div>
            <div class="row items-center q-mt-sm">
              <RatingStars
                :rating="product.promedioCalificacion"
                :review-count="product.totalResenas"
                size="1em"
              />
            </div>
            <div class="row items-center q-mt-sm">
              <div class="text-h6 text-negative">${{ formatPrice(product.precioOferta) }}</div>
              <div class="text-caption text-grey q-ml-sm text-line-through">
                ${{ formatPrice(product.precio) }}
              </div>
            </div>
          </q-card-section>
          
          <q-card-actions align="between" class="q-px-md q-pb-md">
            <q-btn flat label="Ver Detalles" color="primary" :to="`/Details/${product._id}`" />
            <FavoriteButton :product="product" />
          </q-card-actions>
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
import FavoriteButton from '../components/FavoriteButton.vue';
import RatingStars from '../components/RatingStars.vue';

const route = useRoute();
const router = useRouter();

const products = ref([]);
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
      enOferta: true,
      limit: 12
    };

    console.log('Fetching products with params:', params);
    const response = await getData('productos', params);
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
    
    // Filtrar solo los productos que realmente están en oferta
    const productosEnOferta = productosArray.filter(producto => 
      producto.enOferta === true && 
      producto.precioOferta && 
      producto.precioOferta < producto.precio
    );
    
    console.log('Total productos:', productosArray.length);
    console.log('Productos en oferta:', productosEnOferta.length);
    
    products.value = productosEnOferta;

    // Set pagination data
    pagination.value = {
      total: productosEnOferta.length,
      page: page || 1,
      limit: 12,
      totalPages: Math.ceil(productosEnOferta.length / 12)
    };
    currentPage.value = pagination.value.page;

  } catch (error) {
    console.error('Error al obtener productos en oferta:', error);
    console.error('Error details:', error.response?.data);
    products.value = [];
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

onMounted(fetchProducts);
watch(() => route.query, fetchProducts, { deep: true });

const changePage = (newPage) => {
  router.push({ query: { ...route.query, page: newPage } });
};
</script>

<style scoped>
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