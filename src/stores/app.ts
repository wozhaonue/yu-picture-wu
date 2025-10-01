import { defineStore } from "pinia";
import variable from '../styles/variable.module.scss'
import { computed, ref } from "vue";
import { theme } from "ant-design-vue";

export const useAppStore = defineStore('app',()=>{
  const themeName = ref('cyan');
  const darkMode = ref('light');
  const darkModeComp = computed(() => {
    document.documentElement.setAttribute('data-dark',darkMode.value);
    return darkMode.value;
  })
  const themeConfig = computed(() => {
    document.documentElement.setAttribute('data-theme',themeName.value);
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
      darkMode.value = darkMode.value === 'light' ? 'dark' : 'light';
    }
    return {themeName,darkMode,toggleDarkMode,setThemeName,themeConfig,darkModeComp}
  },{persist: true},
)
