<template>
    <div class="login-container">
        <div class="ui card">
            <div class="content">
                <div class="header">Create Account</div>
            </div>
            <div class="content">
                <form class="ui form" @submit.prevent="handleRegister">
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
                    <div class="field">
                        <label>Confirm Password</label>
                        <div class="ui input">
                            <input 
                                type="password" 
                                v-model="confirmPassword" 
                                placeholder="Confirm password"
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
                        Register
                    </button>
                </form>
            </div>
            <div class="extra content">
                <router-link to="/login" class="ui basic fluid button">
                    Back to Login
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
    setup() {
        const router = useRouter();
        const username = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const isLoading = ref(false);

        const handleRegister = async () => {
            if (password.value !== confirmPassword.value) {
                alert("Passwords don't match!");
                return;
            }

            try {
                isLoading.value = true;
                const response = await axios.post('/register', {
                    username: username.value,
                    password: password.value
                });

                if (response.data) {
                    alert('Registration successful!');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Registration failed:', error);
                alert(error.response?.data?.message || 'Registration failed');
            } finally {
                isLoading.value = false;
            }
        };

        return {
            username,
            password,
            confirmPassword,
            isLoading,
            handleRegister
        };
    }
}
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
