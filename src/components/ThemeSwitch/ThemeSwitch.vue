<template>
  <div class="theme-switch-container">
    <a-switch
      v-model:checked="isDayMode"
      class="theme-switch"
      :class="{ 'night-mode': !isDayMode }"
    >
      <template #checkedChildren>
        <div class="switch-content day-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" fill="#FFD700"/>
            <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </template>
      <template #unCheckedChildren>
        <div class="switch-content night-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 12.79A9 9 0 1 1 7.21 3 7 7 0 0 0 17 12.79Z" fill="#4A90E2"/>
            <circle cx="13" cy="8" r="0.8" fill="#FFF"/>
            <circle cx="15" cy="10.5" r="0.4" fill="#FFF"/>
            <circle cx="11" cy="9.5" r="0.4" fill="#FFF"/>
          </svg>
        </div>
      </template>
    </a-switch>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const isDayMode = computed({
  get: () => appStore.darkMode === 'light',
  set: (value: boolean) => {
    console.log('isDayMode setter called with:', value, 'current darkMode:', appStore.darkMode)
    // 直接根据开关状态设置对应的模式
    const targetMode = value ? 'light' : 'dark'
    if (appStore.darkMode !== targetMode) {
      console.log('Calling toggleDarkMode with animation')
      // 触发带动画的主题切换
      appStore.toggleDarkMode()
    }
  }
})
</script>

<style scoped lang="scss">
// .theme-switch-container {
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }

.theme-switch {
  position: relative;
  width: 60px !important;
  height: 30px !important;

  :deep(.ant-switch-inner) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  // 白天模式样式优化
  &.ant-switch-checked {
    background: linear-gradient(135deg, #87CEEB 0%, #FFD700 50%, #FFA500 100%) !important;
    border: 2px solid #FFD700 !important;

    :deep(.ant-switch-handle) {
      width: 24px !important;
      height: 24px !important;
      top: 1px !important;

      &::before {
        background: linear-gradient(135deg, #FFF 0%, #FFFACD 100%) !important;
        box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3) !important;
        border: 1px solid rgba(255, 215, 0, 0.2) !important;
        width: 22px !important;
        height: 22px !important;
      }
    }
  }

  // 黑夜模式样式优化
  &:not(.ant-switch-checked) {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
    border: 2px solid #4A90E2 !important;
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.3) !important;

    :deep(.ant-switch-handle) {
      width: 24px !important;
      height: 24px !important;
      top: 1px !important;

      &::before {
        background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%) !important;
        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(74, 144, 226, 0.3) !important;
        width: 22px !important;
        height: 22px !important;
      }
    }
  }

  // 悬停效果
  &:hover {
    &.ant-switch-checked {
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.5) !important;
    }

    &:not(.ant-switch-checked) {
      box-shadow: 0 0 15px rgba(74, 144, 226, 0.5) !important;
    }
  }

  // 过渡动画
  :deep(.ant-switch-handle) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
}

.switch-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  svg {
    transition: all 0.3s ease;
  }
}

.day-content {
  svg {
    filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
    animation: sunGlow 2s ease-in-out infinite alternate;
  }
}

.night-content {
  svg {
    filter: drop-shadow(0 0 4px rgba(74, 144, 226, 0.6));
    animation: moonGlow 3s ease-in-out infinite alternate;
  }
}

// 太阳发光动画
@keyframes sunGlow {
  0% {
    filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
  }
  100% {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
  }
}

// 月亮发光动画
@keyframes moonGlow {
  0% {
    filter: drop-shadow(0 0 4px rgba(74, 144, 226, 0.6));
  }
  100% {
    filter: drop-shadow(0 0 8px rgba(74, 144, 226, 0.8));
  }
}
</style>
