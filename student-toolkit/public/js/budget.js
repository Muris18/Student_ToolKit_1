const TOOL={id:'budget',cat:'Nauda',ic:'💶',n:'Budžeta kalkulators',d:'Ienākumi, izdevumi, atlikums',f:[{id:'i',l:'Ienākumi',v:800},{id:'e',l:'Izdevumi',v:650}],run:v=>{const i=num(v.i),e=num(v.e);if(!(i>=0)||!(e>=0))throw'Ievadi pozitīvus skaitļus';return'Atlikums: '+f(i-e)+(i-e<0?'\nTu tērē vairāk, nekā pelni':'')}};
calc(TOOL);
