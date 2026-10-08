// Shared: theme toggle, storage and helpers
const $=s=>document.querySelector(s),app=$('#app');
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const th=store.get('theme',null);if(th)document.documentElement.dataset.theme=th;
$('#th').onclick=()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;const n=dark?'light':'dark';document.documentElement.dataset.theme=n;store.set('theme',n)};
const f=(n,d=2)=>(+n).toFixed(d);
const num=v=>v===''?NaN:+v;
let timers=[];const clear=()=>{timers.forEach(clearInterval);timers=[]};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
