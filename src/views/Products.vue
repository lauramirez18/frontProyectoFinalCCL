<template>
    <div class="q-pa-md">
      <div class="row q-col-gutter-lg">
        <!-- Filtros laterales -->
        <div class="col-12 col-md-3">
          <q-card class="q-pa-md">
            <div class="text-h6 q-mb-md">Marca</div>
            <q-option-group
              v-model="filters.brand"
              :options="brandOptions"
              type="checkbox"
              @update:model-value="fetchProducts"
            />
  
            <div class="text-h6 q-mt-lg q-mb-md">Precio</div>
            <q-option-group
              v-model="filters.price"
              :options="priceOptions"
              type="checkbox"
              @update:model-value="fetchProducts"
            />
  
            <div class="text-h6 q-mt-lg q-mb-md">Memoria</div>
            <q-option-group
              v-model="filters.memory"
              :options="memoryOptions"
              type="checkbox"
              @update:model-value="fetchProducts"
            />
          </q-card>
        </div>
  
        <!-- Productos -->
        <div class="col-12 col-md-9">
          <div class="row q-col-gutter-lg">
            <div v-for="product in products" :key="product._id" class="col-12 col-sm-6 col-md-4">
              <q-card class="q-pa-md q-hoverable">
                <!-- Badges -->
              <div class="q-pa-sm">
                <q-badge  color="positive" floating class="q-ml-sm">
                  {{ product.marca }}
                </q-badge>
              </div>
                <q-img :src="product.imagenes[0]" ratio="1" />
                <div class="q-mt-sm text-subtitle2 text-grey-7">{{ product.brand }}</div>
                <div class="text-body1 text-weight-bold">{{ product.nombre }}</div>
                <div v-if="product.oldPrice" class="text-grey text-strike">${{ product.oldPrice }}</div>
                <div class="text-h6 text-primary">${{ product.precio }}</div>
                <div class="text-green text-caption">12x ${{ (product.price / 12).toFixed(3) }} sin interés</div>
                <q-btn color="secondary" label="Agregar" class="q-mt-md full-width" icon="shopping_cart" />
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { getData } from '../services/apiClient';
  
  const products = ref([]);
  const filters = ref({
    brand: [],
    price: [],
    memory: [],
  });
  
  const brandOptions = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Samsung', value: 'Samsung' },
    { label: 'Xiaomi', value: 'Xiaomi' },
    { label: 'Huawei', value: 'Huawei' },
    { label: 'Sony', value: 'Sony' },
  ];
  
  const priceOptions = [
    { label: 'Menos de $100.000', value: '0-100000' },
    { label: '$100.000 - $300.000', value: '100000-300000' },
    { label: '$300.000 - $500.000', value: '300000-500000' },
    { label: 'Más de $500.000', value: '500000-10000000' },
  ];
  
  const memoryOptions = [
    { label: '64GB', value: '64' },
    { label: '128GB', value: '128' },
    { label: '256GB', value: '256' },
    { label: '512GB o más', value: '512' },
  ];

    
  // Llamada al backend
  const fetchProducts = async () => {
    try {
      const response = await getData('productos', {
       /*  params: filters.value, */
      });
      products.value = response;
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };
  
  onMounted(fetchProducts);
  </script>
  
  <style scoped>
  .q-card {
    border-radius: 12px;
    
  }
  </style>
  