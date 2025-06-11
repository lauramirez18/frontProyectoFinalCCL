<template>
  <div class="banner-wrapper">
    <q-carousel
      v-model="slide"
      animated
      infinite
      autoplay
      transition-prev="slide-right"
      transition-next="slide-left"
      control-color="white"
      navigation
      swipeable
      arrows
      class="custom-carousel"
    >
      <q-carousel-slide
        v-for="(banner, index) in banners"
        :key="index"
        :name="index"
        :img-src="banner.imageUrl"
        class="carousel-slide"
      >
        <div class="caption">
          <div class="caption-content">
            <div class="caption-title">{{ banner.title }}</div>
            <div class="caption-description">{{ banner.description }}</div>
            <q-btn 
              label="Ver Ofertas" 
              color="primary" 
              class="cta-button glossy q-mt-md" 
              size="lg"
              rounded
              @click="goToOffers(banner.link)"
            />
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'; // Import useRouter

const slide = ref(0)
const router = useRouter(); // Initialize router

const banners = ref([
  {
    imageUrl: 'https://images.pexels.com/photos/1714341/pexels-photo-1714341.jpeg',
    title: 'Tecnología de Última Generación',
    description: 'Descubre nuestra nueva colección de laptops y dispositivos con hasta 40% de descuento',
    link: '/category/laptops' // Example link
  },
  {
    imageUrl: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
    title: 'Zona Gaming Premium',
    description: 'Equípate con lo mejor en periféricos gaming, monitores y componentes de alta gama',
    link: '/category/gaming'
  },
  {
    imageUrl: 'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg',
    title: 'Smart Home & Gadgets',
    description: 'Convierte tu hogar en un espacio inteligente con nuestra selección de dispositivos',
    link: '/category/smarthome'
  },
  {
    imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg',
    title: 'Ofertas Especiales',
    description: 'Aprovecha nuestras promociones exclusivas en productos seleccionados',
    link: '/ofertas' // Link to your offers page
  },
])

const goToOffers = (link) => {
  if (link) {
    router.push(link);
  }
};
</script>

<style scoped lang="scss">
.banner-wrapper {
  width: 100%;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(6, 143, 255, 0.15);
  border-radius: 0;
  margin: 0;
  position: relative;
  // Ensure the wrapper doesn't force extra scroll beyond 100vh
  height: calc(100vh - 70px);
  display: flex; // To ensure carousel fills wrapper
  flex-direction: column; // To ensure carousel fills wrapper
}

.custom-carousel {
  height: 100vh; /* Make it occupy 100% of the viewport height */
  width: 100%;
  margin: 0;
  padding: 0;
  .q-carousel__slide { // Targeting the actual slide container
    background-size: cover;
    background-position: center center; // More precise centering
    background-repeat: no-repeat;
    // Add subtle parallax effect on image background with transitions
    transition: background-position 0.7s ease-out; // Smooth transition for background image
  }
  .q-carousel__control {
    z-index: 3; // Ensure controls are above caption overlay
  }
}

// Ensure the image background is positioned correctly inside the slide
.carousel-slide {
  position: relative;
  overflow: hidden; // Hide overflow for image transitions
  
  // Custom styling for active slide for parallax effect
  &.q-carousel__slide--active {
    background-position: center center; // Default for active
  }
  &:not(.q-carousel__slide--active) {
    background-position: center 20%; // Slight offset for inactive slides
  }
}

.carousel-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  // More sophisticated gradient for better readability over images
  background: linear-gradient(to right, 
              rgba(0, 0, 0, 0.7) 0%, 
              rgba(0, 0, 0, 0.5) 30%, 
              rgba(0, 0, 0, 0.3) 70%, 
              rgba(0, 0, 0, 0.1) 100%);
  z-index: 1;
  pointer-events: none; // Allows interaction with elements behind it if needed
}

.caption {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 4rem;
  z-index: 2;
  // Ensure caption content adjusts responsively on all screen sizes
  justify-content: flex-start; 
  text-align: left;
}

.caption-content {
  color: white;
  max-width: 650px; // Slightly increased max-width for more content
  font-family: 'Poppins', 'Segoe UI', 'Roboto', sans-serif;
  // Glassmorphism effect
  background: rgba(6, 143, 255, 0.15); // Slightly less opaque
  padding: 2.5rem; // Increased padding
  border-radius: 16px; // More rounded corners
  backdrop-filter: blur(12px); // Stronger blur
  border: 1px solid rgba(255, 255, 255, 0.18); // More distinct border
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); // Subtle shadow for depth
  transform-origin: left center; // For animation transform
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); // Smoother transitions
}

.caption-title {
  font-size: 3.8vw; /* Responsive font size */
  font-weight: 800;
  letter-spacing: -0.8px; // Tighter letter spacing
  margin-bottom: 1.2rem; // Slightly more space below title
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4); // Stronger text shadow
  background: linear-gradient(135deg, #ffffff 0%, #e6f3ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: slideInFromLeft 0.9s ease-out forwards; // New animation, slightly slower
}

.caption-description {
  font-size: 1.8vw; /* Responsive font size */
  line-height: 1.5; // Better readability
  opacity: 0.95;
  margin-bottom: 0;
  animation: slideInFromLeft 1.2s ease-out forwards; // Slower animation
  animation-delay: 0.2s; // Staggered delay
}

.cta-button {
  font-weight: bold;
  letter-spacing: 0.5px;
  padding: 0.8rem 2rem;
  border-radius: 50px; // Pill shape
  background: linear-gradient(45deg, #068FFF 0%, #0052a3 100%); // Gradient background
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 20px rgba(6, 143, 255, 0.3);
  }
}

/* Animations (adjusted for more impact) */
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-80px) skewX(5deg); // More aggressive slide with slight skew
  }
  to {
    opacity: 1;
    transform: translateX(0) skewX(0);
  }
}

// Media Queries for fine-tuning responsive font sizes and padding
@media (max-width: 1440px) {
  .caption-title {
    font-size: 45px; // Fallback for fixed size if vw becomes too small/big
  }
  .caption-description {
    font-size: 22px;
  }
  .caption-content {
    padding: 2rem;
  }
}

@media (max-width: 1024px) {
  .caption {
    padding-left: 3rem;
  }
  .caption-title {
    font-size: 38px;
  }
  .caption-description {
    font-size: 18px;
  }
  .caption-content {
    padding: 1.8rem;
    max-width: 550px;
  }
}

@media (max-width: 768px) {
  .custom-carousel {
    height: 70vh; /* Adjust height for smaller tablets, still large but not 100vh */
  }
  .caption {
    padding-left: 2rem;
    padding-right: 2rem;
    justify-content: center; // Center text for smaller screens
    text-align: center;
  }
  .caption-content {
    max-width: 90%; // Allow content to take more width
    padding: 1.5rem;
    backdrop-filter: blur(10px);
  }
  .caption-title {
    font-size: 28px;
    margin-bottom: 0.8rem;
  }
  .caption-description {
    font-size: 16px;
    line-height: 1.4;
  }
  .cta-button {
    font-size: 0.9rem;
    padding: 0.7rem 1.8rem;
  }
}

@media (max-width: 480px) {
  .custom-carousel {
    height: 60vh; /* Even smaller height for mobile */
  }
  .caption {
    padding: 1rem;
  }
  .caption-content {
    padding: 1rem;
    border-radius: 10px;
  }
  .caption-title {
    font-size: 22px;
    letter-spacing: -0.3px;
  }
  .caption-description {
    font-size: 14px;
    line-height: 1.3;
  }
  .cta-button {
    font-size: 0.8rem;
    padding: 0.6rem 1.5rem;
  }
}

@media (max-width: 360px) {
  .custom-carousel {
    height: 55vh;
  }
  .caption-title {
    font-size: 18px;
  }
  .caption-description {
    font-size: 12px;
  }
  .caption-content {
    padding: 0.8rem;
  }
}
</style>