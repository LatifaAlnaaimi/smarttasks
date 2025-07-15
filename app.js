const themeSelect = document.getElementById('themeSelect');
const tasksContainer = document.getElementById('tasksContainer');
let tasks = [];
let editingTaskId = null;

themeSelect.addEventListener('change', function () {
  const selectedTheme = this.value;
  document.documentElement.setAttribute('data-theme', selectedTheme);
  localStorage.setItem('theme', selectedTheme);
});

window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeSelect.value = savedTheme;
});

function loadTasks() {
  const savedTasks = localStorage.getItem('smartTasks');
  return savedTasks ? JSON.parse(savedTasks) : [];
}

function saveTasksToStorage() {
  localStorage.setItem('smartTasks', JSON.stringify(tasks));
}

function generateId() {
  return Date.now().toString();
}

function handleTaskFormSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  const priority = document.getElementById('taskPriority').value;

  if (!title) return;

  if (editingTaskId) {
    const index = tasks.findIndex(task => task.id === editingTaskId);
    if (index !== -1) {
      tasks[index].title = title;
      tasks[index].priority = priority;
    }
  } else {
    tasks.unshift({
      id: generateId(),
      title,
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    });
  }

  editingTaskId = null;
  saveTasksToStorage();
  closeTaskDialog();
  renderTasks();
  updateStats();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasksToStorage();
  renderTasks();
  updateStats();
}

function toggleComplete(taskId) {
  const task = tasks.find(task => task.id === taskId);
  if (task) task.completed = !task.completed;
  saveTasksToStorage();
  renderTasks();
  updateStats();
}

function renderTasks(filtered = 'all') {
  if (tasks.length === 0) {
    tasksContainer.innerHTML = `<div class="empty-state">
      <h2>No tasks yet</h2>
      <p>Create your first task to get started!</p>
      <a class="add-task-btn" onclick="openTaskDialog()">+ Add Your First Task</a>
    </div>`;
    return;
  }

  let filteredTasks = [...tasks];

  if (filtered === 'complete') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  } else if (filtered === 'incomplete') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  const priorityOrder = { high: 1, medium: 2, low: 3 };
  filteredTasks.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  tasksContainer.innerHTML = filteredTasks.map(task => {
    const dateObj = new Date(task.createdAt);
    const formattedDate = isNaN(dateObj) ? '' : dateObj.toLocaleDateString('en-US');
    const priorityBadge = task.priority === 'high' ? '🔥 High' : task.priority === 'medium' ? '⏳ Medium' : '📌 Low';

    return `
      <div class="task-card ${task.completed ? 'done' : ''}">
        <span class="task-badge">${priorityBadge}</span>
        <h3 class="task-title">${task.title}</h3>
        <p class="task-meta"><i class="fa fa-calendar" aria-hidden="true"></i> ${formattedDate}</p>
        <div class="task-actions">
          <button class="complete-btn" onclick="toggleComplete('${task.id}')" title="${task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}">
            ${task.completed ? '↩️' : '<i class="fa fa-check-square" aria-hidden="true"></i>'}
          </button>
          <button class="edit-btn" onclick="openTaskDialog('${task.id}')" title="Edit">
            <i class="fa fa-pencil" aria-hidden="true"></i>
          </button>
          <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Delete">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openTaskDialog(taskId = null) {
  const dialog = document.getElementById('taskDialog');
  const titleInput = document.getElementById('taskTitle');
  const prioritySelect = document.getElementById('taskPriority');

  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      editingTaskId = taskId;
      titleInput.value = task.title;
      prioritySelect.value = task.priority;
      document.getElementById('dialogTitle').textContent = 'Edit Task';
    }
  } else {
    editingTaskId = null;
    titleInput.value = '';
    prioritySelect.value = 'medium';
    document.getElementById('dialogTitle').textContent = 'Add New Task';
  }

  dialog.showModal();
  titleInput.focus();
}

function closeTaskDialog() {
  document.getElementById('taskDialog').close();
}

function updateStats() {
  document.getElementById('completedCount').textContent = tasks.filter(t => t.completed).length;
  document.getElementById('totalCount').textContent = tasks.length;
}

function filterTasks(type) {
  renderTasks(type);
}

document.addEventListener('DOMContentLoaded', () => {
  tasks = loadTasks();
  
  renderTasks();
  updateStats();
  

  document.getElementById('taskForm').addEventListener('submit', handleTaskFormSubmit);

  document.getElementById('taskDialog').addEventListener('click', function (event) {
    if (event.target === this) {
      closeTaskDialog();
    }
  });
});

const filterList = document.getElementById('filterList');
filterList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const filterType = e.target.dataset.filter;

    // شيل active من كل العناصر
    document.querySelectorAll('.filter-list li').forEach(li => {
      li.classList.remove('active');
    });

    // أضف active للي انضغط عليه
    e.target.classList.add('active');

    // فلتر المهام
    filterTasks(filterType);
  }
});

////
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeMenu = document.getElementById('themeMenu');

themeToggleBtn.addEventListener('click', () => {
  themeMenu.classList.toggle('hidden');
});

themeMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const selectedTheme = e.target.dataset.theme;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    themeMenu.classList.add('hidden'); // close menu
  }
});
