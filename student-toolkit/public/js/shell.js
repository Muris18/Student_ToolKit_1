// Tool page shell and generic calculator runner
function shell(t){clear();app.replaceChildren();const b=el('a','back','← Visi rīki');b.href='../index.html';const p=el('section','panel');p.append(el('div','tag',t.cat),el('h2',0,t.ic+' '+t.n),el('p',0,t.d));app.append(b,p);window.scrollTo(0,0);return p}
function calc(t){const p=shell(t),ins={};
t.f.forEach(x=>{const l=el('label',0,x.l);l.htmlFor='f'+x.id;const i=el(x.ta?'textarea':'input');i.id='f'+x.id;if(!x.ta){i.type='number';i.step='any';i.inputMode='decimal'}i.value=x.v;ins[x.id]=i;p.append(l,i)});
const r=el('div','res');const go=()=>{try{const v={};for(const k in ins)v[k]=ins[k].value;r.className='res';r.textContent=t.run(v)}catch(e){r.className='res err';r.textContent=String(e)}};
if(t.live){Object.values(ins).forEach(i=>i.oninput=go);go();p.append(r)}else{const b=el('button','btn',t.id==='pass'?'Ģenerēt':'Aprēķināt');b.onclick=go;p.append(b,r);go()}}
