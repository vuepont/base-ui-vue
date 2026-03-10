<script setup lang="ts">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../../utils/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, onUnmounted, ref, useAttrs, watch } from 'vue'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { useFieldRootContext } from '../root/FieldRootContext'
import { fieldValidityMapping } from '../utils/constants'

defineOptions({
  name: 'FieldError',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldErrorProps>(), {
  as: 'div',
})

export interface FieldErrorState extends FieldRootState {
  transitionStatus: TransitionStatus
}

export interface FieldErrorProps extends BaseUIComponentProps<FieldErrorState> {
  /**
   * The `id` attribute of the error element.
   */
  id?: string
  /**
   * Determines whether to show the error message.
   * Can be `true` (always show), a `ValidityState` key, or unset
   * (show when field is invalid).
   */
  match?: boolean | keyof ValidityState
}

const stateAttributesMapping: StateAttributesMapping<FieldErrorState> = {
  ...fieldValidityMapping,
  ...transitionStatusMapping,
}

const attrs = useAttrs()

const id = useBaseUiId(props.id)

const { validityData, state: fieldState, name } = useFieldRootContext(false)
const { setMessageIds } = useLabelableContext()
const { errors } = useFormContext()

const formError = computed(() => {
  const n = name.value
  return n ? errors.value[n] ?? null : null
})

const rendered = computed(() => {
  if (formError.value || props.match === true) {
    return true
  }
  if (props.match) {
    return Boolean(validityData.value.state[props.match as keyof ValidityState])
  }
  return validityData.value.state.valid === false
})

const { mounted, transitionStatus, setMounted } = useTransitionStatus(rendered)

watch(
  () => ({ rendered: rendered.value, id }),
  ({ rendered: isRendered }) => {
    if (isRendered && id) {
      setMessageIds(ids => ids.concat(id))
    }
    else if (id) {
      setMessageIds(ids => ids.filter(item => item !== id))
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (id) {
    setMessageIds(ids => ids.filter(item => item !== id))
  }
})

const errorRef = ref<HTMLElement | null>(null)

const errorMessage = computed(() => {
  const fe = formError.value
  if (fe)
    return fe

  if (validityData.value.errors.length > 1) {
    return validityData.value.errors
  }
  return validityData.value.error
})

useOpenChangeComplete({
  open: rendered,
  ref: errorRef,
  onComplete() {
    if (!rendered.value) {
      setMounted(false)
    }
  },
})

const state = computed<FieldErrorState>(() => ({
  ...fieldState.value,
  transitionStatus: transitionStatus.value,
}))

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, stateAttributesMapping)
  return {
    ...attrs,
    id,
    ref: errorRef,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
  }
})
</script>

<template>
  <component :is="props.as" v-if="mounted" v-bind="mergedProps">
    <slot v-if="$slots.default" />
    <template v-else-if="Array.isArray(errorMessage)">
      <ul>
        <li v-for="message in errorMessage" :key="message">
          {{ message }}
        </li>
      </ul>
    </template>
    <template v-else>
      {{ errorMessage }}
    </template>
  </component>
</template>
