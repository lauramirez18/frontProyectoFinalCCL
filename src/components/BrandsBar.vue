<template>
  <div class="banner-brand">
    <h6>Nuestras Marcas Premium</h6>

    <div class="brand-grid">
      <div
        v-for="(brand, index) in brands"
        :key="index"
        class="brand-item"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="goToBrandProducts(brand)"
      >
        <div class="brand-card">
          <q-img
            :src="brand.logo"
            :alt="brand.name"
            class="brand-logo"
            :class="{ 'image-loading': !brand.loaded }"
            @load="brand.loaded = true"
          >
            <template v-slot:loading>
              <q-spinner-dots color="primary" />
            </template>
          </q-img>
          <div class="brand-name">{{ brand.nombre }}</div>
        </div>
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
    const res = await getData('marcas');
    brands.value = res.map(brand => ({ ...brand, loaded: false }));
  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    brands.value = [];
  }
}

const goToBrandProducts = (brand) => {
  router.push({
    name: 'AllProducts',
    query: { brand: brand._id }
  })
}

onMounted(() => {
  getBrands();
});
</script>

<style scoped>
@import '../styles/BrandBar.css';
</style>