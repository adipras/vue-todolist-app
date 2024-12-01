import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import TodoList from '../views/TodoList.vue';
import { useAuthStore } from '../stores/authStore';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
  },
  { 
    path: '/todos', 
    name: 'todos', 
    component: TodoList,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (!to.path === '/login' || !to.path === '/register' && authStore.isAuthenticated) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
