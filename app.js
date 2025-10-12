const STORE = 'todo-v4';

const $ = s => document.querySelector(s);
const list = $('#list');
const empty = $('#empty');
const form = $('#createForm');
const input = $('#newInput');
const footerBar = $('#footerBar');
const dd = $('#dd');
const ddLabel = $('#ddLabel');
const clearAllBtn = $('#clearAll');
const tpl = $('#itemTpl');

let tasks = load();
let filter = 'all';

render();

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, done:false });
  input.value = '';
  save(); render(true);
});

clearAllBtn.addEventListener('click', () => {
  tasks = [];
  save(); render();
});

list.addEventListener('click', e => {
  const btn = e.target.closest('button.act');
  if (!btn) return;
  const li = e.target.closest('.item');
  const id = li.dataset.id;
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  const act = btn.dataset.act;
  if (act === 'complete'){ t.done = !t.done; save(); render(); }
  if (act === 'edit'){ startEdit(li, t); }
  if (act === 'delete'){ tasks = tasks.filter(x => x.id !== id); save(); render(); }
});

function startEdit(li, task){
  li.classList.add('item--editing');
  const el = li.querySelector('.item__text');
  el.readOnly = false;
  el.focus();
  el.setSelectionRange(el.value.length, el.value.length);
  const old = el.value;

  const finish = ok => {
    el.readOnly = true;
    li.classList.remove('item--editing');
    const v = el.value.trim();
    if (!ok || v === '') el.value = old; else task.text = v;
    save();
  };

  const onKey = e => {
    if (e.key === 'Enter'){ e.preventDefault(); finish(true); el.removeEventListener('keydown', onKey); }
    if (e.key === 'Escape'){ e.preventDefault(); finish(false); el.removeEventListener('keydown', onKey); }
  };
  el.addEventListener('keydown', onKey);
  el.addEventListener('blur', () => finish(true), { once:true });
}

dd.addEventListener('click', e => {
  if (e.target.closest('.dd__btn')){
    const open = dd.getAttribute('aria-expanded') === 'true';
    dd.setAttribute('aria-expanded', open ? 'false' : 'true');
  }
  const opt = e.target.closest('.dd__opt');
  if (opt){
    filter = opt.dataset.val;
    ddLabel.textContent = opt.textContent;
    dd.setAttribute('aria-expanded','false');
    render();
  }
});
document.addEventListener('click', e => { if (!dd.contains(e.target)) dd.setAttribute('aria-expanded','false'); });
dd.addEventListener('keydown', e => { if (e.key === 'Escape') dd.setAttribute('aria-expanded','false'); });

function render(scrollToNew=false){
  const totallyEmpty = tasks.length === 0;
  footerBar.classList.toggle('hidden', totallyEmpty);
  empty.classList.toggle('hidden', !totallyEmpty);

  const data = tasks.filter(byFilter(filter));
  list.innerHTML = '';
  data.forEach(t => addItem(t));
  if (scrollToNew) list.lastElementChild?.scrollIntoView({block:'nearest'});
}

function addItem(t){
  const node = tpl.content.firstElementChild.cloneNode(true);
  const txt = node.querySelector('.item__text');
  node.dataset.id = t.id;
  txt.value = t.text;
  node.classList.toggle('item--done', t.done);
  list.appendChild(node);
}

function byFilter(f){
  if (f === 'active') return t => !t.done;
  if (f === 'completed') return t => t.done;
  return () => true;
}

function save(){ localStorage.setItem(STORE, JSON.stringify(tasks)); }
function load(){
  try { return JSON.parse(localStorage.getItem(STORE)) || []; }
  catch { return []; }
}
