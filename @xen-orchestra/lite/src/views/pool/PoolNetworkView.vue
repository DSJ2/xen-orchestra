<template>
  <div class="pool-network-view">
    <UiCard class="container">
      <PoolNetworksTable />
      <PoolHostInternalNetworksTable />
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
import PoolHostInternalNetworksTable from '@/components/pool/network/PoolHostInternalNetworksTable.vue'
import PoolNetworksTable from '@/components/pool/network/PoolNetworksTable.vue'
import { usePageTitleStore } from '@/stores/page-title.store'
import UiCard from '@core/components/ui/card/UiCard.vue'
import { useI18n } from 'vue-i18n'

usePageTitleStore().setTitle(useI18n().t('network'))
</script>

<style lang="postcss" scoped>
.pool-network-view {
  .container {
    gap: 4rem;
    margin: 0.8rem;
  }
}
</style>
