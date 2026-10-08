// Exam countdown
function exam(t){const p=shell(t);let ex=store.get('exams',[]);const n=el('input'),dt=el('input');n.placeholder='Eksāmena nosaukums';n.id='en';dt.type='datetime-local';dt.id='ed';
const l1=el('label',0,'Nosaukums');l1.htmlFor='en';const l2=el('label',0,'Datums un laiks');l2.htmlFor='ed';
const add=el('button','btn','Pievienot'),list=el('div'),msg=el('div','res err');msg.hidden=true;
const draw=()=>{list.replaceChildren();ex.sort((a,b)=>a.t-b.t).forEach((x,i)=>{const diff=x.t-Date.now(),r=el('div','li');const a=el('div');a.append(el('strong',0,x.n));const cd=el('div',0,'');cd.style.color='var(--mute)';cd.textContent=diff<=0?'Pagājis':Math.floor(diff/864e5)+' d '+Math.floor(diff%864e5/36e5)+' h '+Math.floor(diff%36e5/6e4)+' min '+Math.floor(diff%6e4/1e3)+' s';a.append(cd);const rm=el('button','ib','✕');rm.setAttribute('aria-label','Dzēst');rm.onclick=()=>{ex.splice(i,1);store.set('exams',ex);draw()};r.append(a,rm);list.append(r)})};
add.onclick=()=>{const tm=new Date(dt.value).getTime();if(!n.value.trim()||isNaN(tm)){msg.hidden=false;msg.textContent='Ievadi nosaukumu un datumu';return}msg.hidden=true;ex.push({n:n.value.trim(),t:tm});store.set('exams',ex);n.value='';draw()};
timers.push(setInterval(draw,1000));p.append(l1,n,l2,dt,add,msg,list);draw()}
exam({"id": "exam", "cat": "Mācības", "ic": "📅", "n": "Eksāmenu atskaite", "d": "Dzīvs atpakaļskaitījums, saglabājas"});
