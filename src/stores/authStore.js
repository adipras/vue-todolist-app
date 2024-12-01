import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  // Status apakah user sudah login
  const isAuthenticated = ref(false);

  // Menyimpan token JWT (jika diperlukan)
  const token = ref(null);

  // Simpan informasi user (misalnya nama)
  const user = ref(null);

  // Fungsi untuk login
  async function login(username, password) {
    try {
      // Kirim request ke backend untuk login
      const response = await axios.post('/login', {
        username,
        password,
      });

      // Simpan token dari response
      token.value = response.data.token;
      
      // Set status authenticated menjadi true
      isAuthenticated.value = true;

      // Simpan informasi user (optional, bisa ditambahkan jika diperlukan)
      user.value = response.data.user; 

      // Simpan token ke localStorage atau sessionStorage (untuk persistence)
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));  // Simpan user (optional)

    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid login credentials');
    }
  }

  // Fungsi untuk logout
  function logout() {
    // Reset state status dan informasi user
    isAuthenticated.value = false;
    token.value = null;
    user.value = null;

    // Hapus token dari localStorage atau sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Cek apakah user sudah login ketika aplikasi dimulai
  function checkAuth() {
    const savedToken = localStorage.getItem('token');
    // const savedUser = localStorage.getItem('user');

    if (savedToken) {
      token.value = savedToken;
    //   user.value = JSON.parse(savedUser);
      isAuthenticated.value = true;
    }
  }

  // Panggil checkAuth() saat store pertama kali diinisialisasi
  checkAuth();

  return {
    isAuthenticated,
    token,
    user,
    login,
    logout,
  };
});
