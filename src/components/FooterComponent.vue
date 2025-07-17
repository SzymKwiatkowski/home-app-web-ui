<template>
    <v-footer class="d-flex align-center justify-center ga-2 flex-grow-1 py-3" color="surface-light">
    <v-btn
      v-for="link in links"
      :key="link"
      :text="link"
      variant="text"
      rounded
      disabled="true"
    ></v-btn>
  </v-footer>
</template>

<script setup>
  const links = [
    'Home',
    'About Us',
    'Team',
    'Services',
    'Blog',
    'Contact Us',
    new Date().getFullYear().toString() + " - Rainy productions"
  ]
</script>