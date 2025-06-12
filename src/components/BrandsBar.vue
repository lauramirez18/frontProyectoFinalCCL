<template>
  <div class="brand-bar-section">
    <h6>Las mejores marcas de la Industria</h6>

    <div v-if="brands.length > 0" class="brands-grid q-px-md">
      <div
        v-for="(brand, index) in brands"
        :key="brand._id || index"
        class="brand-card-wrapper"
        @click="goToBrandProducts(brand)"
        data-aos="fade-up"
        :data-aos-delay="index * 50"
        data-aos-offset="100"
        data-aos-once="true"
      >
        <q-card flat class="brand-card">
          <q-img
            :src="brand.logo"
            :alt="brand.nombre"
            class="brand-logo"
            fit="contain"
            :class="{ 'image-loading': !brand.loaded }"
            @load="brand.loaded = true"
          >
            <template v-slot:loading>
              <q-spinner-dots color="primary" size="md" />
            </template>
            <template v-slot:error>
              <div class="error-image flex flex-center">
                <span>No logo</span>
              </div>
            </template>
          </q-img>
          <div class="brand-name">{{ brand.nombre }}</div>
        </q-card>
      </div>
    </div>
    <div v-else class="loading-brands flex flex-center q-py-lg">
      <q-spinner-dots color="primary" size="xl" />
      <p class="q-ml-sm text-grey-7">Cargando marcas...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../services/apiclient'
import { useRouter } from 'vue-router'

const router = useRouter()
const brands = ref([])

const getBrands = async () => {
  try {
    console.log('BrandsBar: Iniciando carga de marcas...');
    const res = await getData('marcas');
    console.log('BrandsBar: Respuesta de marcas:', res);

    if (Array.isArray(res)) {
      const marcasValidas = res.filter(brand =>
        brand.state === '1' &&
        brand.logo &&
        brand.nombre
      );

      console.log('BrandsBar: Marcas válidas encontradas:', marcasValidas.length);
      brands.value = marcasValidas.map(brand => ({
        ...brand,
        loaded: false,
        nombre: brand.nombre.trim(),
        _id: brand._id || `brand-${Math.random().toString(36).substring(7)}`
      }));
    } else {
      console.warn('BrandsBar: Formato de respuesta inesperado:', res);
      brands.value = [];
    }
  } catch (error) {
    console.error('BrandsBar: Error al obtener las marcas:', error);
    console.error('BrandsBar: Detalles del error:', error.response?.data);
    brands.value = [];
  }
}

const goToBrandProducts = (brand) => {
  if (!brand || !brand._id) {
    console.error('BrandsBar: Intento de navegación con marca inválida:', brand);
    return;
  }

  console.log('BrandsBar: Navegando a productos de marca:', brand.nombre);
  router.push({
    name: 'BrandProducts',
    params: { id: brand._id }
  });
}

onMounted(() => {
  getBrands();
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap'); // Nueva fuente para el nombre de la marca
@import "../css/variables.css";
@import '../styles/BrandBar.css';
</style>