<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <input
      v-model="newTask"
      type="text"
      placeholder="Nova tarefa..."
      class="task-input"
    />
    <button type="submit" class="task-button">
      {{ editingTask ? 'Alterar' : 'Adicionar' }}
    </button>
    <button
      v-if="editingTask"
      type="button"
      class="task-button-cancel"
      @click="handleCancel"
    >
      Cancelar
    </button>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['add', 'update', 'cancel']);
const newTask = ref('');

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : '';
  },
);

function handleSubmit() {
  if (!newTask.value.trim()) return;
  if (props.editingTask) {
    emit('update', props.editingTask.id, newTask.value.trim());
  } else {
    emit('add', newTask.value.trim());
  }
  newTask.value = '';
}

function handleCancel() {
  newTask.value = '';
  emit('cancel');
}
</script>

<style scoped>
.task-form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
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

.task-button:hover {
  background-color: #357abd;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.task-button-cancel:hover {
  border-color: #aaa;
  color: #333;
}
</style>