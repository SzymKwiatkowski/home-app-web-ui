<template>
  <div class="emoji-picker-wrap">
    <!-- Trigger button — shows current icon or placeholder -->
    <button :ref="target" type="button" class="emoji-trigger" @click="toggle">
      <span v-if="modelValue" class="emoji-trigger-icon">{{ modelValue }}</span>
      <span v-else class="emoji-trigger-placeholder">+</span>
      <span class="emoji-trigger-caret">▾</span>
    </button>

    <!-- Picker dropdown -->
    <Transition name="fade">
      <div v-if="open" class="emoji-dropdown" @click.stop>

        <!-- Search / custom input -->
        <div class="emoji-search-row">
          <input
            ref="searchRef"
            v-model="query"
            class="emoji-search"
            placeholder="Search or paste any emoji…"
            @input="onQuery"
          />
          <button
            v-if="query && isEmoji(query.trim())"
            type="button"
            class="emoji-use-custom btn btn-accent btn-sm"
            @click="selectEmoji(query.trim())"
          >
            Use {{ query.trim() }}
          </button>
        </div>

        <!-- Category tabs -->
        <div class="emoji-cats" v-if="!query">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="emoji-cat-btn"
            :class="{ active: activeCat === cat.id }"
            @click="activeCat = cat.id"
            :title="cat.label"
          >{{ cat.icon }}</button>
        </div>

        <!-- Grid -->
        <div class="emoji-grid-wrap">
          <div class="emoji-cat-label text-xs text-muted" v-if="!query">
            {{ currentCatLabel }}
          </div>
          <div class="emoji-grid">
            <button
              v-for="em in displayedEmojis"
              :key="em"
              type="button"
              class="emoji-cell"
              :class="{ selected: modelValue === em }"
              @click="selectEmoji(em)"
              :title="em"
            >{{ em }}</button>
            <div v-if="!displayedEmojis.length" class="emoji-empty text-xs text-muted">
              No matches. Paste a custom emoji above.
            </div>
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const searchRef = ref(null)
const activeCat = ref('common')
const target = useTemplateRef('target')

// ── Emoji data ────────────────────────────────────────────────────
const categories = [
  { id: 'common',  icon: '⭐', label: 'Common' },
  { id: 'food',    icon: '🍔', label: 'Food & Drink' },
  { id: 'travel',  icon: '🚗', label: 'Travel & Places' },
  { id: 'money',   icon: '💰', label: 'Money & Finance' },
  { id: 'health',  icon: '💊', label: 'Health' },
  { id: 'home',    icon: '🏠', label: 'Home & Living' },
  { id: 'fun',     icon: '🎮', label: 'Fun & Activities' },
  { id: 'nature',  icon: '🌿', label: 'Nature' },
  { id: 'symbols', icon: '✅', label: 'Symbols' },
]

const EMOJI_MAP = {
  common: [
    '⭐','❤️','✅','❌','🔔','📌','📍','🏷️','🔑','🎯',
    '📊','📈','📉','💡','🔧','🗂️','📁','📋','🗓️','⏰',
    '🌟','💎','🏆','🎁','🔒','🔓','📱','💻','🖥️','⚡',
  ],
  food: [
    '🍔','🍕','🍣','🍜','🍱','🥗','🍰','🧁','☕','🍺',
    '🥤','🍷','🍸','🥂','🍾','🧃','🥛','🍵','🧇','🥞',
    '🌮','🌯','🥙','🍟','🌭','🥪','🧆','🥚','🍳','🥘',
    '🍝','🍛','🍲','🥣','🥗','🫕','🧋','🍫','🍬','🍭',
  ],
  travel: [
    '🚗','✈️','🚂','🚢','🛵','🚌','🏠','🏢','🏨','🏪',
    '⛽','🅿️','🛣️','🗺️','🧳','🎒','⛺','🏖️','🏔️','🌍',
    '🚕','🚙','🛻','🚐','🚑','🚒','🛺','🚲','🛴','🛷',
  ],
  money: [
    '💰','💵','💴','💶','💷','💳','🪙','💸','🏦','📊',
    '💹','📈','📉','🤑','💼','🧾','💱','⚖️','🏧','💲',
    '📦','🛒','🛍️','🏷️','🧮','📑','✏️','🖊️','📝','🗃️',
  ],
  health: [
    '💊','🏥','🩺','🩹','💉','🧬','🦷','👁️','💪','🧘',
    '🏃','🚴','🏋️','⚽','🏊','🧗','🤸','🛁','🧴','🧼',
    '🩻','🩺','🏋️','🥊','🤼','🏄','⛷️','🎿','🏇','🧪',
  ],
  home: [
    '🏠','🛋️','🛏️','🚪','🪟','🧹','🧺','🔌','💡','🚿',
    '🛁','🧴','🪒','🧻','🔑','🪴','🕯️','🪣','🧯','🔧',
    '🏡','🌿','🌱','🌺','🐕','🐈','🐠','🪴','🎋','🪵',
  ],
  fun: [
    '🎮','🎲','🎸','🎹','🎬','🎭','🎨','📸','🎪','🎡',
    '🎢','🎠','🎯','🎱','♟️','🎳','🏓','🏸','🎻','🥁',
    '🎤','🎧','🎷','🪗','🎺','🎻','🎼','🎵','🎶','🎙️',
  ],
  nature: [
    '🌿','🌸','🌳','🌻','🍀','🌊','⛅','🌙','☀️','❄️',
    '🌈','⚡','🌋','🏔️','🦁','🐘','🦋','🐬','🦜','🌺',
    '🍃','🌾','🍁','🍂','🌵','🎄','🌴','🪨','🌏','🌿',
  ],
  symbols: [
    '✅','❌','⚠️','ℹ️','🔴','🟡','🟢','🔵','🟣','⚫',
    '⭕','❓','❗','💯','🔝','🆕','🆒','🆓','🔁','🔀',
    '➕','➖','✖️','➗','💠','🔷','🔶','🔸','🔹','🔺',
  ],
}

// All emojis flat for search
const allEmojis = Object.values(EMOJI_MAP).flat()

const currentCatLabel = computed(() => categories.find(c => c.id === activeCat.value)?.label || '')

const displayedEmojis = computed(() => {
  if (query.value.trim()) {
    // Simple unicode search — filter emojis that contain the query (after stripping spaces)
    // Also show emojis that are emoji themselves (direct match)
    const q = query.value.trim()
    if (isEmoji(q)) return []          // handled by "Use custom" button
    return allEmojis.filter(e => e.includes(q))
  }
  return EMOJI_MAP[activeCat.value] || []
})

// ── Helpers ───────────────────────────────────────────────────────
function isEmoji(str) {
  // Checks if the string is purely emoji characters (no plain ASCII letters/digits)
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\uFE0F|\u200D)+$/u
  return emojiRegex.test(str.trim()) && str.trim().length > 0
}

// ── Actions ───────────────────────────────────────────────────────
function selectEmoji(em) {
  emit('update:modelValue', em)
  open.value = false
  query.value = ''
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(() => searchRef.value?.focus())
  }
}

function onQuery() {
  // If user has typed/pasted something that starts with an emoji, auto-trim
  const val = query.value
  const firstEmoji = [...val].find(ch => isEmoji(ch))
  if (firstEmoji && isEmoji(val.trim())) {
    // The whole thing is emoji — keep it for "Use custom" button
  }
}

// Close on outside click
onClickOutside(target, _ => open.value = false);
</script>

<style scoped>
.emoji-picker-wrap {
  position: relative;
  display: inline-block;
}

/* ── Trigger ── */
.emoji-trigger {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition);
  font-size: 1.25rem;
  min-width: 64px;
}
.emoji-trigger:hover { border-color: var(--color-border-strong); }
.emoji-trigger:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-light); }
.emoji-trigger-icon { font-size: 1.375rem; line-height: 1; }
.emoji-trigger-placeholder {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface-2); border-radius: 50%;
  font-size: 0.875rem; color: var(--color-text-muted);
}
.emoji-trigger-caret { font-size: 0.625rem; color: var(--color-text-muted); line-height: 1; }

/* ── Dropdown ── */
.emoji-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 300;
  width: 300px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* Search row */
.emoji-search-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 0.625rem 0.375rem;
  border-bottom: 1px solid var(--color-border);
}
.emoji-search {
  flex: 1;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition);
  font-family: inherit;
  min-width: 0;
}
.emoji-search:focus { border-color: var(--color-accent); }
.emoji-search::placeholder { color: var(--color-text-muted); font-size: 0.8125rem; }
.emoji-use-custom { white-space: nowrap; flex-shrink: 0; font-size: 0.8125rem; }

/* Category tabs */
.emoji-cats {
  display: flex; gap: 0; overflow-x: auto;
  padding: 0.375rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  scrollbar-width: none;
}
.emoji-cats::-webkit-scrollbar { display: none; }
.emoji-cat-btn {
  flex-shrink: 0;
  padding: 0.3rem 0.45rem;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  cursor: pointer;
  background: none; border: none;
  transition: background var(--transition);
  opacity: 0.6;
}
.emoji-cat-btn:hover { opacity: 1; background: var(--color-surface-2); }
.emoji-cat-btn.active { opacity: 1; background: var(--color-accent-light); }

/* Grid */
.emoji-grid-wrap {
  padding: 0.375rem 0.5rem 0.5rem;
  max-height: 220px;
  overflow-y: auto;
}
.emoji-cat-label {
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 0.2rem 0.25rem 0.375rem;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1px;
}
.emoji-cell {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none; border: none;
  transition: background var(--transition), transform 0.1s ease;
  line-height: 1;
}
.emoji-cell:hover { background: var(--color-surface-2); transform: scale(1.2); }
.emoji-cell.selected { background: var(--color-accent-light); outline: 2px solid var(--color-accent); }
.emoji-empty { grid-column: 1 / -1; padding: 1.5rem; text-align: center; }
</style>