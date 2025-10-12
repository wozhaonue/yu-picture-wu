import { defineStore } from "pinia";
import variable from '../styles/variable.module.scss'
import { computed, ref, watchEffect } from "vue";
import { theme } from "ant-design-vue";

export const useAppStore = defineStore('app',()=>{
  const themeName = ref('blue');
  const darkMode = ref('light');
  const isThemeTransitioning = ref(false);

  // 定时器引用，用于清理
  let themeTransitionTimer: NodeJS.Timeout | null = null;
  let animationEndTimer: NodeJS.Timeout | null = null;

  // 使用 watchEffect 处理 DOM 副作用
  watchEffect(() => {
    // console.log('watchEffect triggered, setting data-dark to:', darkMode.value)
    document.documentElement.setAttribute('data-dark', darkMode.value);
  });

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName.value);
  });

  const themeConfig = computed(() => {
    return {
      token: {
        colorPrimary: variable[themeName.value] || '#2f54eb',
        colorSuccess: '#1dc779',
          colorWarning: '#ffb302',
          colorError: '#cf4444',
          colorInfo: variable[themeName.value] || '#27ba9b',
          wireframe: true,
      },
      algorithm: darkMode.value === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm
    }
})
    const setThemeName = (value:string) => {
      themeName.value = value;
    }
    const toggleDarkMode = () => {
      console.log('toggleDarkMode called, current value:', darkMode.value)

      // 清理之前的定时器，防止重复点击造成的问题
      if (themeTransitionTimer) {
        clearTimeout(themeTransitionTimer);
        themeTransitionTimer = null;
      }
      if (animationEndTimer) {
        clearTimeout(animationEndTimer);
        animationEndTimer = null;
      }

      // 开始动画
      isThemeTransitioning.value = true;

      // 动画结束时切换主题，确保动画过程中页面样式不变
      themeTransitionTimer = setTimeout(() => {
        // 先切换主题
        darkMode.value = darkMode.value === 'light' ? 'dark' : 'light';
        console.log('toggleDarkMode finished, new value:', darkMode.value)

        // 立即结束动画状态
        animationEndTimer = setTimeout(() => {
          isThemeTransitioning.value = false;
          // 清理定时器引用
          themeTransitionTimer = null;
          animationEndTimer = null;
        }, 50); // 很短的延迟，让新主题样式生效
      }, 1400); // 在动画即将结束时切换主题（1.6秒动画的85%时间点）
    }

    return {themeName,darkMode,isThemeTransitioning,toggleDarkMode,setThemeName,themeConfig}
  },{persist: true}
)
