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
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const slide = ref(0)

const banners = ref([
  {
    imageUrl: 'https://images.pexels.com/photos/1714341/pexels-photo-1714341.jpeg',
    title: 'Tecnología de Última Generación',
    description: 'Descubre nuestra nueva colección de laptops y dispositivos con hasta 40% de descuento',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
    title: 'Zona Gaming Premium',
    description: 'Equípate con lo mejor en periféricos gaming, monitores y componentes de alta gama',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg',
    title: 'Smart Home & Gadgets',
    description: 'Convierte tu hogar en un espacio inteligente con nuestra selección de dispositivos',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg',
    title: 'Ofertas Especiales',
    description: 'Aprovecha nuestras promociones exclusivas en productos seleccionados',
  },
])
</script>

<style scoped>
.banner-wrapper {
  width: 100%;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(6, 143, 255, 0.15);
  border-radius: 0;
  margin: 0;
  position: relative;
}

.custom-carousel {
  height: 500px;
  margin: 0;
}

.q-carousel {
  width: 100%;
  margin: 0;
  padding: 0;
}

.carousel-slide {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
}

.carousel-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.2) 100%);
  z-index: 1;
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
}

.caption-content {
  color: white;
  max-width: 600px;
  font-family: 'Poppins', 'Segoe UI', 'Roboto', sans-serif;
  background: rgba(6, 143, 255, 0.2);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.caption-title {
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInLeft 0.8s ease-in-out;
  background: linear-gradient(135deg, #ffffff 0%, #e6f3ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.caption-description {
  font-size: 1.5rem;
  line-height: 1.4;
  opacity: 0.95;
  margin-bottom: 0;
  animation: fadeInLeft 1s ease-in-out;
  animation-delay: 0.2s;
}

/* Responsive Styles */
@media (max-width: 1440px) {
  .custom-carousel {
    height: 450px;
  }

  .caption-title {
    font-size: 2.8rem;
  }

  .caption-description {
    font-size: 1.3rem;
  }
}

@media (max-width: 1024px) {
  .custom-carousel {
    height: 400px;
  }

  .caption {
    padding-left: 3rem;
  }

  .caption-content {
    max-width: 500px;
    padding: 1.8rem;
  }

  .caption-title {
    font-size: 2.5rem;
  }

  .caption-description {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .custom-carousel {
    height: 350px;
  }

  .caption {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .caption-content {
    max-width: 100%;
    padding: 1.5rem;
  }

  .caption-title {
    font-size: 2.2rem;
  }

  .caption-description {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .custom-carousel {
    height: 300px;
  }

  .caption {
    padding: 1rem;
  }

  .caption-content {
    padding: 1rem;
  }

  .caption-title {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  .caption-description {
    font-size: 1rem;
  }
}

@media (max-width: 360px) {
  .custom-carousel {
    height: 250px;
  }

  .caption-title {
    font-size: 1.5rem;
  }

  .caption-description {
    font-size: 0.9rem;
  }
}

/* Animación */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

</style>