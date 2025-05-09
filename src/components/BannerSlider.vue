<template>
    <div class="banner-wrapper">
      <q-carousel
        v-model="slide"
        animated
        infinite
        autoplay
        transition-prev="slide-right"
        transition-next="slide-left"
        control-type="flat"
        swipeable
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
            <div class="caption-title">{{ banner.title }}</div>
            <div class="caption-description">{{ banner.description }}</div>
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
      imageUrl: '/banner1.png',
      title: 'Big Sale 1',
      description: 'Hasta 50% en productos seleccionados',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1606813902914-6f9d6ff10e52?auto=format&fit=crop&w=1200&q=80',
      title: 'Nueva colección',
      description: 'Explora nuestras nuevas categorías',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      title: 'Envío gratis',
      description: 'En tu primera compra',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      title: 'Aprovecha',
      description: 'Últimas unidades disponibles',
    },
  ])
  </script>
  
  <style scoped>
  .banner-wrapper {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
   
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  .custom-carousel {
    height: 420px;
  }
  
  .carousel-slide {
   
    background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  }
  
  .caption {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    color: white;
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .caption-title {
    font-size: 2rem;
    font-weight: bold;
  }
  
  .caption-description {
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .custom-carousel {
      height: 300px;
    }
  
    .caption-title {
      font-size: 1.5rem;
    }
  
    .caption-description {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .custom-carousel {
      height: 220px;
    }
  
    .caption-title {
      font-size: 1.2rem;
    }
  
    .caption-description {
      font-size: 0.9rem;
    }
  }
  </style>
  