const TOOL={id:'sal',cat:'Karjera',ic:'💼',n:'Algas kalkulators',d:'No stundas likmes uz mēnesi',f:[{id:'h',l:'Stundas likme',v:8},{id:'w',l:'Stundas nedēļā',v:20},{id:'k',l:'Nedēļas gadā',v:52}],run:v=>{const h=num(v.h),w=num(v.w),k=num(v.k);if(!(h>=0)||!(w>=0)||!(k>0&&k<=52))throw'Pārbaudi ievadi';const y=h*w*k;return'Nedēļā: '+f(h*w)+'\nMēnesī: '+f(y/12)+'\nGadā: '+f(y)}};
calc(TOOL);
