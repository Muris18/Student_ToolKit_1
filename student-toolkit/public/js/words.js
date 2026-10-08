const TOOL={id:'words',cat:'Rīki',ic:'🔤',n:'Vārdu skaitītājs',d:'Vārdi, rakstzīmes, lasīšanas laiks',f:[{id:'t',l:'Teksts',ta:1,v:''}],live:1,run:v=>{const t=v.t,w=(t.trim().match(/\S+/g)||[]).length;return'Vārdi: '+w+'\nRakstzīmes: '+t.length+'\nTeikumi: '+(t.match(/[.!?]+/g)||[]).length+'\nLasīšanas laiks: ~'+Math.max(w?1:0,Math.round(w/200))+' min'}};
calc(TOOL);
