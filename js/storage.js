const STORAGE_KEYS = {
attempts: 'trainer_attempts_v1',
exams: 'trainer_exams_v1',
};


export let ATTEMPTS = JSON.parse(localStorage.getItem(STORAGE_KEYS.attempts) || '{}');
export let EXAMS = JSON.parse(localStorage.getItem(STORAGE_KEYS.exams) || '[]');


export function saveAttempts(){ localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(ATTEMPTS)); }
export function saveExams(){ localStorage.setItem(STORAGE_KEYS.exams, JSON.stringify(EXAMS)); }
export function resetAll(){ ATTEMPTS = {}; EXAMS = []; saveAttempts(); saveExams(); }