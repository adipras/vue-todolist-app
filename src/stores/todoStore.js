import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([]);

  // Fungsi untuk mengambil data todos dari server
  const getTodos = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const response = await axios.get('/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      todos.value = response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      alert('Failed to fetch todos. Please refresh the page or try again later.');
    }
  };

  // Fungsi untuk membuat todo baru
  const createTodo = async (newTodo) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const response = await axios.post('/todos', {
        title: newTodo.title,
        description: newTodo.description,
        completed: newTodo.completed
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      todos.value.push(response.data);
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  };

  // Fungsi untuk menghapus todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/todos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Hapus item dari state setelah penghapusan berhasil
      todos.value = todos.value.filter(todo => todo.ID !== id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  };

  // Fungsi untuk menandai todo selesai
  const markAsDone = async (todo) => {
    try {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed
      };
      await axios.put(`/todos/${todo.ID}`, updatedTodo, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update the local state
      const index = todos.value.findIndex(t => t.ID === todo.ID);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  };

  // Fungsi untuk update todo
  const updateTodo = async (todo) => {
    try {
      await axios.put(`/todos/${todo.ID}`, todo, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const updateOrder = async (orderData) => {
    try {
      // Assuming you have an API endpoint to update the order
      await axios.put('/api/todos/reorder', { orders: orderData });
      // The todos are already updated in the UI thanks to v-model
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  return {
    todos,
    getTodos,
    createTodo,
    deleteTodo,
    markAsDone,
    updateTodo,
    updateOrder
  };
});
