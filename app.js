const KEY = 'todo-v2';

const el = {
  form: document.getElementById('form'),
  inp: document.getElementById('inp'),
  list: document.getElementById('list'),
  empty: document.getElementById('empty'),
  filter: document.getElementById('filter'),
  clear: document.getElementById('clear'),
  tpl: document.getElementById('tpl'),
};

let tasks = load();
let mode = el.filter.value;

render();

/* створення */
el.form.addEventListener('submit', e => {
  e.preventDefault();
  const text = el.inp.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, done: false, ts: Date.now() });
  el.inp.value = '';
  save(); render(true);
});

/* фільтр */
el.filter.addEventListener('change', () => {
  mode = el.filter.value;
  render();
});

/* прибрати виконані */
el.clear.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});

/* події списку (делегування) */
el.list.addEventListener('click', onClick);
el.list.addEventListener('change', onChange);
el.list.addEventListener('keydown', onKey);

function onClick(e){
  const btn = e.target.closest('button.icon');
  if (!btn) return;
  const li = e.target.closest('.item');
  const id = li.dataset.id;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const act = btn.dataset.act;
  if (act === 'delete') {
    li.classList.add('fade'); // мікро-анімація прибрання
    tasks = tasks.filter(t => t.id !== id);
    save(); render();
  }
  if (act === 'edit') startEdit(li, task);
}

function onChange(e){
  const cb = e.target;
  if (cb.type !== 'checkbox') return;
  const li = cb.closest('.item');
  const id = li.dataset.id;
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = cb.checked;
  save(); render();
}

function onKey(e){
  if (e.target.classList.contains('item__text') && !e.target.readOnly){
    if (e.key === 'Enter'){ e.preventDefault(); commitEdit(e.target, true); }
    if (e.key === 'Escape'){ e.preventDefault(); commitEdit(e.target, false); }
  }
}

function startEdit(li, task){
  const input = li.querySelector('.item__text');
  input.readOnly = false;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
  input.dataset.old = task.text;
  input.addEventListener('blur', () => commitEdit(input, true), { once:true });
}

function commitEdit(input, ok){
  input.readOnly = true;
  const li = input.closest('.item');
  const id = li.dataset.id;
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  const val = input.value.trim();
  if (!ok || val === ''){
    input.value = input.dataset.old || t.text;
  } else {
    t.text = val;
    save();
  }
}

function render(scrollToNew = false){
  const filtered = tasks.filter(fBy(mode));
  el.list.innerHTML = '';

  if (filtered.length === 0){
    el.empty.classList.remove('hidden');
  } else {
    el.empty.classList.add('hidden');
    filtered.forEach(t => addItem(t));
  }

  if (scrollToNew) el.list.lastElementChild?.scrollIntoView({block:'nearest'});
}

function addItem(t){
  const node = el.tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = t.id;
  const cb = node.querySelector('input[type="checkbox"]');
  const text = node.querySelector('.item__text');

  cb.checked = t.done;
  if (t.done) node.classList.add('item--done');
  text.value = t.text;

  // toggle через клас при зміні
  cb.addEventListener('change', () => {
    node.classList.toggle('item--done', cb.checked);
  });

  el.list.appendChild(node);
}

function fBy(mode){
  if (mode === 'active') return t => !t.done;
  if (mode === 'completed') return t => t.done;
  return () => true;
}

function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); }
function load(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
