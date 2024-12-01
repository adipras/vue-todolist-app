import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './style.css'
import App from './App.vue'
import router from './router';
import axios from 'axios';
import './plugins/semantic.js'


const app = createApp(App);

axios.defaults.baseURL = 'http://localhost:3000/api';
if (localStorage.getItem('token')) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
}

app.use(createPinia());
app.use(router);
app.mount('#app');