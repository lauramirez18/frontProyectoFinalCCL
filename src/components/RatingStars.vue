<template>
  <div class="rating-wrapper">
    <div class="rating-stars">
      <q-rating
        :model-value="rating"
        :max="5"
        :size="size"
        color="amber"
        icon="star"
        icon-selected="star"
        icon-half="star_half"
        readonly
      />
    </div>
    <div class="rating-info" v-if="showCount">
      <span class="rating-value">{{ (rating || 0).toFixed(1) }}</span>
      <span class="rating-count">({{ reviewCount || 0 }} reseñas)</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: '1.2em'
  },
  showCount: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.9em;
}

.rating-value {
  font-weight: 600;
}

.rating-count {
  color: #999;
}
</style> 