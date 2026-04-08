<template>
    <div v-if="!isOnline" class="offline-banner">
        Você está offline. Algumas funcionalidades podem estar indisponíveis.
    </div>
</template>

<script setup>

import { useOnlineStatus } from '../composables/useOnlineStatus';

const { isOnline } = useOnlineStatus();

</script>

<style scoped>

.offline-banner {
  background-color: #e74c3c;
  color: white;
  text-align: center;
  padding: 8px 16px;
  font-size: 0.85rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

</style>