<template>
  <q-page class="home-page">
    <div class="banner-section"> 
      <BannerSlider />
    </div>

    <div class="section-container">
      <CategorySlider />
    </div>

    <div class="section-container">
      <OfertasSection />
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
      <BrandsList />
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
const showLoginDialog = ref(false); // Make sure this is handled if you use it

let observer = null; // Declare observer outside for cleanup

onMounted(() => {
  const sections = document.querySelectorAll('.section-container');
  const options = {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
  };

  observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-hidden');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, options);

  sections.forEach(section => {
    section.classList.add('is-hidden'); // Add hidden class initially
    observer.observe(section);
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect(); // Clean up observer
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

  // Base transition for elements that will be animated
  transition: opacity 0.8s ease-out, transform 0.8s ease-out; // Increased duration
  will-change: opacity, transform; // Optimize for animation

  @media (max-width: 600px) {
    padding: 0 0.5rem;
  }
}

// Initial hidden state for elements before they come into view
.section-container.is-hidden {
  opacity: 0;
  transform: translateY(40px); // Increased initial offset for more impact
}

// State when element becomes visible and animates
.section-container.is-visible {
  opacity: 1;
  transform: translateY(0);
}

// Removed the old @keyframes fadeIn and nth-child animation-delay
// as the Intersection Observer handles the trigger and the
// transition property handles the animation.

.banner-section {
  width: 100%;
  margin-bottom: 2rem;
  // If you DO NOT want the banner to fade in, remove 'section-container' from its div in the template.
  // Otherwise, it will fade in like other sections.
}
</style>