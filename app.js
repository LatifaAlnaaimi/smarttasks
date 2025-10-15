const openBtn = document.getElementById('openFormBtn');
const closeBtn = document.getElementById('closeFormBtn');
const overlay = document.getElementById('popupOverlay');
const saveBtn = document.getElementById('saveBtn');
const taskInput = document.querySelector('input');
const prioritySelect = document.querySelector('select');
const formTitle = document.querySelector('.popup-form h2');

// نحصل على كل الألوان من الـ CSS
const root = document.documentElement;
const styles = getComputedStyle(root);

function getColors() {
  const styles = getComputedStyle(root);
  return {
    highCard: styles.getPropertyValue('--high-card').trim(),
    mediumCard: styles.getPropertyValue('--medium-card').trim(),
    lowCard: styles.getPropertyValue('--low-card').trim(),
    completeCard: styles.getPropertyValue('--complete-card').trim(),
  };
}

let colors = getColors();

function getCardColor(task) {
  if (task.completed) return colors.completeCard;
  if (task.priority === 'high') return colors.highCard;
  if (task.priority === 'medium') return colors.mediumCard;
  return colors.lowCard;
}

// ====== الفتح والإغلاق ======
openBtn.addEventListener('click', () => {
  overlay.style.display = 'flex';
  formTitle.textContent = 'Add New Task';
  userForm.reset();
  editIndex = null;
});

closeBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
});
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.style.display = 'none';
  }
});

// ====== جلب العناصر ======
const userForm = document.getElementById('userForm');
const taskList = document.getElementById('taskList');
const popupOverlay = document.getElementById('popupOverlay');
const closeFormBtn = document.getElementById('closeFormBtn');

let editIndex = null;

// ====== حماية النص ======
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ====== غلق الفورم ======
closeFormBtn.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
  userForm.reset();
  editIndex = null;
});

// ====== إضافة أو تعديل مهمة ======
userForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskTitle = document.getElementById('task').value.trim();
  const priority = document.getElementById('serviceType').value;
  if (!taskTitle || !priority) return;

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  if (editIndex !== null) {
    tasks[editIndex].title = taskTitle;
    tasks[editIndex].priority = priority;
  } else {
    tasks.push({ title: taskTitle, priority, completed: false });
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));
  popupOverlay.style.display = 'none';
  userForm.reset();
  editIndex = null;
  displayTasks();
  updateCounter();
});

// ====== إنشاء كارد المهمة ======
function createTaskCard(task, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = index;
  card.style.backgroundColor = getCardColor(task);

  card.innerHTML = `
    <div class="task">
      <input class="task-checkbox" type="checkbox" ${task.completed ? 'checked' : ''} />
      <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</span>
    </div>
    <div class="icons">
      <button class="edit" type="button"><i class="fa-solid fa-pen-to-square"></i></button>
      <button class="delete" type="button"><i class="fa fa-times"></i></button>
    </div>
  `;

  const checkbox = card.querySelector('.task-checkbox');
  const textSpan = card.querySelector('.task-text');
  const editBtn = card.querySelector('.edit');
  const deleteBtn = card.querySelector('.delete');

  // ====== تغيير حالة المهمة ======
  checkbox.addEventListener('change', function () {
    const idx = Number(card.dataset.index);
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks[idx].completed = this.checked;
    localStorage.setItem('tasks', JSON.stringify(tasks));

    textSpan.classList.toggle('completed', this.checked);
    card.style.backgroundColor = getCardColor(tasks[idx]);

    // نعيد تطبيق الفلتر الحالي
    applyFilter();
  });

  // ====== تعديل المهمة ======
  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    editIndex = Number(card.dataset.index);
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const t = tasks[editIndex];
    if (!t) return;

    document.getElementById('task').value = t.title;
    document.getElementById('serviceType').value = t.priority;

    formTitle.textContent = 'Edit Task';
    popupOverlay.style.display = 'flex';
  });

  // ====== حذف المهمة ======
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const idx = Number(card.dataset.index);
    if (!Number.isFinite(idx)) return;
    if (confirm('Are you sure want to delete?')) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.splice(idx, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      if (editIndex !== null && editIndex === idx) editIndex = null;
      displayTasks();
    }
  });

  return card;
}

// ====== عرض جميع المهام ======
function displayTasks() {
  taskList.innerHTML = '';
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach((task, i) => {
    const card = createTaskCard(task, i);
    taskList.appendChild(card);
  });
  applyFilter();
  updateCounter();
}

// ================== الفلترة ==================//
const tabs = document.querySelectorAll('.tab');
let currentFilter = 'all';

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    currentFilter = tab.textContent.trim().toLowerCase();
    applyFilter();
  });
});

function applyFilter() {
  const cards = taskList.querySelectorAll('.card');
  cards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    const isChecked = checkbox.checked;

    if (currentFilter === 'all') {
      card.classList.remove('hidden');
    } else if (currentFilter === 'complete' && isChecked) {
      card.classList.remove('hidden');
    } else if (currentFilter === 'incomplete' && !isChecked) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  updateCounter();
}

// ====== عداد المهام ======
function updateCounter() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const counter = document.getElementById('taskCounter');
  counter.textContent = `Complete ${completed} of ${total}`;
}

// ====== حفظ الثيم في localStorage ======
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
}
colors = getColors();

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  colors = getColors();
  displayTasks();
});

// ====== تحميل أولي ======
window.addEventListener('load', displayTasks);
