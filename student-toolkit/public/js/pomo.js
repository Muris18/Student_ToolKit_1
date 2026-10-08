// Pomodoro timer
function beep(){try{const a=new AudioContext(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();setTimeout(()=>{o.stop();a.close()},500)}catch(e){}}
function pomo(t){const p=shell(t);const row=el('div','row');const mk=(l,v)=>{const w=el('div');const lb=el('label',0,l),i=el('input');i.type='number';i.min=1;i.value=v;lb.htmlFor=i.id='p'+l[0];w.append(lb,i);row.append(w);return i};
const fi=mk('Fokuss (min)',25),bi=mk('Pauze (min)',5);const d=el('div','big','25:00'),lab=el('div','res','Gatavs darbam');
let left=25*60,mode='f',run=0;const show=()=>{d.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0')};
const tick=setInterval(()=>{if(!run)return;left--;if(left<=0){beep();mode=mode==='f'?'b':'f';left=(+(mode==='f'?fi:bi).value||1)*60;lab.textContent=mode==='f'?'Fokusa laiks 🔥':'Pauze ☕'}show()},1000);timers.push(tick);
const s=el('button','btn','Sākt'),r=el('button','btn g','Atiestatīt');s.onclick=()=>{run=!run;s.textContent=run?'Pauze':'Sākt';if(run&&lab.textContent==='Gatavs darbam')lab.textContent='Fokusa laiks 🔥'};
r.onclick=()=>{run=0;mode='f';left=(+fi.value||25)*60;s.textContent='Sākt';lab.textContent='Gatavs darbam';show()};
const br=el('div','row');br.append(s,r);p.append(row,d,br,lab)}
pomo({"id": "pomo", "cat": "Mācības", "ic": "⏱️", "n": "Pomodoro taimeris", "d": "Fokuss un pauzes ar signālu"});
