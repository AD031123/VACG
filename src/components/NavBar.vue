<template>
  <nav class="navbar navbar-light sticky-top mt-3" style="background: #F4F5F7;">
    <div class="d-flex w-100 align-items-center" style="padding-left: 1.5rem; padding-right: 1.5rem;">
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <span class="fw-bold" style="background: linear-gradient(65deg, #ff5e95, #3cc8f5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.4rem;">VACG</span>
      </router-link>

      <!-- 中/大屏：内联导航 + 搜索 -->
      <div class="desktop-nav">
        <ul class="nav-links">
          <li>
            <router-link to="/" class="nav-link-item" :class="{ active: $route.path === '/' }">首页</router-link>
          </li>
          <li>
            <router-link to="/catalog" class="nav-link-item" :class="{ active: $route.path === '/catalog' }">目录</router-link>
          </li>
          <li>
            <router-link to="/update" class="nav-link-item" :class="{ active: $route.path === '/update' }">一周更新</router-link>
          </li>
          <li>
            <router-link to="/rank" class="nav-link-item" :class="{ active: $route.path === '/rank' }">排行榜</router-link>
          </li>
        </ul>

        <div class="desktop-search-wrapper" :class="{ expanded: showSearch }">
          <input
            ref="desktopSearchInput"
            v-model="keyword"
            class="desktop-search-input"
            type="text"
            placeholder="搜索..."
            @keyup.enter="doSearch"
          />
          <button class="desktop-search-btn" @click="onSearchClick">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>

      <!-- 小屏：弹窗触发按钮 -->
      <button class="mobile-trigger" @click="popupOpen = true" aria-label="导航和搜索">
        <i class="bi bi-list"></i>
      </button>
    </div>
  </nav>

  <!-- 小屏弹窗（仅小屏可见） -->
  <Teleport to="body">
    <div class="nav-popup-overlay" :class="{ open: popupOpen }" @click.self="closePopup">
      <div class="nav-popup-panel" :class="{ open: popupOpen }">
        <button class="nav-popup-close" @click="closePopup">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="nav-popup-search">
          <input
            ref="popupSearchInput"
            v-model="keyword"
            type="text"
            placeholder="搜索番剧..."
            @keyup.enter="doSearch"
          />
          <button class="search-submit-btn" @click="doSearch">
            <i class="bi bi-search"></i>
          </button>
        </div>

        <div class="nav-popup-links">
          <router-link to="/" class="nav-popup-link" :class="{ active: $route.path === '/' }" @click="closePopup">
            <i class="bi bi-house-fill"></i>
            <span>首页</span>
          </router-link>
          <router-link to="/catalog" class="nav-popup-link" :class="{ active: $route.path === '/catalog' }" @click="closePopup">
            <i class="bi bi-grid-3x3-gap-fill"></i>
            <span>目录</span>
          </router-link>
          <router-link to="/update" class="nav-popup-link" :class="{ active: $route.path === '/update' }" @click="closePopup">
            <i class="bi bi-calendar-week-fill"></i>
            <span>一周更新</span>
          </router-link>
          <router-link to="/rank" class="nav-popup-link" :class="{ active: $route.path === '/rank' }" @click="closePopup">
            <i class="bi bi-trophy-fill"></i>
            <span>排行榜</span>
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const showSearch = ref(false)
const popupOpen = ref(false)
const desktopSearchInput = ref(null)
const popupSearchInput = ref(null)

watch(popupOpen, (val) => {
  if (val) {
    nextTick(() => popupSearchInput.value?.focus())
  }
})

function closePopup() {
  popupOpen.value = false
  keyword.value = ''
}

function onSearchClick() {
  if (!showSearch.value) {
    showSearch.value = true
    nextTick(() => desktopSearchInput.value?.focus())
  } else {
    doSearch()
  }
}

function doSearch() {
  if (keyword.value.trim()) {
    router.push({ path: '/search', query: { q: keyword.value.trim() } })
    keyword.value = ''
  }
  showSearch.value = false
  popupOpen.value = false
}
</script>

<style scoped>
/* ==================== 中/大屏导航 ==================== */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 0;
  margin-left: auto;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}

.nav-link-item {
  display: block;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-link-item:hover {
  color: #ff5e95;
  background: rgba(255, 94, 149, 0.06);
}
.nav-link-item.active {
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}

/* 桌面搜索 */
.desktop-search-wrapper {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.desktop-search-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #888;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  flex-shrink: 0;
}
.desktop-search-btn:hover {
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.desktop-search-input {
  width: 0;
  padding: 0;
  border: none;
  border-bottom: 2px solid transparent;
  outline: none;
  background: transparent;
  color: #333;
  font-size: 0.9rem;
  transition: all 0.35s ease;
  opacity: 0;
}

.desktop-search-wrapper.expanded .desktop-search-input {
  width: 160px;
  padding: 2px 4px;
  border-bottom-color: #ddd;
  opacity: 1;
}
.desktop-search-wrapper.expanded .desktop-search-input:focus {
  border-bottom-color: transparent;
  border-image: linear-gradient(65deg, #ff5e95, #3cc8f5) 1;
}

.desktop-search-wrapper.expanded .desktop-search-btn {
  border-radius: 0;
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ==================== 小屏弹窗触发按钮 ==================== */
.mobile-trigger {
  display: flex;
  margin-left: auto;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}
.mobile-trigger:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #ff5e95;
}

/* ==================== 响应式 ==================== */
/* ≥992px：显示桌面导航，隐藏小屏触发按钮 */
@media (min-width: 992px) {
  .desktop-nav {
    display: flex;
  }
  .mobile-trigger {
    display: none;
  }
  .nav-popup-overlay {
    display: none;
  }
}

/* <992px：隐藏桌面导航，显示小屏触发按钮 */
@media (max-width: 991.98px) {
  .desktop-nav {
    display: none;
  }
  .mobile-trigger {
    display: flex;
  }
}

/* ==================== 弹窗（小屏专用） ==================== */
.nav-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 10500;
  background: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  transition: background 0.35s ease;
}
.nav-popup-overlay.open {
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.nav-popup-panel {
  position: relative;
  width: 340px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.15);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}
.nav-popup-panel.open {
  transform: translateX(0);
}

.nav-popup-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.nav-popup-close:hover {
  background: #f0f0f0;
  color: #333;
}

.nav-popup-search {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 20px;
  border: 2px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.nav-popup-search:focus-within {
  border-color: transparent;
  border-image: linear-gradient(65deg, #ff5e95, #3cc8f5) 1;
}
.nav-popup-search input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: #333;
  background: transparent;
}
.nav-popup-search input::placeholder {
  color: #bbb;
}
.search-submit-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}
.search-submit-btn:hover {
  opacity: 0.85;
}

.nav-popup-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-popup-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #444;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-popup-link:hover {
  background: #f8f8f8;
  color: #ff5e95;
}
.nav-popup-link i {
  font-size: 1.3rem;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.nav-popup-link.active {
  background: linear-gradient(65deg, rgba(255, 94, 149, 0.08), rgba(60, 200, 245, 0.08));
  color: #ff5e95;
}
.nav-popup-link.active i {
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
