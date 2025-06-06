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
    <div v-if="rating >= 4.5" class="rating-label">
      <q-badge color="positive" class="rating-badge">
        <q-icon name="verified" size="xs" class="q-mr-xs" />
        Excelente
      </q-badge>
    </div>
    <div v-else-if="rating >= 4" class="rating-label">
      <q-badge color="primary" class="rating-badge">
        <q-icon name="thumb_up" size="xs" class="q-mr-xs" />
        Muy bueno
      </q-badge>
    </div>
    <div v-else-if="rating >= 3" class="rating-label">
      <q-badge color="warning" class="rating-badge">
        <q-icon name="sentiment_satisfied" size="xs" class="q-mr-xs" />
        Bueno
      </q-badge>
    </div>
    <div v-else-if="reviewCount > 0" class="rating-label">
      <q-badge color="negative" class="rating-badge">
        <q-icon name="sentiment_dissatisfied" size="xs" class="q-mr-xs" />
        Regular
      </q-badge>
    </div>
    <div v-else class="rating-label">
      <q-badge color="grey-5" class="rating-badge">
        <q-icon name="star_outline" size="xs" class="q-mr-xs" />
        Sin reseñas
      </q-badge>
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
  flex-wrap: wrap;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.rating-stars :deep(.q-rating) {
  display: flex;
  align-items: center;
}

.rating-stars :deep(.q-rating__icon) {
  color: #ffd700;
  text-shadow: 0 0 2px rgba(0,0,0,0.1);
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
  color: #333;
}

.rating-count {
  color: #999;
}

.rating-label {
  margin-top: 2px;
}

.rating-badge {
  font-size: 0.8em;
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 