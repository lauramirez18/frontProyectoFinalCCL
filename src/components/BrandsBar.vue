<template>
  <div class="bg-black full-width banner-brand">
    <h6>Las mejores marcas de la Industria</h6>

    <div class="q-gutter-sm row items-center justify-center">
      <div
        v-for="(brand, index) in brands"
        :key="index"
        class="col-6 col-sm-3 col-md-2 col-lg-2 q-ma-sm"
      >
        <q-card flat bordered class="q-pa-sm flex flex-center brand-card">
          <q-img
            :src="brand.logo"
            :alt="brand.name"
            style="height: 60px; max-width: 80px;"
            fit="contain"
            :class="{ 'image-loading': !brand.loaded }"
            @load="brand.loaded = true"
          />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../services/apiclient'

const brands = ref([])

const getBrands = async () => {
  try {
    const res = await getData('marcas');
    brands.value = res.map(brand => ({ ...brand, loaded: false })); // Añadimos un estado de carga
  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    brands.value = [];
  }
}

onMounted(() => {
  getBrands();
});
</script>

<style scoped>
@import './BrandBar.css';
</style>