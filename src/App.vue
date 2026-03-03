<template>
    <v-app color="primary">
      <v-main class="flex-1-1-100">
          <NavigationBar>
            <CalendarView />
          </NavigationBar>
      </v-main>
      <FooterComponent/>
    </v-app>
</template>

<script setup>
import CalendarView from '@/views/CalendarView.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import FooterComponent from './components/FooterComponent.vue';
</script>