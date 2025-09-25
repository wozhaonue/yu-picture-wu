<template>
   <div class="batch-edit-picture">
    <a-modal v-model:visible="visible" title="批量处理" :footer="false" @cancel="closeModal">
     <a-alert
      message="提示"
      description="批量处理仅对当前页有效"
      type="info"
      show-icon
    />
    <br>
    <!-- 搜索表单 -->
  <a-form class="search-form" layout="vertical" :model="formData" @finish="doSubmit">
    <a-form-item label="分类" name="category">
      <a-auto-complete
        v-model:value="formData.category"
        style="min-width: 180px"
        :options="categoryOptions"
        placeholder="请输入分类"
        allowClear
      />
    </a-form-item>
    <a-form-item label="标签" name="tags">
      <a-select
        v-model:value="formData.tags"
        style="min-width: 180px"
        :options="tagsOptions"
        mode="tags"
        placeholder="请输入标签"
        allowClear
      />
    </a-form-item>
    <a-form-item label="命名规则" name="nameRule">
      <a-input
        v-model:value="formData.nameRule"
        placeholder="请输入命名规则，输入{序号}可动态生成"
        allowClear
      />
    </a-form-item>
    <a-form-item>
      <a-button style="width: 100%;" type="primary" html-type="submit" >提交</a-button>
    </a-form-item>
  </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { editPictureByBatchUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController';
import { message } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue'
interface Props {
  pictureList: API.PictureVO[]
  spaceId: string | number
  onSuccess: () => void
}
const formData = reactive({
  category: '',
  tags: [],
  nameRule: '',
})
/**
 * 给组件指定初始值
 */
const prop = withDefaults(defineProps<Props>(),{})
const visible = ref<boolean>(false)
interface Options {
  value: string
  label: string
}
const tagsOptions = ref<Options[]>([])
const categoryOptions = ref<Options[]>([])
/**
 * 获取分类和标签选项数据并赋值
 */
const getTagsAndCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  // 如果请求成功，则赋值给两个选项数据
  if (res.data.code === 0 && res.data.data) {
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    tagsOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  }
}
/**
 * 批量处理按钮
 */
const doSubmit = async(value:any) => {
  if(!prop.pictureList){
    closeModal();
    message.error('处理异常');
    return;
  }
  const res = await editPictureByBatchUsingPost({
    pictureIdList: prop.pictureList.map((item) => {return item.id}),
    spaceId: prop.spaceId,
    ...value,
  })
  if(res.data.data && res.data.code === 0){
    message.success('处理成功');
    closeModal();
    prop?.onSuccess?.();
  }else{
    closeModal();
    message.error('处理异常');
    console.error('批量处理图片异常',res.data.message);
  }
}
/**
 * 打开弹窗
 */
const openModal = () => {
  visible.value = true
  formData.category = ''
  formData.nameRule = ''
  formData.tags = []
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
onMounted(() => [
  getTagsAndCategoryOptions()
])
</script>

<style scoped>

</style>
