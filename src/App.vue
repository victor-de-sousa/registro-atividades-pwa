<template>
  <AppHeader />
  <main>
    <router-view />
  </main>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
</script>

<style scoped>
main {
  padding-bottom: 40px;
}
</style>