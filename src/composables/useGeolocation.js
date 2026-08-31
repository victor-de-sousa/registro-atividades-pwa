import { ref } from 'vue'
import geocodingApi from '../api/geocodingApi'

export function useGeolocation() {
  const isSuported =
    typeof navigator !== 'undefined' && typeof navigator.geolocation !== 'undefined'
  const permissionState = ref('unknown')
  const loadingLocation = ref(false)
  const locationError = ref('')
  const location = ref(null)

  async function readPermissionState() {
    if (!navigator.permissions?.query) return

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' })
      permissionState.value = status.state
      status.onchange = () => {
        permissionState.value = status.state
      }
    } catch {
      permissionState.value = 'unknown'
    }
  }

  function setLocationFromTask(task) {
    if (!task || task.latitude == null || task.longitude == null) {
      location.value = null
      return
    }
    location.value = {
      latitude: task.latitude,
      longitude: task.longitude,
      accuracy: task.geolocation_accuracy ?? null,
      timestamp: task.geolocation_timestamp ? Date.parse(task.geolocation_timestamp) : Date.now(),
      label: task.location_label ?? null,
    }
  }

  function clearLocation() {
    location.value = null
    locationError.value = ''
  }

  function setLocationLabel(label) {
    if (location.value) location.value = { ...location.value, location_label: label || null }
  }

  function requestCurrentLocation() {
    if (!isSuported) {
      locationError.value = 'Geolocalização não suportada neste dispositivo.'
      return Promise.resolve(null)
    }

    loadingLocation.value = true
    locationError.value = ''

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          permissionState.value = 'granted'
          location.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            geolocation_accuracy: position.coords.accuracy,
            geolocation_timestamp: position.timestamp,
            location_label: null,
          }

          loadingLocation.value = false
          resolve(location.value)
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            permissionState.value = 'denied'
            location.value = 'Permissão de localização negada.'
          } else if (error.code === error.TIMEOUT) {
            location.value = 'Tempo esgotado para obter localização.'
          } else {
            locationError.value = 'Não foi possível obter a localização agora.'
          }
          loadingLocation.value = false
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  async function handleGetLocation() {
    const captured = await requestCurrentLocation()
    if (!captured) return
    
    try {
      const address = await geocodingApi.reverse(
        captured.latitude,
        captured.longitude)
      setLocationLabel(address?.label)
    } catch {
      locationError.value = 'Localização obtida, mas não foi possível identificar a rua'
    }
  }

  return {
    isSuported,
    permissionState,
    loadingLocation,
    locationError,
    location,
    readPermissionState,
    setLocationFromTask,
    clearLocation,
    setLocationLabel,
    requestCurrentLocation,
    handleGetLocation,
  }
}
