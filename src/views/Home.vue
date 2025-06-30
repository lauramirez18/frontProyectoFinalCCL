<template>
  <q-page class="home-page">
    <!-- Componente de prueba temporal -->
    <TestComponent />
    
    <div class="banner-section"> 
      <BannerSlider />
    </div>

    <div class="section-container">
      <CategorySlider />
    </div>

    <div class="section-container">
      <div class="text-center q-py-lg">
        <h4 class="text-h4 q-mb-md">Ofertas Especiales</h4>
        <q-btn 
          color="primary" 
          size="lg" 
          label="Ver Todas las Ofertas" 
          icon="local_offer"
          :to="{ name: 'Ofertas' }"
        />
      </div>
    </div>

    <div class="section-container q-py-sm">
      <BrandsBar />
    </div>

    <LoginDialog v-model="showLoginDialog" />

    <div class="section-container q-py-lg">
      <RecommendedProducts />
    </div>

    <div class="section-container q-py-lg">
      <BestSellers />
    </div>

    <div class="section-container q-py-lg">
      <InfoColumns />
    </div>

    <div class="section-container q-pb-xl">
      <div class="text-center q-py-lg">
        <h4 class="text-h4 q-mb-md">Nuestras Marcas</h4>
        <BrandsBar />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CategorySlider from '../components/CategorySlider.vue'
import BrandsBar from '../components/BrandsBar.vue'
import RecommendedProducts from '../components/RecommendedProducts.vue'
import BannerSlider from '../components/BannerSlider.vue';
import BestSellers from '../components/BestSellers.vue'
import InfoColumns from '../components/InfoColumns.vue'
import LoginDialog from '../components/LoginDialog.vue'


const showLoginDialog = ref(false);

let observer = null;

onMounted(() => {
  const sections = document.querySelectorAll('.section-container');
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-hidden');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  sections.forEach(section => {
    section.classList.add('is-hidden');
    observer.observe(section);
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.home-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.home-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(6, 143, 255, 0.267) 0%, transparent 35%),
    radial-gradient(circle at 80% 70%, rgb(6, 143, 255) 0%, transparent 35%);
  animation: circuitPulse 6s ease-in-out infinite;
  z-index: 0;
}

.section-container {
  margin: 0 auto;
  padding: 0 1rem;
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  will-change: opacity, transform;

  @media (max-width: 600px) {
    padding: 0 0.5rem;
  }
}

.section-container.is-hidden {
  opacity: 0;
  transform: translateY(40px);
}

.section-container.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.banner-section {
  width: 100%;
  margin-bottom: 2rem;
}
</style>