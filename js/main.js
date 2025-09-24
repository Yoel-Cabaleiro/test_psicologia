import { $, $$ } from './utils.js';
import { updateDatasetBadge, loadCSVByName, loadCSVFromFile } from './data.js';
import { resetAll, EXAMS, ATTEMPTS } from './storage.js';
import { renderTraining, updateHardCount } from './training.js';
import { bindExamUI } from './exam.js';


// Tabs
$$('.pill').forEach(p=>p.addEventListener('click', ()=>{ $$('.pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); const tab=p.dataset.tab; $('#train').style.display=(tab==='train')?'block':'none'; $('#exam').style.display=(tab==='exam')?'block':'none'; $('#stats').style.display=(tab==='stats')?'block':'none'; if(tab==='stats') renderStats(); }));


// Reset
$('#resetBtn').addEventListener('click', ()=>{ if(confirm('¿Seguro que quieres borrar todo el progreso local?')){ resetAll(); updateHardCount(); renderStats(); alert('Progreso borrado.'); }});


// CSV auto por nombre y carga manual
loadCSVByName('preguntas_tts_psicologia.csv').then(()=>{ renderTraining(); updateHardCount(); }).catch(err=>{ console.error('No se pudo cargar preguntas_tts_psicologia.csv', err); updateDatasetBadge('Error al cargar CSV'); });
$('#pickCsvBtn').addEventListener('click', ()=> $('#csvInput').click());
$('#csvInput').addEventListener('change', async (e)=>{ const file = e.target.files?.[0]; if(!file) return; try{ await loadCSVFromFile(file); renderTraining(); updateHardCount(); }catch(err){ console.error('Error al leer CSV local', err); updateDatasetBadge('Error al leer CSV'); } });


// Exam UI
bindExamUI();


// Stats
function fmt(n){ return (Math.round(n*10)/10).toString(); }
function renderStats(){
const attempts = Object.values(ATTEMPTS);
const seenUnique = attempts.filter(a => (a.seen||0) > 0).length;
const hard = attempts.filter(a=>a.fails>0).length;
const exams = EXAMS.slice(-10).reverse();
const avgScore = EXAMS.length? fmt(EXAMS.reduce((s,e)=>s+e.score,0)/EXAMS.length) : 0;
$('#statsPane').innerHTML = `
<div class="grid two">
<div class="opt"><div class="muted">Preguntas vistas</div><div style="font-size:28px">${seenUnique}</div></div>
<div class="opt"><div class="muted">Difíciles activas</div><div style="font-size:28px">${hard}</div></div>
</div>
<div class="grid" style="margin-top:12px">
<div class="opt"><div class="muted">Exámenes realiados</div><div style="font-size:28px">${EXAMS.length}</div></div>
<div class="opt"><div class="muted">Nota media</div><div style="font-size:28px">${avgScore}%</div></div>
</div>
<h3 style="margin-top:16px">Últimos exámenes</h3>
${exams.length? exams.map(e=>{ const dt = new Date(e.startedAt).toLocaleString(); return `<div class="opt"><div>${dt}</div><div class="muted">${e.corrects}/${e.total} · ${e.score}% · ${Math.floor(e.durationMs/60000)} min</div></div>`; }).join('') : '<div class="muted">Aún no hay exámenes.</div>'}
`;
}

