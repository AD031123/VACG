<template>
  <div>
    <!-- 筛选标签区 -->
    <div class="section-card mb-3">
      <div v-if="filterLoading" class="text-center py-3">
        <div class="spinner-border" style="color:#ff5e95;width:2rem;height:2rem;" role="status"></div>
      </div>

      <div v-else v-for="f in filters" :key="f.name" class="filter-row">
        <span class="filter-label">{{ f.name }}</span>
        <div class="filter-tags">
          <button
            v-for="opt in f.items" :key="opt.name"
            class="filter-tag"
            :class="{ active: isFilterActive(f.name, opt) }"
            @click="selectFilter(opt)">
            {{ opt.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="section-card text-center py-5">
      <div class="spinner-border" style="color:#ff5e95;" role="status"></div>
    </div>

    <!-- 动漫列表 -->
    <div v-else-if="items.length">
      <div class="section-card p-3 mb-2" v-for="item in items" :key="item.detailUrl">
        <div class="catalog-item">
          <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="catalog-cover">
            <img :src="item.imageUrl" :alt="item.name" loading="lazy" @error="e => e.target.src=fallbackImg">
            <span class="catalog-status">{{ item.status }}</span>
          </router-link>
          <div class="catalog-body">
            <div class="catalog-top">
              <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="text-decoration-none">
                <h6 class="catalog-title">{{ item.name }}</h6>
              </router-link>
              <div class="catalog-info">
                <div v-for="(v, k) in item.info" :key="k" class="catalog-info-item">
                  <span>{{ k }}：{{ v }}</span>
                </div>
              </div>
              <p class="catalog-desc" v-if="item.description">{{ item.description }}</p>
            </div>
            <div class="catalog-actions">
              <router-link :to="`/detail/${extractId(item.detailUrl)}`" class="btn btn-sm btn-outline-secondary">详情</router-link>
              <router-link v-if="item.playUrl" :to="relativePath(item.playUrl)" class="btn btn-sm btn-primary">播放</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="d-flex justify-content-center gap-1 mt-4">
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current <= 1" @click="goPage(pagination.current - 1)">上一页</button>
        <button
          v-for="p in pageButtons" :key="p"
          class="btn btn-sm" :class="p === pagination.current ? 'btn-primary' : 'btn-outline-secondary'"
          @click="goPage(p)">{{ p }}</button>
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current >= pagination.totalPages" @click="goPage(pagination.current + 1)">下一页</button>
      </div>
    </div>

    <div v-else class="section-card text-center py-5 text-muted">暂无数据</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCatalog, extractId } from '../api'

const fallbackImg = '/not-found.png'

const loading = ref(true)
const filterLoading = ref(true)
const filters = ref([])
const items = ref([])
const pagination = ref({ total: 0, current: 1, totalPages: 1 })
const segment = ref('all-all-all-all-all-time')

const activeFilters = ref({})

const pageButtons = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const cur = pagination.value.current
  const start = Math.max(1, cur - 3)
  const end = Math.min(total, cur + 3)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Extract segment from filter href (remove the -page suffix only)
function segmentFromHref(href) {
  return href.replace(/-(\d+)$/, '')
}

function pageFromHref(href) {
  const m = href.match(/-(\d+)$/)
  return m ? parseInt(m[1], 10) : 1
}

function relativePath(url) {
  const m = url.match(/^https?:\/\/[^/]+(.+)$/)
  return m ? m[1] : url
}

function isFilterActive(filterName, opt) {
  return activeFilters.value[filterName] === opt.name
}

function selectFilter(opt) {
  const newSeg = segmentFromHref(opt.href)
  segment.value = newSeg
  goPage(1)
}

async function goPage(p) {
  loading.value = true
  try {
    const data = await fetchCatalog(segment.value, p)
    items.value = data.items
    pagination.value = data.pagination
    if (data.filters && data.filters.length) {
      filters.value = data.filters
      // Track active filters from loaded data
      const active = {}
      data.filters.forEach(f => {
        f.items.forEach(opt => {
          if (isOptionActive(opt)) {
            active[f.name] = opt.name
          }
        })
      })
      activeFilters.value = active
    }
    filterLoading.value = false
    window.scrollTo(0, 0)
  } catch (e) {
    console.error('目录加载失败:', e.message)
  } finally {
    loading.value = false
  }
}

function isOptionActive(opt) {
  // The filter item representing "all" that's active has no specific value in the URL
  // We check if the opt's segment (without page) matches the current segment, meaning this option is active
  const optSeg = segmentFromHref(opt.href)
  return optSeg === segment.value
}

onMounted(() => {
  goPage(1)
})
</script>

<style scoped>
.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.filter-row:last-child {
  border-bottom: none;
}

.filter-label {
  flex-shrink: 0;
  width: 52px;
  font-size: 0.8rem;
  color: #999;
  line-height: 28px;
}

.filter-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-tag {
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.filter-tag:hover {
  border-color: #ff5e95;
  color: #ff5e95;
}
.filter-tag.active {
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  color: #fff;
  border-color: transparent;
}

/* ===== 列表项 ===== */
.catalog-item {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.catalog-cover {
  flex-shrink: 0;
  width: 160px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
.catalog-cover img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
}

.catalog-status {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.catalog-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: stretch;
}

.catalog-title {
  font-size: 1rem;
  color: #333;
  margin-bottom: 6px;
}

.catalog-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 16px;
  margin-bottom: 6px;
}

.catalog-info-item {
  font-size: 0.75rem;
  color: #888;
}

.catalog-info-item span {
  color: #888;
}

.catalog-desc {
  font-size: 0.78rem;
  color: #aaa;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.catalog-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

@media (max-width: 767.98px) {
  .catalog-cover {
    width: 120px;
  }
}
</style>
