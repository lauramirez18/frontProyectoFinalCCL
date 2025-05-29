<template>
  <q-card class="product-card q-hoverable" flat bordered>
    <!-- Badges y etiquetas -->
    <div class="absolute-top-right q-pa-xs">
      <q-badge v-if="product.oferta" color="red" class="q-mr-xs">
        {{ product.descuento }}% OFF
      </q-badge>
      <q-badge v-if="product.envioGratis" color="green">
        Envío gratis
      </q-badge>
    </div>
    
    <!-- Imagen del producto -->
    <q-img
      :src="mainImage"
      :ratio="1"
      class="cursor-pointer"
      @click="$router.push(`/producto/${product._id}`)"
    >
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
          <q-icon name="image_not_supported" size="2em" />
        </div>
      </template>
      
      <!-- Miniaturas si hay más imágenes -->
      <div v-if="product.imagenes.length > 1" class="absolute-bottom">
        <div class="row no-wrap justify-center q-pb-xs">
          <q-btn
            v-for="(img, index) in product.imagenes"
            :key="index"
            dense
            flat
            padding="xs"
            @click.stop="currentImage = index"
          >
            <q-avatar size="30px">
              <q-img :src="img" :ratio="1" />
            </q-avatar>
          </q-btn>
        </div>
      </div>
    </q-img>

    <!-- Contenido de la tarjeta -->
    <q-card-section>
      <!-- Categoría -->
      <div class="text-caption text-grey-7">
        {{ product.category?.name }}
      </div>
      
      <!-- Nombre del producto -->
      <div class="text-subtitle2 ellipsis-2-lines" style="height: 3em;">
        {{ product.nombre }}
      </div>
      
      <!-- Rating -->
      <div class="row items-center q-mt-xs">
        <q-rating
  :model-value="typeof product.rating === 'number' ? product.rating : 0"
  size="1em"
  color="yellow"
  icon="star_border"
  icon-selected="star"
  readonly
/>

        <span class="text-caption text-grey-7 q-ml-xs">
          ({{ product.reviewsCount || 0 }})
        </span>
      </div>
      
      <!-- Precios -->
      <div class="q-mt-sm">
        <div v-if="product.precioAnterior" class="text-caption text-strike text-grey">
          ${{ formatPrice(product.precioAnterior) }}
        </div>
        <div class="text-h6 text-primary">
         
        </div>
        <div v-if="product.cuotas" class="text-caption text-green">
          {{ product.cuotas }}x ${{ formatPrice(product.precio / product.cuotas) }} sin interés
        </div>
      </div>
      
      <!-- Especificaciones destacadas -->
      <div class="q-mt-sm">
        <q-chip
          v-for="(spec, index) in highlightedSpecs"
          :key="index"
          dense
          size="sm"
          color="grey-2"
          text-color="dark"
          class="q-mr-xs q-mb-xs"
        >
          {{ spec }}
        </q-chip>
      </div>
    </q-card-section>

    <!-- Acciones -->
    <q-card-actions class="q-px-md q-pb-md">
      <q-btn
        color="primary"
        label="Agregar"
        icon="shopping_cart"
        class="full-width"
        @click="addToCart"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const currentImage = ref(0)

const mainImage = computed(() => {
  return props.product.imagenes[currentImage.value] || '/placeholder-product.png'
})

const highlightedSpecs = computed(() => {
  const specs = []
  if (props.product.especificaciones?.almacenamiento) {
    specs.push(props.product.especificaciones.almacenamiento)
  }
  if (props.product.especificaciones?.ram) {
    specs.push(props.product.especificaciones.ram + ' RAM')
  }
  if (props.product.especificaciones?.sistemaOperativo) {
    specs.push(props.product.especificaciones.sistemaOperativo)
  }
  return specs
})

const formatPrice = (price) => {
  return price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

const addToCart = () => {
  // Aquí debes implementar la lógica para agregar el producto al carrito
  console.log('Agregar al carrito')
}
</script>

<style scoped>
.product-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>