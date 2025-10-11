// мінімальні коментарі UA
const KEY = 'tasks-v1';

const qs = (s, p = document) => p.querySelector(s);
const listEl = qs('#list');
const emptyEl = qs('#empty');
const formEl = qs('#new-task-form');
const inputEl = qs('#task-input');
const clearBtn = qs('#clear-done');
const tpl = qs('#item-tpl');
const filters = document.querySelectorAll('.filters .chip');

let tasks = load();
let currentFilter = 'all';

render();

formEl.addEventListener('submit', e => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, done: false });
  inputEl.value = '';
  save(); render();
});

clearBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('chip--active'));
    btn.classList.add('chip--active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

function render(){
  const visible = tasks.filter(fBy(currentFilter));
  listEl.innerHTML = '';
  if (visible.length === 0){
    emptyEl.style.display = 'grid';
  } else {
    emptyEl.style.display = 'none';
    visible.forEach(addItem);
  }
}

function addItem(task){
  const node = tpl.content.firstElementChild.cloneNode(true);
  const cb = node.querySelector('input[type="checkbox"]');
  const text = node.querySelector('.item__text');
  const btnEdit = node.querySelector('.icon--edit');
  const btnDel = node.querySelector('.icon--delete');

  text.textContent = task.text;
  cb.checked = task.done;
  node.dataset.id = task.id;
  node.classList.toggle('item--done', task.done);

  cb.addEventListener('change', () => {
    task.done = cb.checked;
    save(); render();
  });

  btnDel.addEventListener('click', () => {
    tasks = tasks.filter(t => t.id !== task.id);
    save(); render();
  });

  btnEdit.addEventListener('click', () => startEdit(node, task));

  listEl.appendChild(node);
}

function startEdit(node, task){
  const span = node.querySelector('.item__text');
  const old = task.text;
  span.contentEditable = 'true';
  span.focus();

  const finish = (ok) => {
    span.contentEditable = 'false';
    const val = span.textContent.trim();
    if (!ok || val === '') { span.textContent = old; return; }
    task.text = val; save(); render();
  };

  span.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){ e.preventDefault(); finish(true); }
    if (e.key === 'Escape'){ e.preventDefault(); finish(false); }
  }, { once:false });

  span.addEventListener('blur', () => finish(true), { once:true });
}

function fBy(type){
  if (type === 'active') return t => !t.done;
  if (type === 'completed') return t => t.done;
  return () => true;
}

function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); }
function load(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
