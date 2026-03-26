<script setup lang="ts">
import { CheckboxGroup, CheckboxIndicator, CheckboxRoot } from 'base-ui-vue'
import { ref, useId } from 'vue'

const id = useId()
const mainPermissions = ['view-dashboard', 'manage-users', 'access-reports']
const userManagementPermissions = ['create-user', 'edit-user', 'delete-user', 'assign-roles']

const mainValue = ref<string[]>([])
const managementValue = ref<string[]>([])

function handleMainValueChange(value: string[]) {
  if (value.includes('manage-users')) {
    managementValue.value = userManagementPermissions.slice()
  }
  else if (managementValue.value.length === userManagementPermissions.length) {
    managementValue.value = []
  }
  mainValue.value = value
}

function handleManagementValueChange(value: string[]) {
  if (value.length === userManagementPermissions.length) {
    mainValue.value = Array.from(new Set([...mainValue.value, 'manage-users']))
  }
  else {
    mainValue.value = mainValue.value.filter(v => v !== 'manage-users')
  }
  managementValue.value = value
}
</script>

<template>
  <CheckboxGroup
    :aria-labelledby="id"
    :all-values="mainPermissions"
    :value="mainValue"
    class="CheckboxGroup"
    style="margin-left: 1rem"
    @value-change="handleMainValueChange"
  >
    <label :id="id" class="Item ParentItem" style="margin-left: -1rem">
      <CheckboxRoot
        parent
        :indeterminate="managementValue.length > 0 && managementValue.length !== userManagementPermissions.length"
        class="Checkbox"
      >
        <CheckboxIndicator v-slot="{ state }" class="Indicator">
          <svg
            v-if="state.indeterminate"
            class="Icon"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            class="Icon"
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

    <label class="Item">
      <CheckboxRoot value="view-dashboard" class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      View Dashboard
    </label>

    <label class="Item">
      <CheckboxRoot value="access-reports" class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      Access Reports
    </label>

    <CheckboxGroup
      aria-labelledby="manage-users-caption"
      :all-values="userManagementPermissions"
      :value="managementValue"
      class="CheckboxGroup"
      style="margin-left: 1rem"
      @value-change="handleManagementValueChange"
    >
      <label id="manage-users-caption" class="Item ParentItem" style="margin-left: -1rem">
        <CheckboxRoot parent class="Checkbox">
          <CheckboxIndicator v-slot="{ state }" class="Indicator">
            <svg
              v-if="state.indeterminate"
              class="Icon"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <svg
              v-else
              class="Icon"
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
        Manage Users
      </label>

      <label class="Item">
        <CheckboxRoot value="create-user" class="Checkbox">
          <CheckboxIndicator class="Indicator">
            <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
              />
            </svg>
          </CheckboxIndicator>
        </CheckboxRoot>
        Create User
      </label>

      <label class="Item">
        <CheckboxRoot value="edit-user" class="Checkbox">
          <CheckboxIndicator class="Indicator">
            <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
              />
            </svg>
          </CheckboxIndicator>
        </CheckboxRoot>
        Edit User
      </label>

      <label class="Item">
        <CheckboxRoot value="delete-user" class="Checkbox">
          <CheckboxIndicator class="Indicator">
            <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
              />
            </svg>
          </CheckboxIndicator>
        </CheckboxRoot>
        Delete User
      </label>

      <label class="Item">
        <CheckboxRoot value="assign-roles" class="Checkbox">
          <CheckboxIndicator class="Indicator">
            <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
              />
            </svg>
          </CheckboxIndicator>
        </CheckboxRoot>
        Assign Roles
      </label>
    </CheckboxGroup>
  </CheckboxGroup>
</template>

<style src="./styles.css"></style>
