const TOOL={id:'grade',cat:'Mācības',ic:'📝',n:'Atzīmju kalkulators',d:'Punkti uz procentiem un burtu',f:[{id:'p',l:'Iegūtie punkti',v:42},{id:'m',l:'Maksimālie punkti',v:50}],run:v=>{const p=num(v.p),m=num(v.m);if(!(p>=0)||!(m>0)||p>m)throw'Pārbaudi ievadi';const x=p/m*100;return f(x,1)+'% ('+(x>=90?'A':x>=80?'B':x>=70?'C':x>=60?'D':'F')+')'}};
calc(TOOL);
