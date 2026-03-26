<script setup lang="ts">
import { CheckboxGroup, CheckboxIndicator, CheckboxRoot } from 'base-ui-vue'
import { computed, ref, useId } from 'vue'

const rootLabelId = useId()
const nestedLabelId = useId()

const permissions = [
  { id: 'view-dashboard', label: 'View Dashboard' },
  {
    id: 'manage-users',
    label: 'Manage Users',
    children: [
      { id: 'create-user', label: 'Create User' },
      { id: 'edit-user', label: 'Edit User' },
      { id: 'delete-user', label: 'Delete User' },
      { id: 'assign-roles', label: 'Assign Roles' },
    ],
  },
  { id: 'access-reports', label: 'Access Reports' },
] as const

const manageUsersOption = permissions.find(option => option.id === 'manage-users' && 'children' in option)!
const standalonePermissions = permissions.filter(option => !('children' in option))
const mainPermissions = computed(() => permissions.map(option => option.id))
const userManagementPermissions = computed(() => manageUsersOption.children.map(option => option.id))

const mainValue = ref<string[]>([])
const managementValue = ref<string[]>([])

function syncMainValue(nextValue: string[]) {
  if (nextValue.includes(manageUsersOption.id)) {
    managementValue.value = userManagementPermissions.value.slice()
  }
  else if (managementValue.value.length === userManagementPermissions.value.length) {
    managementValue.value = []
  }

  mainValue.value = nextValue
}

function syncManagementValue(nextValue: string[]) {
  if (nextValue.length === userManagementPermissions.value.length) {
    mainValue.value = Array.from(new Set([...mainValue.value, manageUsersOption.id]))
  }
  else {
    mainValue.value = mainValue.value.filter(value => value !== manageUsersOption.id)
  }

  managementValue.value = nextValue
}
</script>

<template>
  <CheckboxGroup
    :aria-labelledby="rootLabelId"
    :all-values="mainPermissions"
    :value="mainValue"
    class="ml-4 flex flex-col items-start gap-1 text-gray-900"
    @value-change="syncMainValue"
  >
    <label :id="rootLabelId" class="-ml-4 flex items-center gap-2 font-normal">
      <CheckboxRoot
        parent
        :indeterminate="managementValue.length > 0 && managementValue.length !== userManagementPermissions.length"
        class="flex size-5 items-center justify-center rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 data-[indeterminate]:border data-[indeterminate]:border-gray-300 data-[indeterminate]:bg-[canvas]"
      >
        <CheckboxIndicator v-slot="{ state }" class="flex text-gray-50 data-[unchecked]:hidden data-[indeterminate]:text-gray-900">
          <svg
            v-if="state.indeterminate"
            class="size-3"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            class="size-3"
            fill="currentColor"
            width="10"
            height="10"
            viewBox="0 0 10 10"
          >
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      User Permissions
    </label>

    <label
      v-for="option in standalonePermissions"
      :key="option.id"
      class="flex items-center gap-2 font-normal"
    >
      <CheckboxRoot
        :value="option.id"
        class="flex size-5 items-center justify-center rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
      >
        <CheckboxIndicator class="flex text-gray-50 data-[unchecked]:hidden">
          <svg class="size-3" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      {{ option.label }}
    </label>

    <CheckboxGroup
      :aria-labelledby="nestedLabelId"
      :all-values="userManagementPermissions"
      :value="managementValue"
      class="ml-4 flex flex-col items-start gap-1 text-gray-900"
      @value-change="syncManagementValue"
    >
      <label :id="nestedLabelId" class="-ml-4 flex items-center gap-2 font-normal">
        <CheckboxRoot
          parent
          class="flex size-5 items-center justify-center rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300 data-[indeterminate]:border data-[indeterminate]:border-gray-300 data-[indeterminate]:bg-[canvas]"
        >
          <CheckboxIndicator v-slot="{ state }" class="flex text-gray-50 data-[unchecked]:hidden data-[indeterminate]:text-gray-900">
            <svg
              v-if="state.indeterminate"
              class="size-3"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <svg
              v-else
              class="size-3"
              fill="currentColor"
              width="10"
              height="10"
              viewBox="0 0 10 10"
            >
              <path
                d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
              />
            </svg>
          </CheckboxIndicator>
        </CheckboxRoot>
        {{ manageUsersOption.label }}
      </label>

      <label
        v-for="option in manageUsersOption.children"
        :key="option.id"
        class="flex items-center gap-2 font-normal"
      >
        <CheckboxRoot
          :value="option.id"
          class="flex size-5 items-center justify-center rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
        >
          <CheckboxIndicator class="flex text-gray-50 data-[unchecked]:hidden">
            <svg class="size-3" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
              />
            </svg>
          </CheckboxIndicator>
        </CheckboxRoot>
        {{ option.label }}
      </label>
    </CheckboxGroup>
  </CheckboxGroup>
</template>
