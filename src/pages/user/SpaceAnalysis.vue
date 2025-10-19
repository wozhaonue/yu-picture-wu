<template>
  <div id="spaceAnalysis">
    <h2 style="text-align: center">
      空间图库分析 -
      <span v-if="queryAll">全部空间</span>
      <span v-else-if="queryPublic">公共图库</span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">id: {{ spaceId }}</a>
      </span>
    </h2>
    <a-row :gutter="[16, 16]">
      <a-col :span="12"
        >
        <SpaceOccupancyAdmin v-if="isAdmin && spaceId === undefined" :isAdmin="isAdmin" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      />
        <SpaceOccupancy v-else :isAdmin="isAdmin" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      /></a-col>
      <a-col :span="12">
        <SpaceCategory :isAdmin="isAdmin" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
    </a-row>
    <a-row :gutter="[16, 16]">
      <a-col :span="12"
        ><SpaceDifferentSize :isAdmin="isAdmin" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      /></a-col>
      <a-col :span="12">
        <SpaceTags :isAdmin="isAdmin" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
    </a-row>
    <a-row :gutter="[16, 16]">
      <a-col :span="12"
        ><SpaceUserUpload :isAdmin="isAdmin" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      /></a-col>
      <a-col :span="12">
        <SpaceUsingRank :isAdmin="isAdmin" v-if="isAdmin && (queryAll || queryPublic)" :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import SpaceOccupancyAdmin from '@/components/SpaceAnalysis/SpaceOccupancyAdmin.vue'
import SpaceUsingRank from '@/components/SpaceAnalysis/SpaceUsingRank.vue'
import SpaceUserUpload from '@/components/SpaceAnalysis/SpaceUserUpload.vue'
import SpaceTags from '@/components/SpaceAnalysis/SpaceTags.vue'
import SpaceDifferentSize from '@/components/SpaceAnalysis/SpaceDifferentSize.vue'
import SpaceCategory from '@/components/SpaceAnalysis/SpaceCategory.vue'
import SpaceOccupancy from '@/components/SpaceAnalysis/SpaceOccupancy.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLoginUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore();
console.log(appStore.darkMode);

// 定义是否为管理员的变量
const userStore = useLoginUserStore()
const userData = computed(() => userStore.loginUser)
const isAdmin = computed(() => (userData.value.userRole === 'admin' ? true : false))
const route = useRoute()
const spaceId = computed(() => {
  return route.query?.spaceId as string
})
const queryAll = computed(() => {
  return route.query?.queryAll === 'true' ? true : false
})
const queryPublic = computed(() => {
  return route.query?.queryPublic === 'true' ? true : false
})
</script>

<style scoped></style>
