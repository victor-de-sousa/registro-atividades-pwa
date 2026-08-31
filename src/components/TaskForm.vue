<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input v-model="newTask" type="text" placeholder="Nova tarefa..." class="task-input" />
      <button type="submit" class="task-button" :disabled="uploading">
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>
      <button v-if="editingTask" type="button" class="task-button-cancel" @click="handleCancel">
        Cancelar
      </button>
    </div>

    <div class="image-section">
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />
      <label class="image-label" :class="{ disabled: uploading }">
        <span v-if="uploading" class="upload-status">Enviando...</span>
        <span v-else>
          {{
            previewUrl || editingTask?.img_url
              ? 'Trocar imagem'
              : isMobileDevice
                ? 'Fotografar'
                : 'Adicionar imagem'
          }}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <p class="image-help">
        Em celular, o botão pode abrir a câmera. Em notebook, abre o seletor de arquivos.
      </p>

      <button
        type="button"
        class="task-button-secondary"
        @click="showCameraCapture = !showCameraCapture"
      >
        {{ showCameraCapture ? 'Fechar câmera' : 'Abrir preview ao vivo' }}
      </button>
      <CameraCapture v-if="showCameraCapture" @captured="handleCameraCapture" />
    </div>
    <div class="location-container">
      <div class="location-actions">
        <button class="location-btn" type="button" @click="handleShowLocation">
          {{ showTaskLocation ? 'Substituir localização' : 'Usar localização atual' }}
        </button>
        <button
          type="button"
          class="remove-location-btn"
          v-if="showTaskLocation"
          @click="handleDeleteLocation"
        >
          Remover localização
        </button>
      </div>

      <div v-if="showTaskLocation">
        <div class="location-timestamp">{{ locationTimestamp }}</div>
        <TaskLocationMap :location="location" />
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import tasksApi from '../api/tasksApi.js'
import CameraCapture from '../components/CameraCapture.vue'
import TaskLocationMap from './TaskLocationMap.vue'
import { useGeolocation } from '../composables/useGeolocation.js'

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['add', 'update', 'cancel'])
const newTask = ref('')
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)

const showCameraCapture = ref(false)

const { location, handleGetLocation, clearLocation } = useGeolocation()
const showTaskLocation = ref(false)

function handleLocation(task) {
  if (task?.latitude != null && task?.longitude != null) {
    location.value = {
      latitude: task.latitude,
      longitude: task.longitude,
      location_label: task.location_label,
      geolocation_accuracy: task.geolocation_accuracy,
      geolocation_timestamp: task.geolocation_timestamp,
      location_label: task.location_label,
    }
    return (showTaskLocation.value = true)
  }
}

const locationTimestamp = computed(() => {
  let timestamp = location.value?.geolocation_timestamp
  if (!timestamp) return null
  if (timestamp[-1] != 'Z' && typeof(timestamp) !== 'number') timestamp = new Date(`${timestamp}Z`)

  return new Date(timestamp).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'medium',
  })
}); 

watch(
  () => props.editingTask,
  async (task) => {
    newTask.value = task ? task.title : ''
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
    imgAttachmentKey.value = null
    handleLocation(task)
  },
)

async function handleShowLocation() {
  await handleGetLocation()
  if (showTaskLocation.value == false || location.value == null) {
    showTaskLocation.value = !showTaskLocation.value
  }
}

function handleDeleteLocation() {
  location.value = {
    latitude: null,
    longitude: null,
    location_label: null,
    geolocation_accuracy: null,
    geolocation_timestamp: null,
    location_label: null,
  }
  showTaskLocation.value = !showTaskLocation.value
}

async function handleImageChange(event) {
  const file = event.target.files[0]
  if (!file) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    const response = await tasksApi.uploadImage(file)
    imgAttachmentKey.value = response.data.attachment_key
  } catch (err) {
    console.error('Erro ao fazer upload da imagem', err)
    previewUrl.value = null
    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

function handleSubmit() {
  let payload = {}

  if (!newTask.value.trim()) return

  if (location.value != null) {
    const timestamp = location.value.geolocation_timestamp
    if (typeof(timestamp) === 'number') location.value.geolocation_timestamp = new Date(timestamp).toISOString()
    payload = location.value
  }

  if (newTask.value.trim() !== undefined) {
    payload.title = newTask.value.trim()
  }

  if (imgAttachmentKey.value != null) {
    payload.img_attachment_key = imgAttachmentKey.value
  }

  if (props.editingTask) {
    emit('update', props.editingTask.id, payload)
  } else {
    emit('add', payload)
  }

  newTask.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  imgAttachmentKey.value = null
  clearLocation()
  showTaskLocation.value = false
}

function handleCancel() {
  newTask.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  imgAttachmentKey.value = null
  showTaskLocation.value = false
  clearLocation()

  emit('cancel')
}

const isMobileDevice = ref(!window.matchMedia('(pointer: fine)').matches)

function handleCameraCapture(file) {
  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  tasksApi
    .uploadImage(file)
    .then((response) => {
      imgAttachmentKey.value = response.data.attachment_key
    })
    .catch((err) => {
      console.error(err)
      previewUrl.value = null
    })
    .finally(() => {
      uploading.value = false
    })
}
</script>

<style scoped>
.task-form {
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.task-input:focus {
  border-color: #4a90d9;
}

.task-button {
  padding: 12px 20px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-button:hover:not(:disabled) {
  background-color: #357abd;
}

.task-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.task-button-cancel:hover {
  border-color: #aaa;
}

.image-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.image-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.image-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #4a90d9;
  color: #4a90d9;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-label:hover:not(.disabled) {
  background: #eaf2fb;
}

.image-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.upload-status {
  color: #888;
}

.image-help {
  font-size: 0.75rem;
  color: #999;
  margin: 0;
  flex-basis: 100%;
}

.location-container {
  background-color: #f8f9fa;
  margin-top: 14px;
  border: 1px dashed #ccc;
  border-radius: 6px;
  padding: 8px 14px;
}

.location-actions {
  font-size: 0.875rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-btn {
  background-color: #fff;
  border: 1.5px solid #4a90d9;
  color: #4a90d9;
  padding: 4px 8px;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
}

.remove-location-btn {
  cursor: pointer;
  color: #e74c3c;
  background: none;
  border: none;
}

.location-timestamp {
  margin: 1vw 0;
  font-size: 0.875rem;
  color: #999;
}

</style>
