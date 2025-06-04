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
    imageUrl: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
    title: 'Tecnología de Última Generación',
    description: 'Descubre nuestra nueva colección de laptops y dispositivos con hasta 40% de descuento',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    title: 'Zona Gaming Premium',
    description: 'Equípate con lo mejor en periféricos gaming, monitores y componentes de alta gama',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/1038628/pexels-photo-1038628.jpeg',
    title: 'Smart Home & Gadgets',
    description: 'Convierte tu hogar en un espacio inteligente con nuestra selección de dispositivos',
  },
  {
    imageUrl: 'https://images.pexels.com/photos/4792729/pexels-photo-4792729.jpeg',
    title: 'Ofertas Especiales',
    description: 'Aprovecha nuestras promociones exclusivas en productos seleccionados',
  },
])
</script>

<style scoped>
.banner-wrapper {
  width: 100%;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
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
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.caption-title {
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInLeft 0.8s ease-in-out;
}

.caption-description {
  font-size: 1.5rem;
  line-height: 1.4;
  opacity: 0.95;
  margin-bottom: 1.5rem;
  animation: fadeInLeft 1s ease-in-out;
  animation-delay: 0.2s;
}

.q-btn {
  animation: fadeInUp 1.2s ease-in-out;
  animation-delay: 0.4s;
  font-size: 1.1rem;
  padding: 12px 24px;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .custom-carousel {
    height: 350px;
    margin: 0;
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
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .custom-carousel {
    height: 250px;
    margin: 0;
  }

  .caption-content {
    padding: 1rem;
  }

  .caption-title {
    font-size: 1.8rem;
  }

  .caption-description {
    font-size: 1rem;
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