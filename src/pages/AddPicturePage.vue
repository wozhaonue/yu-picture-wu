<template>
  <div id="add-picture-page">
    <h2 style="margin-bottom: 16px; text-align: left">
      {{ route?.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <PictureUpload :picture="picture" :onSuccess="onSuccess" />
    <a-form
      v-if="picture"
      layout="vertical"
      :model="pictureForm"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item label="图片名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入图片名称" />
      </a-form-item>

      <a-form-item label="简介" name="introduction">
        <a-textarea
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          allowClear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          mode="tags"
          v-model:value="pictureForm.tags"
          placeholder="请输入标签"
          :options="tagsOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button class="submit-button" type="primary" html-type="submit">
          {{ route?.query?.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import PictureUpload from '@/components/PictureUplo​ad.vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const pictureForm = reactive<API.PictureEditRequest>({} as API.PictureEditRequest)
const picture = ref<API.PictureVO>()
interface Options {
  value: string
  label: string
}
const tagsOptions = ref<Options[]>([])
const categoryOptions = ref<Options[]>([])

/**
 * 上传成功回调
 * @param newPicture 新上传的图片
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 修改图片信息
 * @param value 图片表单信息
 */
const handleSubmit = async (value: API.PictureEditRequest) => {
  // 首先判断是否存在picture。id，因为不存在，则代表是新建图片，无法修改
  if (!picture.value) {
    message.error('图片不存在，无法创建')
    return
  }
  // 调用修改请求，然后赋值给表单model的数据
  const res = await editPictureUsingPost({
    id: picture.value.id,
    ...value,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    router.push('/picture/${picture.value.id}')
  } else {
    message.error('创建失败')
    console.error(res.data.message)
  }
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
 * 获取老图片信息
 */
const getOldPicture = async () => {
  if (route.query?.id) {
    // 获取id参数并转换为number类型，符合后端请求参数需求
    const id = route.query.id as string
    const numberid = Number(id)
    console.log(numberid)

    // 如果不是有效数字，则进行返回
    if (isNaN(numberid)) {
      message.error('参数错误')
      return
    } else {
      const res = await getPictureVoByIdUsingGet({
        id: id,
      })
      // 如果请求成功，则进行赋值
      if (res.data.code === 0 && res.data.data) {
        message.success('获取成功')
        const data = res.data.data
        picture.value = data
        pictureForm.name = data.name
        pictureForm.introduction = data.introduction
        pictureForm.category = data.category
        pictureForm.tags = data.tags
      } else {
        message.error('获取失败')
        console.error(res.data.message)
      }
    }
  }
}
onMounted(() => {
  getTagsAndCategoryOptions() // 在组件挂载时获取分类和标签选项数据
  getOldPicture() // 在组件挂载时获取老图片信息
})
</script>

<style scoped>
#add-picture-page {
  max-width: 800px;
  margin: 0 auto;
}
#add-picture-page .submit-button {
  width: 100%;
}
</style>
