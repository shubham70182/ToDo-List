// Get input and list items
const taskName = document.getElementById('task-name');
const startDate = document.getElementById('start-date');
const dueDate = document.getElementById('due-date');
const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const todoList = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save tasks in browser
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Show tasks in kanban columns
function renderTasks() {
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const top = document.createElement('div');
        top.className = 'task-top';

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = task.completed;

        const name = document.createElement('span');
        name.className = 'task-name';
        name.textContent = task.name;

        // Edit task name on double-click
        name.addEventListener('dblclick', () => {
            const newName = prompt('Edit task:', task.name);

            if (newName && newName.trim()) {
                task.name = newName.trim();
                saveTasks();
                renderTasks();
            }
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'delete-btn';

        // Check task as done or not done
        check.addEventListener('change', () => {
            task.completed = check.checked;
            renderTasks();
            saveTasks();
        });

        // Delete one task
        delBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            renderTasks();
            saveTasks();
        });

        const dateText = document.createElement('div');
        dateText.className = 'task-date';
        const taskStartDate = task.startDate || '';
        const taskDueDate = task.dueDate || task.date || '';
        dateText.textContent = 'Start: ' + formatDate(taskStartDate) +
            ' | Due: ' + formatDate(taskDueDate);

        top.appendChild(check);
        top.appendChild(name);
        top.appendChild(delBtn);
        card.appendChild(top);
        card.appendChild(dateText);

        if (task.completed) {
            doneList.appendChild(card);
        } else {
            todoList.appendChild(card);
        }
    });

    // Show empty message if no task
    if (todoList.children.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'No task in this list';
        todoList.appendChild(empty);
    }

    if (doneList.children.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'No finished task';
        doneList.appendChild(empty);
    }
}

// Show dates as DD-MM-YYYY
function formatDate(date) {
    if (!date) {
        return 'No date';
    }

    const parts = date.split('-');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
}

// Add new task
function addTask() {
    const name = taskName.value.trim();
    const start = startDate.value;
    const due = dueDate.value;

    if (!name) {
        return;
    }

    tasks.push({
        name: name,
        startDate: start,
        dueDate: due,
        completed: false
    });

    taskName.value = '';
    startDate.value = '';
    dueDate.value = '';
    renderTasks();
    saveTasks();
}

// Clear tasks already done
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
    saveTasks();
}

// Add click event
addBtn.addEventListener('click', addTask);
clearBtn.addEventListener('click', clearCompleted);

// Add with Enter key
taskName.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

renderTasks();
