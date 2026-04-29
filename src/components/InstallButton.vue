<template>
  <button v-if="showInstallButton" class="install-button" @click="installApp">
    Instalar aplicativo
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showInstallButton = ref(false);
let deferredPrompt = null;

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Impede o banner automático do navegador
    event.preventDefault();
    // Armazena o evento para usar depois
    deferredPrompt = event;
    // Mostra o botão customizado
    showInstallButton.value = true;
  });

  window.addEventListener('appinstalled', () => {
    // Esconde o botão quando o app for instalado
    showInstallButton.value = false;
    deferredPrompt = null;
  });
});

async function installApp() {
  if (!deferredPrompt) return;

  // Mostra o prompt de instalação do navegador
  deferredPrompt.prompt();

  // Aguarda a resposta do usuário
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    showInstallButton.value = false;
  }

  deferredPrompt = null;
}
</script>

<style scoped>
.install-button {
  display: block;
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.install-button:hover {
  background-color: #219a52;
}
</style>