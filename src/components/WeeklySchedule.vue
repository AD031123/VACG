<template>
  <div class="section-card">
    <div class="section-title"><i class="bi bi-calendar-week"></i> 本周放送</div>

    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border" style="color:#ff5e95;width:1.5rem;height:1.5rem;" role="status"></div>
    </div>

    <template v-else>
      <div class="d-flex flex-wrap gap-1 mb-2">
        <button v-for="(day, idx) in weekLabels" :key="idx"
          class="week-btn" :class="{ active: activeWeek === idx }"
          @click="activeWeek = idx">
          {{ day }}
        </button>
      </div>

      <div v-if="weeklyData[activeWeek] && weeklyData[activeWeek].length">
        <router-link
          v-for="item in weeklyData[activeWeek]"
          :key="item.detailUrl"
          :to="`/detail/${extractId(item.detailUrl)}`"
          class="text-decoration-none">
          <div class="weekly-item-text">
            <div class="anime-name">{{ item.name }}</div>
            <div class="update-info">{{ item.info }}</div>
          </div>
        </router-link>
      </div>
      <div v-else class="text-center text-muted py-3" style="font-size:0.8rem;">暂无数据</div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { extractId } from '../api'

const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const activeWeek = ref(new Date().getDay())

defineProps({
  weeklyData: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped>
.weekly-item-text {
  padding: 8px 10px;
  border-radius: 8px;
  background: #F4F5F7;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}
.weekly-item-text:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.weekly-item-text .anime-name {
  font-size: 0.8rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.weekly-item-text .update-info {
  font-size: 0.7rem;
  color: #888;
  margin-top: 2px;
}
</style>
