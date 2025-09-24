import { $ } from './utils.js';


export let QUESTIONS = [];


export function updateDatasetBadge(text){ $('#datasetBadge').textContent = text || `${QUESTIONS.length} preguntas cargadas`; }


export function normalizeRows(rows){
return rows.map(q=>({
id: String(q.numero ?? q['numero'] ?? ''),
pregunta: q.pregunta ?? q['pregunta'] ?? '',
A: q.A ?? q['A'] ?? '',
B: q.B ?? q['B'] ?? '',
C: q.C ?? q['C'] ?? '',
D: q.D ?? q['D'] ?? '',
correcta: String(q.letra_correcta ?? q['letra_correcta'] ?? '').trim(),
correcta_texto: q.texto_respuesta_correcta ?? q['texto_respuesta_correcta'] ?? ''
})).filter(q=>q.id && q.pregunta);
}


export function loadCSVByName(name='preguntas_tts_psicologia.csv'){
return new Promise((resolve, reject)=>{
Papa.parse(name, {
download: true,
header: true,
dynamicTyping: true,
skipEmptyLines: 'greedy',
complete: (res)=>{ QUESTIONS = normalizeRows(res.data); updateDatasetBadge(); resolve(QUESTIONS); },
error: (err)=> reject(err)
});
});
}


export function loadCSVFromFile(file){
return new Promise((resolve, reject)=>{
Papa.parse(file, {
header: true,
dynamicTyping: true,
skipEmptyLines: 'greedy',
complete: (res)=>{ QUESTIONS = normalizeRows(res.data); updateDatasetBadge(`${QUESTIONS.length} preguntas cargadas (${file.name})`); resolve(QUESTIONS); },
error: (err)=> reject(err)
});
});
}