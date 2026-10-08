// Get input and list items
const taskName = document.getElementById('task-name');
const startDate = document.getElementById('start-date');
const dueDate = document.getElementById('due-date');
const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const searchInput = document.getElementById('search-tasks');
const sortSelect = document.getElementById('sort-tasks');
const progressCounter = document.getElementById('progress-counter');
const filterButtons = document.querySelectorAll('.filter-btn');
const todoList = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');
const taskBoard = document.getElementById('task-board');
const todoColumn = document.getElementById('todo-column');
const doneColumn = document.getElementById('done-column');

// Load saved tasks
let tasks = [];
let currentFilter = 'all';

try {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks;
    }
} catch (error) {
    alert('Saved tasks are not loaded.');
}


function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Tasks are not saved:', error);
        alert('Tasks are not saved. Please check your browser storage.');
    }
}

function isOverdue(task) {
    const today = new Date();
    const todayString = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
    const due = task.dueDate || task.date || '';

    return !task.completed && due && due < todayString;
}

// Show tasks in kanban columns
function renderTasks() {
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    const completedTasks = tasks.filter(task => task.completed).length;
    progressCounter.textContent = 'Progress: ' + completedTasks +
        ' of ' + tasks.length + ' tasks completed';

    const searchText = searchInput.value.trim().toLowerCase();
    let visibleTasks = tasks.filter(task => {
        const dueDate = task.dueDate || task.date || '';
        const formattedDueDate = formatDate(dueDate);
        const matchesSearch = task.name.toLowerCase().includes(searchText) ||
            dueDate.includes(searchText) ||
            formattedDueDate.toLowerCase().includes(searchText);
        const matchesFilter = currentFilter === 'all' ||
            (currentFilter === 'todo' && !task.completed) ||
            (currentFilter === 'done' && task.completed) ||
            (currentFilter === 'overdue' && isOverdue(task));

        return matchesSearch && matchesFilter;
    });

    if (sortSelect.value === 'due-asc' || sortSelect.value === 'due-desc') {
        visibleTasks.sort((taskA, taskB) => {
            const dateA = taskA.dueDate || taskA.date || '';
            const dateB = taskB.dueDate || taskB.date || '';

            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;

            return sortSelect.value === 'due-asc'
                ? dateA.localeCompare(dateB)
                : dateB.localeCompare(dateA);
        });
    }

    if (sortSelect.value === 'done-first') {
        taskBoard.appendChild(doneColumn);
        taskBoard.appendChild(todoColumn);
    } else {
        taskBoard.appendChild(todoColumn);
        taskBoard.appendChild(doneColumn);
    }

    visibleTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        const overdue = isOverdue(task);

        if (overdue) {
            card.classList.add('overdue-task');
        }

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
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }

            tasks.splice(tasks.indexOf(task), 1);
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

        if (overdue) {
            const overdueLabel = document.createElement('div');
            overdueLabel.className = 'overdue-label';
            overdueLabel.textContent = 'OVERDUE';
            card.appendChild(overdueLabel);
        }

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
        empty.textContent = searchText ? 'No matching tasks' : 'No task in this list';
        todoList.appendChild(empty);
    }

    if (doneList.children.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = searchText ? 'No matching tasks' : 'No finished task';
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

function toDateObject(dateString) {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function validateTaskDates(start, due) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = toDateObject(start);
    const dueDate = toDateObject(due);

    if (startDate && startDate < todayStart) {
        alert('Start date cannot be a previous date.');
        return false;
    }

    if (dueDate && dueDate < todayStart) {
        alert('Due date cannot be a previous date.');
        return false;
    }

    if (startDate && dueDate && dueDate < startDate) {
        alert('Due date cannot be before the start date.');
        return false;
    }

    return true;
}

// Add new task
function addTask() {
    const name = taskName.value.trim();
    const start = startDate.value;
    const due = dueDate.value;

    if (!name) {
        alert('Please enter a task name.');
        return;
    }

    if (!start) {
        alert('Please select a start date.');
        return;
    }

    if (!due) {
        alert('Please select a due date.');
        return;
    }

    if (!validateTaskDates(start, due)) {
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
searchInput.addEventListener('input', renderTasks);
sortSelect.addEventListener('change', renderTasks);

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {
            const isActive = filterButton === button;
            filterButton.classList.toggle('active', isActive);
            filterButton.setAttribute('aria-pressed', isActive);
        });

        renderTasks();
    });
});

// Add with Enter key
taskName.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

renderTasks();
setInterval(renderTasks, 60 * 1000);
