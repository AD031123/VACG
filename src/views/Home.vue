<template>
  <div>
    <VideoBanner />

    <div class="row g-3 mt-0">
      <!-- 左侧主内容 -->
      <div class="col-12 col-lg-9">
        <RecentUpdates :list="recentUpdates" :loading="loading" colClass="col-6 col-sm-4 col-md-3 col-lg-five" />
        <TodayRecommends :list="todayRecommends" :loading="loading" colClass="col-6 col-sm-4 col-md-3 col-lg-five" />
      </div>

      <!-- 右侧本周放送列表 -->
      <div class="col-12 col-lg-3">
        <WeeklySchedule :weeklyData="weeklyData" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VideoBanner from '../components/VideoBanner.vue'
import RecentUpdates from '../components/RecentUpdates.vue'
import TodayRecommends from '../components/TodayRecommends.vue'
import WeeklySchedule from '../components/WeeklySchedule.vue'
import { fetchRecentUpdates, fetchTodayRecommends, fetchWeeklySchedule, extractId } from '../api'

const loading = ref(true)
const recentUpdates = ref([])
const todayRecommends = ref([])
const weeklyData = ref([])

function mapItem(item) {
  return { ...item, id: extractId(item.detailUrl), episode: item.episodeInfo }
}

onMounted(async () => {
  try {
    const [recent, recommend, weekly] = await Promise.all([
      fetchRecentUpdates(),
      fetchTodayRecommends(),
      fetchWeeklySchedule(),
    ])
    recentUpdates.value = recent.list.map(mapItem)
    todayRecommends.value = recommend.list.map(mapItem)
    weeklyData.value = weekly.days
  } catch (e) {
    console.error('数据加载失败:', e.message)
  } finally {
    loading.value = false
  }
})
</script>
