<template>
  <div class="picture-search-form">
  <!-- 搜索表单 -->
  <a-form class="search-form" layout="inline" :model="searchParams" @finish="doSearch">
    <a-form-item label="关键词" name="searchText">
      <a-input
        v-model:value="searchParams.searchText"
        placeholder="从名称和简介搜索"
        allow-clear
      />
    </a-form-item>
    <a-form-item label="分类" name="category">
      <a-auto-complete
        v-model:value="searchParams.category"
        style="min-width: 180px"
        :options="categoryOptions"
        placeholder="请输入分类"
        allowClear
      />
    </a-form-item>
    <a-form-item label="标签" name="tags">
      <a-select
        v-model:value="searchParams.tags"
        style="min-width: 180px"
        :options="tagsOptions"
        mode="tags"
        placeholder="请输入标签"
        allowClear
      />
    </a-form-item>
    <a-form-item label="日期" name="">
      <a-range-picker
        style="width: 400px"
        show-time
        v-model:value="dateRange"
        :placeholder="['编辑开始日期', '编辑结束时间']"
        format="YYYY/MM/DD HH:mm:ss"
        :presets="rangePresets"
        @change="onRangeChange"
      />
    </a-form-item>
    <a-form-item label="名称" name="name">
      <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
    </a-form-item>
    <a-form-item label="简介" name="introduction">
      <a-input v-model:value="searchParams.introduction" placeholder="请输入简介" allow-clear />
    </a-form-item>
    <a-form-item label="宽度" name="picWidth">
      <a-input-number v-model:value="searchParams.picWidth" />
    </a-form-item>
    <a-form-item label="高度" name="picHeight">
      <a-input-number v-model:value="searchParams.picHeight" />
    </a-form-item>
    <a-form-item label="格式" name="picFormat">
      <a-input v-model:value="searchParams.picFormat" placeholder="请输入格式" allow-clear />
    </a-form-item>
    <a-form-item>
      <a-space>
      <a-button type="primary" html-type="submit" >搜索</a-button>
      <a-button html-type="reset" type="primary" @click="doClear">重置</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</div>

</template>

<script setup lang="ts">
import { listPictureTagCategoryUsingGet } from '@/api/pictureController';
import dayjs from 'dayjs';
import { onMounted, reactive, ref } from 'vue';
interface Options {
  value: string
  label: string
}
const tagsOptions = ref<Options[]>([])
const categoryOptions = ref<Options[]>([])
const dateRange = ref<[]>([])
const rangePresets = ref([
  {label: '过去7天',value: [dayjs().add(-7,'d'),dayjs()]},
  {label: '过去14天',value: [dayjs().add(-14,'d'),dayjs()]},
  {label: '过去30天',value: [dayjs().add(-30,'d'),dayjs()]},
  {label: '过去90天',value: [dayjs().add(-90,'d'),dayjs()]},
])
const searchParams = reactive<API.PictureQueryRequest>({});
interface Props {
  onSearch: (searchParms: API.PictureQueryRequest) => void
}
const props = defineProps<Props>()

const doSearch = () => {
  props.onSearch(searchParams)
}
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
 * 当日期范围选择器变化时
 */
const onRangeChange = (dates:any[],dateStrings:string[]) => {
  if(dates.length < 2){
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }else{
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  }
}
// 重置按钮
const doClear = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  dateRange.value = []
  props?.onSearch?.(searchParams)
}
onMounted(() => {
  getTagsAndCategoryOptions()
})
</script>

<style lang="scss" scoped>
@import '../styles/variable.module.scss';
@import '../styles/mixins.scss';
.picture-search-form {
  .search-form {
    .ant-form-item {
      margin-bottom: $spacing-lg !important;
    }
  }
}
</style>
