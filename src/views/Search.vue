<template>
  <div>
    <div class="d-flex section-card mb-2">
      <div class="section-title"><i class="bi bi-search"></i> 搜索"{{ keyword }}"</div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="section-card text-center py-5">
      <div class="spinner-border" style="color:#ff5e95;" role="status"></div>
    </div>

    <!-- Results -->
    <div v-else-if="items.length">
      <div class="section-card mb-2" style="font-size:0.85rem;color:#888;">
        共 {{ pagination.total }} 条结果，第 {{ pagination.current }}/{{ pagination.totalPages }} 页
      </div>

      <div v-for="item in items" :key="item.detailUrl" class="section-card py-3 mb-2">
        <div class="d-flex">
          <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="flex-shrink-0" style="width:100px;">
            <img :src="item.imageUrl" class="rounded-3 w-100" style="aspect-ratio:2/3;object-fit:cover;" alt="" @error="e => e.target.src=fallbackImg">
          </router-link>
          <div class="ps-3 flex-grow-1 min-w-0" style="overflow:hidden;">
            <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="text-decoration-none">
              <h6 class="mb-1" style="color:#333;">{{ item.name }}</h6>
            </router-link>
            <span class="badge mb-2" style="background:#F4F5F7;color:#888;font-size:0.75rem;">{{ item.status }}</span>
            <div class="row g-1" style="font-size:0.78rem;color:#888;">
              <div v-for="(v, k) in item.info" :key="k" class="col-6 col-sm-4">{{ k }}: {{ v }}</div>
            </div>
            <p class="mt-2 mb-2" style="font-size:0.78rem;color:#aaa;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">{{ item.description }}</p>
            <div class="d-flex gap-1">
              <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="btn btn-sm btn-outline-secondary">详情</router-link>
              <a v-if="item.playUrl" :href="item.playUrl" class="btn btn-sm btn-primary">播放</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="d-flex justify-content-center gap-1 mt-3">
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current <= 1" @click="goPage(pagination.current - 1)">上一页</button>
        <button v-for="p in pageButtons" :key="p" class="btn btn-sm" :class="p === pagination.current ? 'btn-primary' : 'btn-outline-secondary'" @click="goPage(p)">{{ p }}</button>
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current >= pagination.totalPages" @click="goPage(pagination.current + 1)">下一页</button>
      </div>
    </div>

    <!-- No results -->
    <div v-else class="section-card text-center py-5 text-muted">
      <i class="bi bi-inbox" style="font-size:2.5rem;color:#ddd;"></i>
      <p class="mt-2">未找到相关番剧</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSearch, extractId } from '../api'

const fallbackImg = '/not-found.png'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const items = ref([])
const pagination = ref({ total: 0, current: 1, totalPages: 1 })
const loading = ref(true)

const pageButtons = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const cur = pagination.value.current
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, cur + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function load(page = 1) {
  loading.value = true
  try {
    const data = await fetchSearch(keyword.value, page)
    items.value = data.items
    pagination.value = data.pagination
  } catch (e) {
    console.error('搜索失败:', e.message)
  } finally {
    loading.value = false
  }
}

function goPage(p) {
  load(p)
  window.scrollTo(0, 0)
}

watch(() => route.query.q, (val) => {
  if (val) {
    keyword.value = val
    load(1)
  }
}, { immediate: true })
</script>
