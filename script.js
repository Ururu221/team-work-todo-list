/* ===========================
   Team To-Do — app.js
   (Разработчик: логика приложения)
   =========================== */

(function () {
  'use strict';

  /** Хранилище ключ */
  const STORE_KEY = 'team_todo_v1';

  /** Ссылки на DOM */
  const form = document.getElementById('taskForm');
  const inputText = document.getElementById('taskText');
  const selectAssignee = document.getElementById('assignee');
  const listA = document.getElementById('listA');
  const listB = document.getElementById('listB');

  /** Состояние */
  /** @typedef {{id:string,text:string,assignee:'A'|'B',done:boolean,createdAt:number}} Task */
  /** @type {Task[]} */
  let tasks = load();

  /** Инициализация */
  render();

  /* === События === */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputText.value.trim();
    const who = /** @type {'A'|'B'} */ (selectAssignee.value);

    if (!text) {
      inputText.focus();
      return;
    }

    const newTask = /** @type {Task} */ ({
      id: cryptoRandomId(),
      text,
      assignee: who,
      done: false,
      createdAt: Date.now(),
    });

    tasks.push(newTask);
    save(tasks);
    render();

    form.reset();
    inputText.focus();
  });

  /* === Делегирование кликов по спискам === */
  [listA, listB].forEach((ul) => {
    ul.addEventListener('click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      // чекбокс завершения
      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        const id = target.closest('[data-id]')?.getAttribute('data-id');
        if (!id) return;
        tasks = tasks.map(t => t.id === id ? { ...t, done: target.checked } : t);
        save(tasks);
        // визуально достаточно класса, но перерендерим для простоты
        render();
        return;
      }
      // удаление
      if (target.closest('.btn-icon.danger')) {
        const id = target.closest('[data-id]')?.getAttribute('data-id');
        if (!id) return;
        tasks = tasks.filter(t => t.id !== id);
        save(tasks);
        render();
      }
    });
  });

  /* === Рендер === */
  function render() {
    renderColumn(listA, 'A');
    renderColumn(listB, 'B');
  }

  /**
   * Рендер одной колонки
   * @param {HTMLElement} mountEl
   * @param {'A'|'B'} who
   */
  function renderColumn(mountEl, who) {
    const own = tasks
      .filter(t => t.assignee === who)
      .sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt);

    if (own.length === 0) {
      mountEl.innerHTML = `<div class="empty">Нет задач</div>`;
      return;
    }

    mountEl.innerHTML = own.map(task => itemTemplate(task)).join('');
  }

  /**
   * Шаблон задачи
   * @param {Task} t
   */
  function itemTemplate(t) {
    const date = new Date(t.createdAt);
    const badge = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    return `
      <li class="todo ${t.done ? 'done':''}" data-id="${t.id}">
        <input type="checkbox" ${t.done ? 'checked':''} aria-label="Отметить выполненной" />
        <div class="title">${escapeHtml(t.text)}</div>
        <div class="meta">
          <span class="badge">${badge}</span>
          <button class="btn-icon danger" title="Удалить" aria-label="Удалить">✕</button>
        </div>
      </li>
    `;
  }

  /* === Хранилище === */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return seed();
      return parsed;
    } catch {
      return seed();
    }
  }
  function save(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  /* === Вспомогательные === */
  function cryptoRandomId() {
    // Короткий устойчивый ID
    if (window.crypto?.getRandomValues) {
      const arr = new Uint32Array(2);
      window.crypto.getRandomValues(arr);
      return [...arr].map(n => n.toString(36)).join('');
    }
    return Math.random().toString(36).slice(2);
  }
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function seed(){
    // Начальные примеры для демонстрации
    return [
      { id: cryptoRandomId(), text: 'Создать черновик презентации', assignee:'A', done:false, createdAt: Date.now()-3600_000 },
      { id: cryptoRandomId(), text: 'Сверстать титульный слайд', assignee:'B', done:true,  createdAt: Date.now()-7200_000 },
    ];
  }
})();
