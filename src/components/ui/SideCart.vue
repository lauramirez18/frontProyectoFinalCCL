<template>
  <q-drawer
    v-model="cartDrawerOpen"
    side="right"
    :width="$q.screen.lt.sm ? '100%' : '400px'"
    overlay
    elevated
    class="side-cart-drawer"
    :breakpoint="0"
  >
    <div class="side-cart-header">
      <div class="text-h6">Mi Carrito ({{ totalItems }})</div>
      <q-btn
        flat
        round
        dense
        icon="close"
        @click="toggleCart"
        class="close-btn"
      />
    </div>

    <q-scroll-area class="cart-scroll-area">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <q-icon name="shopping_cart" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">Tu carrito está vacío</div>
        <p class="text-grey-7">Agrega productos para continuar</p>
        <q-btn
          color="primary"
          label="Seguir comprando"
          class="q-mt-md"
          @click="$router.push('/')"
        />
      </div>

      <div v-else>
        <q-list>
          <q-item v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
            <q-item-section avatar>
              <q-avatar size="60px" class="bg-grey-3">
                <img :src="item.image" :alt="item.name" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
              <q-item-label caption>{{ item.description || 'Sin descripción' }}</q-item-label>
              <div class="q-mt-sm">
                <q-btn
                  dense
                  flat
                  round
                  icon="remove"
                  size="sm"
                  @click="decreaseQuantity(index)"
                />
                <span class="q-mx-sm">{{ item.quantity }}</span>
                <q-btn
                  dense
                  flat
                  round
                  icon="add"
                  size="sm"
                  @click="increaseQuantity(index)"
                />
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="text-right">
                <div class="text-weight-bold">{{ formatCurrency(getItemPrice(item)) }}</div>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="removeItem(index)"
                  class="q-mt-xs"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-scroll-area>

    <div v-if="cartItems.length > 0" class="cart-footer">
      <div class="row justify-between items-center q-px-md q-py-sm">
        <div class="text-subtitle1">Total:</div>
        <div class="text-h6 text-weight-bold">{{ formatCurrency(total) }}</div>
      </div>
      <q-separator />
      <div class="q-pa-md">
        <q-btn
          color="primary"
          label="Ver carrito"
          class="full-width q-mb-sm"
          @click="$router.push('/car')"
        />
        <q-btn
          color="positive"
          label="Pagar ahora"
          class="full-width"
          @click="proceedToCheckout"
        />
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useAuthStore } from '../../store/store';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

// Obtener el estado del carrito del plugin
const cart = inject('cart');
const cartDrawerOpen = ref(false);

// Sincronizar con el estado global del carrito
onMounted(() => {
  cartDrawerOpen.value = cart.isOpen.value;
});

// Observar cambios en el estado global
const stopWatch = $q.platform.is.cordova ? null : 
  $q.platform.is.electron ? null :
  watch(() => cart.isOpen.value, (newVal) => {
    cartDrawerOpen.value = newVal;
  });

// Limpiar el watcher cuando el componente se desmonte
onUnmounted(() => {
  if (stopWatch) stopWatch();
});

// Computed properties
const cartItems = computed(() => authStore.cartItems);
const totalItems = computed(() => {
  return authStore.cartItems.reduce((total, item) => total + item.quantity, 0);
});

const total = computed(() => {
  return authStore.cartItems.reduce((total, item) => {
    const price = getItemPrice(item);
    return total + (price * item.quantity);
  }, 0);
});

// Métodos
const getItemPrice = (item) => {
  if (item.discountPrice && !isNaN(item.discountPrice)) {
    return item.discountPrice;
  }
  if (item.price && !isNaN(item.price)) {
    return item.price;
  }
  return 0;
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value);
};

const toggleCart = () => {
  cartDrawerOpen.value = !cartDrawerOpen.value;
};

const increaseQuantity = (index) => {
  authStore.cartItems[index].quantity++;
};

const decreaseQuantity = (index) => {
  if (authStore.cartItems[index].quantity > 1) {
    authStore.cartItems[index].quantity--;
  } else {
    removeItem(index);
  }
};

const removeItem = (index) => {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: '¿Estás seguro de que quieres eliminar este producto del carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      authStore.cartItems.splice(index, 1);
      $q.notify({
        message: 'Producto eliminado del carrito',
        color: 'positive',
        position: 'top'
      });
    }
  });
};

const proceedToCheckout = () => {
  router.push('/payments');
  cartDrawerOpen.value = false;
};

// Sincronizar con el estado global
watch(cartDrawerOpen, (newVal) => {
  if (newVal !== cart.isOpen.value) {
    if (newVal) cart.open();
    else cart.close();
  }
});

// Exponer métodos al template
defineExpose({
  toggleCart: cart.toggle
});
</script>

<style scoped>
.side-cart-drawer {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.side-cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #f5f5f5;
}

.close-btn {
  margin-left: auto;
}

.cart-scroll-area {
  flex: 1;
  height: calc(100% - 180px);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
}

.cart-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.cart-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.cart-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #fff;
}

.q-badge {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
