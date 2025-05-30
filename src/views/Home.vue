<template>
  <q-page class="bg-grey-1">

    <BannerSlider />
  <!-- Marcas -->
    <BrandsBar class="q-mt-md"  />
    <!-- Categoría Slider -->
    <CategorySlider />
    <LoginDialog v-model="showLoginDialog" />
    <!-- Lo más recomendado -->
    <RecommendedProducts class="q-mt-xl" />

    <!-- Lo más vendido -->
    <BestSellers class="q-mt-xl" />
  
    <!-- Información -->
    <InfoColumns class="q-mt-xl" />
    <BrandsList />

  </q-page>
</template>
<script setup>
import CategorySlider from '../components/CategorySlider.vue'
import BrandsBar from '../components/BrandsBar.vue'
import RecommendedProducts from '../components/RecommendedProducts.vue'
import BannerSlider from '../components/BannerSlider.vue';
import BestSellers from '../components/BestSellers.vue'
import InfoColumns from '../components/InfoColumns.vue'

</script>
