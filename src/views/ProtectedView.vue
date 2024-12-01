<template>
    <div class="ui container" style="margin-top: 50px;">
        <h1 class="ui header">Protected Page</h1>
        <div class="ui positive message">
            <p>You are logged in and can access this page.</p>
        </div>
    </div>
</template>
  
<script>
    // import { useAuthStore } from '../stores/authStore';
  
    // export default {
    //     setup() {
    //         const authStore = useAuthStore();
    //         return { authStore };
    //     },
    //     methods: {
    //         handleLogout() {
    //             this.authStore.logout();
    //             this.$router.push({ name: 'login' });
    //         },
    //     },
    // };
</script>
  