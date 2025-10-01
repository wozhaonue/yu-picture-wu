<template>
  <div id="spaceAnalysis">
    <a-row :gutter="[16, 16]">
      <a-col :span="12"
        ><SpaceOccupancy :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      /></a-col>
      <a-col :span="12">
        <SpaceCategory :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
    </a-row>
    <a-row :gutter="[16, 16]">
      <a-col :span="12"
        ><SpaceDifferentSize :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      /></a-col>
      <a-col :span="12">
        <!-- <SpaceTags :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic"
      /> -->
    </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import SpaceTags from '@/components/SpaceAnalysis/SpaceTags.vue'
import SpaceDifferentSize from '@/components/SpaceAnalysis/SpaceDifferentSize.vue'
import SpaceCategory from '@/components/SpaceAnalysis/SpaceCategory.vue'
import SpaceOccupancy from '@/components/SpaceAnalysis/SpaceOccupancy.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const spaceId = computed(() => {
  return route.query?.spaceId
})
const queryAll = computed(() => {
  return route.query?.queryAll
})
const queryPublic = computed(() => {
  return route.query?.queryPublic
})
</script>

<style scoped></style>
