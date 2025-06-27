import { ref } from 'vue';

export default {
  install: (app) => {
    // Estado reactivo para controlar la visibilidad del carrito
    const isCartOpen = ref(false);
    
    // Método para abrir/cerrar el carrito
    const toggleCart = () => {
      isCartOpen.value = !isCartOpen.value;
    };
    
    // Añadir el método y el estado a la instancia de la aplicación
    app.config.globalProperties.$cart = {
      isOpen: isCartOpen,
      toggle: toggleCart,
      open: () => isCartOpen.value = true,
      close: () => isCartOpen.value = false
    };
    
    // Inyectar en las opciones del componente
    app.provide('cart', {
      isOpen: isCartOpen,
      toggle: toggleCart
    });
  }
};
