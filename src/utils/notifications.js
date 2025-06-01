import { Notify } from 'quasar'

export const showNotification = (type, message, details = '') => {
  Notify.create({
    type: type, // 'positive', 'negative', 'warning', 'info'
    message: message,
    caption: details,
    position: 'top-right',
    timeout: 3000,
    actions: [
      { icon: 'close', color: 'white', handler: () => { /* dismiss */ } }
    ]
  })
}

export const showError = (message, details = '') => {
  showNotification('negative', message, details)
}

export const showSuccess = (message) => {
  showNotification('positive', message)
}

export const showWarning = (message) => {
  showNotification('warning', message)
}

export const showInfo = (message) => {
  showNotification('info', message)
}