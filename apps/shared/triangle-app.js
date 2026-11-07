(function(){
'use strict';
const $=id=>document.getElementById(id),T=window.TriangleMath,Assess=window.MathsAssessment;
const kind=document.body.dataset.app,pyth=kind==='pythagoras';
const fixedRatio=['sin','cos','tan'].includes(document.body.dataset.ratio)?document.body.dataset.ratio:null;
const cfg={mode:'instruction',ratio:fixedRatio||'sin',route:'ratio',find:'num',bank:pyth?'triples':'decimal',precision:1,angle:35,hyp:10,step:0,slide:0,reveal:false,question:0,activeQuestion:null,showRays:false,sound:true,attempts:0,wrong:[],chosen:null,quizIndex:0,quizQuestions:[],testQuestions:[],testAnswers:[],submitted:false,testType:'any'};
const ratioSides={sin:['opp','hyp'],cos:['adj','hyp'],tan:['opp','adj']},round=v=>T.round(v,cfg.precision),fmt=v=>String(round(v));
const sideNames={opp:'opposite',adj:'adjacent',hyp:'hypotenuse'};
const tripleList=T.bank();
function makeQuestion(n=cfg.question,vary=false){
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
 const entry=tripleList[n%tripleList.length],useTriple=cfg.bank==='triples';
 const variedAngle=Math.max(5,Math.min(85,cfg.angle+(n%3-1)*4));
 const rawAngle=useTriple?entry.angle:cfg.bank==='surds'?[30,45,60][n%3]:vary?variedAngle:cfg.angle;
 const variedHyp=Math.max(3,Math.min(20,Math.round((cfg.hyp+(n%3-1)*1.5)*2)/2));
 const h=useTriple?entry.c:vary?variedHyp:cfg.hyp,original=T.sides(rawAngle,h);
 const given={opp:round(original.opp),adj:round(original.adj),hyp:round(original.hyp)};
 const find=cfg.route==='unknown'?cfg.find:['num','den','angle'][n%3],[num,den]=ratioSides[cfg.ratio];
 const displayAngle=round(rawAngle),value=T.trig(cfg.ratio,displayAngle),ratio=given[num]/given[den];
 const answer=find==='angle'?
  (cfg.ratio==='sin'?Math.asin(Math.min(1,Math.max(-1,ratio))):
   cfg.ratio==='cos'?Math.acos(Math.min(1,Math.max(-1,ratio))):Math.atan(ratio))*180/Math.PI:
  find==='num'?given[den]*value:given[num]/value;
 return {...given,hyp:original.hyp,angle:find==='angle'?answer:displayAngle,find,answer,ratio:cfg.ratio};
}
function correctAnswer(q){return q.answer}
function questionText(q){
 if(pyth)return q.find==='hyp'?'Find the hypotenuse.':q.find==='adj'?'Find the missing horizontal side.':'Find the missing vertical side.';
 const [num,den]=ratioSides[q.ratio];return q.find==='angle'?'Find θ using the two marked sides.':q.find==='num'?'Find the '+sideNames[num]+' side.':'Find the '+sideNames[den]+' side.';
}
function questionTriangle(q,answers=false){
 if(pyth){const marks={adj:q.find==='adj'?'?':fmt(q.given.adj),opp:q.find==='opp'?'?':fmt(q.given.opp),hyp:q.find==='hyp'?'?':fmt(q.given.hyp)};
  return T.triangle({angle:q.angle,hypotenuse:q.h,marks,highlight:cfg.showRays?['adj','opp','hyp']:[]});}
 const [num,den]=ratioSides[q.ratio];let marks={opp:'O',adj:'A',hyp:'H'};
 for(const k of [num,den])marks[k]=q.find==='angle'?fmt(q[k]):q.find==='num'&&k===num?'?':q.find==='den'&&k===den?'?':fmt(q[k]);
 return T.triangle({angle:q.angle,hypotenuse:q.hyp,angleLabel:q.find==='angle'&&!answers?'?°':fmt(q.angle)+'°',marks,highlight:cfg.showRays?[num,den]:[]});
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
 const r=q.ratio,[num,den]=ratioSides[r],value=T.trig(r,q.angle);
 if(!worked)return r+(q.find==='angle'?' θ':' '+fmt(q.angle)+'°')+' = '+num+' / '+den;
 if(q.find==='angle')return 'θ = '+r+'⁻¹('+fmt(q[num])+' / '+fmt(q[den])+') = '+fmt(q.answer)+'°';
 if(q.find==='num')return num+' = '+fmt(q[den])+' × '+r+'('+fmt(q.angle)+'°) = '+fmt(q.answer);
 return den+' = '+fmt(q[num])+' ÷ '+r+'('+fmt(q.angle)+'°) = '+fmt(q.answer);
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
 $('ratioControls').hidden=pyth||Boolean(fixedRatio);
 $('routeControls').hidden=pyth;
 $('bank').value=cfg.bank;$('find').value=question?question.find:cfg.find;
 $('find').disabled=cfg.route==='ratio'||cfg.mode==='quiz'||cfg.mode==='test';
 $('trigFind').hidden=pyth||cfg.mode==='test';
 $('pythFind').value=cfg.testType;
 $('precision').value=String(cfg.precision);
 $('bank').disabled=cfg.mode==='quiz'||cfg.mode==='test';$('precision').disabled=cfg.mode==='quiz'||cfg.mode==='test';
 const exactBank=cfg.bank==='triples',specialBank=cfg.bank==='surds';
 $('angleControl').hidden=pyth||exactBank||specialBank||cfg.mode==='test'||Boolean(question&&question.find==='angle');
 $('hypControl').hidden=pyth||exactBank||cfg.mode==='test'||Boolean(question&&(question.ratio==='tan'||question.find==='den'&&ratioSides[question.ratio][1]==='hyp'));
 if(question&&!pyth){
  if(!$('angleControl').hidden){cfg.angle=Number(question.angle);$('angle').value=cfg.angle;$('angleOut').textContent=cfg.angle+'°';}
  if(!$('hypControl').hidden){cfg.hyp=Number(question.hyp);$('hyp').value=cfg.hyp;$('hypOut').textContent=String(cfg.hyp);}
 }
}
function setOptionsOpen(open){
 const panel=$('optionsPanel'),toggle=$('optionsToggle'),backdrop=$('optionsBackdrop');
 panel.classList.toggle('open',open);
 toggle.setAttribute('aria-expanded',String(open));
 if(backdrop)backdrop.hidden=!open;
}
function mode(mode){cfg.mode=mode;cfg.showRays=false;cfg.step=0;cfg.reveal=false;
 setOptionsOpen(false);
 for(const m of ['instruction','practice','display','quiz','test','sheets'])$(m+'Panel').hidden=m!==mode;
 $('assessmentPanel').hidden=mode!=='quiz'&&mode!=='test';
 renderToolbar();
 if(mode==='instruction')instruction();
 if(mode==='practice'||mode==='display')practice();
 if(mode==='quiz'||mode==='test')startAssessment(mode);
 if(mode==='sheets')$('sheetsPanel').hidden=false;
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
['See the two sides first','Identify the marked acute reference angle and the two relevant sides. Imagine each side as a ray. Which angle lies between them?','The INCLUDED angle may be the marked angle, the other acute angle, or the right angle.'],
['Pre-teach the language','Side, ray, right angle, acute angle, opposite, adjacent, hypotenuse, reference angle, included angle, ratio, numerator and denominator.','Opposite and adjacent depend on your chosen acute reference angle.'],
['Discover sine','Opposite and hypotenuse meet at the OTHER acute angle. The reference angle θ is not their included angle.','sin θ = opposite / hypotenuse.'],
['Discover cosine','Adjacent and hypotenuse meet at the marked acute reference angle.','cos θ = adjacent / hypotenuse.'],
['Discover tangent','The two shorter sides, opposite and adjacent, meet at the right angle.','tan θ = opposite / adjacent.'],
['Find three different unknowns','Find numerator by multiplying ratio and denominator. Find denominator by dividing numerator by ratio. Find θ by using the inverse function.','O = H sin θ; H = O / sin θ; θ = sin⁻¹(O/H).'],
['How the ratio changes','As θ increases with hypotenuse fixed, sine rises and cosine falls. Tangent increases and passes 1 at 45°.','For θ from 0° to 90°, sin rises from 0 to 1, cos falls from 1 to 0 and tan grows without bound.'],
['Proportionality needs a constant','At fixed θ, O is directly proportional to H. At fixed O, H is inversely proportional to sine. At fixed H, adjacent is directly proportional to cosine.','Do not call adjacent inversely proportional to cos; A = H cos θ.']
];
const ratioInfo={
 sin:{title:'Sine',numerator:'opposite',denominator:'hypotenuse',formula:'sin θ = O ÷ H',findNumerator:'O = H × sin θ',findDenominator:'H = O ÷ sin θ',findAngle:'θ = sin⁻¹(O ÷ H)',trend:'As the acute angle θ increases, sine increases.',limits:'As θ approaches 0°, sin θ approaches 0. As θ approaches 90°, sin θ approaches 1. Therefore 0 < sin θ < 1.',
  valueText:(a,v)=>'sin '+a+'° = '+v.toPrecision(3)+'; the value stays below 1 for every acute angle.'},
 cos:{title:'Cosine',numerator:'adjacent',denominator:'hypotenuse',formula:'cos θ = A ÷ H',findNumerator:'A = H × cos θ',findDenominator:'H = A ÷ cos θ',findAngle:'θ = cos⁻¹(A ÷ H)',trend:'As the acute angle θ increases, cosine decreases.',limits:'As θ approaches 0°, cos θ approaches 1. As θ approaches 90°, cos θ approaches 0. Therefore 0 < cos θ < 1.',
  valueText:(a,v)=>'cos '+a+'° = '+v.toPrecision(3)+'; the value stays between 0 and 1 for every acute angle.'},
 tan:{title:'Tangent',numerator:'opposite',denominator:'adjacent',formula:'tan θ = O ÷ A',findNumerator:'O = A × tan θ',findDenominator:'A = O ÷ tan θ',findAngle:'θ = tan⁻¹(O ÷ A)',trend:'As the acute angle θ increases, tangent increases. At 45°, opposite and adjacent are equal, so tan θ = 1.',limits:'As θ approaches 0°, tan θ approaches 0. As θ approaches 90° from below, tan θ grows without bound. Tangent has no upper limit.',
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
const slides=fixedRatio?focusedRatioSlides(fixedRatio):generalSlides;
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
  diagram.innerHTML=T.triangle({angle:degrees,hypotenuse:10,angleLabel:degrees+'°',marks:{adj:'A',opp:'O',hyp:'H'}});
 }
 slider.addEventListener('input',update);update();area.append(controls,diagram);return area;
}
function instruction(){
 const host=$('instructionPanel');host.replaceChildren();
 const [title,body,answer]=slides[cfg.slide];
 const wrap=document.createElement('div');wrap.className='lesson';
 const slide=document.createElement('article');slide.className='slide';
 const heading=document.createElement('h2');heading.textContent=title;const text=document.createElement('p');text.textContent=body;
 slide.append(heading,text);
 if(cfg.slide===0||cfg.slide===1){
  const drawing=document.createElement('div');drawing.style.maxWidth='410px';drawing.style.margin='auto';
  drawing.innerHTML=T.triangle({angle:35,hypotenuse:10,angleLabel:'35°',marks:{adj:'A',opp:'O',hyp:'H'},highlight:[]});slide.append(drawing)
 }
 if(fixedRatio&&cfg.slide===slides.length-1)slide.append(ratioExplorer(fixedRatio));
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
 $('questionTitle').textContent='Question '+(cfg.question+1);
 $('questionText').textContent=questionText(q);
 $('prediction').textContent=prediction(q);
 $('ratioEquation').textContent=equation(q,display?cfg.step>0:cfg.step>=3);
 $('included').textContent=pyth?'Right angle marked':cfg.ratio==='sin'?'Included angle: other acute angle':cfg.ratio==='cos'?'Included angle: reference angle':'Included angle: right angle';
 const labels=pyth?['Identify the longest side','Predict the missing side','Choose addition or subtraction of squares','Calculate and check']:['Mark the reference angle','Identify the two needed sides','Find their included angle','Write the correct ratio','Rearrange and calculate'];
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
 cfg.attempts=0;cfg.wrong=[];cfg.chosen=null;cfg.quizIndex=0;cfg.submitted=false;
 cfg.quizQuestions=Array.from({length:4},(_,i)=>makeQuestion(cfg.question+i,true));
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
 if(cfg.mode==='quiz'&&cfg.quizIndex<4){cfg.activeQuestion=cfg.quizQuestions[cfg.quizIndex];renderToolbar(cfg.activeQuestion)}
 else if(cfg.mode==='test'){cfg.activeQuestion=null;renderToolbar(null)}
 if(cfg.mode==='quiz'){
  if(cfg.quizIndex===4){
   const done=document.createElement('div');done.className='assessment';done.innerHTML='<h2>Quiz complete</h2><p>Four questions completed.</p>';host.append(done);return;
  }
  const q=cfg.quizQuestions[cfg.quizIndex],answer=correctAnswer(q),box=document.createElement('section');box.className='assessment';
  const title=document.createElement('h2');title.textContent='Quiz · Question '+(cfg.quizIndex+1)+' / 4';
  const question=document.createElement('p');question.textContent=questionText(q);
  const pic=document.createElement('div');pic.className='triangle';pic.innerHTML=questionTriangle(q);
  const choices=document.createElement('div');choices.className='cards';
  const spread=Math.max(.8,Math.abs(answer)*.16);
  const values=[answer,answer+spread,Math.max(.1,answer-spread),answer+2*spread];
  const order=[[2,0,3,1],[1,3,0,2],[3,1,2,0],[0,2,1,3]][cfg.quizIndex];
  const correctIndex=order.indexOf(0);
  order.forEach((choice,j)=>{const value=values[choice],b=document.createElement('button');b.textContent=fmt(value)+(pyth||q.find!=='angle'?'':'°');b.disabled=cfg.chosen!==null||cfg.wrong.includes(j);if(cfg.wrong.includes(j))b.className='wrong';
   if(cfg.chosen!==null&&j===correctIndex)b.className='right';
   b.onclick=()=>{if(cfg.chosen!==null||cfg.wrong.includes(j))return;
    const ok=choice===0;cfg.attempts++;if(!ok)cfg.wrong.push(j);
    const finished=ok||cfg.attempts>=2;
    if(finished)cfg.chosen=j;
    Assess.playSound(ok?true:finished?'final-wrong':false,cfg.sound);assessment();
   };choices.append(b)});
  const feedback=document.createElement('p');feedback.className='feedback';
  feedback.textContent=cfg.attempts===0?'Choose an answer. Sound is on by default.':cfg.chosen===null?'One more chance. Your next answer is final.':cfg.chosen===correctIndex?'Correct.':'Two incorrect attempts. Correct answer: '+fmt(answer);
  const next=document.createElement('button');next.className='primary';next.textContent=cfg.quizIndex===3?'Finish quiz':'Next →';next.disabled=cfg.chosen===null;next.onclick=()=>{cfg.quizIndex++;cfg.attempts=0;cfg.chosen=null;cfg.wrong=[];assessment()};
  const sound=document.createElement('button');sound.textContent='Sound '+(cfg.sound?'On':'Off');sound.onclick=()=>{cfg.sound=!cfg.sound;assessment()};
  box.append(title,question,pic,choices,feedback,next,sound);host.append(box);return;
 }
 const box=document.createElement('section');box.className='assessment';
 const title=document.createElement('h2');title.textContent='Test · Write your answers';box.append(title);
 cfg.quizQuestions.forEach((q,i)=>{
  const row=document.createElement('div');row.className='test-question';
  const label=document.createElement('label');label.textContent=(i+1)+'. '+questionText(q)+' ';
  const pic=document.createElement('div');pic.className='triangle';pic.style.maxWidth='320px';pic.innerHTML=questionTriangle(q);row.append(pic);
  const input=document.createElement('input');input.className='input-answer';input.type='number';input.step='any';input.value=cfg.testAnswers[i];input.disabled=cfg.submitted;
  input.setAttribute('aria-label','Answer for question '+(i+1));input.oninput=()=>{cfg.testAnswers[i]=input.value};label.append(input);row.append(label);
  if(cfg.submitted){
   const answer=correctAnswer(q),ok=matchesAnswer(cfg.testAnswers[i],q);
   const feedback=document.createElement('p');feedback.className='feedback'+(ok?' correct':'');feedback.textContent=ok?'Correct.':'Expected '+fmt(answer);row.append(feedback)
  }
  box.append(row);
 });
 if(!cfg.submitted){const submit=document.createElement('button');submit.className='primary';submit.textContent='Submit test';submit.onclick=()=>{cfg.submitted=true;assessment()};box.append(submit)}
 else {const count=cfg.quizQuestions.filter((q,i)=>matchesAnswer(cfg.testAnswers[i],q)).length;
  const summary=document.createElement('h3');summary.textContent='Score: '+count+' / 4';box.append(summary)}
 host.append(box)
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
$('questionRoute').textContent=pyth?'Identify the hypotenuse and choose squares':fixedRatio?ratioInfo[fixedRatio].formula+' · calculate either side or the angle':'Find two marked sides and their included angle';
$('pythBank').hidden=!pyth;$('trigFind').hidden=pyth;
 $('angleControl').hidden=pyth;$('hypControl').hidden=pyth;
mode('instruction');
})();
