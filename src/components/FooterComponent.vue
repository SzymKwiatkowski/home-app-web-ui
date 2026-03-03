<template>
    <v-footer app height="60" class="d-flex align-center justify-center" color="surface-light" rounded="lg">
    <v-btn
      v-for="link in links"
      :key="link"
      :text="link"
      variant="text"
      rounded
      :disabled="true"
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