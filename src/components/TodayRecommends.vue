<template>
  <div class="section-card">
    <div class="section-title"><i class="bi bi-hand-thumbs-up"></i> 今日推荐</div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" style="color:#ff5e95;width:2rem;height:2rem;" role="status"></div>
    </div>
    <div v-else class="row g-2">
      <div v-for="item in list" :key="item.id"
        :class="colClass">
        <AnimeCard :anime="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AnimeCard from './AnimeCard.vue'

defineProps({
  list: { type: Array, required: true },
  colClass: { type: String, default: 'col-6 col-sm-4 col-md-3 col-lg-five' },
  loading: { type: Boolean, default: false },
})
</script>
