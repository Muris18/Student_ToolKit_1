const TOOL={id:'save',cat:'Nauda',ic:'🐷',n:'Uzkrājumu kalkulators',d:'Cik mēnešu līdz mērķim',f:[{id:'g',l:'Mērķis',v:1200},{id:'s',l:'Jau uzkrāts',v:200},{id:'m',l:'Ietaupi mēnesī',v:50}],run:v=>{const g=num(v.g),s=num(v.s),m=num(v.m);if(!(g>=0)||!(s>=0)||!(m>0))throw'Ievadi mēneša summu > 0';return s>=g?'Mērķis jau sasniegts 🎉':'Vajadzīgi '+Math.ceil((g-s)/m)+' mēneši'}};
calc(TOOL);
