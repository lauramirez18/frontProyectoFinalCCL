<template>
  <q-breadcrumbs 
    v-if="breadcrumbs.length > 0"
    class="text-grey-8 q-py-sm" 
    active-color="primary"
    separator="/"
  >
    <q-breadcrumbs-el 
      v-for="(item, index) in breadcrumbs" 
      :key="index"
      :label="item.label" 
      :to="!item.disabled ? item.to : undefined"
      :icon="item.icon"
      :class="{
        'text-grey-6': item.disabled,
        'text-weight-medium': item.disabled,
        'cursor-default': item.disabled
      }"
      @click="handleBreadcrumbClick(item, $event)"
    >
      <q-tooltip v-if="!item.disabled && item.to">
        Ir a {{ item.label }}
      </q-tooltip>
    </q-breadcrumbs-el>
  </q-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useBreadcrumbs from '../../composables/useBreadcrumbs';

const props = defineProps({
  // Items personalizados (opcional)
  items: {
    type: Array,
    default: () => []
  },
  // Configuración del breadcrumb de inicio
  home: {
    type: Object,
    default: () => ({
      label: 'Inicio',
      to: '/',
      icon: 'home',
      disabled: false
    })
  },
  // Mostrar el breadcrumb de inicio
  showHome: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['navigate']);
const router = useRouter();
const route = useRoute();

// Usar el composable de breadcrumbs
const { breadcrumbs: routeBreadcrumbs } = useBreadcrumbs();

// Combinar breadcrumbs personalizados con los de la ruta
const breadcrumbs = computed(() => {
  // Si hay items personalizados, usarlos
  if (props.items && props.items.length > 0) {
    return props.showHome ? [props.home, ...props.items] : [...props.items];
  }
  
  // Si no hay items personalizados, usar los de la ruta
  return routeBreadcrumbs.value;
});

// Manejar clic en un breadcrumb
const handleBreadcrumbClick = (item, event) => {
  if (item.to) {
    event.preventDefault();
    emit('navigate', item.to);
    router.push(item.to);
  }
};
</script>

<style scoped>
.q-breadcrumbs {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.q-breadcrumbs--last {
  color: inherit;
  font-weight: 500;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-default {
  cursor: default;
}
</style>

<style scoped>
.q-breadcrumbs {
  font-size: 1rem;
}

.q-breadcrumbs--last {
  color: inherit;
  font-weight: 500;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
