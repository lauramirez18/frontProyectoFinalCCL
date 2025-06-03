<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    :maximized="showRegister"
  >
    <div class="auth-container">
      <transition name="flip">
        <login-dialog
          v-if="!showRegister"
          v-model="dialogModel"
          @switch-to-register="handleSwitchToRegister"
          key="login"
        />
        <register-dialog
          v-else
          v-model="dialogModel"
          @close="handleClose"
          @switch-to-login="handleSwitchToLogin"
          key="register"
        />
      </transition>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import LoginDialog from './LoginDialog.vue';
import RegisterDialog from './RegisterDialog.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const showRegister = ref(false);

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleSwitchToRegister = () => {
  console.log('Switching to register');
  showRegister.value = true;
};

const handleSwitchToLogin = () => {
  console.log('Switching to login');
  showRegister.value = false;
};

const handleClose = () => {
  dialogModel.value = false;
};

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    setTimeout(() => {
      showRegister.value = false;
    }, 300);
  }
});
</script>

<style>
.auth-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: relative;
}

/* Animaciones de flip */
.flip-enter-active,
.flip-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.flip-enter-from {
  transform: rotateY(-180deg);
  opacity: 0;
}

.flip-leave-to {
  transform: rotateY(180deg);
  opacity: 0;
}

.flip-enter-to,
.flip-leave-from {
  transform: rotateY(0deg);
  opacity: 1;
}

/* Asegurarse de que los diálogos internos ocupen todo el espacio */
:deep(.login-card-container),
:deep(.register-card-container) {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
}

/* Animaciones de entrada/salida del diálogo */
:deep(.q-dialog--enter-active) .auth-container {
  animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.q-dialog--leave-active) .auth-container {
  animation: zoomOut 0.2s ease-in-out;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes zoomOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style> 