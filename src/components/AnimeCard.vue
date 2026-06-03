<template>
  <router-link :to="`/detail/${anime.id}`" class="text-decoration-none">
    <div class="anime-card">
      <div class="card-img-wrapper">
        <img :src="anime.image || anime.imageUrl" :alt="anime.name" loading="lazy" @error="e => e.target.src=fallbackImg">
        <span class="ep-badge">{{ anime.episode || anime.episodeInfo }}</span>
      </div>
      <div class="p-2 text-center">
        <div class="card-title text-truncate">{{ anime.name }}</div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
const fallbackImg = '/not-found.png'
defineProps({
  anime: { type: Object, required: true },
})
</script>
