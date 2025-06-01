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
          </q-img>
          
          <q-card-section>
            <div class="text-subtitle2 text-grey-8">{{ product.categoria }}</div>
            <div class="text-h6 ellipsis-2-lines">{{ product.nombre }}</div>
            <div class="row items-center q-mt-sm">
              <div class="text-h6 text-primary">${{ formatPrice(product.precio) }}</div>
              <div v-if="product.enOferta" class="text-caption text-grey q-ml-sm text-line-through">
                ${{ formatPrice(product.precioOriginal) }}
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
import FavoriteButton from './FavoriteButton.vue';

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
</style>