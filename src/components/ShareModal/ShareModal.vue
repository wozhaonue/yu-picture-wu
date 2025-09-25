<template>
  <div class="share-modal">
    <a-modal v-model:visible="visible" :footer="false" title="分享图片" @cancel="closeModal">
      <a-typography-paragraph copyable>
        {{ prop.link }}
      </a-typography-paragraph>
      <br />
      <h4>手机扫码查看</h4>
      <a-qrcode :value="prop.link" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  title: string
  link: string
}
/**
 * 给组件指定初始值
 */
const prop = withDefaults(defineProps<Props>(), {
  title: '分享',
  link: () => 'https://antdv.com/components/qrcode-cn',
})
const visible = ref<boolean>(false)
/**
 * 打开弹窗
 */
const openModal = () => {
  visible.value = true
}
defineExpose({
  openModal,
})
/**
 * 关闭弹窗
 */
const closeModal = () => {
  visible.value = false
}
</script>

<style scoped></style>
