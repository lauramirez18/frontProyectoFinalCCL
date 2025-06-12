<template>
  <div class="search-suggestions" v-if="suggestions.length > 0">
    <q-list bordered separator>
      <q-item
        v-for="suggestion in suggestions"
        :key="suggestion._id"
        clickable
        v-ripple
        @click="selectSuggestion(suggestion)"
      >
        <q-item-section avatar>
          <q-img
            :src="suggestion.imagenes[0]"
            :alt="suggestion.nombre"
            style="width: 40px; height: 40px"
            fit="contain"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ suggestion.nombre }}</q-item-label>
          <q-item-label caption>{{ suggestion.marca?.nombre }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label class="text-primary">${{ formatPrice(suggestion.precio) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  suggestions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select'])
const router = useRouter()

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL').format(price)
}

const selectSuggestion = (suggestion) => {
  emit('select', suggestion)
  router.push({
    name: 'Details',
    params: { slug: suggestion.slug }
  })
}
</script>

<style scoped>
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}
</style> 