(function(){
'use strict';
const $=id=>document.getElementById(id),T=window.TriangleMath,Assess=window.MathsAssessment;
const kind=document.body.dataset.app,pyth=kind==='pythagoras';
const fixedRatio=['sin','cos','tan'].includes(document.body.dataset.ratio)?document.body.dataset.ratio:null;
const cfg={mode:'practice',ratio:fixedRatio||'sin',route:'ratio',find:'num',familyId:fixedRatio==='cos'?4:fixedRatio==='tan'?7:1,bank:pyth?'triples':'decimal',precision:1,angle:35,hyp:10,step:0,slide:0,reveal:false,question:0,activeQuestion:null,showRays:false,sound:true,attempts:0,wrong:[],chosen:null,quizIndex:0,quizScore:0,quizQuestions:[],testQuestions:[],testAnswers:[],submitted:false,testType:'any'};
const ratioSides={sin:['opp','hyp'],cos:['adj','hyp'],tan:['opp','adj']},round=v=>T.round(v,cfg.precision),fmt=v=>String(round(v));
const sideNames={opp:'opposite',adj:'adjacent',hyp:'hypotenuse'};
const tripleList=T.bank();
const familyBanks={
 sin:[{id:1,ratio:'sin',find:'num',omitted:'adj',included:'unmarked',title:'Find opposite x'},{id:2,ratio:'sin',find:'den',omitted:'adj',included:'unmarked',title:'Find hypotenuse x'},{id:3,ratio:'sin',find:'angle',omitted:'adj',included:'unmarked',title:'Find marked angle θ'}],
 cos:[{id:4,ratio:'cos',find:'num',omitted:'opp',included:'marked',title:'Find adjacent x'},{id:5,ratio:'cos',find:'den',omitted:'opp',included:'marked',title:'Find hypotenuse x'},{id:6,ratio:'cos',find:'angle',omitted:'opp',included:'marked',title:'Find marked angle θ'}],
 tan:[{id:7,ratio:'tan',find:'num',omitted:'hyp',included:'right',title:'Find opposite x'},{id:8,ratio:'tan',find:'den',omitted:'hyp',included:'right',title:'Find adjacent x'},{id:9,ratio:'tan',find:'angle',omitted:'hyp',included:'right',title:'Find marked angle θ'}]
};
const allFamilies=[...familyBanks.sin,...familyBanks.cos,...familyBanks.tan];
const familyById=id=>allFamilies.find(f=>f.id===Number(id))||allFamilies[0];
function availableFamilies(){return fixedRatio?familyBanks[fixedRatio]:allFamilies}
function renderFamilyBanks(){
 const host=$('familyBanks');if(!host)return;host.replaceChildren();
 const label=document.createElement('strong');label.className='family-heading';label.textContent='Question families';host.append(label);
 availableFamilies().forEach(f=>{const b=document.createElement('button');b.type='button';b.dataset.family=String(f.id);b.setAttribute('aria-pressed',String(cfg.familyId===f.id));b.setAttribute('aria-label','Family '+f.id+': '+ratioInfo[f.ratio]?.title+' — '+f.title);b.innerHTML='<span class="family-number">'+f.id+'</span><span class="family-name">'+f.title+'</span>';b.onclick=()=>selectFamily(f.id);host.append(b)});
}
function selectFamily(id){const f=familyById(id);cfg.familyId=f.id;cfg.ratio=f.ratio;cfg.find=f.find;cfg.route='unknown';cfg.question=0;cfg.step=0;cfg.activeQuestion=null;renderFamilyBanks();renderToolbar();if(cfg.mode==='practice'||cfg.mode==='display')practice();if(cfg.mode==='quiz'||cfg.mode==='test')startAssessment(cfg.mode)}
function makeQuestion(n=cfg.question,vary=false,familyId=cfg.familyId){
 if(pyth){
  const entry=tripleList[n%tripleList.length],useTriple=cfg.bank==='triples'||cfg.bank==='mixed'&&n%2===0;
  let a=useTriple?entry.a:4+n%6,b=useTriple?entry.b:n%3===0?10:7+n%5;
  if(!useTriple&&Number.isInteger(T.hyp(a,b)))b+=1;
  if(cfg.bank==='surds'){a=3+n%4;b=5+n%3}
  if(n%12===11&&!useTriple){a=10;b=26}
  if(cfg.bank==='decimal'){a=3.2+n%5*.7;b=4.1+n%4*.8}
  if(cfg.bank==='near'){a=6+n%4+.04;b=8+n%3+.06}
  const h=T.hyp(a,b);
  const find=cfg.testType==='any'?(n%3===0?'hyp':n%2===0?'adj':'opp'):cfg.testType;
  const given={opp:round(a),adj:round(b),hyp:round(h)};
  // All marked input lengths are rounded BEFORE calculating the answer.
  const answer=find==='hyp'?T.hyp(given.opp,given.adj):
   find==='adj'?Math.sqrt(Math.max(0,given.hyp**2-given.opp**2)):
   Math.sqrt(Math.max(0,given.hyp**2-given.adj**2));
  return {a,b,h,given,answer,find,angle:Math.atan2(a,b)*180/Math.PI,exact:useTriple,triplet:entry};
 }
 const family=familyById(familyId),r=family.ratio,[num,den]=ratioSides[r],step=n%17;
 const first=step===0;let angle=first?33:22+((step*9+family.id*5)%37),knownNum=first?7:4+((step*3+family.id)%6),knownDen=first?11:9+((step*5+family.id)%8);
 let values={opp:0,adj:0,hyp:0},answer=0;
 if(family.find==='num'){
  const base=first?11:8+((step*5+family.id)%9);
  if(r==='sin'||r==='cos'){
   values.hyp=base;values.opp=base*Math.sin(angle*Math.PI/180);values.adj=base*Math.cos(angle*Math.PI/180);
  }else{values.adj=base;values.opp=base*Math.tan(angle*Math.PI/180);values.hyp=T.hyp(values.opp,values.adj)}
  values[den]=round(base);answer=values[den]*T.trig(r,angle);
 }else if(family.find==='den'){
  const givenNumerator=first?7:5+((step*3+family.id)%7),v=T.trig(r,angle);
  values[num]=givenNumerator;values[den]=givenNumerator/v;
  if(r==='sin'){values.hyp=values[den];values.opp=givenNumerator;values.adj=Math.sqrt(Math.max(0,values.hyp**2-values.opp**2))}
  else if(r==='cos'){values.hyp=values[den];values.adj=givenNumerator;values.opp=Math.sqrt(Math.max(0,values.hyp**2-values.adj**2))}
  else{values.opp=givenNumerator;values.adj=values[den];values.hyp=T.hyp(values.opp,values.adj)}
  values[num]=round(givenNumerator);answer=values[num]/v;
 }else{
  if(first){knownNum=7;knownDen=11}
  else if(r==='tan'){knownNum=5+((step*2+family.id)%8);knownDen=7+((step*5+family.id)%9)}
  else{knownNum=4+((step*2+family.id)%5);knownDen=knownNum+5+((step+family.id)%5)}
  values[num]=knownNum;values[den]=knownDen;
  if(r==='sin'){values.hyp=knownDen;values.opp=knownNum;values.adj=Math.sqrt(Math.max(0,knownDen**2-knownNum**2))}
  else if(r==='cos'){values.hyp=knownDen;values.adj=knownNum;values.opp=Math.sqrt(Math.max(0,knownDen**2-knownNum**2))}
  else{values.opp=knownNum;values.adj=knownDen;values.hyp=T.hyp(knownNum,knownDen)}
  const ratio=round(knownNum)/round(knownDen);
  angle=(r==='sin'?Math.asin(Math.min(1,ratio)):r==='cos'?Math.acos(Math.min(1,ratio)):Math.atan(ratio))*180/Math.PI;
  answer=angle;
 }
 const given={opp:round(values.opp),adj:round(values.adj),hyp:round(values.hyp)};
 if(family.find==='num')answer=given[den]*T.trig(r,angle);
 if(family.find==='den')answer=given[num]/T.trig(r,angle);
 return {...given,angle,find:family.find,answer,ratio:r,omitted:family.omitted,included:family.included,familyId:family.id,num,den};
}
function correctAnswer(q){return q.answer}
function questionText(q){
 if(pyth)return q.find==='hyp'?'Find the hypotenuse.':q.find==='adj'?'Find the missing horizontal side.':'Find the missing vertical side.';
 const [num,den]=ratioSides[q.ratio];return q.find==='angle'?'Find the marked angle θ from the two given sides.':q.find==='num'?'Find x, the '+sideNames[num]+' side.':'Find x, the '+sideNames[den]+' side.';
}
function questionTriangle(q,answers=false){
 if(pyth){const marks={adj:q.find==='adj'?'x':fmt(q.given.adj),opp:q.find==='opp'?'x':fmt(q.given.opp),hyp:q.find==='hyp'?'x':fmt(q.given.hyp)};
  return T.triangle({angle:q.angle,hypotenuse:q.h,marks,highlight:cfg.showRays?['adj','opp','hyp']:[]});}
 const [num,den]=ratioSides[q.ratio],marks={opp:'',adj:'',hyp:''};
 if(q.find==='angle'){marks[num]=fmt(q[num]);marks[den]=fmt(q[den])}
 else if(q.find==='num'){marks[num]='x';marks[den]=fmt(q[den])}
 else{marks[num]=fmt(q[num]);marks[den]='x'}
 return T.triangle({angle:q.angle,hypotenuse:q.hyp,angleLabel:q.find==='angle'?'θ':fmt(q.angle)+'°',marks,highlight:cfg.showRays?[num,den]:[],arrows:[num,den],included:q.included});
}
function equation(q,worked=false){
 if(pyth){
  const a=q.given.opp,b=q.given.adj,h=q.given.hyp;
  if(q.find==='hyp'){
   const squared=a*a+b*b;
   const exact=Number.isInteger(squared)?T.surd(squared):null;
   return worked?'h = √('+a+'² + '+b+'²)'+(exact?' = '+exact:'')+' ≈ '+fmt(q.answer):'h² = '+a+'² + '+b+'²';
  }
  const k=q.find==='adj'?'b':'a',known=q.find==='adj'?a:b;
  const squared=h*h-known*known,exact=Number.isInteger(squared)?T.surd(squared):null;
  return worked?k+' = √('+h+'² − '+known+'²)'+(exact?' = '+exact:'')+' ≈ '+fmt(q.answer):k+'² = '+h+'² − '+known+'²';
 }
 const r=q.ratio,[num,den]=ratioSides[r];
 if(q.find==='angle')return worked?'θ = '+r+'⁻¹('+fmt(q[num])+' / '+fmt(q[den])+') = '+fmt(q.answer)+'°':r+' θ = '+fmt(q[num])+' / '+fmt(q[den]);
 if(!worked)return r+' '+fmt(q.angle)+'° = '+(q.find==='num'?'x / '+fmt(q[den]):fmt(q[num])+' / x');
 if(q.find==='num')return 'x = '+fmt(q[den])+' × '+r+'('+fmt(q.angle)+'°) = '+fmt(q.answer);
 return 'x = '+fmt(q[num])+' ÷ '+r+'('+fmt(q.angle)+'°) = '+fmt(q.answer);
}
function prediction(q){
 if(pyth)return q.find==='hyp'?'Predict: the hypotenuse must be longer than either shorter side.':'Predict: the missing shorter side must be less than the hypotenuse.';
 if(q.ratio==='tan')return 'Predict: below 45° opposite < adjacent; at 45° equal; above 45° opposite > adjacent. Tangent crosses 1 at 45°.';
 return 'Predict: '+(q.ratio==='sin'?'opposite':'adjacent')+' is shorter than the hypotenuse. The ratio is between 0 and 1 for an acute angle.';
}
function renderToolbar(question=cfg.activeQuestion){
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(cfg.mode===b.dataset.mode)));
 document.querySelectorAll('[data-ratio]').forEach(b=>b.setAttribute('aria-pressed',String(cfg.ratio===b.dataset.ratio)));
 document.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(cfg.route===b.dataset.route)));
 $('ratioControls').hidden=true;
 $('routeControls').hidden=true;
 $('bank').value=cfg.bank;$('find').value=question?question.find:cfg.find;
 $('find').disabled=true;
 $('trigFind').hidden=true;
 $('pythFind').value=cfg.testType;
 $('precision').value=String(cfg.precision);
 $('bank').disabled=cfg.mode==='quiz'||cfg.mode==='test';$('precision').disabled=cfg.mode==='quiz'||cfg.mode==='test';
 const exactBank=cfg.bank==='triples',specialBank=cfg.bank==='surds';
 $('angleControl').hidden=true;$('hypControl').hidden=true;
 $('pythBank').hidden=!pyth;
 if(!pyth){$('bank').parentElement.hidden=true;$('routeControls').hidden=true;$('ratioControls').hidden=true;}
 if(!pyth)renderFamilyBanks();
}
function setOptionsOpen(open){
 const panel=$('optionsPanel'),toggle=$('optionsToggle'),backdrop=$('optionsBackdrop');
 panel.classList.toggle('open',open);
 toggle.setAttribute('aria-expanded',String(open));
 if(backdrop)backdrop.hidden=!open;
}
function mode(mode){cfg.mode=mode;cfg.showRays=false;cfg.step=0;cfg.reveal=false;
 setOptionsOpen(false);
 for(const m of ['instruction','practice','display','graph','sheets']){const panel=$(m+'Panel');if(panel)panel.hidden=m!==mode;}
 if($('quizPanel'))$('quizPanel').hidden=true;
 if($('testPanel'))$('testPanel').hidden=true;
 if($('assessmentPanel'))$('assessmentPanel').hidden=mode!=='quiz'&&mode!=='test';
 const sinePathways=$('sinePathways');if(sinePathways)sinePathways.hidden=mode!=='instruction';
 renderToolbar();
 if(mode==='instruction')instruction();
 if(mode==='practice'||mode==='display')practice();
 if(mode==='graph')ratioGraph();
 if(mode==='quiz'||mode==='test')startAssessment(mode);
 if(mode==='sheets'&&$('sheetsPanel'))$('sheetsPanel').hidden=false;
}
const generalSlides=pyth?[
['What makes a right triangle?','Identify the right angle, then find the hypotenuse: it is opposite the right angle. The shorter sides meet at 90°.','The hypotenuse is the longest side.'],
['Predict before calculating','If the two shorter sides are marked, the hypotenuse must be longer than either one. If the hypotenuse is marked, the missing shorter side must be smaller.','Use the diagram to rule out an impossible answer.'],
['Squares and the theorem','The square on the longest side has the same area as the sum of the squares on the two shorter sides.','a² + b² = c²'],
['Why subtraction works','If c is known and a is known, remove the known small square from the big square.','b = √(c² − a²)'],
['Exact triples','Try 3, 4, 5 and 5, 12, 13. No rounding is needed because every side is an integer. Scaling a triple makes another triple.','10, 24, 26 is another scaled triple.'],
['Non-triples and surds','The sides 26 and 10 may be two legs or a hypotenuse and a leg. Their roles change the expression.','If both are legs: √776 = 2√194 ≈ 27.9; if 26 is the hypotenuse: √576 = 24.'],
['Reflection','An exact surd should not be rounded until required. When measurements are rounded, do not imply that the derived result is exact.','The bank lets you choose exact triples, non-triples, mixed and surds.']
]:[
['Mark one acute angle','The common term is reference angle. We will quickly call it the marked angle, θ. The other acute angle is the unmarked angle.','Mark θ first. Opposite and adjacent are named from θ.'],
['Name the sides','The side opposite θ is opposite (red); the leg beside θ is adjacent (blue); the side opposite 90° is the hypotenuse (green). Every diagram marks the right angle.','Use lower-case o, a and h only as side symbols.'],
['Find the included angle','Put an arrow on each of the two sides in the ratio. Their shared vertex is the included angle. You can also start with the side left out and look at the angle opposite it.','The included angle can be marked, unmarked, or 90°.'],
['The unmarked side gives the cue','There is a one-to-one correspondence. Leave out adjacent a: the angle between the other two sides is unmarked, so use sine. Leave out opposite o: that angle is marked θ, so use cosine. Leave out hypotenuse h: that angle is 90°, so use tangent.','The unmarked side identifies the ratio; calculate with the marked angle θ in all three cases.'],
['Why sine uses the marked angle','For sine, the included angle between o and h is the unmarked angle. That identifies the ratio; it is not the angle used in the calculation. Keep θ marked and use sin θ = o/h.','Example: sin 33° = x/11.'],
['The nine question families','Each ratio has three families: find its numerator side, find its denominator side, or find θ. Sine: find o, h, θ. Cosine: find a, h, θ. Tangent: find o, a, θ.','Choose a family bank, then practise the same question structure with fresh values.'],
['Ratios change with the marked angle','As θ rises from 0° towards 90°, sine rises from 0 towards 1, cosine falls from 1 towards 0, and tangent rises without bound. Tangent is not a wave: it has a vertical asymptote at 90°.','A right triangle is non-degenerate for 0° < θ < 90°. Endpoints are limits. Open Graph to explore.'],
['Proportion and scale','For a fixed θ, similar right triangles have the same ratios. With h fixed, o is proportional to sin θ and a is proportional to cos θ. With o fixed, h is proportional to 1/sin θ.','The inverse sine function is different from inverse proportion.']
];
const ratioInfo={
 sin:{title:'Sine',numerator:'opposite',denominator:'hypotenuse',formula:'sin θ = o ÷ h',findNumerator:'o = h × sin θ',findDenominator:'h = o ÷ sin θ',findAngle:'θ = sin⁻¹(o ÷ h)',trend:'As the acute angle θ increases, sine increases.',limits:'As θ approaches 0°, sin θ approaches 0. As θ approaches 90°, sin θ approaches 1. Therefore 0 < sin θ < 1.',
  valueText:(a,v)=>'sin '+a+'° = '+v.toPrecision(3)+'; the value stays below 1 for every acute angle.'},
 cos:{title:'Cosine',numerator:'adjacent',denominator:'hypotenuse',formula:'cos θ = a ÷ h',findNumerator:'a = h × cos θ',findDenominator:'h = a ÷ cos θ',findAngle:'θ = cos⁻¹(a ÷ h)',trend:'As the acute angle θ increases, cosine decreases.',limits:'As θ approaches 0°, cos θ approaches 1. As θ approaches 90°, cos θ approaches 0. Therefore 0 < cos θ < 1.',
  valueText:(a,v)=>'cos '+a+'° = '+v.toPrecision(3)+'; the value stays between 0 and 1 for every acute angle.'},
 tan:{title:'Tangent',numerator:'opposite',denominator:'adjacent',formula:'tan θ = o ÷ a',findNumerator:'o = a × tan θ',findDenominator:'a = o ÷ tan θ',findAngle:'θ = tan⁻¹(o ÷ a)',trend:'As the acute angle θ increases, tangent increases. At 45°, opposite and adjacent are equal, so tan θ = 1.',limits:'As θ approaches 0°, tan θ approaches 0. As θ approaches 90° from below, tan θ grows without bound. Tangent has no upper limit.',
  valueText:(a,v)=>'tan '+a+'° = '+v.toPrecision(3)+'; tangent has no upper bound as θ approaches 90°.'}
};
function focusedRatioSlides(ratio){
 const info=ratioInfo[ratio];
 return [
  ['Fix the reference angle','Choose the acute angle θ first. Opposite and adjacent are named from that angle; the hypotenuse is always opposite the right angle.',info.formula],
  ['The ratio is a proportion','Draw right triangles with the same angle but different sizes. They are similar, so corresponding sides scale together and this ratio stays constant.',info.formula+' has the same value in every similar triangle with this θ.'],
  ['Find the numerator side','When θ and the denominator side are known, multiply the denominator by the ratio to find the numerator side.',info.findNumerator],
  ['Find the denominator side','When θ and the numerator side are known, divide the numerator by the ratio to find the denominator side.',info.findDenominator],
  ['Find the angle','When both relevant sides are known, use the inverse ratio. Check that the answer is an acute angle in this right-triangle setting.',info.findAngle],
  ['Watch the ratio change',info.trend+' Move the slider to see the triangle and ratio value change. '+info.limits+' The endpoints are limits; a non-degenerate right triangle has 0° < θ < 90°.',info.limits]
 ];
}
const slides=generalSlides;
function ratioExplorer(ratio){
 const info=ratioInfo[ratio],area=document.createElement('div');area.className='ratio-explorer';
 const controls=document.createElement('div');controls.className='ratio-explorer-controls';
 const label=document.createElement('label');label.textContent='Acute reference angle θ';
 const slider=document.createElement('input');slider.type='range';slider.min='5';slider.max='85';slider.step='1';slider.value='35';slider.setAttribute('aria-label','Acute reference angle in degrees');
 const angle=document.createElement('output');angle.textContent='35°';label.append(angle);controls.append(label,slider);
 const readout=document.createElement('p');readout.className='ratio-readout';readout.setAttribute('aria-live','polite');controls.append(readout);
 const diagram=document.createElement('div');diagram.className='ratio-explorer-diagram';
 function update(){
  const degrees=Number(slider.value),value=T.trig(ratio,degrees);
  angle.textContent=degrees+'°';
  readout.textContent=info.valueText(degrees,value);
  diagram.innerHTML=T.triangle({angle:degrees,hypotenuse:10,angleLabel:degrees+'°',marks:{adj:'a',opp:'o',hyp:'h'}});
 }
 slider.addEventListener('input',update);update();area.append(controls,diagram);return area;
}
function ratioGraph(){
 const host=$('graphPanel');if(!host)return;host.replaceChildren();
 const heading=document.createElement('h2');heading.textContent='Watch the ratios change';
 const intro=document.createElement('p');intro.className='graph-intro';intro.textContent='Move θ from 1° towards 90°. Sine rises, cosine falls, and tangent rises towards a vertical asymptote; tangent is not a wave. Red: sine / opposite. Blue: cosine / adjacent. Dark: tangent. The right-hand scale shows tan θ up to 5; the readout gives its full value.';
 const controls=document.createElement('div');controls.className='graph-controls';
 const label=document.createElement('label');label.textContent='Marked angle θ';
 const slider=document.createElement('input');slider.type='range';slider.min='1';slider.max='89';slider.step='1';slider.value='35';slider.setAttribute('aria-label','Marked angle theta in degrees');
 const degrees=document.createElement('output');degrees.textContent='35°';label.append(degrees);controls.append(label,slider);
 const values=document.createElement('p');values.className='graph-values';values.setAttribute('aria-live','polite');controls.append(values);
 const svgWrap=document.createElement('div');svgWrap.className='ratio-graph';
 const x0=58,y0=282,w=650,h=226,yTop=y0-h,yMaxTan=5;
 const xOf=d=>x0+w*d/90, yUnit=v=>y0-h*v, yTan=v=>y0-h*Math.min(v/yMaxTan,1);
 const pathFor=(fn,yMap,limit=Infinity)=>{const parts=[];for(let i=0;i<180;i++){const d=i*.5,v=fn(d*Math.PI/180);if(v>limit)break;parts.push((i?'L':'M')+xOf(d).toFixed(2)+' '+yMap(v).toFixed(2))}return parts.join(' ')};
 let ticks='';
 [0,.25,.5,.75,1].forEach(v=>{const y=yUnit(v);ticks+='<line x1="'+x0+'" y1="'+y.toFixed(1)+'" x2="'+(x0+w)+'" y2="'+y.toFixed(1)+'" stroke="#e2e8ef"/><text x="'+(x0-10)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" font-size="12" fill="#53677c">'+v.toFixed(v===0||v===1?0:2)+'</text>'});
 [0,15,30,45,60,75,90].forEach(d=>{const x=xOf(d);ticks+='<line x1="'+x.toFixed(1)+'" y1="'+yTop+'" x2="'+x.toFixed(1)+'" y2="'+y0+'" stroke="#f0f3f7"/><text x="'+x.toFixed(1)+'" y="'+(y0+22)+'" text-anchor="middle" font-size="12" fill="#53677c">'+d+'°</text>'});
 const tangentTicks=[0,2.5,5].map(v=>'<text x="'+(x0+w+10)+'" y="'+(yTan(v)+4).toFixed(1)+'" font-size="12" fill="#53677c">'+(v===5?'↑':v)+'</text>').join('');
 svgWrap.innerHTML='<svg viewBox="0 0 780 355" role="img" aria-label="Graph of sine increasing from zero to one, cosine decreasing from one to zero, and tangent rising off the separate right-hand scale towards a vertical asymptote at 90 degrees. Sine and cosine use the left scale from zero to one; tangent uses a right scale from zero to five."><defs><clipPath id="ratio-graph-clip"><rect x="'+x0+'" y="'+yTop+'" width="'+w+'" height="'+h+'"/></clipPath></defs>'+ticks+'<line x1="'+x0+'" y1="'+y0+'" x2="'+(x0+w)+'" y2="'+y0+'" stroke="#243d55" stroke-width="2"/><line x1="'+x0+'" y1="'+yTop+'" x2="'+x0+'" y2="'+y0+'" stroke="#243d55" stroke-width="2"/><line x1="'+(x0+w)+'" y1="'+yTop+'" x2="'+(x0+w)+'" y2="'+y0+'" stroke="#243d55" stroke-width="2"/><line x1="'+xOf(90)+'" y1="'+yTop+'" x2="'+xOf(90)+'" y2="'+y0+'" stroke="#30343b" stroke-dasharray="7 6" stroke-width="2"/><g clip-path="url(#ratio-graph-clip)"><path d="'+pathFor(Math.sin,yUnit)+'" fill="none" stroke="#c63d43" stroke-width="4"/><path d="'+pathFor(Math.cos,yUnit)+'" fill="none" stroke="#2369d1" stroke-width="4"/><path d="'+pathFor(Math.tan,yTan,yMaxTan)+'" fill="none" stroke="#252b33" stroke-width="3.5"/><path d="M'+xOf(78.5)+' '+(yTop+20)+' L'+xOf(78.5)+' '+(yTop+3)+' M'+(xOf(78.5)-5)+' '+(yTop+9)+' L'+xOf(78.5)+' '+(yTop+3)+' L'+(xOf(78.5)+5)+' '+(yTop+9)+'" fill="none" stroke="#252b33" stroke-width="2.5"/><text x="'+(xOf(78.5)+9)+'" y="'+(yTop+17)+'" font-size="12" font-weight="700" fill="#252b33">tan &gt; 5</text><line id="graph-cursor" x1="'+xOf(35)+'" y1="'+yTop+'" x2="'+xOf(35)+'" y2="'+y0+'" stroke="#75869a" stroke-dasharray="4 5"/><circle id="graph-sin-dot" cx="'+xOf(35)+'" cy="'+yUnit(Math.sin(35*Math.PI/180))+'" r="6" fill="#c63d43"/><circle id="graph-cos-dot" cx="'+xOf(35)+'" cy="'+yUnit(Math.cos(35*Math.PI/180))+'" r="6" fill="#2369d1"/><circle id="graph-tan-dot" cx="'+xOf(35)+'" cy="'+yTan(Math.tan(35*Math.PI/180))+'" r="6" fill="#252b33"/></g>'+tangentTicks+'<text x="'+(x0+w/2)+'" y="'+(y0+47)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#243d55">Marked angle θ</text><text x="16" y="'+(yTop+h/2)+'" transform="rotate(-90 16 '+(yTop+h/2)+')" text-anchor="middle" font-size="13" fill="#243d55">sin θ, cos θ</text><text x="'+(x0+w+46)+'" y="'+(yTop+h/2)+'" transform="rotate(-90 '+(x0+w+46)+' '+(yTop+h/2)+')" text-anchor="middle" font-size="13" fill="#243d55">tan θ</text></svg>';
 const legend=document.createElement('div');legend.className='graph-legend';legend.innerHTML='<span class="legend-sin">● sin θ</span><span class="legend-cos">● cos θ</span><span class="legend-tan">● tan θ</span><span class="legend-angle">⋮ 90° asymptote</span>';
 const lower=document.createElement('div');lower.className='graph-lower';
 const read=document.createElement('p');read.className='graph-limit';read.textContent='As θ → 0°: sin θ → 0, cos θ → 1, tan θ → 0. As θ → 90°⁻: sin θ → 1, cos θ → 0, tan θ → ∞. A right triangle itself requires 0° < θ < 90°.';
 const diagram=document.createElement('div');diagram.className='graph-triangle';
 function update(){const d=Number(slider.value),s=T.trig('sin',d),c=T.trig('cos',d),t=T.trig('tan',d);degrees.textContent=d+'°';values.textContent='sin '+d+'° = '+s.toFixed(3)+'   ·   cos '+d+'° = '+c.toFixed(3)+'   ·   tan '+d+'° = '+t.toFixed(3);const cursor=$('graph-cursor'),sd=$('graph-sin-dot'),cd=$('graph-cos-dot'),td=$('graph-tan-dot');if(cursor){cursor.setAttribute('x1',xOf(d));cursor.setAttribute('x2',xOf(d));sd.setAttribute('cx',xOf(d));sd.setAttribute('cy',yUnit(s));cd.setAttribute('cx',xOf(d));cd.setAttribute('cy',yUnit(c));td.setAttribute('cx',xOf(d));td.setAttribute('cy',yTan(t))}diagram.innerHTML=T.triangle({angle:d,hypotenuse:10,angleLabel:d+'°',marks:{opp:'o',adj:'a',hyp:'h'}})}
 slider.addEventListener('input',update);lower.append(read,diagram);host.append(heading,intro,controls,svgWrap,legend,lower);update();
}
function instruction(){
 const host=$('instructionPanel');host.replaceChildren();
 const [title,body,answer]=slides[cfg.slide];
 const wrap=document.createElement('div');wrap.className='lesson';
 const slide=document.createElement('article');slide.className='slide';
 const heading=document.createElement('h2');heading.textContent=title;const text=document.createElement('p');text.textContent=body;
 slide.append(heading,text);
 if(!pyth&&(cfg.slide===0||cfg.slide===1||cfg.slide===2||cfg.slide===3)){
  const drawing=document.createElement('div');drawing.style.maxWidth='410px';drawing.style.margin='auto';
  const f=familyById(cfg.familyId),[num,den]=ratioSides[f.ratio];drawing.innerHTML=T.triangle({angle:35,hypotenuse:10,angleLabel:'35°',marks:{adj:'a',opp:'o',hyp:'h'},arrows:[num,den],included:f.included});slide.append(drawing)
 }
 if(!pyth&&cfg.slide===3){const map=document.createElement('div');map.className='included-map';map.innerHTML='<div><b>Unmarked adjacent side a</b><span>opposite angle: unmarked</span><strong>sin θ = o/h</strong></div><div><b>Unmarked opposite side o</b><span>opposite angle: marked θ</span><strong>cos θ = a/h</strong></div><div><b>Unmarked hypotenuse h</b><span>opposite angle: right angle</span><strong>tan θ = o/a</strong></div>';slide.append(map)}
 if(!pyth&&cfg.slide===5){const map=document.createElement('div');map.className='included-map nine-families';map.innerHTML='<div><b>1 · sin</b><span>find opposite x</span></div><div><b>2 · sin</b><span>find hypotenuse x</span></div><div><b>3 · sin</b><span>find θ</span></div><div><b>4 · cos</b><span>find adjacent x</span></div><div><b>5 · cos</b><span>find hypotenuse x</span></div><div><b>6 · cos</b><span>find θ</span></div><div><b>7 · tan</b><span>find opposite x</span></div><div><b>8 · tan</b><span>find adjacent x</span></div><div><b>9 · tan</b><span>find θ</span></div>';slide.append(map)}
 if(cfg.reveal){const reveal=document.createElement('div');reveal.className='notice math';reveal.textContent=answer;slide.append(reveal)}
 const nav=document.createElement('div');nav.className='slide-nav';
 const previous=document.createElement('button');previous.textContent='← Previous';previous.disabled=cfg.slide===0;previous.onclick=()=>{cfg.slide--;cfg.reveal=false;instruction()};
 const progress=document.createElement('span');progress.textContent='Instruction '+(cfg.slide+1)+' / '+slides.length;
 const show=document.createElement('button');show.textContent=cfg.reveal?'Hide explanation':'Explain';show.onclick=()=>{cfg.reveal=!cfg.reveal;instruction()};
 const next=document.createElement('button');next.className='primary';next.textContent=cfg.slide===slides.length-1?'Practise':'Next →';next.onclick=()=>{if(cfg.slide===slides.length-1)mode('practice');else{cfg.slide++;cfg.reveal=false;instruction()}};
 nav.append(previous,progress,show,next);wrap.append(slide,nav);host.append(wrap)
}
function practice(){
 const q=makeQuestion(),display=cfg.mode==='display';
 cfg.activeQuestion=q;renderToolbar(q);
 if(display){
  $('displayTriangle').innerHTML=questionTriangle(q);
  $('displayEquation').textContent=equation(q,cfg.step>0);
  return;
 }
 $('triangle').innerHTML=questionTriangle(q);
 $('questionTitle').textContent=pyth?'Question '+(cfg.question+1):'Family '+q.familyId+' · Example '+(cfg.question+1);
 $('questionText').textContent=questionText(q);
 $('prediction').textContent=prediction(q);
 $('ratioEquation').textContent=equation(q,display?cfg.step>0:cfg.step>=3);
 const includedNames={unmarked:'unmarked acute angle',marked:'marked angle θ',right:'right angle 90°'};
 $('included').textContent=pyth?'Right angle marked':'Arrows meet at the '+includedNames[q.included]+'. The omitted side is '+sideNames[q.omitted]+'. Keep θ marked in the calculation.';
 const labels=pyth?['Identify the longest side','Predict the missing side','Choose addition or subtraction of squares','Calculate and check']:['Mark θ','Read the two arrowed sides','Name their included angle','Check the omitted-side cue','Write the ratio and find x or θ'];
 const container=$('steps');container.replaceChildren();
 if(display)container.hidden=true;else{
  container.hidden=false;
  labels.forEach((t,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+t;b.className=i<cfg.step?'done':'';b.onclick=()=>{cfg.step=i+1;practice()};container.append(b)})
 }
 $('practiceExtra').textContent=cfg.step>0||display?'Prediction: '+prediction(q):'';
 $('worked').hidden=cfg.step<labels.length&&!display;
 $('worked').textContent=equation(q,true);
 
}
function startAssessment(type){
 cfg.attempts=0;cfg.wrong=[];cfg.chosen=null;cfg.quizIndex=0;cfg.quizScore=0;cfg.testScore=0;cfg.submitted=false;
 cfg.quizQuestions=Array.from({length:4},(_,i)=>makeQuestion(cfg.question+i,true,cfg.familyId));
 cfg.testAnswers=Array(4).fill('');
 assessment();
}
function matchesAnswer(value,q){
 if(String(value).trim()==='')return false;
 const entered=Number(value);
 return Number.isFinite(entered)&&round(entered)===round(correctAnswer(q));
}
function assessment(){
 const host=$('assessmentPanel');host.replaceChildren();
 if(cfg.quizIndex===4){
  const done=document.createElement('section');done.className='assessment';done.innerHTML='<h2>'+(cfg.mode==='quiz'?'Quiz':'Test')+' complete</h2><p>Score: '+(cfg.mode==='quiz'?cfg.quizScore:cfg.testScore)+' / 4</p><button class="primary" id="assessmentDone">Back to practice</button>';host.append(done);$('assessmentDone').onclick=()=>mode('practice');return;
 }
 const q=cfg.quizQuestions[cfg.quizIndex],answer=correctAnswer(q);cfg.activeQuestion=q;renderToolbar(q);
 const box=document.createElement('section');box.className='assessment';
 const top=document.createElement('div');top.className='assessment-topbar';
 const status=document.createElement('div');status.className='assessment-status';
 const title=document.createElement('strong');title.textContent=(cfg.mode==='quiz'?'Quiz':'Test')+(pyth?' · Pythagoras':' · Family '+q.familyId);
 const progress=document.createElement('div');progress.className='question-progress';
 for(let i=0;i<4;i++){const mark=document.createElement('span');mark.className='question-chip'+(i===cfg.quizIndex?' current':'')+(i<cfg.quizIndex?' complete':'');mark.textContent=String(i+1);progress.append(mark)}
 const score=document.createElement('span');score.className='running-score';score.textContent='Score: '+(cfg.mode==='quiz'?cfg.quizScore:cfg.testScore)+' / 4';
 status.append(title,progress,score);
 const next=document.createElement('button');next.className='primary assessment-next';
 if(cfg.mode==='quiz'){
  next.textContent=cfg.quizIndex===3?'Finish quiz':'Next →';next.disabled=cfg.chosen===null;
  next.onclick=()=>{cfg.quizIndex++;cfg.attempts=0;cfg.chosen=null;cfg.wrong=[];assessment()};
 }else{
  next.textContent=cfg.submitted?(cfg.quizIndex===3?'Finish test':'Next →'):'Check answer';next.disabled=cfg.submitted===false&&cfg.testAnswers[cfg.quizIndex]==='';
  next.onclick=()=>{if(!cfg.submitted){cfg.submitted=true;if(matchesAnswer(cfg.testAnswers[cfg.quizIndex],q))cfg.testScore++;assessment()}else{cfg.quizIndex++;cfg.submitted=false;assessment()}};
 }
 top.append(status,next);box.append(top);
 const question=document.createElement('p');question.className='assessment-question';question.textContent=questionText(q);box.append(question);
 const pic=document.createElement('div');pic.className='triangle assessment-triangle';pic.innerHTML=questionTriangle(q);box.append(pic);
 if(cfg.mode==='quiz'){
  const choices=document.createElement('div');choices.className='cards';
  const spread=Math.max(.8,Math.abs(answer)*.16),values=[answer,answer+spread,Math.max(.1,answer-spread),answer+2*spread];
  const order=[[2,0,3,1],[1,3,0,2],[3,1,2,0],[0,2,1,3]][cfg.quizIndex],correctIndex=order.indexOf(0);
  order.forEach((choice,j)=>{const value=values[choice],b=document.createElement('button');b.textContent=fmt(value)+(q.find==='angle'?'°':'');b.disabled=cfg.chosen!==null||cfg.wrong.includes(j);if(cfg.wrong.includes(j))b.className='wrong';if(cfg.chosen!==null&&j===correctIndex)b.className='right';b.onclick=()=>{if(cfg.chosen!==null||cfg.wrong.includes(j))return;const ok=choice===0;cfg.attempts++;if(!ok)cfg.wrong.push(j);if(ok){cfg.chosen=j;cfg.quizScore++}else if(cfg.attempts>=2)cfg.chosen=j;Assess.playSound(ok?true:cfg.attempts>=2?'final-wrong':false,cfg.sound);assessment()};choices.append(b)});
  const feedback=document.createElement('p');feedback.className='feedback';feedback.textContent=cfg.attempts===0?'Choose an answer.':cfg.chosen===null?'One more attempt.':cfg.chosen===correctIndex?'Correct.':'Two attempts used. Correct answer: '+fmt(answer)+(q.find==='angle'?'°':'');box.append(choices,feedback);
  const sound=document.createElement('button');sound.className='sound-toggle';sound.textContent='Sound '+(cfg.sound?'On':'Off');sound.onclick=()=>{cfg.sound=!cfg.sound;assessment()};box.append(sound);
 }else{
  const label=document.createElement('label');label.className='test-answer-label';label.textContent=q.find==='angle'?'θ =':'x =';
  const input=document.createElement('input');input.className='input-answer';input.type='number';input.step='any';input.value=cfg.testAnswers[cfg.quizIndex];input.disabled=cfg.submitted;input.setAttribute('aria-label','Answer for question '+(cfg.quizIndex+1));input.oninput=()=>{cfg.testAnswers[cfg.quizIndex]=input.value;next.disabled=input.value===''};input.onkeydown=event=>{if(event.key==='Enter'&&!cfg.submitted&&input.value!==''){cfg.submitted=true;if(matchesAnswer(cfg.testAnswers[cfg.quizIndex],q))cfg.testScore++;assessment()}};label.append(input);box.append(label);
  if(cfg.submitted){const ok=matchesAnswer(cfg.testAnswers[cfg.quizIndex],q),feedback=document.createElement('p');feedback.className='feedback'+(ok?' correct':'');feedback.textContent=ok?'Correct.':'Expected '+fmt(answer)+(q.find==='angle'?'°':'');box.append(feedback)}
 }
 host.append(box);
}
function sheet(){
 const questions=Array.from({length:6},(_,i)=>makeQuestion(cfg.question+i,true)),title=(pyth?'Pythagoras':fixedRatio?ratioInfo[fixedRatio].title+' Ratio':'Right-Angled Trigonometry')+' · Six questions';
 const body=questions.map((q,i)=>'<article><b>'+(i+1)+'.</b> '+questionText(q)+'<div class="diagram">'+questionTriangle(q)+'</div><div class="space"></div></article>').join('');
 const answers=questions.map((q,i)=>'<p>'+(i+1)+'. '+fmt(correctAnswer(q))+'</p>').join('');
 const html='<!doctype html><html><head><title>'+title+'</title><style>@page{size:A4;margin:14mm}body{font:15px Arial}h1{font-size:22px}main{display:grid;grid-template-columns:1fr 1fr;gap:12px}article{border:1px solid #eee;padding:10px;min-height:240px;break-inside:avoid}.diagram svg{max-width:100%;height:135px}.space{height:55px}.key{break-before:page}button{padding:10px}@media print{button{display:none}}</style></head><body><button onclick="print()">Print / Save PDF</button><h1>'+title+'</h1><p>Name: __________________________</p><main>'+body+'</main><div class="key"><h2>Answer key</h2>'+answers+'</div></body></html>';
 const win=window.open('','_blank');if(!win){alert('Allow pop-ups to open Sheets.');return}win.document.write(html);win.document.close();
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>mode(b.dataset.mode));
document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{cfg.ratio=b.dataset.ratio;cfg.question=0;renderToolbar();if(cfg.mode==='practice'||cfg.mode==='display')practice()});
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{cfg.route=b.dataset.route;renderToolbar();if(cfg.route==='unknown')setOptionsOpen(true)});
$('optionsToggle').onclick=()=>setOptionsOpen(!$('optionsPanel').classList.contains('open'));
if($('optionsClose'))$('optionsClose').onclick=()=>setOptionsOpen(false);
if($('optionsBackdrop'))$('optionsBackdrop').onclick=()=>setOptionsOpen(false);
document.addEventListener('keydown',event=>{if(event.key==='Escape')setOptionsOpen(false)});
$('find').onchange=()=>{cfg.find=$('find').value;cfg.question=0;if(cfg.mode==='practice'||cfg.mode==='display')practice()};
$('pythFind').onchange=()=>{cfg.testType=$('pythFind').value;cfg.question=0;if(cfg.mode==='practice'||cfg.mode==='display')practice()};
$('bank').onchange=()=>{cfg.bank=$('bank').value;cfg.question=0;cfg.activeQuestion=null;renderToolbar();if(cfg.mode==='practice'||cfg.mode==='display')practice()};
$('precision').onchange=()=>{cfg.precision=Number($('precision').value);if(cfg.mode==='practice'||cfg.mode==='display')practice()};
$('angle').oninput=()=>{cfg.angle=Number($('angle').value);$('angleOut').textContent=cfg.angle+'°';if(cfg.mode==='practice'||cfg.mode==='display')practice()};
$('hyp').oninput=()=>{cfg.hyp=Number($('hyp').value);$('hypOut').textContent=String(cfg.hyp);if(cfg.mode==='practice'||cfg.mode==='display')practice()};
$('highlight').onclick=()=>{cfg.showRays=!cfg.showRays;practice()};
$('stepReset').onclick=()=>{cfg.step=0;practice()};
$('stepWorked').onclick=()=>{cfg.step=pyth?4:5;practice()};
$('newQuestion').onclick=()=>{cfg.question++;cfg.step=0;practice()};
$('displayAnswer').onclick=()=>{cfg.step=cfg.step?0:5;practice()};
$('displayNew').onclick=()=>{cfg.question++;cfg.step=0;practice()};
$('sheetOpen').onclick=sheet;
$('pythBank').hidden=!pyth;if($('questionRoute'))$('questionRoute').textContent=pyth?'Identify the hypotenuse and choose squares':fixedRatio?ratioInfo[fixedRatio].formula+' · calculate either side or the angle':'Find two marked sides and their included angle';
$('trigFind').hidden=true;
 $('angleControl').hidden=pyth;$('hypControl').hidden=pyth;
mode(pyth?'instruction':'practice');
})();
