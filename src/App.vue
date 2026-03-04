<template>
    <v-app color="primary">
      <NavigationBar>
      </NavigationBar>
      <v-main class="d-flex-1-100">
          <CalendarView />
      </v-main>
      <FooterComponent/>
    </v-app>
</template>

<script setup>
import CalendarView from '@/views/CalendarView.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import FooterComponent from '@/components/FooterComponent.vue';
</script>