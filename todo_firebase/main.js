import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js';
import { getDatabase, ref, set, get, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDyohr8ZqokZBVLzKs-rdx7hgjJebwf64k',
  authDomain: 'noona-todo-backend-a5f3c.firebaseapp.com',
  projectId: 'noona-todo-backend-a5f3c',
  storageBucket: 'noona-todo-backend-a5f3c.firebasestorage.app',
  messagingSenderId: '89742513311',
  appId: '1:89742513311:web:2069f4e74a7191bf233eaa',
  measurementId: 'G-S3GC6RV5B1',
  databaseURL: 'https://noona-todo-backend-a5f3c-default-rtdb.firebaseio.com/'
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const todosRef = ref(db, 'todos');

(function () {
  'use strict';

  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');
  const archiveList = document.getElementById('archiveList');
  const countText = document.getElementById('countText');
  const editSection = document.getElementById('editSection');
  const editInput = document.getElementById('editInput');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  let todos = [];
  let editingId = null;

  function syncFromFirebase() {
    onValue(todosRef, function (snapshot) {
      const data = snapshot.val();
      todos = data ? Object.entries(data).map(function (entry) {
        return { id: entry[0], text: entry[1].text, done: entry[1].done === true };
      }) : [];
      render();
    });
  }

  function getActiveTodos() {
    return todos.filter(function (t) { return !t.done; });
  }

  function getArchiveTodos() {
    return todos.filter(function (t) { return t.done; });
  }

  function updateCount() {
    const active = getActiveTodos();
    countText.textContent = active.length === 0 ? '0개의 할일' : active.length + '개의 할일';
  }

  function renderEmptyMessage() {
    const active = getActiveTodos();
    let empty = document.querySelector('.empty-message');
    if (active.length === 0) {
      if (!empty) {
        empty = document.createElement('p');
        empty.className = 'empty-message';
        empty.textContent = '할일이 없습니다. 위에서 새로 추가해 보세요.';
        todoList.appendChild(empty);
      }
      empty.classList.remove('hidden');
    } else if (empty) {
      empty.classList.add('hidden');
    }
  }

  function toggleDone(id) {
    const item = todos.find(function (t) { return t.id === id; });
    if (item) {
      update(ref(db, 'todos/' + id), { done: !item.done });
    }
  }

  function createTodoElement(item) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = item.id;
    if (item.done) li.classList.add('done');

    const label = document.createElement('label');
    label.className = 'todo-check-wrap';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-check';
    checkbox.checked = item.done;
    checkbox.addEventListener('change', function () {
      toggleDone(item.id);
    });

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = item.text;

    label.appendChild(checkbox);
    label.appendChild(span);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = '수정';
    editBtn.addEventListener('click', function () {
      startEdit(item.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', function () {
      removeTodo(item.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(label);
    li.appendChild(actions);
    return li;
  }

  function render() {
    const active = getActiveTodos();
    const archived = getArchiveTodos();

    todoList.innerHTML = '';
    active.forEach(function (item) {
      todoList.appendChild(createTodoElement(item));
    });

    archiveList.innerHTML = '';
    archived.forEach(function (item) {
      archiveList.appendChild(createTodoElement(item));
    });

    updateCount();
    renderEmptyMessage();
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    const id = Date.now().toString();
    set(ref(db, 'todos/' + id), { text: text, done: false });
    todoInput.value = '';
    todoInput.focus();
  }

  function startEdit(id) {
    const item = todos.find(function (t) { return t.id === id; });
    if (!item) return;
    editingId = id;
    editInput.value = item.text;
    editSection.classList.remove('hidden');
    editInput.focus();
    document.querySelectorAll('.todo-item').forEach(function (el) {
      el.classList.toggle('editing', el.dataset.id === id);
    });
  }

  function saveEdit() {
    if (editingId == null) return;
    const text = editInput.value.trim();
    if (!text) return;
    update(ref(db, 'todos/' + editingId), { text: text });
    cancelEdit();
  }

  function cancelEdit() {
    editingId = null;
    editInput.value = '';
    editSection.classList.add('hidden');
    document.querySelectorAll('.todo-item').forEach(function (el) {
      el.classList.remove('editing');
    });
  }

  function removeTodo(id) {
    if (editingId === id) cancelEdit();
    remove(ref(db, 'todos/' + id));
  }

  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTodo();
  });

  saveEditBtn.addEventListener('click', saveEdit);
  cancelEditBtn.addEventListener('click', cancelEdit);
  editInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  });

  syncFromFirebase();
})();
