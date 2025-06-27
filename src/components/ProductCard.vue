<template>
  <q-card class="product-card q-hoverable" flat bordered>
    <!-- Badges y etiquetas -->
    <div class="absolute-top-right q-pa-xs">
      <q-badge v-if="product.enOferta" color="red" class="q-mr-xs">
        {{ product.porcentajeDescuento }}% OFF
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
      @click="$router.push(`/Details/${product.slug}`)"
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
          <div v-if="product.enOferta" class="row items-center">
            <div class="text-h6 text-negative">
              {{ formatPrice(product.precioOferta) }}
            </div>
            <div class="text-caption text-grey q-ml-sm text-line-through">
              {{ formatPrice(product.precio) }}
            </div>
          </div>
          <div v-else class="text-h6">
            {{ formatPrice(product.precio) }}
          </div>
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
      <FavoriteButton
        :product="product"
        class="favorite-btn"
      />
    </q-card-actions>
    <LoginDialog v-model="showLoginDialog" />
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, Dialog } from 'quasar'
import { useAuthStore } from '../store/store.js'
import { showNotification } from '../utils/notifications'
import FavoriteButton from './FavoriteButton.vue'
import RatingStars from './RatingStars.vue'
import LoginDialog from './LoginDialog.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const $q = useQuasar()
const currentImage = ref(0)
const loading = ref(false)
const showLoginDialog = ref(false)

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

const addToCart = async () => {
  if (!authStore.token) {
    $q.dialog({
      title: 'Iniciar sesión',
      message: '¿Deseas iniciar sesión para agregar productos al carrito?',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Sí, iniciar sesión',
        color: 'primary'
      },
      cancel: {
        label: 'No, continuar sin sesión',
        color: 'grey'
      }
    }).onOk(() => {
      showLoginDialog.value = true;
    });
    return;
  }

  try {
    loading.value = true
    const cartItem = {
      id: props.product._id,
      name: props.product.nombre,
      price: props.product.enOferta ? props.product.precioOferta : props.product.precio,
      image: props.product.imagenes && props.product.imagenes.length > 0 ? props.product.imagenes[0] : '/placeholder-product.png',
      quantity: 1,
      seller: typeof props.product.marca === 'object' ? props.product.marca.nombre : (props.product.marca || 'Vendedor oficial')
    }
    await authStore.addToCart(cartItem)
    showNotification('success', 'Producto agregado al carrito')
  } catch (error) {
    console.error('Error al agregar al carrito:', error)
    showNotification('error', 'Error al agregar al carrito')
  } finally {
    loading.value = false
  }
}

const authStore = useAuthStore()
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
