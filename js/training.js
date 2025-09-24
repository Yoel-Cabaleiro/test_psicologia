import { $, $$, now } from './utils.js';
import { QUESTIONS } from './data.js';
import { ATTEMPTS, saveAttempts } from './storage.js';


export function updateHardCount(){ const c = Object.values(ATTEMPTS).filter(a=>a.fails>0).length; $('#hardCount').textContent = c; }


function pickTrainingQuestion(){
const hardIds = Object.entries(ATTEMPTS).filter(([,a])=>a.fails>0).map(([id])=>id);
const useHard = hardIds.length>0 && Math.random() < 0.25;
const pool = useHard ? hardIds.map(id=>QUESTIONS.find(q=>q.id===id)).filter(Boolean) : QUESTIONS;
return pool[Math.floor(Math.random()*pool.length)];
}


export function renderTraining(){
const container = $('#trainQuestion');
const q = pickTrainingQuestion();
container.innerHTML = '';


const wrap = document.createElement('div');
const title = document.createElement('div'); title.className='muted'; title.textContent = `#${q.id}`;
const text = document.createElement('div'); text.className='q-text'; text.textContent = q.pregunta;
const opts = document.createElement('div'); opts.className='options';


['A','B','C','D'].forEach(letter=>{ if(!q[letter]) return; const btn = document.createElement('div'); btn.className='opt'; btn.dataset.letter = letter; btn.innerHTML = `<strong>${letter})</strong> ${q[letter]}`; opts.appendChild(btn); });


const actions = document.createElement('div'); actions.className='actions';
const nextBtn = document.createElement('button'); nextBtn.textContent = 'Siguiente'; nextBtn.disabled = true; nextBtn.className='primary';
const markBtn = document.createElement('button'); markBtn.textContent = 'Marcar como difícil'; markBtn.className='ghost';
const feedback = document.createElement('div'); feedback.className='muted';


actions.append(nextBtn, markBtn, feedback);
wrap.append(title, text, opts, actions);
container.appendChild(wrap);


let answered = false;
opts.addEventListener('click', (e)=>{
const el = e.target.closest('.opt'); if(!el || answered) return;
const selected = el.dataset.letter; const correct = (selected === q.correcta); answered = true;
$$('.opt', opts).forEach(o=>o.classList.remove('correct','wrong'));
if(correct){ el.classList.add('correct'); feedback.textContent = '✔ Correcta'; }
else{ el.classList.add('wrong'); const good = $$('.opt', opts).find(o=>o.dataset.letter===q.correcta); if(good) good.classList.add('correct'); feedback.textContent = `✖ Incorrecta — respuesta: ${q.correcta}) ${q.correcta_texto || q[q.correcta] || ''}`; }
nextBtn.disabled = false;


const a = ATTEMPTS[q.id] || {fails:0, seen:0, last:0};
a.seen += 1; a.last = now();
if(correct) a.fails = Math.max(0, a.fails-1); else a.fails = Math.max(1, Math.min(3, a.fails+1));
ATTEMPTS[q.id] = a; saveAttempts(); updateHardCount();
});


nextBtn.addEventListener('click', ()=> renderTraining());
markBtn.addEventListener('click', ()=>{ const a = ATTEMPTS[q.id] || {fails:0, seen:0, last:0}; a.fails = Math.min(3, (a.fails||0) + 1); a.last = now(); ATTEMPTS[q.id]=a; saveAttempts(); updateHardCount(); markBtn.textContent='Marcada ✓'; markBtn.disabled=true; });
}