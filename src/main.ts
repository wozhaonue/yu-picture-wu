import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import { message } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css';
import '@/access';
import App from './App.vue';
import router from './router';
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'
// 之前的npm版本为10.8.2
const app = createApp(App);

app.use(VueCropper);
app.use(createPinia());
app.use(router);
app.use(Antd);

// 全局配置消息提示，避免被导航条遮挡
message.config({
  top: '80',            // 数值像素，避免字符串不生效
  duration: 2,        // 默认显示时长
  maxCount: 3,        // 最大同时显示条数
  getContainer: () => document.body // 明确渲染到 body，避免局部层叠上下文影响
})

app.mount('#app');
