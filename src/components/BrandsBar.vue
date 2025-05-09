<template>
  <div class="q-pa-md bg-grey full-width">
    
    <div class="q-gutter-sm row items-center justify-center">
      <div
        v-for="(brand, index) in brands"
        :key="index"
        class="col-4 col-sm-2 col-md-2 col-lg-1"
      >
        <q-card flat bordered class="q-pa-sm flex flex-center brand-card">
          <q-img
            :src="brand.image"
            :alt="brand.name"
            style="height: 35px; max-width: 70px;"
            fit="contain"
          />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const brands = ref([
  { name: 'HP', image: 'https://upload.wikimedia.org/wikipedia/commons/4/43/HP_logo_2008.svg' },
  { name: 'Lenovo', image: 'https://1000marcas.net/wp-content/uploads/2020/01/Lenovo-logo-1.jpg' },
  { name: 'Apple', image: 'https://1000logos.net/wp-content/uploads/2017/02/iPhone-Logo-2007.png' },
  { name: 'ASUS', image: 'https://companylogos.org/wp-content/uploads/2024/08/Asus-1995-300x169.png' },
  { name: 'Acer', image: 'https://1000marcas.net/wp-content/uploads/2020/01/Logo-Acer.png' },
  { name: 'dell', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/1200px-Dell_Logo.svg.png' },
  { name: 'Samsung', image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { name: 'oppo', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/OPPO_LOGO_2019.svg/2560px-OPPO_LOGO_2019.svg.png' },
  { name: 'sony', image: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
  { name: 'Xiaomi', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Xiaomi_logo.svg/2048px-Xiaomi_logo.svg.png' }
])
</script>

<style scoped>
.brand-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}
.brand-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
