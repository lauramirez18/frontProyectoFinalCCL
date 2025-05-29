<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const category = ref(route.query.type)

onMounted(() => {
  // Lógica para cargar productos de esa categoría desde backend
  console.log('Mostrar productos de categoría:', category.value)
})
</script>
