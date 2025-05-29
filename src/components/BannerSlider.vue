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
            <q-btn
              unelevated
              color="primary"
              icon="visibility"
              label="Ver más"
              class="q-mt-md"
              :to="'/products'"
            />
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
    imageUrl: 'https://images.pexels.com/photos/14714826/pexels-photo-14714826.jpeg?auto=compress&cs=tinysrgb&w=600',
    title: 'Tecnología de Alto Rendimiento',
    description: 'Descubre nuestros nuevos dispositivos con potencia profesional',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/7199194/pexels-photo-7199194.jpeg?auto=compress&cs=tinysrgb&w=600',
    title: 'Equipos Gamer',
    description: 'Experimenta juegos sin límites con nuestras nuevas laptops',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/13844013/pexels-photo-13844013.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
    title: 'Ofertas Exclusivas',
    description: 'Aprovecha descuentos únicos por tiempo limitado',
  },
])
</script>

<style scoped>
.banner-wrapper {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.custom-carousel {
  height: 480px;
}

.carousel-slide {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
}

/* Fondo oscuro con blur */
 .carousel-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
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
  max-width: 520px;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
}

.caption-title {
  font-size: 2.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  animation: fadeInUp 0.8s ease-in-out;
}

.caption-description {
  font-size: 1.3rem;
  opacity: 0.95;
  animation: fadeInUp 1s ease-in-out;
  animation-delay: 0.2s;
}

.q-btn {
  animation: fadeInUp 1.2s ease-in-out;
  animation-delay: 0.4s;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-carousel {
    height: 320px;
  }

  .caption {
    padding-left: 2rem;
  }

  .caption-title {
    font-size: 1.8rem;
  }

  .caption-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .custom-carousel {
    height: 240px;
  }

  .caption {
    padding-left: 1rem;
  }

  .caption-title {
    font-size: 1.4rem;
  }

  .caption-description {
    font-size: 0.9rem;
  }
}

/* Animación */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
