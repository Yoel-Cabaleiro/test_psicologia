export const $ = (s, root=document) => root.querySelector(s);
export const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
export const now = () => Date.now();
export const pad = n => String(n).padStart(2,'0');
export const fmtTime = (ms) => { const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; return `${h}:${pad(m)}:${pad(ss)}`; };


// PRNG con semilla reproducible
function xmur3(str){ let h=1779033703 ^ str.length; for(let i=0;i<str.length;i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h<<13) | (h>>>19);} return ()=>{ h = Math.imul(h ^ (h>>>16), 2246822507); h = Math.imul(h ^ (h>>>13), 3266489909); return (h ^= h>>>16) >>> 0; }; }
function mulberry32(a){ return function(){ let t = a += 0x6D2B79F5; t = Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14) >>> 0) / 4294967296; } }
export const rngFromSeed = (seed) => { const seedFn = xmur3(seed); return mulberry32(seedFn()); };
export const shuffleInPlace = (arr, rand=Math.random) => { for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rand()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; };