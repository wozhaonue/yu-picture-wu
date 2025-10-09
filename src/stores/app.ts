import { defineStore } from "pinia";
import variable from '../styles/variable.module.scss'
import { computed, ref, watchEffect } from "vue";
import { theme } from "ant-design-vue";

export const useAppStore = defineStore('app',()=>{
  const themeName = ref('blue');
  const darkMode = ref('light');

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
      darkMode.value = darkMode.value === 'light' ? 'dark' : 'light';
      console.log('toggleDarkMode finished, new value:', darkMode.value)
    }
    return {themeName,darkMode,toggleDarkMode,setThemeName,themeConfig}
  },
)
