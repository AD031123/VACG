<template>
  <div v-if="loading" class="section-card text-center py-5">
    <div class="spinner-border" style="color: #ff5e95;" role="status">
      <span class="visually-hidden">加载中...</span>
    </div>
  </div>

  <div v-else-if="detail">
    <div class="section-card mb-3">
      <div class="row g-3">
        <div class="col-md-3 col-lg-2">
          <img :src="detail.cover" class="w-100 rounded-3" alt="" @error="e => e.target.src=fallbackImg">
        </div>
        <div class="col-md-9 col-lg-10">
          <h3 class="fw-bold">{{ detail.title }}</h3>
          <pre class="py-2 mt-2" style="white-space:pre-wrap;font-family:inherit;font-size:0.9rem;color:#444;">{{ detail.description }}</pre>
          <div class="row g-2 mt-3">
            <div v-for="(v, k) in detail.info" :key="k" class="col-6 col-sm-4 col-lg-3">
              <small class="text-secondary">{{ k }}</small>
              <div class="text-truncate" style="font-size:0.85rem;">{{ v }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title"><i class="bi bi-play-btn-fill"></i> 剧集列表</div>
      <div class="d-flex flex-wrap gap-2">
        <router-link v-for="ep in detail.episodes" :key="ep.name"
          :to="playRoute(ep.url)"
          class="btn btn-sm btn-outline-primary rounded-pill px-3">
          {{ ep.name }}
        </router-link>
      </div>
    </div>

    <div v-if="detail.recommendations && detail.recommendations.length" class="section-card mt-3">
      <div class="section-title"><i class="bi bi-hand-thumbs-up-fill"></i> 相关推荐</div>
      <div class="rec-grid">
        <router-link
          v-for="item in detail.recommendations" :key="item.detailUrl"
          :to="`/detail/${recId(item.detailUrl)}`"
          class="text-decoration-none">
          <div class="rec-item">
            <div class="rec-img-wrapper">
              <img :src="item.imageUrl" :alt="item.name" loading="lazy" @error="e => e.target.src=fallbackImg">
              <span class="rec-ep-badge">{{ item.episodeInfo }}</span>
            </div>
            <div class="rec-name">{{ item.name }}</div>
          </div>
        </router-link>
      </div>
    </div>

  </div>

  <div v-else class="section-card text-center py-5 text-muted">番剧信息加载失败</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchDetail } from '../api'

const fallbackImg = '/not-found.png'

const route = useRoute()
const detail = ref(null)
const loading = ref(true)

function extractEp(url) {
  const parts = url.split('/')
  return parts[parts.length - 1]
}
function playRoute(url) {
  return url
}
function recId(detailUrl) {
  const m = detailUrl.match(/\/detail\/(\d+)/)
  return m ? m[1] : ''
}

async function load(id) {
  loading.value = true
  try {
    detail.value = await fetchDetail(id)
  } catch (e) {
    console.error('详情加载失败:', e.message)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (newId) => {
  window.scrollTo(0, 0)
  load(newId)
}, { immediate: true })
</script>

<style scoped>
.rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.rec-item {
  background: #F4F5F7;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.rec-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.rec-img-wrapper {
  position: relative;
  padding-top: 140%;
  overflow: hidden;
}
.rec-img-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rec-ep-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 4px;
}

.rec-name {
  padding: 8px 10px;
  font-size: 0.8rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
