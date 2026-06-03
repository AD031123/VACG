<template>
  <div id="app-root">
    <NavBar />

    <main class="app-content py-3">
      <router-view />
    </main>

    <footer class="text-center py-3 text-muted" style="font-size: 0.8rem;">
      <p class="mb-1">VACG 动漫 — 仅供学习交流使用</p>
      <p class="mb-0">Copyright &copy; 2026</p>
    </footer>

  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>
