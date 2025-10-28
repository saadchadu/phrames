interface Toast {
  id: string
  title: string
  description?: string
  color?: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

export const useToast = () => {
  const toasts = ref<Toast[]>([])

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      timeout: 5000,
      color: 'info',
      ...toast
    }
    
    toasts.value.push(newToast)
    
    if (newToast.timeout && newToast.timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, newToast.timeout)
    }
    
    return id
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    add,
    remove,
    clear
  }
}