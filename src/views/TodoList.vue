<template>
  <div class="todo-container">
    <!-- Left side - Add Todo Form -->
    <div class="form-section">
      <h2 class="ui header">Add New Todo</h2>
      <div class="ui form">
        <div class="field">
          <label>Title</label>
          <input 
            type="text" 
            v-model="newTodoTitle" 
            placeholder="Enter todo title"
          >
        </div>
        <div class="field">
          <label>Description</label>
          <textarea 
            v-model="newTodoDescription" 
            placeholder="Enter todo description"
          ></textarea>
        </div>
        <button 
          class="ui primary button"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
          @click="addTodo"
        >
          Add Todo
        </button>
      </div>
    </div>

    <!-- Right side - Todo List -->
    <div class="list-section">
      <h2 class="ui header">Todo List</h2>

      <div class="search-filter-container">
        <!-- Completion Toggle -->
        <div class="filter-section">
            <div class="toggle-container">
                <label class="toggle-label">Show Completed</label>
                <div class="ui toggle checkbox">
                    <input 
                        type="checkbox" 
                        v-model="showCompleted"
                        id="show-completed"
                    >
                    <label></label>
                </div>
            </div>
            <!-- <div class="ui toggle checkbox">
                <input 
                    type="checkbox" 
                    v-model="showCompleted"
                    id="show-completed"
                >
                <label>Show Completed</label>
            </div> -->
        </div>

        <!-- Search Bar -->
        <div class="search-section">
            <div class="ui fluid icon input">
                <input 
                    type="text" 
                    v-model="searchQuery"
                    placeholder="Search todos..."
                >
                <i class="search icon"></i>
            </div>
        </div>
      </div>

      <div v-if="isLoading" class="ui segment">
        <div class="ui active inverted dimmer">
            <div class="ui text loader">Loading</div>
        </div>
        <p></p>
      </div>
      <div v-else>
        <div v-if="!filteredTodos.length" class="ui placeholder segment">
            <div class="ui icon header">
                <i class="tasks icon"></i>
                {{ searchQuery
                    ? 'No matching todos found'
                    : !showCompleted
                        ? 'No active todos available'
                        : 'No todos available'
                }}
                <div class="sub header">
                    {{ searchQuery ?
                        'Try a different search term'
                        : !showCompleted
                            ? 'All todos are completed'
                            : 'Add a new todo to get started'
                    }}
                </div>
            </div>
        </div>
        <draggable 
            v-model="filteredTodos" 
            class="ui styled fluid accordion"
            item-key="ID"
            handle=".drag-handle"
            @end="onDragEnd"
        >
            <template #item="{element: todo}">
                <div class="todo-item">
                    <!-- Title Section -->
                    <div class="title" @click="toggleAccordion(todo.ID)">
                    <div class="todo-header">
                        <div class="drag-handle">
                        <i class="bars icon"></i>
                        </div>
                        <div class="todo-checkbox" @click.stop>
                        <input 
                            type="checkbox" 
                            :checked="todo.completed"
                            @change="markAsDone(todo)"
                        >
                        </div>
                        <i class="dropdown icon"></i>
                        <span :class="{ 'completed-todo': todo.completed }">{{ todo.title }}</span>
                        <div class="todo-actions">
                        <button 
                            class="ui mini negative icon button"
                            :class="{ 'loading': isDeleting === todo.ID }"
                            @click.stop="confirmDelete(todo.ID)"
                        >
                            <i class="trash icon"></i>
                        </button>
                        </div>
                    </div>
                    </div>
                    <!-- Content Section -->
                    <div class="content" :class="{ 'active': activeTodos.includes(todo.ID) }">
                    <p>{{ todo.description }}</p>
                    </div>
                </div>
            </template>
        </draggable>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="ui dimmer modals visible active">
    <div class="ui tiny modal visible active">
      <div class="header">Confirm Delete</div>
      <div class="content">
        <p>Are you sure you want to delete this todo?</p>
      </div>
      <div class="actions">
        <button class="ui negative button" @click="handleConfirmDelete">Delete</button>
        <button class="ui button" @click="closeModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed} from 'vue';
import { storeToRefs } from 'pinia';
import { useTodoStore } from "../stores/todoStore";
import Draggable from "vuedraggable";

export default {
    components: {
        Draggable
    },
    setup() {
        const todoStore = useTodoStore();
        const { todos } = storeToRefs(todoStore);
        const { getTodos, createTodo, deleteTodo, markAsDone } = todoStore;

        const isLoading = ref(false);
        const newTodoTitle = ref("");
        const newTodoDescription = ref("");
        const activeTodos = ref([]);
        const isDeleting = ref(null);
        const todoToDelete = ref(null); 
        const showModal = ref(false);
        const searchQuery = ref('');
        const showCompleted = ref(true);

        const onDragEnd = async () => {};

        // Filter todos based on search query
        const filteredTodos = computed(() => {
            return todos.value
                .filter(todo => showCompleted.value ? true : !todo.completed) // Filter by completion
                .filter(todo =>  // Then filter by search query
                    todo.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                    todo.description.toLowerCase().includes(searchQuery.value.toLowerCase())
                );
        });

        const confirmDelete = (id) => {
            todoToDelete.value = id;
            showModal.value = true;
        };

        const closeModal = () => {
            showModal.value = false;
            todoToDelete.value = null;
        };

        const handleConfirmDelete = async () => {
        if (todoToDelete.value) {
            await handleDelete(todoToDelete.value);
            closeModal();
        }
        };

        const handleDelete = async (id) => {
        try {
            isDeleting.value = id;
            await deleteTodo(id);
            showToast('Task deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete task:', error);
            showToast('Failed to delete task', 'error');
        } finally {
            isDeleting.value = null;
            closeModal();
        }
        };

        const showToast = (message, type = 'info') => {
            console.log('Showing toast:', message, type); 
            const toast = document.createElement('div');
            toast.className = `ui ${type} floating message`;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                margin: 0;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const content = document.createElement('p');
            content.textContent = message;
            toast.appendChild(content);

            document.body.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 100);

            // Remove after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                toast.remove();
                }, 300);
            }, 3000);
        };

        const toggleAccordion = (todoId) => {
            const index = activeTodos.value.indexOf(todoId);
            if (index === -1) {
                activeTodos.value.push(todoId);
            } else {
                activeTodos.value.splice(index, 1);
            }
        };

        onMounted(async () => {
            try {
                isLoading.value = true;
                await getTodos();
            } catch (error) {
                console.error('Failed to fetch todos:', error);
            } finally {
                isLoading.value = false;
            }
        });

        const addTodo = async () => {
            if (!newTodoTitle.value.trim()) {
                alert("Title cannot be empty!");
                return;
            }

            const newTodo = {
                title: newTodoTitle.value,
                description: newTodoDescription.value,
                completed: false,
            };

            try {
                isLoading.value = true;
                await createTodo(newTodo);
                showToast('Task created successfully', 'success');
            } catch (error) {
                console.error("Failed to add task:", error);
            } finally {
                isLoading.value = false;
            }

            // Reset input setelah menambah
            newTodoTitle.value = "";
            newTodoDescription.value = "";
        };

        return {
            todos,
            isLoading,
            searchQuery,
            filteredTodos,
            showCompleted,
            newTodoTitle,
            newTodoDescription,
            activeTodos,
            isDeleting,
            showModal,
            addTodo,
            getTodos,
            createTodo,
            markAsDone,
            confirmDelete,
            closeModal,
            handleConfirmDelete,
            toggleAccordion,
            onDragEnd
        };
    }
}
</script>

<style scoped>
.search-filter-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: flex-end;
}

.filter-section {
    flex: 1;
    min-width: 150px;
}
.search-section {
    flex: 4;
}

.toggle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.toggle-label {
    font-size: 0.9em;
    color: rgba(0,0,0,0.7);
    margin-bottom: 0.2rem;
}

:deep(.ui.toggle.checkbox) {
    min-height: 1.5rem;
}

:deep(.ui.toggle.checkbox input[type="checkbox"]) {
    width: 3.5rem !important;
    height: 1.5rem !important;
}

:deep(.ui.toggle.checkbox input[type="checkbox"]:checked ~ .box:before),
:deep(.ui.toggle.checkbox input[type="checkbox"]:checked ~ label:before) {
    background-color: #2185d0 !important;
}

:deep(.ui.toggle.checkbox label) {
    padding-left: 4rem !important;
    line-height: 1.5rem !important;
}

:deep(.ui.toggle.checkbox label:before) {
    width: 3.5rem !important;
    height: 1.5rem !important;
    background: rgba(0,0,0,.05) !important;
    border-radius: 500rem !important;
}

:deep(.ui.toggle.checkbox label:after) {
    width: 1.5rem !important;
    height: 1.5rem !important;
    border-radius: 500rem !important;
    box-shadow: 0 1px 2px 0 rgba(34,36,38,.15), 0 0 0 1px rgba(34,36,38,.15) inset !important;
}

.ui.checkbox {
    display: flex;
    align-items: center;
    height: 100%;
}

.ui.checkbox label {
    padding-left: 1.75rem;
    cursor: pointer;
    font-size: 0.95em;
    color: rgba(0,0,0,0.87);
}

.ui.checkbox input[type="checkbox"] {
    cursor: pointer;
}

.ui.input {
    width: 100%;
}

.ui.input input {
    border-radius: 4px;
    border: 1px solid #ddd;
}

.ui.input input:focus {
    border-color: #85b7d9;
}

.todo-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  margin-top: 60px;
}

.form-section {
  flex: 1;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
  position: sticky;
  top: 5rem;
}

.list-section {
  flex: 4;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ui.accordion .title {
  display: block !important;
  padding: 0 !important;
  cursor: pointer;
}

.ui.accordion .content {
  padding: 1rem !important;
  color: rgba(0,0,0,.87) !important;
}

.ui.accordion .title:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.ui.accordion .title.active {
  background-color: rgba(0, 0, 0, 0.05);
}

.drag-handle {
  cursor: move;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  color: #999;
}

.drag-handle:hover {
  color: #666;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  width: 100%;
}

.sortable-ghost {
  opacity: 0.5;
  background: #f7f7f7;
}

.sortable-drag {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.todo-checkbox {
  display: flex;
  align-items: center;
}

.todo-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-actions {
  margin-left: auto;
}

.completed-todo {
  text-decoration: line-through;
  color: #888;
}

.ui.form .field {
  margin-bottom: 1.5rem;
}

.ui.form textarea {
  min-height: 100px;
  resize: vertical;
}

.ui.button {
  margin: 0 !important;
  padding: 0.5em !important;
  width: 100%;
}

.ui.header {
  margin-bottom: 1.5rem !important;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(34,36,38,.15);
}

/* Responsive design */
@media (max-width: 768px) {
  .todo-container {
    flex-direction: column;
  }
  
  .form-section,
  .list-section {
    flex: none;
    width: 100%;
  }
  
  .form-section {
    position: static;
  }
}

.ui.button {
  margin: 0 0 0 0.75rem !important; /* Add margin to the left of buttons */
  padding: 0.78571429em 1.5em !important; /* Add proper padding */
  width: auto !important; /* Remove fluid width */
}

.ui.dimmer.modals {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ui.modal {
  position: relative;
  background: white;
  border-radius: 0.3rem;
  z-index: 1001;
  max-width: 500px;
  width: 90%;
}

.ui.modal > .header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(34, 36, 38, 0.15);
  font-size: 1.42857143rem;
}

.ui.modal > .content {
  padding: 1.5rem;
  font-size: 1.14285714rem;
}

.ui.modal > .actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(34, 36, 38, 0.15);
  text-align: right;
}

.ui.modal .actions > .button {
  margin-left: 0.75rem;
}

.ui.inverted.button {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5) inset !important;
}

.button.loading i.icon {
  display: none;
}

.ui.grid {
  margin: 0 !important;
}

.dropdown.icon {
  transition: transform 0.2s ease;
  margin-right: 0.5rem !important;
}

.ui.segment {
  margin-top: 1rem;
}

/* Optional: Add hover effect */
.todo-item:hover {
  background-color: #f9fafb;
}

.content {
  transition: all 0.2s ease-out;
}

.content.active {
  display: block;
}

.description {
  background-color: #f8f9fa !important;
  margin: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.content .segment {
  background-color: #fcfcfc;
  margin: 0;
}

.title .grid {
  width: 100% !important;
}

.title .dropdown.icon {
  transition: transform 0.3s ease;
}

.title.active .dropdown.icon {
  transform: rotate(90deg);
}

.ui.checkbox, .ui.button {
  z-index: 2;
  position: relative;
}

/* Form styling */
.ui.form {
  margin-top: 1rem;
}

.ui.form .field {
  margin-bottom: 1rem;
}

.ui.placeholder.segment {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui.icon.header {
  color: #666;
}

.ui.icon.header .icon {
  margin-bottom: 0.5rem;
}

.ui.icon.header .sub.header {
  margin-top: 0.5rem;
}

.right.aligned.column {
  text-align: right !important;
}

.toast {
  position: fixed !important;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 250px;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.removing {
  animation: slideOut 0.3s ease-in-out forwards;
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

:global(.ui.message) {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
}

:global(.ui.success.message) {
  background-color: #21ba45 !important;
  color: white !important;
}

:global(.ui.error.message) {
  background-color: #db2828 !important;
  color: white !important;
}

.ui.segment {
    margin: 1rem 0;
}

.ui.dimmer {
    background-color: rgba(255,255,255,0.9);
}

.ui.loader:after {
    border-color: #767676 transparent transparent;
}
</style>
