// Store tasks for each person
let tasks = {
    Alice: [],
    Bob: []
};

// Load tasks from localStorage on page load
window.onload = function() {
    const savedTasks = localStorage.getItem('teamTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderTasks();
};

// Add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const assignee = document.getElementById('assignee').value;
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks[assignee].push(task);
    taskInput.value = '';
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleComplete(person, taskId) {
    const task = tasks[person].find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Delete a task
function deleteTask(person, taskId) {
    tasks[person] = tasks[person].filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('teamTasks', JSON.stringify(tasks));
}

// Render all tasks
function renderTasks() {
    // Render Alice's tasks
    const aliceList = document.getElementById('alice-tasks');
    aliceList.innerHTML = '';
    tasks.Alice.forEach(task => {
        const li = createTaskElement(task, 'Alice');
        aliceList.appendChild(li);
    });

    // Render Bob's tasks
    const bobList = document.getElementById('bob-tasks');
    bobList.innerHTML = '';
    tasks.Bob.forEach(task => {
        const li = createTaskElement(task, 'Bob');
        bobList.appendChild(li);
    });
}

// Create a task element
function createTaskElement(task, person) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = task.completed ? 'Undo' : 'Done';
    completeBtn.onclick = () => toggleComplete(person, task.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteTask(person, task.id);

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskText);
    li.appendChild(actions);

    return li;
}

// Allow Enter key to add task
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
});
