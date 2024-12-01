<template>
    <div class="login-container">
        <div class="ui card">
            <div class="content">
                <div class="header">Login</div>
            </div>
            <div class="content">
                <form class="ui form" @submit.prevent="handleLogin">
                    <div class="field">
                        <label>Username</label>
                        <div class="ui input">
                            <input 
                                type="text" 
                                v-model="username" 
                                placeholder="Enter username"
                                required
                            >
                        </div>
                    </div>
                    <div class="field">
                        <label>Password</label>
                        <div class="ui input">
                            <input 
                                type="password" 
                                v-model="password" 
                                placeholder="Enter password"
                                required
                            >
                        </div>
                    </div>
                    <button 
                        class="ui primary fluid button" 
                        type="submit"
                        :class="{ loading: isLoading }"
                        :disabled="isLoading"
                    >
                        Login
                    </button>
                </form>
            </div>
            <div class="extra content">
                <p class="text-center">Don't have an account?</p>
                <router-link to="/register" class="ui basic fluid button">
                    Create Account
                </router-link>
            </div>
        </div>
    </div>
</template>

  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/authStore';
  
  export default {
    setup() {
      const router = useRouter();
      const authStore = useAuthStore();
      const username = ref('');
      const password = ref('');
      const isLoading = ref(false);

      const handleLogin = async () => {
        console.log('Login button clicked: ', username.value);
        try {
          isLoading.value = true;
          await authStore.login(username.value, password.value);
          router.push({ name: 'home' });
        } catch (error) {
          console.error('Login failed:', error);
          alert('Invalid login credentials');
        } finally {
          isLoading.value = false;
        }
      };

      return {
        username,
        password,
        isLoading,
        handleLogin
      }
    }
  };
  </script>

  <style scoped>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f7f7f7;
        padding: 1rem;
    }

    .ui.card {
        width: 100%;
        max-width: 400px;
    }

    .ui.card .header {
        font-size: 1.5em;
        text-align: center;
        padding: 1rem 0;
    }

    .ui.form {
        padding: 1rem 0;
    }

    .field {
        margin-bottom: 1rem;
    }

    .ui.button {
        margin-top: 1rem;
    }
  </style>
