<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <div v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  tag: 'button'
})

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500',
    tertiary: 'text-primary-700 hover:text-primary-800 hover:bg-primary-50 focus-visible:ring-primary-500',
    destructive: 'bg-error-600 text-white shadow-sm hover:bg-error-700 focus-visible:ring-error-500',
    ghost: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-500'
  }
  
  const sizes = {
    xs: 'h-8 px-3 text-xs rounded-lg',
    sm: 'h-9 px-3 text-sm rounded-lg',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-11 px-6 text-base rounded-xl',
    xl: 'h-12 px-7 text-base rounded-xl'
  }
  
  return [base, variants[props.variant], sizes[props.size]].join(' ')
})
</script>