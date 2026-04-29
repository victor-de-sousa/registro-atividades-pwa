import { ref, onMounted, onUnmounted } from 'vue';

const HEARTBEAT_INTERVAL = 10_000; // 10 segundos
const FETCH_TIMEOUT = 5_000; // 5 segundos

export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine);
  let intervalId = null;

  function updateStatus() {
    isOnline.value = navigator.onLine;
  }

  async function checkConnectivity() {
    if (!navigator.onLine) {
      isOnline.value = false;
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      // Faz HEAD request para um recurso pequeno do próprio domínio
      // O cache-bust via query string evita resposta do cache HTTP
      await fetch(
        `${window.location.origin}/icons/icon-192x192.png?_=${Date.now()}`,
        {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      isOnline.value = true;
    } catch {
      isOnline.value = false;
    }
  }

  onMounted(() => {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Verificação inicial real de conectividade
    checkConnectivity();

    // Heartbeat periódico
    intervalId = setInterval(checkConnectivity, HEARTBEAT_INTERVAL);
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  return { isOnline };
}