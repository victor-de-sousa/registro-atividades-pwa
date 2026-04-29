<template>
  <OfflineBanner />
  <AppHeader />
  <main>
    <router-view />
  </main>
  <UpdatePrompt />
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
import OfflineBanner from './components/OfflineBanner.vue';
import UpdatePrompt from './components/UpdatePrompt.vue';
</script>

<style scoped>
main {
  padding-bottom: 40px;
}
</style>