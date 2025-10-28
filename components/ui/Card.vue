<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200">
      <slot name="header" />
    </div>
    <div :class="bodyClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: true
})

const cardClasses = computed(() => {
  const base = 'bg-white rounded-xl overflow-hidden'
  
  const variants = {
    default: 'border border-gray-200',
    outlined: 'border-2 border-gray-200',
    elevated: 'shadow-lg border border-gray-100'
  }
  
  return [base, variants[props.variant]].join(' ')
})

const bodyClasses = computed(() => {
  return props.padding ? 'p-6' : ''
})
</script>