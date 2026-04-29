<template>
  <div v-if="needRefresh" class="update-prompt">
    <p>Uma nova versão está disponível.</p>
    <div class="update-actions">
      <button class="update-button" @click="updateServiceWorker()">
        Atualizar agora
      </button>
      <button class="dismiss-button" @click="close()">Depois</button>
    </div>
  </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    // Verifica novas versões periodicamente (a cada hora)
    if (registration) {
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000,
      );
    }
  },
  onRegisterError(error) {
    console.error('Erro ao registrar o Service Worker:', error);
  },
});

function close() {
  needRefresh.value = false;
}
</script>

<style scoped>
.update-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 400px;
  width: calc(100% - 32px);
}

.update-prompt p {
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.update-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.update-button {
  padding: 8px 16px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.update-button:hover {
  background-color: #357abd;
}

.dismiss-button {
  padding: 8px 16px;
  background-color: transparent;
  color: #ccc;
  border: 1px solid #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.dismiss-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>