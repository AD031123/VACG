<template>
  <div>
    <div v-if="loading" class="section-card text-center py-5">
      <div class="spinner-border" style="color:#ff5e95;" role="status"></div>
    </div>

    <template v-else>
      <!-- Tab 切换 -->
      <div class="section-card mb-3">
        <div class="d-flex gap-2">
          <button
            v-for="tab in tabs" :key="tab.key"
            class="rank-tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 排行榜列表 -->
      <div class="section-card">
        <div class="section-title">
          <i class="bi bi-trophy-fill"></i>
          {{ currentTab?.title || '排行榜' }}
        </div>

        <div v-if="currentList.length">
          <div v-for="item in currentList" :key="item.detailUrl" class="rank-item">
            <span class="rank-no" :class="rankClass(item.rank)">{{ item.rank }}</span>
            <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="rank-name text-decoration-none">
              {{ item.name }}
            </router-link>
          </div>
        </div>
        <div v-else class="text-center py-4 text-muted">暂无数据</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchRank, extractId } from '../api'

const loading = ref(true)
const rankData = ref({})
const activeTab = ref('weekly')
const tabs = [
  { key: 'weekly', label: '周榜' },
  { key: 'monthly', label: '月榜' },
  { key: 'total', label: '总榜' },
]

const currentTab = computed(() => rankData.value[activeTab.value])
const currentList = computed(() => currentTab.value?.items || [])

function rankClass(rank) {
  const n = parseInt(rank, 10)
  if (n === 1) return 'rank-1'
  if (n === 2) return 'rank-2'
  if (n === 3) return 'rank-3'
  return ''
}

onMounted(async () => {
  try {
    rankData.value = await fetchRank()
  } catch (e) {
    console.error('加载失败:', e.message)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.rank-tab-btn {
  padding: 6px 24px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.rank-tab-btn:hover {
  border-color: #ff5e95;
  color: #ff5e95;
}
.rank-tab-btn.active {
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  color: #fff;
  border-color: transparent;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #F4F5F7;
  margin-bottom: 6px;
  transition: all 0.2s;
}
.rank-item:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.rank-no {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e0e0e0;
  color: #888;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-no.rank-1 { background: #FFD700; color: #fff; }
.rank-no.rank-2 { background: #C0C0C0; color: #fff; }
.rank-no.rank-3 { background: #CD7F32; color: #fff; }

.rank-name {
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-name:hover {
  color: #ff5e95;
}
</style>
