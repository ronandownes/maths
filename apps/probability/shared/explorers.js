
(()=>{'use strict';
const $=id=>document.getElementById(id);
const palette={R:{name:'Red',fill:'#ee6972'},B:{name:'Blue',fill:'#7399e4'},G:{name:'Green',fill:'#5da47b'},Y:{name:'Yellow',fill:'#f1cc5a'}};
const bagState={R:3,B:6,G:7,Y:1},freqState=[18,2,4,26];let bagFocus='B',bagReplacement=true,bagSolution=false,focusCell=0;
const totalBag=()=>Object.values(bagState).reduce((a,b)=>a+b,0);
const getCounts=()=>freqState.slice(),getBagCounts=()=>({...bagState});
function switchTab(tab){for(const btn of document.querySelectorAll('[data-studio-tab]')){const on=btn.dataset.studioTab===tab;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on))}for(const [name,id] of [['trees','treeTab'],['bag','bagTab'],['frequency','frequencyTab']])$(id).hidden=name!==tab;}
for(const btn of document.querySelectorAll('[data-studio-tab]'))btn.addEventListener('click',()=>switchTab(btn.dataset.studioTab));
function newControl(color){const s=document.createElement('div');s.className='counter-group';const label=document.createElement('label');label.innerHTML=`<span class="ball-dot ${palette[color].name.toLowerCase()}"></span>${palette[color].name}`;const input=document.createElement('input');input.type='number';input.min='0';input.max='12';input.step='1';input.value=bagState[color];input.setAttribute('aria-label',`${palette[color].name} marbles`);input.addEventListener('change',()=>{const v=Math.min(12,Math.max(0,parseInt(input.value,10)||0));bagState[color]=v;input.value=v;bagSolution=false;renderBag()});label.append(input);s.append(label);return s}
for(const c of Object.keys(palette))$('bagCounters').append(newControl(c));
function elSvg(name,attrs){let node=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));return node;}
function bagSlots(){let out=[];for(let r=-4;r<=4;r++){for(let c=-4;c<=4;c++){let x=295+c*48+(r%2)*24,y=365+r*49;if(Math.pow((x-295)/206,2)+Math.pow((y-365)/205,2)<.90)out.push({x,y})}}// Disperse deterministically; no random jumps as answers are entered.
let seed=726441;for(let i=out.length-1;i>0;i--){seed=(1664525*seed+1013904223)>>>0;const j=seed%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}
function resetBagAnswers(){for(const id of ['bagNum','bagDen','bagPct'])$(id).value='';$('bagNeedle').hidden=true;$('bagFeedback').textContent='Enter the fraction and percentage, then choose Check.';$('bagFeedback').dataset.status='';}
function renderBag(reset=true){const tot=totalBag(),colour=palette[bagFocus];$('bagQuestion').textContent=`What is the probability of choosing a ${colour.name.toLowerCase()} marble?`;$('bagPLabel').textContent=`P(${colour.name}) =`;$('bagPercentLabel').textContent=`P(${colour.name}) =`;$('bagToTree').disabled=tot===0||(!bagReplacement&&tot<2);$('bagCheck').disabled=tot===0;$('bagReveal').disabled=tot===0;if(reset)resetBagAnswers();
 const svg=$('marbleBag');svg.replaceChildren();const title=elSvg('title',{});title.textContent=`Bag with ${tot} marbles`;svg.append(title);
 const outline=elSvg('path',{d:'M 222 166 Q 179 212 137 265 C 67 370 108 521 203 560 Q 294 609 389 560 C 496 510 518 363 452 264 Q 419 216 367 171 Z',fill:'#f9fbff',stroke:'#263449','stroke-width':7,'stroke-linejoin':'round'});svg.append(outline);
 const neck=elSvg('path',{d:'M 217 174 C 237 159 354 159 375 175 Q 369 205 298 208 Q 226 206 217 174 Z',fill:'#e5ecf7',stroke:'#263449','stroke-width':6});svg.append(neck);
 const top=elSvg('path',{d:'M 220 160 Q 164 110 210 78 L 255 107 L 290 75 L 325 105 L 377 77 Q 413 108 376 160 Z',fill:'#f6f8fe',stroke:'#263449','stroke-width':6,'stroke-linejoin':'round'});svg.append(top);
 svg.append(elSvg('path',{d:'M 210 176 Q 293 149 381 177',stroke:'#66778d','stroke-width':4,fill:'none'}));
 const marbleColours=Object.keys(palette).flatMap(c=>Array(bagState[c]).fill(c));const slots=bagSlots();for(let i=0;i<marbleColours.length;i++){const c=marbleColours[i];const pos=slots[i%slots.length];const group=elSvg('g',{role:'button',tabindex:'0','aria-label':`Ask about ${palette[c].name.toLowerCase()} marble`});let circ=elSvg('circle',{cx:pos.x,cy:pos.y,r:20,fill:palette[c].fill,class:'marble'+(c===bagFocus?' selected':'')});group.append(circ);group.append(elSvg('ellipse',{cx:pos.x-6,cy:pos.y-8,rx:6,ry:4,fill:'#fff',opacity:.42,class:'shine'}));group.addEventListener('click',()=>{bagFocus=c;bagSolution=false;renderBag()});group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();bagFocus=c;bagSolution=false;renderBag()}});svg.append(group)}
 if(!tot){const text=elSvg('text',{x:295,y:385,'text-anchor':'middle',fill:'#526579','font-size':22});text.textContent='Add some marbles';svg.append(text)}
 if(bagSolution&&tot)revealBag();}
function revealBag(){const tot=totalBag(),num=bagState[bagFocus];if(tot===0)return;const pct=100*num/tot;bagSolution=true;$('bagNum').value=num;$('bagDen').value=tot;$('bagPct').value=Number(pct.toFixed(2));$('bagNeedle').hidden=false;$('bagNeedle').style.left=pct+'%';$('bagFeedback').dataset.status='good';$('bagFeedback').textContent=`${num} favourable marble${num===1?'':'s'} out of ${tot} equally likely marbles. P(${palette[bagFocus].name}) = ${num}/${tot} = ${Number(pct.toFixed(2))}%.`}
$('bagCheck').addEventListener('click',()=>{const n=Number($('bagNum').value),d=Number($('bagDen').value),p=Number($('bagPct').value),tot=totalBag(),good=bagState[bagFocus];const entered=['bagNum','bagDen','bagPct'].every(id=>$(id).value.trim()!=='');const ok=entered&&Number.isInteger(n)&&Number.isInteger(d)&&d>0&&n>=0&&n<=d&&n*tot===good*d&&Math.abs(p-100*good/tot)<=.05;$('bagFeedback').dataset.status=ok?'good':'bad';$('bagFeedback').textContent=!entered?'Complete all three entries first.':ok?'Correct. Both the fraction and percentage describe the same probability.':'Not quite. Count the chosen colour and every marble; your fraction may be equivalent to the simplest count fraction.';if(ok){$('bagNeedle').hidden=false;$('bagNeedle').style.left=100*good/tot+'%'}});
$('bagReveal').addEventListener('click',revealBag);
$('bagNew').addEventListener('click',()=>{let sum=0;for(const c of Object.keys(bagState)){bagState[c]=Math.floor(Math.random()*8);sum+=bagState[c]}if(sum===0)bagState.B=3;const possible=Object.keys(bagState);bagFocus=possible[Math.floor(Math.random()*possible.length)];document.querySelectorAll('#bagCounters input').forEach((x,i)=>x.value=bagState[possible[i]]);bagSolution=false;renderBag()});
$('bagReplace').addEventListener('change',()=>{bagReplacement=$('bagReplace').checked;renderBag(false)});
$('bagToTree').addEventListener('click',()=>{location.href='../tree-diagrams/index.html?from=bag&counts='+Object.values(bagState).join(',')+'&replace='+(bagReplacement?'1':'0');});
function freqTotal(){return freqState.reduce((a,b)=>a+b,0)}
const fmtPct=(x)=>!Number.isFinite(x)?'—':Number(x.toFixed(1)).toLocaleString('en-IE',{maximumFractionDigits:1})+'%';
function freqInputs(){const keys=['Wet · carried','Wet · not carried','Dry · carried','Dry · not carried'];$('freqControls').replaceChildren();for(let i=0;i<4;i++){const l=document.createElement('label');l.className='counter-group';l.append(document.createTextNode(keys[i]+' '));const x=document.createElement('input');x.type='number';x.className='freq-input';x.min='0';x.max='999';x.step='1';x.value=freqState[i];x.setAttribute('aria-label',`${keys[i]} frequency`);x.addEventListener('change',()=>{freqState[i]=Math.max(0,Math.min(999,parseInt(x.value,10)||0));x.value=freqState[i];renderFrequency()});l.append(x);$('freqControls').append(l)}}
function pct(v,den){return den===0?NaN:100*v/den}
function renderFrequency(){const [a,b,c,d]=freqState;const r1=a+b,r2=c+d,co1=a+c,co2=b+d,T=freqTotal(),mode=$('freqDisplay').value;const rows=[[a,b,r1],[c,d,r2],[co1,co2,T]];
 const table=document.createElement('table');table.className='frequency-table';table.innerHTML='<thead><tr><th scope="col">Weather</th><th scope="col">Carried</th><th scope="col">Not carried</th><th scope="col">Total</th></tr></thead>';const body=document.createElement('tbody');rows.forEach((row,ri)=>{const tr=document.createElement('tr');const th=document.createElement('th');th.scope='row';th.textContent=['Wet','Dry','Total'][ri];tr.append(th);row.forEach((v,ci)=>{const cell=document.createElement('td');let denominator=mode==='overall'?T:mode==='row'?row[2]:mode==='col'?rows[2][ci]:1;cell.textContent=mode==='count'?v:fmtPct(pct(v,denominator));cell.className=(ri===2||ci===2?'total ':'')+(ri<2&&ci<2?'data-cell ':'')+(ri<2&&ci<2&&focusCell===ri*2+ci?'focus':'');if(ri<2&&ci<2){cell.tabIndex=0;cell.title='Select to examine this frequency';const select=()=>{focusCell=ri*2+ci;renderFrequency()};cell.addEventListener('click',select);cell.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}})}tr.append(cell)});body.append(tr)});table.append(body);$('frequencyTableContainer').replaceChildren(table);
 const labels=['Wet and carried','Wet and not carried','Dry and carried','Dry and not carried'];let r=focusCell>=2?r2:r1,col=focusCell%2===0?co1:co2,val=freqState[focusCell];$('freqExplanation').textContent=`Selected cell: ${labels[focusCell]} = ${val} observation${val===1?'':'s'}. Row total: ${r}. Column total: ${col}. Overall total: ${T}.`;
 $('freqChart').replaceChildren();for(const [label,yes,no] of [['Wet',a,b],['Dry',c,d]]){const total=yes+no,wrap=document.createElement('div');wrap.className='freq-row';const head=document.createElement('div');head.className='freq-row-label';head.innerHTML=`<span>${label}</span><span>${total?fmtPct(100*yes/total)+' carried':'No observations'}</span>`;wrap.append(head);const stack=document.createElement('div');stack.className='stacked';if(total){const y=document.createElement('span'),n=document.createElement('span');y.className='yes';n.className='no';y.style.width=(100*yes/total)+'%';n.style.width=(100*no/total)+'%';stack.append(y,n)}else{const e=document.createElement('span');e.className='empty';e.textContent='No observations';stack.append(e)}wrap.append(stack);$('freqChart').append(wrap)}
 $('freqToTree').disabled=T===0;
 const q=$('freqQuestion').value;const cases={joint:['Wet and carried',a,T],marginalWet:['Wet',r1,T],marginalCarry:['Carried',co1,T],carryGivenWet:['Carried | Wet',a,r1],carryGivenDry:['Carried | Dry',c,r2],wetGivenCarry:['Wet | Carried',a,co1]};const [event,n,den]=cases[q];$('freqAnswer').replaceChildren();const div=document.createElement('div');if(den===0){div.textContent=`P(${event}) is undefined here: the conditioning group has no observations.`}else{const p=fmtPct(100*n/den);const strong=document.createElement('strong');strong.textContent=`P(${event}) = ${n}/${den} = ${p}`;div.append(strong);const small=document.createElement('small');small.textContent=q==='joint'?'Joint frequency ÷ overall total.':q.startsWith('marginal')?'Marginal frequency ÷ overall total.':'Joint frequency ÷ frequency of the condition.';div.append(small)}$('freqAnswer').append(div);
}
$('freqDisplay').addEventListener('change',renderFrequency);$('freqQuestion').addEventListener('change',renderFrequency);$('freqReset').addEventListener('click',()=>{freqState.splice(0,4,18,2,4,26);focusCell=0;freqInputs();renderFrequency()});$('freqToTree').addEventListener('click',()=>{if(freqTotal()===0)return;location.href='../tree-diagrams/index.html?from=frequency&counts='+freqState.join(',');});
window.MathsProbabilityStudio={getCounts,getBagCounts,getBagReplacement:()=>bagReplacement,showTab:switchTab};
freqInputs();renderFrequency();renderBag();
const route=new URLSearchParams(location.search),kind=route.get('from');
if(kind==='bag'){
 const ns=(route.get('counts')||'').split(',').map(Number);
 if(ns.length===4&&ns.every(x=>Number.isInteger(x)&&x>=0&&x<=12)){
  Object.keys(bagState).forEach((k,i)=>bagState[k]=ns[i]);
  bagReplacement=route.get('replace')!=='0';$('bagReplace').checked=bagReplacement;
  $('preset').value='fromBag';$('preset').dispatchEvent(new Event('change'));
  $('showProb').checked=true;$('showAll').click();
 }
}else if(kind==='frequency'){
 const ns=(route.get('counts')||'').split(',').map(Number);
 if(ns.length===4&&ns.every(x=>Number.isInteger(x)&&x>=0&&x<=999)&&ns.some(Boolean)){
  freqState.splice(0,4,...ns);
  $('preset').value='fromTable';$('preset').dispatchEvent(new Event('change'));
  $('showProb').checked=true;$('showAll').click();
 }
}
switchTab(document.body.dataset.mode||'trees');
})();

