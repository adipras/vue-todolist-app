<template>
  <div class="ui fixed inverted menu">
    <div class="ui container">
      <router-link to="/" class="header item">To Do App</router-link>
      <router-link to="/" class="item">Home</router-link>
      <router-link v-if="authStore.isAuthenticated" to="/todos" class="item">To-Do List</router-link>
      <div class="right menu">
        <router-link 
          v-if="!authStore.isAuthenticated" 
          to="/login" 
          class="item">Login</router-link>

        <div v-else class="item" @click="handleLogout">Logout</div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/authStore';

export default {
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  methods: {
    handleLogout() {
      this.authStore.logout();
      this.$router.push({ name: 'login' });
    },
  },
};
</script>

<style scoped>
.ui.fixed.menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}
</style>