<script setup lang="ts">
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { FieldValidityData } from '../root/FieldRoot.vue'
import { computed } from 'vue'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { useFieldRootContext } from '../root/FieldRootContext'
import { getCombinedFieldValidityData } from '../utils/getCombinedFieldValidityData'

export interface FieldValidityState extends Omit<FieldValidityData, 'state'> {
  validity: FieldValidityData['state']
  transitionStatus: TransitionStatus
}

defineOptions({
  name: 'FieldValidity',
})

const { validityData, invalid } = useFieldRootContext(false)

const combinedFieldValidityData = computed(() =>
  getCombinedFieldValidityData(validityData.value, invalid.value),
)

const isInvalid = computed(() => combinedFieldValidityData.value.state.valid === false)
const { transitionStatus } = useTransitionStatus(isInvalid)

const fieldValidityState = computed<FieldValidityState>(() => ({
  ...combinedFieldValidityData.value,
  validity: combinedFieldValidityData.value.state,
  transitionStatus: transitionStatus.value,
}))
</script>

<template>
  <slot v-bind="fieldValidityState" />
</template>
