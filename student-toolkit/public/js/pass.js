const TOOL={id:'pass',cat:'Rīki',ic:'🔐',n:'Paroļu ģenerators',d:'Drošas nejaušas paroles',f:[{id:'n',l:'Garums (8–64)',v:16}],run:v=>{const n=num(v.n);if(!(n>=8&&n<=64))throw'Garums 8–64';const a='abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?',r=crypto.getRandomValues(new Uint32Array(n));return[...r].map(x=>a[x%a.length]).join('')}};
calc(TOOL);
