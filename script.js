class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
       
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

    
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showNotification('Пожалуйста, введите задачу!', 'error');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
        input.value = '';
        this.showNotification('Задача добавлена!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Редактировать задачу:', todo.text);
        if (newText && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
            this.showNotification('Задача обновлена!', 'success');
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('fade-out');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
                this.updateStats();
                this.showNotification('Задача удалена!', 'info');
            }, 300);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Нет задач для отображения</p>
                </div>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" 
                       class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''}
                       onchange="todoApp.toggleTodo(${todo.id})">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" onclick="todoApp.editTodo(${todo.id})" title="Редактировать">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="todo-btn delete-btn" onclick="todoApp.deleteTodo(${todo.id})" title="Удалить">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('completedCount').textContent = completed;

        
        const clearBtn = document.getElementById('clearCompleted');
        clearBtn.style.display = completed > 0 ? 'block' : 'none';
    }

    clearCompleted() {
        if (confirm('Удалить все выполненные задачи?')) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification('Выполненные задачи удалены!', 'info');
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
      
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)';
                break;
            case 'error':
                backgroundColor = 'linear-gradient(135deg, #c71585 0%, #ff1493 100%)';
                break;
            case 'info':
                backgroundColor = 'linear-gradient(135deg, #ff69b4 0%, #ff8fab 100%)';
                break;
            default:
                backgroundColor = 'linear-gradient(135deg, #ff8fab 0%, #ffb6c1 100%)';
        }

        notification.innerHTML = `
            <span>${message}</span>
        `;

        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(255, 20, 147, 0.4), 
                        inset 0 2px 10px rgba(255, 255, 255, 0.2);
            z-index: 1000;
            animation: slideIn 0.4s ease;
            max-width: 320px;
            font-weight: 500;
            border: 2px solid rgba(255, 255, 255, 0.3);
            text-shadow: 1px 1px 2px rgba(139, 0, 69, 0.3);
        `;

        document.body.appendChild(notification);

        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.4s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 3500);
    }
}


let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});


if (!localStorage.getItem('todos')) {
    const sampleTodos = [
        { id: 1, text: 'Изучить JavaScript', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Создать To-Do приложение', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Добавить полный розовый дизайн', completed: false, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('todos', JSON.stringify(sampleTodos));
}
