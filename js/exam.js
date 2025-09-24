import { $, fmtTime, rngFromSeed, shuffleInPlace, now } from './utils.js';
import { QUESTIONS } from './data.js';
import { ATTEMPTS, saveAttempts, EXAMS, saveExams } from './storage.js';


let examState = null; // {seed, durationMs, startedAt, endsAt, idx, order, answers:{[id]:letter}}
let examTimerHandle = null;


export function bindExamUI(){
$('#startExam').addEventListener('click', startExam);
}


function startExam(){
if(!QUESTIONS.length){ alert('No hay preguntas cargadas.'); return; }
const durMin = parseInt($('#durationSelect').value, 10) || 120;
const seed = ($('#seedInput').value || '').trim() || `auto-${Date.now()}`;
const rand = rngFromSeed(seed);
const order = QUESTIONS.map(q=>q.id);
shuffleInPlace(order, rand);
const selected = order.slice(0, Math.min(100, order.length));
examState = { seed, durationMs: durMin*60*1000, startedAt: now(), endsAt: now()+durMin*60*1000, idx: 0, order: selected, answers: {} };
$('#examPane').innerHTML = '';
tickExamTimer();
if(examTimerHandle) clearInterval(examTimerHandle);
examTimerHandle = setInterval(tickExamTimer, 1000);
renderExamQuestion();
}


function tickExamTimer(){
if(!examState){ $('#examTimer').textContent = '–:–:–'; return; }
const rem = Math.max(0, examState.endsAt - now());
$('#examTimer').textContent = fmtTime(rem);
if(rem<=0){ finishExam(); }
}


function renderExamQuestion(){
const pane = $('#examPane');
const i = examState.idx; const qid = examState.order[i];
const q = QUESTIONS.find(qq=>qq.id===qid);
pane.innerHTML = '';


const head = document.createElement('div'); head.className='row';
head.innerHTML = `<div>Pregunta ${i+1} de ${examState.order.length} · <span class="muted">semilla: ${examState.seed}</span></div>`;


// Render mínimo específico de examen (sin mostrar solución hasta el final)
const text = document.createElement('div'); text.className='q-text'; text.textContent = q.pregunta;
const opts = document.createElement('div'); opts.className='options';
['A','B','C','D'].forEach(letter=>{ if(!q[letter]) return; const btn=document.createElement('div'); btn.className='opt'; btn.dataset.letter=letter; btn.innerHTML = `<strong>${letter})</strong> ${q[letter]}`; if(examState.answers[q.id]===letter) btn.style.outline='2px solid rgba(110,231,255,.35)'; opts.appendChild(btn); });


const nav = document.createElement('div'); nav.className='actions';
const prev = document.createElement('button'); prev.textContent='Anterior'; prev.disabled = i===0;
const next = document.createElement('button'); next.textContent = i===examState.order.length-1 ? 'Finalizar' : 'Siguiente'; next.className='primary';
nav.append(prev,next);


pane.append(head, text, opts, nav);


opts.addEventListener('click', (e)=>{ const el = e.target.closest('.opt'); if(!el) return; const chosen = el.dataset.letter; examState.answers[q.id] = chosen; // resalta selección actual
Array.from(opts.children).forEach(x=>x.style.outline='none'); el.style.outline='2px solid rgba(110,231,255,.35)'; });
prev.addEventListener('click', ()=>{ examState.idx = Math.max(0, examState.idx-1); renderExamQuestion(); });
next.addEventListener('click', ()=>{ if(i===examState.order.length-1){ finishExam(); } else { examState.idx += 1; renderExamQuestion(); } });
}


// function finishExam(){
// if(!examState) return;
// if(examTimerHandle){ clearInterval(examTimerHandle); examTimerHandle=null; }


// let corrects = 0; const details = [];
// for(const qid of examState.order){
// const q = QUESTIONS.find(qq=>qq.id===qid);
// const sel = examState.answers[qid] || null;
// const ok = sel === q.correcta; if(ok) corrects++;
// details.push({id: qid, sel, ok, correct: q.correcta});
// // Actualiza intentos (post examen)
// const a = ATTEMPTS[qid] || {fails:0, seen:0, last:0}; a.seen += 1; a.last = now(); a.fails = ok ? Math.max(0, a.fails-1) : Math.min(3, a.fails+1); ATTEMPTS[qid]=a;
// }
// saveAttempts();


// const total = examState.order.length; const score = Math.round((corrects/total)*1000)/10; const durationMs = Math.max(0, now() - examState.startedAt);
// }

function finishExam(){
  if(!examState) return;
  if(examTimerHandle){ clearInterval(examTimerHandle); examTimerHandle=null; }

  let corrects = 0; 
  const details = [];

  for (const qid of examState.order){
    const q = QUESTIONS.find(qq => qq.id === qid);
    const sel = examState.answers[qid] || null;
    const ok = sel === q.correcta;
    if (ok) corrects++;
    details.push({ id: qid, sel, ok, correct: q.correcta });

    // ✅ Sólo contamos vista si respondió algo
    const a = ATTEMPTS[qid] || { fails:0, seen:0, last:0 };
    if (sel !== null) a.seen += 1;
    a.last = now();
    a.fails = ok ? Math.max(0, a.fails - 1) : Math.min(3, a.fails + 1);
    ATTEMPTS[qid] = a;
  }
  saveAttempts();

  const total = examState.order.length;
  const score = Math.round((corrects / total) * 1000) / 10;
  const durationMs = Math.max(0, now() - examState.startedAt);

  // ✅ Guardar la sesión
  EXAMS.push({
    seed: examState.seed,
    total,
    corrects,
    score,
    startedAt: examState.startedAt,
    durationMs,
    endedAt: now()
  });
  saveExams();

  // ✅ Mostrar resumen simple
  const pane = $('#examPane');
  pane.innerHTML = `
    <div class="grid">
      <h3>Resultado</h3>
      <div>Nota: <strong>${score}%</strong> — ${corrects}/${total} correctas</div>
      <div>Duración: ${fmtTime(durationMs)}</div>
      <div class="actions"><button class="primary" id="retryExam">Nuevo examen</button></div>
    </div>
  `;
  $('#retryExam').addEventListener('click', ()=> { examState = null; startExam(); });
}
