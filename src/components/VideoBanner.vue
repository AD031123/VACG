<template>
  <div class="video-banner">
    <video
      ref="videoRef"
      class="banner-video"
      src="/fufu.mp4"
      autoplay
      muted
      loop
      playsinline
      preload="auto">
    </video>

    <!-- 遮罩 -->
    <div class="banner-overlay"></div>

    <!-- 动态 Logo -->
    <div class="banner-logo">
      <span class="logo-char" v-for="(ch, i) in logoChars" :key="i"
        :style="{ animationDelay: `${i * 0.08}s` }">
        {{ ch }}
      </span>
      <div class="logo-subtitle">ANIME · DISCOVER · ENJOY</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const logoChars = ['V', 'A', 'C', 'G']
const videoRef = ref(null)

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      document.addEventListener('click', () => {
        videoRef.value?.play()
      }, { once: true })
    })
  }
})
</script>

<style scoped>
.video-banner {
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 0 32%;
  z-index: 0;
}

/* 暗色遮罩让 Logo 更突出 */
.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* ===== 动态 Logo ===== */
.banner-logo {
  position: relative;
  z-index: 2;
  text-align: center;
  user-select: none;
}

.logo-char {
  display: inline-block;
  font-size: 5rem;
  font-weight: 900;
  letter-spacing: 6px;
  background: linear-gradient(65deg, #ff5e95, #3cc8f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 18px rgba(255, 94, 149, 0.6)) drop-shadow(0 0 30px rgba(60, 200, 245, 0.4));
  animation: logoFloat 2.5s ease-in-out infinite, logoGlow 2s ease-in-out infinite alternate;
}

.logo-char:nth-child(2) { animation-delay: 0.12s; }
.logo-char:nth-child(3) { animation-delay: 0.24s; }
.logo-char:nth-child(4) { animation-delay: 0.36s; }

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes logoGlow {
  0% {
    filter: drop-shadow(0 0 12px rgba(255, 94, 149, 0.5)) drop-shadow(0 0 20px rgba(60, 200, 245, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 24px rgba(255, 94, 149, 0.8)) drop-shadow(0 0 40px rgba(60, 200, 245, 0.6));
  }
}

.logo-subtitle {
  font-size: 0.85rem;
  letter-spacing: 6px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
