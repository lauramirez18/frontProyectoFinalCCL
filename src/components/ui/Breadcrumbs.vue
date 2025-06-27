<template>
  <q-breadcrumbs v-if="itemsToShow.length > 1" class="breadcrumb-bar" active-color="primary" separator="/">
    <q-breadcrumbs-el
      v-for="(item, index) in itemsToShow"
      :key="index"
      v-if="index !== itemsToShow.length - 1 || (item.label && item.label !== '' && !/^[a-f0-9]{24}$/.test(item.label))"
      :label="item.label"
      :to="!item.disabled ? item.to : undefined"
      :icon="item.icon"
      :class="{
        'text-grey-6': item.disabled,
        'text-weight-medium': item.disabled,
        'cursor-default': item.disabled
      }"
      @click="!item.disabled && navigateTo(item.to)"
    />
  </q-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue';
import useBreadcrumbs from '../../composables/useBreadcrumbs';

const props = defineProps({
  customItems: {
    type: Array,
    default: null
  }
});

const { breadcrumbs, navigateTo } = useBreadcrumbs();
const itemsToShow = computed(() => props.customItems && props.customItems.length > 0 ? props.customItems : breadcrumbs.value);
</script>

<style scoped>
.breadcrumb-bar {
  padding: 0;
  background: transparent;
  border-radius: 0;
  margin: 0 0 24px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  display: flex;
  align-items: center;
  min-height: 44px;
  box-shadow: none;
  border: none;
}
.breadcrumb-bar :deep(.q-breadcrumbs__el),
.breadcrumb-bar :deep(.q-breadcrumbs__el .q-icon),
.breadcrumb-bar :deep(.q-breadcrumbs__el .q-breadcrumbs__label) {
  color: #222 !important;
}
.breadcrumb-bar :deep(.q-breadcrumbs__separator) {
  color: #888 !important;
}
</style>
