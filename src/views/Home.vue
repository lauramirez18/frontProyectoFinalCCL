<template>
  <q-page class="home-page">
    <!-- Banner principal -->
    <div class="banner-section">
      <BannerSlider />
    </div>

     <!-- Categorías -->
     <div class="section-container q-py-md">
      <CategorySlider />
    </div>

    <!-- Sección de ofertas -->
    <div class="section-container q-py-md">
      <OfertasSection />
    </div>

    <!-- Sección de marcas -->
    <div class="section-container q-py-sm">
      <BrandsBar />
    </div>

  

    <LoginDialog v-model="showLoginDialog" />

    <!-- Productos recomendados -->
    <div class="section-container q-py-lg">
      <RecommendedProducts />
    </div>

    <!-- Más vendidos -->
    <div class="section-container q-py-lg">
      <BestSellers />
    </div>

    <!-- Información -->
    <div class="section-container q-py-lg">
      <InfoColumns />
    </div>

    <!-- Lista de marcas -->
    <div class="section-container q-pb-xl">
      <BrandsList />
    </div>
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

<style lang="scss" scoped>
.home-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 600px) {
    padding: 0 0.5rem;
  }
}

.banner-section {
  width: 100%;
  margin-bottom: 2rem;
}

// Animaciones para las secciones
.section-container {
  opacity: 0;
  animation: fadeIn 0.5s ease-in forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Aplicar animaciones con delay para cada sección
.section-container:nth-child(1) { animation-delay: 0.1s; }
.section-container:nth-child(2) { animation-delay: 0.2s; }
.section-container:nth-child(3) { animation-delay: 0.3s; }
.section-container:nth-child(4) { animation-delay: 0.4s; }
.section-container:nth-child(5) { animation-delay: 0.5s; }
.section-container:nth-child(6) { animation-delay: 0.6s; }
</style>
