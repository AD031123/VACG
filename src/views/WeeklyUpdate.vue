<template>
  <div>
    <div v-if="loading" class="section-card text-center py-5">
      <div class="spinner-border" style="color:#ff5e95;" role="status"></div>
    </div>

    <template v-else>
      <div v-for="day in sortedDays" :key="day.label" class="mb-3">
        <div class="section-card">
          <div class="section-title"><i class="bi bi-calendar-check"></i> {{ day.label }}</div>
          <div class="update-grid">
            <router-link
              v-for="item in day.items" :key="item.detailUrl"
              :to="`/detail/${extractId(item.detailUrl)}`"
              class="text-decoration-none">
              <div class="update-item">
                <img :src="item.imageUrl" :alt="item.name" loading="lazy" @error="e => e.target.src=fallbackImg">
                <div class="update-item-body">
                  <div class="update-item-name">{{ item.name }}</div>
                  <div class="update-item-ep">{{ item.episodeInfo }}</div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </template>

    <div v-if="!loading && !sortedDays.length" class="section-card text-center py-5 text-muted">暂无数据</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchWeeklyUpdate, extractId } from '../api'

const fallbackImg = '/not-found.png'
const loading = ref(true)
const days = ref([])

// Japanese weekday to Chinese 星期X
const weekdayMap = { '日': '星期日', '月': '星期一', '火': '星期二', '水': '星期三', '木': '星期四', '金': '星期五', '土': '星期六' }

// Japanese weekday names to JS day-of-week index
const dayIndexMap = {
  '日': 0, '月': 1, '火': 2, '水': 3, '木': 4, '金': 5, '土': 6,
}

function normalizeLabel(label) {
  return label.replace(/([日月火水木金土])曜日/, (_, c) => weekdayMap[c])
}

function parseDayIndex(label) {
  for (const [char, idx] of Object.entries(dayIndexMap)) {
    if (label.includes(char + '曜日')) return idx
  }
  return -1
}

const sortedDays = computed(() => {
  const today = new Date().getDay()
  const arr = days.value.map(d => ({ ...d, label: normalizeLabel(d.label), dayIdx: parseDayIndex(d.label) }))
  arr.sort((a, b) => {
    const adjA = (a.dayIdx - today + 7) % 7
    const adjB = (b.dayIdx - today + 7) % 7
    return adjB - adjA
  })
  return arr
})

onMounted(async () => {
  try {
    const data = await fetchWeeklyUpdate()
    days.value = data.days
  } catch (e) {
    console.error('加载失败:', e.message)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.update-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.update-item {
  background: #F4F5F7;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.update-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.update-item img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
}

.update-item-body {
  padding: 8px 10px;
}

.update-item-name {
  font-size: 0.82rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-item-ep {
  font-size: 0.72rem;
  color: #999;
  margin-top: 3px;
}
</style>
