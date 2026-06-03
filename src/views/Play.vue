<template>
  <div>
    <div v-if="loading" class="section-card text-center py-5">
      <div class="spinner-border" style="color:#ff5e95;" role="status"></div>
    </div>

    <template v-else-if="data">
      <!-- 播放器 -->
      <div class="player-container mb-4">
        <div class="player-box">
          <div class="player-overlay">
            <div class="overlay-title">{{ data.title }}</div>
            <span class="overlay-ep-badge">{{ data.episode }}</span>
          </div>
          <iframe :src="data.iframeSrc" allowfullscreen="true" allow="autoplay; fullscreen" referrerpolicy="no-referrer"
            class="player-iframe">
          </iframe>
        </div>
      </div>

      <!-- 下方信息区 -->
      <div class="info-container">
        <div class="section-card">
          <div class="d-flex gap-3 info-top">
            <div class="d-flex" style="align-items: center;">
              <img v-if="data.cover" :src="data.cover" class="detail-cover rounded-3" alt="" @error="e => e.target.src=fallbackImg">
            </div>
            <div class="flex-grow-1 min-w-0">
              <h5 class="fw-bold text-truncate mb-3">{{ data.title }}</h5>
              <div v-if="data.info && Object.keys(data.info).length" class="info-list">
                <div v-for="(v, k) in data.info" :key="k" class="info-row">
                  <span class="info-key">{{ k }}</span>
                  <span class="info-val">{{ v }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="episode-section mt-3">
            <div class="section-title"><i class="bi bi-collection-play-fill"></i> 选集（共 {{ data.episodes.length }} 集）
            </div>
            <div class="episode-grid">
              <router-link v-for="epItem in data.episodes" :key="epItem.url" :to="epUrl(epItem.url)" class="ep-btn"
                :class="{ active: currentEp === extractEp(epItem.url) }">
                {{ epItem.name }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="section-card text-center py-5 text-muted">加载失败</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPlay } from '../api'

const fallbackImg = '/not-found.png'

const route = useRoute()
const data = ref(null)
const loading = ref(true)

const currentEp = computed(() => route.params.ep)

function extractEp(url) {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

function epUrl(playUrl) {
  const parts = playUrl.replace(/^\/play\//, '').split('/')
  return `/play/${parts[0]}/${parts[1]}/${parts[2]}`
}

async function load() {
  loading.value = true
  try {
    data.value = await fetchPlay(route.params.id, route.params.source, route.params.ep)
  } catch (e) {
    console.error('加载失败:', e.message)
  } finally {
    loading.value = false
  }
}

watch([() => route.params.source, () => route.params.ep], () => {
  window.scrollTo(0, 0)
  load()
}, { immediate: true })
</script>

<style scoped>
/* ===== 播放器 ===== */
.player-container,
.info-container {
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 1.5rem;
}

.player-box {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.player-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 40%);
  padding: 18px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.player-box:hover .player-overlay {
  opacity: 1;
}

.overlay-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.overlay-ep-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 5px;
  font-size: 0.75rem;
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  color: #fff;
  flex-shrink: 0;
}

.player-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* ===== 信息列表 ===== */
/* ===== 信息列表 ===== */
.info-top {
  align-items: flex-start;
}
.info-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  align-items: baseline;
  font-size: 0.82rem;
  line-height: 1.8;
  min-width: 0;
}

.info-key {
  color: #999;
  flex-shrink: 0;
  margin-right: 4px;
}

.info-key::after {
  content: '：';
}

.info-val {
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 封面 ===== */
.detail-cover {
  width: 180px;
  height: auto;
  flex-shrink: 0;
  align-self: flex-start;
  border-radius: 8px;
}

/* ===== 选集网格 ===== */
.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}

.ep-btn {
  display: block;
  text-align: center;
  padding: 8px 4px;
  border-radius: 8px;
  font-size: 0.8rem;
  text-decoration: none;
  color: #777;
  background: #F4F5F7;
  transition: all 0.2s;
}

.ep-btn:hover {
  color: #333;
  background: #e0e0e0;
}

.ep-btn.active {
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  color: #fff;
}

/* ===== 响应式 ===== */
@media (max-width: 767.98px) {
  .detail-cover {
    width: 120px;
    height: auto;
  }

  .info-row {
    font-size: 0.75rem;
  }

  .player-container,
  .info-container {
    max-width: none;
  }

  .player-box {
    border-radius: 0;
  }
}
</style>
