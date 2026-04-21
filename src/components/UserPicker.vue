<template>
  <div class="user-picker">
    <div class="assigned-list">
      <div
        v-for="userId in modelValue"
        :key="userId"
        class="user-chip"
        :style="{ background: usersStore.getColor(userId) + '22', borderColor: usersStore.getColor(userId) + '55' }"
      >
        <span class="user-avatar-sm" :style="{ background: usersStore.getColor(userId) }">
          {{ usersStore.getAvatar(userId) }}
        </span>
        <span class="user-chip-name">{{ usersStore.getById(userId)?.name || 'Unknown' }}</span>
        <button class="chip-remove" @click="remove(userId)" :disabled="modelValue.length === 1 && required">✕</button>
      </div>
      <button :ref="target" class="add-user-btn" @click="open = !open" v-if="unassignedUsers.length">
        + Assign
      </button>
      <span>{{open}}</span>
    </div>

    <!-- Dropdown -->
    <Transition name="fade">
      <div v-if="open" class="user-dropdown" @click.stop>
        <div
          v-for="user in unassignedUsers"
          :key="user.id"
          class="user-option"
          @click="add(user.id)"
        >
          <span class="user-avatar-sm" :style="{ background: user.color }">{{ user.name[0].toUpperCase() }}</span>
          <div class="user-option-info">
            <span class="user-option-name">{{ user.name }}</span>
            <span v-if="user.email" class="user-option-email text-xs text-muted">{{ user.email }}</span>
          </div>
        </div>
        <div v-if="!unassignedUsers.length" class="user-option-empty text-xs text-muted">
          All users assigned
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { useUsersStore } from '@/stores/users'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  required: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const usersStore = useUsersStore()
const open = ref(false)
const target = useTemplateRef('target')

const unassignedUsers = computed(() =>
  usersStore.allUsers.filter(u => !props.modelValue.includes(u.id))
)

function add(userId) {
  emit('update:modelValue', [...props.modelValue, userId])
  open.value = false
}

function remove(userId) {
  if (props.required && props.modelValue.length <= 1) return
  emit('update:modelValue', props.modelValue.filter(id => id !== userId))
}

// Close dropdown on outside click
onClickOutside(target, _ => open.value = false);
</script>

<style scoped>
.user-picker { position: relative; }

.assigned-list { display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; }

.user-chip {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.2rem 0.5rem 0.2rem 0.25rem;
  border: 1px solid; border-radius: 999px;
  font-size: 0.8rem;
}
.user-avatar-sm {
  width: 20px; height: 20px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700; color: white;
  flex-shrink: 0;
}
.user-chip-name { font-weight: 500; color: var(--color-text); }
.chip-remove {
  font-size: 0.65rem; color: var(--color-text-muted); cursor: pointer;
  line-height: 1; padding: 0; border: none; background: none;
  transition: color var(--transition);
}
.chip-remove:hover { color: var(--color-danger); }
.chip-remove:disabled { opacity: 0.3; cursor: not-allowed; }

.add-user-btn {
  font-size: 0.8rem; font-weight: 500; color: var(--color-accent);
  border: 1px dashed var(--color-accent); border-radius: 999px;
  padding: 0.2rem 0.625rem; cursor: pointer;
  background: none; transition: all var(--transition);
}
.add-user-btn:hover { background: var(--color-accent-light); }

.user-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-md);
  min-width: 200px; max-height: 220px; overflow-y: auto;
  z-index: 200; padding: 0.375rem;
}
.user-option {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.625rem; border-radius: var(--radius-sm);
  cursor: pointer; transition: background var(--transition);
}
.user-option:hover { background: var(--color-surface-2); }
.user-option-info { display: flex; flex-direction: column; }
.user-option-name { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
.user-option-email { color: var(--color-text-muted); }
.user-option-empty { padding: 0.5rem 0.625rem; }
</style>