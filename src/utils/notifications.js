import { Notify } from 'quasar'

export const showNotification = (type, message, caption = '') => {
  const notifyConfig = {
    message,
    caption,
    position: 'top-right',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  }

  switch (type) {
    case 'success':
      Notify.create({
        ...notifyConfig,
        type: 'positive',
        icon: 'check_circle'
      })
      break
    case 'error':
      Notify.create({
        ...notifyConfig,
        type: 'negative',
        icon: 'error'
      })
      break
    case 'warning':
      Notify.create({
        ...notifyConfig,
        type: 'warning',
        icon: 'warning'
      })
      break
    case 'info':
      Notify.create({
        ...notifyConfig,
        type: 'info',
        icon: 'info'
      })
      break
    default:
      Notify.create(notifyConfig)
  }
}