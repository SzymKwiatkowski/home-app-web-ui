<template>
  <v-card class="flex-1-1-100">
    <v-layout>
      <v-app-bar :elevation="12" rounded color="primary">
        <template v-slot:prepend>
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Monthly expenses application</v-app-bar-title>

        <template v-slot:append v-if="$vuetify.display.mdAndUp">
          <v-btn icon="mdi-account-circle"></v-btn>

          <v-btn icon="mdi-dots-vertical"></v-btn>
        </template>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
        <v-list>
          <v-list-subheader>REPORTS</v-list-subheader>

          <v-list-item class="my-3" v-for="(item, i) in items" :key="i" :value="item" color="primary" variant="plain">
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>

            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script setup>
import ThemeComponent from './ThemeComponent.vue';
import { ref, watch } from 'vue'

const items = [
  {
    title: 'Calendar',
    value: 'calendar',
    icon: 'mdi-clock'
  },
  {
    title: 'Summaries',
    value: 'summaries',
    icon: 'mdi-flag'
  },
  {
    title: 'Settings',
    value: 'settings',
    icon: 'mdi-account'
  },
]


const drawer = ref(false)
const group = ref(null)

watch(group, () => {
  drawer.value = false
})
</script>