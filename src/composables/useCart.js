import { useAuthStore } from '../store/store.js'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

export function useCart() {
  const authStore = useAuthStore()
  const $q = useQuasar()
  const showCartSidebar = ref(false)
  const showLoginDialog = ref(false)

  function addToCart(producto, mainImage) {
    if (!authStore.token) {
      $q.dialog({
        title: 'Iniciar sesión para añadir al carrito',
        message: 'Para añadir productos a tu carrito, por favor inicia sesión o regístrate.',
        cancel: true,
        persistent: true,
        ok: {
          label: 'Iniciar sesión',
          color: 'primary'
        },
        cancel: {
          label: 'Ahora no',
          color: 'grey'
        }
      }).onOk(() => {
        showLoginDialog.value = true
      })
      return false
    }

    const price = producto.enOferta ? producto.precioOferta : producto.precio

    const cartItem = {
      id: producto._id,
      name: producto.nombre,
      price: price,
      image: mainImage,
      quantity: 1,
      seller: typeof producto.marca === 'object' ? producto.marca.nombre : (producto.marca || 'Vendedor oficial')
    }

    if (!cartItem.id || !cartItem.name || !cartItem.price) {
      $q.notify({
        type: 'negative',
        message: 'Error: Datos del producto incompletos. No se pudo agregar al carrito.',
        position: 'top'
      })
      return false
    }

    authStore.addToCart(cartItem)
    showCartSidebar.value = true
    $q.notify({
      type: 'positive',
      message: `"${producto.nombre}" agregado al carrito.`,
      position: 'top'
    })
    return true
  }

  return {
    addToCart,
    showCartSidebar,
    showLoginDialog
  }
} 