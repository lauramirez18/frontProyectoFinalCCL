<template>
  <div class="banner-brand">
    <h6>Las mejores marcas de la Industria</h6>

    <div class="q-gutter-sm row items-center justify-center q-px-md">
      <div
        v-for="(brand, index) in brands"
        :key="index"
        class="col-4 col-sm-3 col-md-2 col-lg-2 q-pa-sm"
        @click="goToBrandProducts(brand)"
      >
        <q-card flat class="brand-card">
          <q-img
            :src="brand.logo"
            :alt="brand.name"
            style="height: 35px; width: 100%;"
            fit="contain"
            :class="{ 'image-loading': !brand.loaded }"
            @load="brand.loaded = true"
          >
            <template v-slot:loading>
              <q-spinner-dots color="primary" />
            </template>
          </q-img>
          <div class="brand-name">{{ brand.nombre }}</div>
        </q-card>
      </div>
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
      // Filtrar solo marcas activas y con logo
      const marcasValidas = res.filter(brand => 
        brand.state === '1' && 
        brand.logo && 
        brand.nombre
      );
      
      console.log('BrandsBar: Marcas válidas encontradas:', marcasValidas.length);
      brands.value = marcasValidas.map(brand => ({ 
        ...brand, 
        loaded: false,
        nombre: brand.nombre.trim()
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

<style scoped>
@import '../styles/BrandBar.css';
</style>