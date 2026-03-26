<script setup lang="ts">
import { CheckboxGroup, CheckboxIndicator, CheckboxRoot } from 'base-ui-vue'
import { ref, useId } from 'vue'

const rootLabelId = useId()
const nestedLabelId = useId()
const mainPermissions = ['view-dashboard', 'manage-users', 'access-reports']
const userManagementPermissions = ['create-user', 'edit-user', 'delete-user', 'assign-roles']

const mainValue = ref<string[]>([])
const managementValue = ref<string[]>([])

function syncMainValue(nextValue: string[]) {
  if (nextValue.includes('manage-users')) {
    managementValue.value = userManagementPermissions.slice()
  }
  else if (managementValue.value.length === userManagementPermissions.length) {
    managementValue.value = []
  }

  mainValue.value = nextValue
}

function syncManagementValue(nextValue: string[]) {
  if (nextValue.length === userManagementPermissions.length) {
    mainValue.value = Array.from(new Set([...mainValue.value, 'manage-users']))
  }
  else {
    mainValue.value = mainValue.value.filter(value => value !== 'manage-users')
  }

  managementValue.value = nextValue
}
</script>

<template>
  <CheckboxGroup
    :aria-labelledby="rootLabelId"
    :all-values="mainPermissions"
    :value="mainValue"
    class="CheckboxGroup"
    @value-change="syncMainValue"
  >
    <label :id="rootLabelId" class="Item ParentItem">
      <CheckboxRoot
        parent
        class="Checkbox"
        :indeterminate="managementValue.length > 0 && managementValue.length !== userManagementPermissions.length"
      >
        <CheckboxIndicator class="Indicator">
          <span class="Dot" />
        </CheckboxIndicator>
      </CheckboxRoot>
      User Permissions
    </label>

    <label class="Item">
      <CheckboxRoot value="view-dashboard" class="Checkbox">
        <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
      </CheckboxRoot>
      View Dashboard
    </label>

    <label class="Item">
      <CheckboxRoot value="access-reports" class="Checkbox">
        <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
      </CheckboxRoot>
      Access Reports
    </label>

    <CheckboxGroup
      :aria-labelledby="nestedLabelId"
      :all-values="userManagementPermissions"
      :value="managementValue"
      class="CheckboxGroup NestedGroup"
      @value-change="syncManagementValue"
    >
      <label :id="nestedLabelId" class="Item ParentItem">
        <CheckboxRoot parent class="Checkbox">
          <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
        </CheckboxRoot>
        Manage Users
      </label>

      <label class="Item">
        <CheckboxRoot value="create-user" class="Checkbox">
          <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
        </CheckboxRoot>
        Create User
      </label>

      <label class="Item">
        <CheckboxRoot value="edit-user" class="Checkbox">
          <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
        </CheckboxRoot>
        Edit User
      </label>

      <label class="Item">
        <CheckboxRoot value="delete-user" class="Checkbox">
          <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
        </CheckboxRoot>
        Delete User
      </label>

      <label class="Item">
        <CheckboxRoot value="assign-roles" class="Checkbox">
          <CheckboxIndicator class="Indicator"><span class="Dot" /></CheckboxIndicator>
        </CheckboxRoot>
        Assign Roles
      </label>
    </CheckboxGroup>
  </CheckboxGroup>
</template>

<style src="./styles.css"></style>
