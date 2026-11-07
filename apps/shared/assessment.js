/* Maths Apps shared assessments — standalone, dependency-free browser module.
   Each subject app supplies its own problem generator and marking method.
   Shared: feedback rules, sound, one-question pager and algebra entry comparison. */
(function(root){
 'use strict';
 const numberOfAttempts=2;
 function outcome(correct,attempts){
  if(correct)return {done:true,correct:true,feedback:'Correct!'};
  if(attempts>=numberOfAttempts)return {done:true,correct:false,feedback:'Stop guessing. Start thinking.'};
  return {done:false,correct:false,feedback:'ONE MORE CHANCE — your next answer is final.'};
 }
 function playSound(result,enabled=true){
  if(!enabled)return;
  try{
   const AudioCtor=root.AudioContext||root.webkitAudioContext;
   if(!AudioCtor)return;
   const ctx=new AudioCtor(),now=ctx.currentTime;
   const notes=result===true?[[660,0,.16],[880,.18,.25]]:result==='fanfare'?[[523,0,.16],[659,.18,.16],[784,.36,.18],[1047,.56,.48]]:result==='final-wrong'?[[410,0,.20],[300,.25,.22],[195,.53,.42]]:[[350,0,.23],[245,.29,.31]];
   for(const [frequency,offset,duration] of notes){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=result==='final-wrong'?'sawtooth':result===false?'triangle':'sine';
    osc.frequency.value=frequency;
    gain.gain.setValueAtTime(0,now+offset);
    gain.gain.linearRampToValueAtTime(result==='final-wrong'?.17:result===false?.085:.13,now+offset+.02);
    gain.gain.exponentialRampToValueAtTime(.001,now+offset+duration);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start(now+offset);osc.stop(now+offset+duration+.01);
   }
   if(ctx.close)root.setTimeout?.(()=>{Promise.resolve(ctx.close()).catch(()=>{})},1700);
  }catch(_ignored){/* Audio is optional. Assessment must still work without it. */}
 }
 // Only permitted algebra: integer coefficients, letters and non-negative powers.
 // No eval, dynamic code or arbitrary browser markup from student answers.
 function normalise(expression){
  return String(expression).replace(/<sup>([0-9]+)<\/sup>/gi,'^$1')
   .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,part=>'^'+[...part].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''))
   .replace(/[−–]/g,'-').replace(/\s+/g,'').replace(/\*/g,'');
 }
 function polynomial(text){
  const t=normalise(text);
  if(!t||/[^a-zA-Z0-9+\-^]/.test(t)||/[+^-]$/.test(t))return null;
  const pieces=t.match(/[+-]?[^+-]+/g);
  if(!pieces||pieces.join('')!==t)return null;
  const map=new Map();
  for(const raw of pieces){
   const sign=raw[0]==='-'?-1:1;
   const part=raw[0]==='-'||raw[0]==='+'?raw.slice(1):raw;
   const match=/^(\d*)((?:[A-Za-z](?:\^[1-9][0-9]?)?)*)$/.exec(part);
   if(!match||(!match[1]&&!match[2]))return null;
   const coefficient=sign*(match[1]?Number(match[1]):1);
   if(!Number.isSafeInteger(coefficient))return null;
   const exponents={};let totalDegree=0,used='';
   for(const m of match[2].matchAll(/([A-Za-z])(?:\^([1-9][0-9]?))?/g)){
    const deg=Number(m[2]||1);totalDegree+=deg;used+=m[0];
    exponents[m[1]]=(exponents[m[1]]||0)+deg;
   }
   if(used!==match[2]||totalDegree>36)return null;
   const key=Object.keys(exponents).sort().map(letter=>letter+':'+exponents[letter]).join('|');
   map.set(key,(map.get(key)||0)+coefficient);
  }
  for(const [key,value] of map)if(value===0)map.delete(key);
  return map;
 }
 function equalMaps(a,b){
  if(!a||!b||a.size!==b.size)return false;
  for(const [key,value] of a)if(b.get(key)!==value)return false;
  return true;
 }
 function equivalentPolynomial(a,b){return equalMaps(polynomial(a),polynomial(b))}
 function factorised(text,expectedExpanded){
  const str=normalise(text);
  const match=/^\(([^()]+)\)\(([^()]+)\)$/.exec(str);
  if(!match)return false;
  const a=polynomial(match[1]),b=polynomial(match[2]);
  if(!a||!b||a.size!==2||b.size!==2)return false;
  if(![...a.keys()].some(k=>k)||![...b.keys()].some(k=>k))return false;
  const p=new Map();
  for(const [ka,va] of a)for(const [kb,vb] of b){
   const e={};
   for(const k of [ka,kb])if(k)for(const component of k.split('|')){
    const [letter,exponent]=component.split(':');e[letter]=(e[letter]||0)+Number(exponent);
   }
   const key=Object.keys(e).sort().map(letter=>letter+':'+e[letter]).join('|');
   p.set(key,(p.get(key)||0)+va*vb);
  }
  for(const [key,value] of p)if(value===0)p.delete(key);
  return equalMaps(p,polynomial(expectedExpanded));
 }
 function pager(documentRef,{index,total,enabled,onNext,label}){
  const wrap=documentRef.createElement('div');wrap.className='maths-assessment-pager';
  const progress=documentRef.createElement('span');progress.className='maths-assessment-progress';
  progress.textContent='Question '+(index+1)+' of '+total;
  const btn=documentRef.createElement('button');btn.type='button';btn.className='primary';
  btn.textContent=label||(index===total-1?'Show results':'Next question →');
  btn.disabled=!enabled;btn.onclick=onNext;
  wrap.append(progress,btn);return wrap;
 }
 root.MathsAssessment=Object.freeze({outcome,playSound,polynomial,equivalentPolynomial,equivalentFactorisation:factorised,pager,maxAttempts:numberOfAttempts});
})(window);