/* Shared sequence-teaching engine. Arithmetic, quadratic and geometric use one UI. */
(function(){
'use strict';
const $=x=>document.getElementById(x);
const kind=document.body.dataset.kind||'linear';
const isGeo=kind==='geometric',isQuad=kind==='quadratic',isLin=kind==='linear';
const state={step:0,mode:'learn',example:0,questions:[],q:0,attempts:0,complete:false,points:0,records:[]};
const text=(n)=>String(n).replace(/-/g,'−');
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sign=n=>n<0?'−'+Math.abs(n):'+'+n;
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const num=(s)=>Number(String(s).replace(/−/g,'-').trim());
const tidy=s=>String(s).toLowerCase().replace(/[−–]/g,'-').replace(/\s+/g,'').replace(/^\s*(t_?n|t\(n\))=/i,'').replace(/^\+/,'');
const formula=(d,c)=> (d===1?'n':d===-1?'−n':text(d)+'n')+(c===0?'':sign(c));
const format=n=>Number.isInteger(n)?text(n):Number(n.toFixed(5)).toString().replace(/-/g,'−');
const dfrac=(top,bottom)=>'<span class="dfrac" role="math" aria-label="'+esc(top)+' over '+esc(bottom)+'"><span class="dfrac-top">'+esc(top)+'</span><span class="dfrac-bottom">'+esc(bottom)+'</span></span>';
const prettyWorking=s=>esc(s).replace(/\bn\/2\b/g,dfrac('n','2')).replace(/\b10\/2\b/g,dfrac('10','2')).replace(/\b8\/2\b/g,dfrac('8','2'));

const config=()=>{
 if(isGeo){let r=state.example===0?2:1/3,a=state.example===0?3:81;return {a,r,values:[0,1,2,3].map(i=>a*Math.pow(r,i)),c:a/r}}
 if(isQuad){let a=1,b=6,c=4;return {a,b,c,values:[1,2,3,4].map(n=>a*n*n+b*n+c),dif:[9,11,13]}}
 return {a:7,d:state.example===0?2:-3,values:[0,1,2,3].map(i=>7+i*(state.example===0?2:-3)),c:7-(state.example===0?2:-3)};
};
const lesson=isGeo?[
 ['Read the terms','Start with four terms. Look for how each number changes into the next.'],
 ['Show the first under-arc','Instead of subtracting, divide each term by the term before it. For now, say multiply by two or divide by three.'],
 ['Check every under-arc','When the same non-zero ratio repeats, the sequence is geometric.'],
 ['Work one term backwards','Going backwards reverses the operation. That is term zero, not term one.'],
 ['General term','Start at the first term and multiply by the common ratio once for each step after term one.'],
 ['Find a later term','Substitute the term number. Keep the powers distinct from multiplication of the starting value.'],
 ['A missing middle term','For three consecutive positive geometric terms, the middle term squared equals the product of the outer terms.'],
 ['Repeated depreciation','A reduction of 20% each year means keep 80%, so repeatedly multiply by 0.8. Compare with subtraction of a fixed amount.'],
 ['Extend','At higher level we can investigate geometric sums and, when |r| is less than one, the sum to infinity.']
]:isQuad?[
 ['Look at the terms','Draw the numbers with generous spacing. Do not guess a formula yet.'],
 ['Draw first under-arcs','Subtract adjacent terms, keeping the signs.'],
 ['Draw second under-arcs','Subtract adjacent first differences. All second differences are the same.'],
 ['Classify','A constant non-zero second difference identifies a quadratic sequence.'],
 ['Find a','The coefficient of n squared equals half the constant second difference.'],
 ['Backtrack','Extend the first differences one step backwards, then backtrack from term one to a boxed term zero. This is c.'],
 ['Find b','At n equals one, T1 = a + b + c. Subtract a and c from the first term.'],
 ['Write and check the rule','Substitute a, b and c into Tn = an² + bn + c, then check more than one term.']
]:[
 ['Write four terms','Start with the first term and write four consecutive terms, separated by spaces.'],
 ['Under-arc and subtract','Take the next term minus the previous term, stating the sign explicitly.'],
 ['Check the differences','All first differences are the same: this is a linear (arithmetic) sequence.'],
 ['Reverse one step','Go backwards from term one by subtracting the common difference. Box term zero.'],
 ['Write Tn','The signed common difference is the coefficient of n. Term zero is the constant.'],
 ['Calculate T50','Substitute n = 50 into the general term.'],
 ['Find the term number','Set the term equal to a given value, and solve for n.'],
 ['Three consecutive terms','The middle term is the average of the first and third terms. No term formula is needed.'],
 ['Pair a short sum','Pair the first and last, then the second and second-last. Each pair has the same sum.'],
 ['Write forwards and backwards','Arrange the same sum twice, in opposite orders. Each column gives first plus last.'],
 ['Find the sum formula','There are n columns, so 2Sn = n(first + last). Divide by two. Find the printed formula on page 22 of the Formulae and Tables booklet.'],
 ['Given the sum: solve for n','Substitute the sum, first term and common difference into the same formula. Solve the resulting equation, then keep only a positive integer number of terms.'],
 ['Given the sum: solve for a','You know the sum, number of terms and difference. Isolate a, which means the first term T1, not the backwards term T0.'],
 ['Given the sum: solve for d','You know the sum, number of terms and first term. Solve for the signed common difference d.'],
 ['Try an exam-paper question','The 2026 Ordinary Level Paper 1 Question 5 combines the general term, a missing middle term and an arithmetic sum threshold.']
];
const svgTxt=(x,y,s,size=32,colour='#1e3b59')=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" fill="'+colour+'" font-family="Cambria Math, Georgia, serif">'+esc(s)+'</text>';
function sequenceSVG(){
 const cfg=config(),v=cfg.values,x=[155,325,495,665],s=state.step;
 let out='<svg viewBox="0 0 820 285" role="img" aria-label="Sequence terms and labelled difference or ratio under-arcs">';
 x.forEach((a,i)=>{out+=svgTxt(a,33,'T'+(i+1),19,'#617589')+svgTxt(a,90,format(v[i]),39);});
 if(s>=1){
  const count=s===1?1:3;
  for(let i=0;i<count;i++){
   const diff=isGeo?(cfg.r===2?'×2':'÷3'):(isQuad?cfg.dif[i]:sign(cfg.d));
   out+='<path d="M '+(x[i]+18)+' 108 Q '+((x[i]+x[i+1])/2)+' 186 '+(x[i+1]-18)+' 108" stroke="#2876b6" stroke-width="3" fill="none"/>';
   out+=svgTxt((x[i]+x[i+1])/2,165,diff,23,'#2065a3');
  }
 }
 if(isQuad&&s>=2){
  for(let i=0;i<2;i++){
   const x1=(x[i]+x[i+1])/2,x2=(x[i+1]+x[i+2])/2;
   out+='<path d="M '+(x1+24)+' 183 Q '+((x1+x2)/2)+' 260 '+(x2-24)+' 183" stroke="#448d64" stroke-width="3" fill="none"/>';
   out+=svgTxt((x1+x2)/2,251,'+2',20,'#367a51');
  }
 }
 if((isLin&&s>=3)||(isQuad&&s>=5)||(isGeo&&s>=3)){
  let c=isQuad?cfg.c:cfg.c;
  out+='<rect x="18" y="47" width="84" height="60" fill="#fff5de" stroke="#bd821b" stroke-width="3" rx="5"/>';
  out+=svgTxt(60,35,'T0',18,'#9a6513')+svgTxt(60,90,format(c),36,'#915e14');
  out+='<path d="M 140 115 Q 113 214 69 116" stroke="#bd821b" stroke-width="3" fill="none"/>';
  out+=svgTxt(78,220,isGeo?(cfg.r===2?'÷2':'×3'):(isQuad?'−7':sign(-cfg.d)),22,'#9a6513');
 }
 out+='</svg>';return out;
}
function seriesView(){
 const c=config(), terms=[c.a,c.a+c.d,c.a+2*c.d,c.a+3*c.d],s=state.step;
 const paired=terms.map((x,i)=>({top:x,bottom:terms[3-i]}));
 let h='';
 if(s===8){
   h='<div class="display-equation">S₄ = ('+format(terms[0])+' + '+format(terms[3])+') + ('+format(terms[1])+' + '+format(terms[2])+') = '+format(terms.reduce((a,b)=>a+b,0))+'</div>';
 }else{
   h='<div class="pairing-proof" aria-label="The series written forwards and backwards, with four equal pair sums">'+paired.map(x=>'<div class="pairing-column"><span>'+format(x.top)+'</span><span>+ '+format(x.bottom)+'</span><span class="sumline">'+format(x.top+x.bottom)+'</span></div>').join('')+'</div>';
   h+='<div class="display-equation">2S₄ = 4 × '+format(terms[0]+terms[3])+' ⇒ S₄ = '+format(terms.reduce((a,b)=>a+b,0))+'</div>';
 }
 if(s>=10){
   h+='<div class="display-equation">Sₙ = '+dfrac('n','2')+' (T₁ + Tₙ)</div>';
   h+='<div class="display-equation">Sₙ = '+dfrac('n','2')+' [2a + (n − 1)d]</div>';
 }
 if(s>10){
   h='<div class="display-equation">Sₙ = '+dfrac('n','2')+' [2a + (n − 1)d]</div>';
 }
 return h;
}
function working(){
 const c=config(),s=state.step,v=c.values;
 if(isGeo){
  const r=c.r;
  return [
   '', 'T₂ ÷ T₁ = '+format(v[1])+' ÷ '+format(v[0])+' = '+format(r),
   'Common ratio r = '+(r===2?'2 (×2)':'1/3 (÷3)'),
   'T₀ = '+format(c.c)+' (reverse one multiplication)',
   '<span class="box">Tₙ = '+format(c.a)+' × ('+(r===2?'2':'1/3')+')⁽ⁿ⁻¹⁾</span>',
   'T₅ = '+format(c.a)+' × ('+(r===2?'2':'1/3')+')⁴ = '+format(c.a*Math.pow(r,4)),
   '3, x, 27  ⇒  x² = 3 × 27  ⇒  <span class="box">x = 9</span>',
   '€20,000 × 0.8⁴ = <span class="box">€8,192</span>',
   'For |r| &lt; 1, S∞ = a/(1−r) (Higher Level extension)'
  ][s];
 }
 if(isQuad){
  return [
   '', 'First differences: +9, +11, +13',
   'Second differences: +2, +2',
   'Constant non-zero second difference ⇒ quadratic',
   'a = 2/2 = <span class="box">1</span>',
   'Previous first difference = +7. T₀ = 11 − 7 = <span class="box">4</span>',
   'T₁ = a + b + c ⇒ 11 = 1 + b + 4 ⇒ <span class="box">b = 6</span>',
   '<span class="box">Tₙ = n² + 6n + 4</span>'
  ][s];
 }
 const a=c.a,d=c.d,zero=c.c,n=50,term=a+149*d;
 return [
  '',
  format(v[1])+' − ('+format(v[0])+') = '+format(d),
  'd = '+format(d)+' throughout',
  'T₀ = '+format(a)+' − ('+format(d)+') = <span class="box">'+format(zero)+'</span>',
  'Tₙ = <span class="box">'+esc(formula(d,zero))+'</span>',
  'T₅₀ = '+format(d)+' × 50 '+(zero>=0?'+ ':'− ')+Math.abs(zero)+' = <span class="box">'+format(zero+50*d)+'</span>',
  'Tₙ = '+format(term)+' ⇒ '+esc(formula(d,zero))+' = '+format(term)+' ⇒ <span class="box">n = 150</span>',
  '9, x, 19 ⇒ 2x = 9 + 19 ⇒ <span class="box">x = 14</span>',
  'S₄ = '+format(v.reduce((u,w)=>u+w,0))+'; first + last = second + second-last',
  '2S₄ = 4('+format(v[0])+' + '+format(v[3])+')',
  '<span class="small">Find this formula on page 22 of the Formulae and Tables booklet. Here a means T₁, not T₀.</span>',
  '210 = '+dfrac('n','2')+'[6 + 4(n−1)] ⇒ (n−10)(2n+21)=0 ⇒ <span class="box">n = 10</span>',
  '190 = '+dfrac('10','2')+'[2a + 9(2)] ⇒ 38 = 2a + 18 ⇒ <span class="box">a = 10</span>',
  '148 = '+dfrac('8','2')+'[2(8) + 7d] ⇒ 37 = 16 + 7d ⇒ <span class="box">d = 3</span>',
  '2026 OL P1 Q5: 12, 17, 22 gives Tₙ=5n+7; 6, x, −4 gives x=1; 43, 39, 35 has <span class="box">S₂₃ &lt; 0</span> for the first time.'
 ][s];
}
function read(){
 const msg=lesson[state.step][1];if(!$('spoken').checked||!window.speechSynthesis)return;
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(msg);u.lang='en-IE';u.rate=.87;speechSynthesis.speak(u)}catch(e){}
}
function showLesson(){
 $('lessonDiagram').innerHTML=isLin&&state.step>=8?seriesView():sequenceSVG();
 $('lessonText').textContent=lesson[state.step][1];
 $('lessonFormula').innerHTML=working()||'&nbsp;';
 $('progress').textContent='Step '+(state.step+1)+' of '+lesson.length+' · '+lesson[state.step][0];
 $('prev').disabled=state.step===0;$('next').disabled=state.step===lesson.length-1;
 document.querySelectorAll('[data-jump]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.jump)===state.step)));
 if($('spoken').checked)read();
}
function problems(){
 const bank=$('bank')?.value||'mixed';
 let types=isGeo?['ratio','next','nthgeo','missinggeo','depreciation','ratio','next','nthgeo']:
 isQuad?['second','a','termzeroquad','b','rulequad','nextquad','valuequad','second']:
 bank==='terms'?['nextlinear','difference','termzero','rule','nth','position','middle','firstpositive']:
 bank==='series'?['sum','sumGivenN','sumGivenA','sumGivenD','sumnegative','sum','sumGivenA','sumGivenD']:
 bank==='exam'?['exam2026a1','exam2026a2','exam2026a3','exam2026b','exam2026c']:
 ['nextlinear','difference','termzero','rule','nth','position','middle','sum','sumGivenN','sumGivenA','sumGivenD','sumnegative','firstpositive'];
 for(let i=types.length-1;i>0;i--){const j=rand(0,i);[types[i],types[j]]=[types[j],types[i]]}
 return types.map(t=>makeProblem(t));
}
function makeProblem(type){
 const level=$('difficulty').value;let d=pick([-6,-4,-3,-2,2,3,4,5,6]),c=rand(-5,12),a=c+d,n=rand(5,level==='foundation'?12:25),r=pick([2,3,.5]),q=pick([2,3,4]);
 if(level==='foundation'){d=pick([2,3,4]);c=rand(0,9)}
 if(level==='challenge'){d=pick([-9,-7,-5,4,6,8]);c=rand(-15,18);n=rand(20,60)}
 a=c+d;
 const list=[a,a+d,a+2*d,a+3*d].map(format).join(', ');
 const out=(prompt,numbers,expected,explanation,mode='numeric')=>({prompt,numbers,expected,explanation,mode,type,base:{a,d,c}});
 switch(type){
 case 'nextlinear':return out('Find the next term.',list,a+4*d,'Apply the signed common difference one more time.');
 case 'sumnegative':{let A=pick([23,35,43,56]),D=-pick([2,3,4,5]),limit=1+2*A/(-D),N=Math.floor(limit)+1;return out('Find the smallest positive integer n for which the sum Sₙ is negative.',[A,A+D,A+2*D].map(format).join(', '),N,'Sₙ = n/2[2a+(n−1)d]. For n>0, solve 2a+(n−1)d < 0, then choose the smallest whole-number n.')}
 case 'firstpositive':{let D=pick([3,4,5,6]),A=-pick([20,35,60,75]),N=Math.floor(1+(-A)/D)+1;return out('Find the number of the first positive term.',[A,A+D,A+2*D].map(format).join(', '),N,'Solve a+(n−1)d > 0, then take the smallest whole-number n.')}
 case 'sumGivenN':{const N=rand(4,level==='challenge'?25:13),A=rand(1,14),D=rand(1,level==='challenge'?8:5),S=N*(2*A+(N-1)*D)/2;return out('Given the arithmetic sum, first term and difference, find n.','Sₙ = '+S+'; a = '+A+'; d = '+D,N,'Set '+S+' = n/2[2('+A+')+(n−1)('+D+')]. Solve the quadratic and keep only the positive integer root.');}
 case 'sumGivenA':{const N=rand(4,13),A=rand(level==='challenge'?-12:1,18),D=pick([-4,-2,2,3,5]),S=N*(2*A+(N-1)*D)/2;return out('Given the sum, n and d, find the FIRST term a.','S'+N+' = '+format(S)+'; n = '+N+'; d = '+format(D),A,'Use a = Sₙ/n − (n−1)d/2 = '+format(A)+'.');}
 case 'sumGivenD':{const N=rand(4,13),A=rand(level==='challenge'?-12:1,20),D=pick([-5,-3,-2,2,4,6]),S=N*(2*A+(N-1)*D)/2;return out('Given the sum, n and first term, find the signed difference d.','S'+N+' = '+format(S)+'; n = '+N+'; a = '+format(A),D,'Use d = [2Sₙ/n − 2a]/(n−1) = '+format(D)+'.');}
 case 'exam2026a1':return out('LC 2026 Ordinary Level Paper 1, Q5(a)(i): give the THIRD term after 22.', '12, 17, 22, …',37,'The next three terms are 27, 32 and 37.');
 case 'exam2026a2':return out('LC 2026 Ordinary Level Paper 1, Q5(a)(ii): find Tₙ.', '12, 17, 22, …','5n+7','First difference +5. The boxed term zero is 7, so Tₙ=5n+7.','polynomial');
 case 'exam2026a3':return out('LC 2026 Ordinary Level Paper 1, Q5(a)(iii): find T₂₀.', '12, 17, 22, …',107,'T₂₀=5(20)+7=107.');
 case 'exam2026b':return out('LC 2026 Ordinary Level Paper 1, Q5(b): find the missing middle term.', '6, x, −4',1,'2x=6+(−4)=2, so x=1.');
 case 'exam2026c':return out('LC 2026 Ordinary Level Paper 1, Q5(c): smallest n for which Sₙ < 0.', '43, 39, 35, …',23,'Sₙ=n(45−2n), which is negative for positive integer n≥23.');
 case 'difference':return out('What is the signed common difference?',list,d,'Subtract the previous term from the next term.');
 case 'termzero':return out('Work backwards to the boxed term zero.',list,c,'T₀ = T₁ − d = '+format(a)+' − ('+format(d)+') = '+format(c));
 case 'rule':return out('Write the general term Tₙ.',list,formula(d,c),'The coefficient of n is '+format(d)+' and term zero is '+format(c)+'.','polynomial');
 case 'nth':return out('Find T'+n+' using the general term.',list,c+n*d,'T'+n+' = '+format(d)+'×'+n+' + ('+format(c)+') = '+format(c+n*d));
 case 'position':return out('Which term number has the given value?', 'Tₙ = '+formula(d,c)+'; Tₙ = '+format(c+n*d),n,'Solve '+format(d)+'n + ('+format(c)+') = '+format(c+n*d)+'.');
 case 'middle':{let l=rand(-10,16),h=l+2*pick([3,5,7,9]);return out('Find x, the middle of three consecutive arithmetic terms.',format(l)+', x, '+format(h),(l+h)/2,'2x = '+format(l)+' + '+format(h)+', so x = '+format((l+h)/2))}
 case 'sum':{let count=rand(4,12),sum=count*(2*a+(count-1)*d)/2;return out('Find the sum of the first '+count+' terms.',list,sum,'Sₙ = n/2 [2a +(n−1)d]. Here a='+format(a)+', n='+count+' and d='+format(d)+'.')}
 case 'second':{let A=rand(1,3),b=rand(-3,8),C=rand(0,10),v=[1,2,3,4].map(x=>A*x*x+b*x+C);return out('Find the constant second difference.',v.join(', '),2*A,'For a quadratic, the second difference is 2a.')}
 case 'a':{let A=rand(1,4),b=rand(-3,7),C=rand(0,9),v=[1,2,3,4].map(x=>A*x*x+b*x+C);return out('Find the coefficient a of n².',v.join(', '),A,'Half the constant second difference gives a.')}
 case 'termzeroquad':{let A=rand(1,3),b=rand(0,6),C=rand(0,10),v=[1,2,3,4].map(x=>A*x*x+b*x+C);return out('Work backwards and find the boxed T₀.',v.join(', '),C,'Backtrack the first differences, then subtract the previous difference from term one.')}
 case 'b':{let A=rand(1,3),b=rand(-3,8),C=rand(0,10),v=[1,2,3,4].map(x=>A*x*x+b*x+C);return out('Given Tₙ = '+A+'n² + bn + '+C+', find b.',v.join(', '),b,'T₁ = a + b + c, so b = T₁ − a − c.')}
 case 'rulequad':{let A=1,b=rand(1,7),C=rand(0,8),v=[1,2,3,4].map(x=>A*x*x+b*x+C);return out('Find the quadratic general term Tₙ.',v.join(', '),'n^2+'+b+'n+'+C,'Find a from half the second difference, c by backtracking, and b from term one.','polynomial')}
 case 'nextquad':{let A=rand(1,3),b=rand(0,7),C=rand(0,8);return out('Find the next term.',[1,2,3,4].map(x=>A*x*x+b*x+C).join(', '),A*25+b*5+C,'Continue the first differences by adding the constant second difference.')}
 case 'valuequad':{let A=rand(1,3),b=rand(0,6),C=rand(0,8),N=rand(5,10);return out('Find T'+N+'.','Tₙ = '+A+'n² + '+b+'n + '+C,A*N*N+b*N+C,'Substitute n='+N+' into the quadratic formula.')}
 case 'ratio':{let R=pick([2,3,.5]);let A=R===.5?96:rand(2,8);return out('Which operation takes each term to the next? Enter ×2, ×3, or ÷2.',[0,1,2,3].map(i=>format(A*Math.pow(R,i))).join(', '),R===.5?'÷2':'×'+R,'Divide the next term by the previous term. The ratio is constant.','operation')}
 case 'next':{let R=pick([2,3,.5]);let A=R===.5?48:rand(2,7);return out('Find the next term.',[0,1,2,3].map(i=>format(A*Math.pow(R,i))).join(', '),A*Math.pow(R,4),'Multiply by '+(R===.5?'1/2':R)+' once more.')}
 case 'nthgeo':{let R=pick([2,3]);let A=rand(2,6),N=rand(4,6);return out('Find T'+N+'.','Tₙ = '+A+' × '+R+'⁽ⁿ⁻¹⁾',A*Math.pow(R,N-1),'T'+N+' = '+A+' × '+R+'^'+(N-1)+'.')}
 case 'missinggeo':{let A=pick([2,3,4]),R=pick([2,3]);return out('Find the positive middle term x.',A+', x, '+A*R*R,A*R,'x² = first × third. Check the same multiplier on both sides.')}
 case 'depreciation':{let price=pick([10000,15000,20000]),years=2;return out('A car depreciates by 20% each year. Find its value after two years in euro (no € sign).','€'+price+' → ×0.8 → ×0.8',price*.8*.8,'Keep 80% each year: '+price+' × 0.8² = '+format(price*.64)+'.')}
 }
 return out('Find the next term.',list,a+4*d,'Add the signed common difference.');
}

/* Four worked alternatives, one mathematically correct and three with inspectable errors.
   Generated from each problem's actual numbers, never chosen at random from unverified keys. */
function workedChoices(p){
 const options=[{value:p.expected,work:p.explanation,why:'This method gives the required result.',correct:true}];
 const v=Number(p.expected),base=p.base||{};
 const add=(value,work,why)=>{if(value===undefined||value===null)return;options.push({value,work,why,correct:false})};
 if(p.mode==='operation'){
  const other=['×2','×3','÷2','+2','−2'].filter(x=>x!==p.expected);
  add(other[0],'I used '+other[0]+' between the terms.','That operation does not carry every term to the next.');
  add(other[1],'I applied '+other[1]+' to each previous term.','A geometric sequence needs the same multiplicative ratio at every step.');
  add(other[2],'I compared the terms and chose '+other[2]+'.','Check the direction of the operation and whether it works for all pairs.');
 }else if(p.mode==='polynomial'){
  if(p.type==='rulequad'){
   const m=/^n\^2\+(-?\d+)n\+(-?\d+)$/.exec(String(p.expected));
   if(m){
    const b=Number(m[1]),c=Number(m[2]);
    add('2n^2+'+b+'n+'+c,'I used the full second difference as the coefficient of n².','For quadratic sequences, a is HALF the second difference.');
    add('n^2+'+(b+1)+'n+'+c,'I increased b when substituting T₁.','Check T₁=a+b+c against the first term.');
    add('n^2+'+b+'n+'+(c+1),'I stepped back one unit too far to find c.','The constant is precisely T₀, not a nearby term.');
   }
  }else{
   const d=p.type==='exam2026a2'?5:base.d;
   const c=p.type==='exam2026a2'?7:base.c;
   const a=p.type==='exam2026a2'?12:base.a;
   add(formula(-d,c),'I reversed the sign of the first difference: d = '+format(-d)+'.','The direction of subtraction matters: later term minus previous term.');
   add(formula(d,a),'I used the first listed term '+format(a)+' as the constant.','The constant in Tₙ=dn+c is the boxed T₀, not T₁.');
   add(formula(d,c-d),'I stepped backwards twice, producing '+format(c-d)+'.','Only one backwards step is needed from T₁ to T₀.');
  }
 }else if(Number.isFinite(v)){
  if(p.type==='sum'){
   const n=Number((p.prompt.match(/first (\d+) terms/)||[])[1]);
   const a=base.a,d=base.d;
   if(Number.isFinite(n)){
    const bracket=2*a+(n-1)*d;
    add(n*bracket,'I found 2Sₙ = '+n+' × '+format(bracket)+' and forgot to halve.','The paired rows count the sum twice.');
    add(n*(2*a+n*d)/2,'I used n differences instead of n−1.','Between the first and nth terms there are n−1 jumps.');
    add(n*(a+(n-1)*d)/2,'I counted just one first term inside the bracket.','The bracket must begin with 2a, not a.');
   }
  }else if(p.type==='sumGivenA'){
   const m=/S\d+ = ([−\d.]+); n = (\d+); d = ([−\d.]+)/.exec(p.numbers);
   if(m){
    const S=num(m[1]),n=Number(m[2]),d=num(m[3]);
    add(S/n+(n-1)*d/2,'I ADDED the difference contribution when isolating a.','Move the difference contribution across with a minus sign.');
    add(S/n-n*d/2,'I used n differences rather than n−1.','The distance from T₁ to Tₙ is n−1 jumps.');
    add(2*S/n-(n-1)*d/2,'I forgot to halve the 2a term.','The coefficient 2 on a must be removed.');
   }
  }else if(p.type==='sumGivenD'){
   const m=/S\d+ = ([−\d.]+); n = (\d+); a = ([−\d.]+)/.exec(p.numbers);
   if(m){
    const S=num(m[1]),n=Number(m[2]),a=num(m[3]);
    add((2*S/n-a)/(n-1),'I subtracted a instead of 2a.','The bracket in the sum formula contains 2a.');
    add((2*S/n-2*a)/n,'I divided by n instead of n−1.','There are n−1 gaps between the n terms.');
    add(-v,'I reversed the sign when dividing to obtain d.','The common difference is signed; use the original equation to check it.');
   }
  }else if(p.type==='termzero'){
   const a=base.a,d=base.d;
   add(a+d,'I moved forwards: '+format(a)+' + ('+format(d)+').','Backtracking means subtracting the signed difference.');
   add(a,'I kept the first term as term zero.','Term zero is one step BEFORE the first listed term.');
   add(a-2*d,'I moved backwards twice rather than once.','From T₁ to T₀ is exactly one under-arc.');
  }else if(p.type==='difference'){
   const d=base.d;
   add(-d,'I took the first term minus the second.','The signed first difference is T₂−T₁.');
   add(2*d,'I measured from the first term to the THIRD term.','One under-arc joins consecutive terms.');
   add(d+1,'I made an extra addition of 1 during subtraction.','Recheck the arithmetic and the sign.');
  }else if(p.type==='nth'){
   const d=base.d,c=base.c,n=Number((p.prompt.match(/T(\d+)/)||[])[1]);
   if(Number.isFinite(n)){
    add(c+(n-1)*d,'I substituted n−1 in place of n.','Tₙ=dn+c already includes the term number n.');
    add(c+(n+1)*d,'I substituted n+1 in place of n.','Check the requested term number carefully.');
    add(d*n+base.a,'I used T₁ as the constant instead of T₀.','Use the boxed term zero for c.');
   }
  }else if(p.type==='middle'||p.type==='exam2026b'){
   const m=/([−\d]+), x, ([−\d]+)/.exec(p.numbers);
   if(m){
    const l=num(m[1]),h=num(m[2]);
    add(l+h,'I found first + last but forgot to divide by 2.','The middle term is the average, not the sum.');
    add((h-l)/2,'I halved the DIFFERENCE between the outer terms.','Halving the gap is not the same as finding the average.');
    add((l+h)/2+1,'I added one extra unit after averaging.','Check the left and right differences: they must match.');
   }
  }else if(p.type==='sumGivenN'){
   add(v-1,'I stopped one term early and used n = '+format(v-1)+'.','Substitute this n into the sum formula: the given sum is not obtained.');
   add(v+1,'I counted one term too many, taking n = '+format(v+1)+'.','Substitute the term count back into the equation.');
   add(v+2,'I counted two extra terms without checking the sum.','A term count must be a positive integer AND satisfy the sum equation.');
  }
  if(options.length<4){
   add(v+1,'I introduced an extra +1 in my final calculation.','That result does not satisfy the original conditions.');
   add(v-1,'I subtracted an extra 1 in my final calculation.','Check the original terms or equation to detect the slip.');
   add(v===0?2:2*v,'I doubled my final value without checking the original problem.','Doubling the answer is not justified by the question.');
  }
 }
 const distinct=[],seen=new Set();
 for(const op of options){
   const key=tidy(op.value);
   if(seen.has(key))continue;
   if(op.correct || !check(p,String(op.value))){seen.add(key);distinct.push(op)}
 }
 if(distinct.length<4){
  if(p.mode==='numeric'){
   let shift=2;
   while(distinct.length<4 && shift<100){
    let candidate=v+shift;
    if(!seen.has(tidy(candidate))){
     distinct.push({value:candidate,work:'I accepted '+format(candidate)+' without checking it in the original equation.',why:'The answer must satisfy all the supplied conditions.',correct:false});
     seen.add(tidy(candidate));
    }shift++;
   }
  }else{
   let k=2;while(distinct.length<4&&k<12){
    const candidate=p.mode==='polynomial'?'n+'+k:'×'+(k+2);
    if(!seen.has(tidy(candidate))&&!check(p,String(candidate))){
     distinct.push({value:candidate,work:'I substituted '+candidate+' without checking each term.',why:'Check all the given terms or substitutions.',correct:false});seen.add(tidy(candidate));
    }k++;
   }
  }
 }
 if(distinct.length!==4||distinct.filter(x=>x.correct).length!==1)throw Error('Invalid four-choice assessment: '+p.type);
 for(let i=distinct.length-1;i>0;i--){const j=rand(0,i);[distinct[i],distinct[j]]=[distinct[j],distinct[i]]}
 return distinct;
}

function check(p,value){
 const x=tidy(value);if(!x)return false;
 if(p.mode==='operation'){
  const y=x.replace(/×/g,'x').replace(/\*/g,'x').replace(/÷/g,'/').replace(/multiplyby/g,'x').replace(/divideby/g,'/');
  return (p.expected==='÷2'&&['/2','0.5','1/2','x0.5'].includes(y))||(p.expected==='×2'&&['x2','2'].includes(y))||(p.expected==='×3'&&['x3','3'].includes(y));
 }
 if(p.mode==='polynomial'){
  return window.MathsAssessment?.equivalentPolynomial?.(x,tidy(p.expected))||x===tidy(p.expected).replace(/−/g,'-');
 }
 const f=/^(-?\d+)\s*\/\s*(-?\d+)$/.exec(x);
 let v=f?(Number(f[1])/Number(f[2])):Number(x.replace(/,/g,''));
 return Number.isFinite(v)&&Math.abs(v-Number(p.expected))<1e-7;
}
function updateScore(){
 const total=state.questions.length||1;
 $('scoreLive').textContent=(state.mode==='quiz'?'Quiz score: ':'Score: ')+state.points+' / '+total;
 $('answeredLive').textContent=state.records.length+' of '+total+' completed';
 $('progressFill').style.width=(100*state.records.length/total)+'%';
}
function start(mode){
 state.mode=mode;state.step=0;state.questions=problems();state.q=0;state.attempts=0;state.complete=false;state.points=0;state.records=[];
 state.choices=[];state.attemptedChoices=[];state.lastWrongChoice=null;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 $('learn').hidden=mode!=='learn';$('assessment').hidden=mode==='learn';
 $('results').hidden=true;$('questionPanel').hidden=false;
 if(mode==='learn'){showLesson();return}
 $('assessmentIntro').textContent=mode==='quiz'?
   'Choose the ONE correct worked solution. A click checks immediately: green for correct, red for a mistake. Two attempts maximum; the next question is another slide.':
   'Type an answer, then press Return to check it. Two attempts maximum per question; your worked review appears after the test.';
 renderQuestion();
}
function paintChoices(){
 const wrap=$('choices'),used=new Set(state.attemptedChoices);
 wrap.innerHTML=state.choices.map((choice,i)=>{
  const wrong=used.has(i)&&!choice.correct,correct=state.complete&&choice.correct;
  const cls='choice-card'+(wrong?' wrong-choice':'')+(correct?' correct-choice':'');
  const disabled=state.complete||used.has(i);
  return '<button type="button" class="'+cls+'" data-choice="'+i+'" '+(disabled?'disabled':'')+
    ' aria-label="Worked solution '+String.fromCharCode(65+i)+(wrong?', contains a mistake':correct?', correct':'')+'">'+
    '<span class="choice-letter">'+String.fromCharCode(65+i)+'</span>'+
    '<span class="choice-content"><span class="choice-work">'+prettyWorking(choice.work)+'</span>'+
    '<span class="choice-value">Result: '+esc(formatChoice(choice.value))+'</span></span></button>';
 }).join('');
 wrap.querySelectorAll('button[data-choice]').forEach(b=>{
  b.onclick=()=>choose(Number(b.dataset.choice));
 });
}
function formatChoice(value){return typeof value==='number'?format(value):String(value).replace(/-/g,'−')}
function renderQuestion(){
 const p=state.questions[state.q],quiz=state.mode==='quiz';
 $('questionCount').textContent=(quiz?'Quiz':'Test')+' · Question '+(state.q+1)+' of '+state.questions.length;
 $('questionText').textContent=p.prompt;$('numbers').textContent=p.numbers;
 $('entryArea').hidden=quiz;$('choices').hidden=!quiz;
 $('answer').value='';$('answer').disabled=false;$('check').hidden=quiz;$('check').disabled=false;
 $('advance').hidden=true;$('feedback').hidden=true;$('feedback').className='feedback';
 $('reviewActions').hidden=true;$('reviewPanel').hidden=true;$('reviewPanel').className='explanation-panel';
 $('tries').textContent=quiz?'Choose one of four solutions · two attempts':'Press Return or Check · two attempts';
 state.attempts=0;state.complete=false;state.attemptedChoices=[];state.lastWrongChoice=null;
 if(quiz){state.choices=workedChoices(p);paintChoices();}else{$('choices').innerHTML='';$('answer').focus()}
 updateScore();
}
function soundResult(result){
 if(window.MathsAssessment)window.MathsAssessment.playSound(result,$('sound').checked);
}
function settle(p,correct){
 state.complete=true;
 if(correct)state.points++;
 state.records.push({p,ok:correct,attempts:state.attempts,choice:state.lastWrongChoice});
 $('advance').hidden=false;
 $('advance').textContent=state.q===state.questions.length-1?'View results':'Next question →';
 $('reviewActions').hidden=false;
 updateScore();
 if(state.mode==='quiz')paintChoices();
}
function choose(index){
 if(state.mode!=='quiz'||state.complete||state.attemptedChoices.includes(index)||index<0||index>3)return;
 const option=state.choices[index],p=state.questions[state.q];
 state.attempts++;state.attemptedChoices.push(index);
 const result=window.MathsAssessment?window.MathsAssessment.outcome(option.correct,state.attempts):
   {done:option.correct||state.attempts>=2,correct:option.correct};
 $('tries').textContent='Attempt '+state.attempts+' / 2';
 $('feedback').hidden=false;
 if(option.correct){
  soundResult(true);
  $('feedback').className='feedback good';
  $('feedback').textContent='Correct. You have identified the valid working. '+p.explanation;
  settle(p,true);
 }else{
  state.lastWrongChoice=index;
  soundResult(result.done?'final-wrong':false);
  $('feedback').className='feedback bad';
  $('feedback').textContent=(result.done?'Both attempts used. The correct solution is now shown in green. ':
     'This solution contains a mistake. One attempt remains. ')+option.why;
  if(result.done)settle(p,false);
 }
 paintChoices();
}
function gradeTest(){
 if(state.mode!=='test'||state.complete)return;
 const p=state.questions[state.q],value=$('answer').value;
 if(!value.trim())return;
 state.attempts++;const correct=check(p,value);
 const result=window.MathsAssessment?window.MathsAssessment.outcome(correct,state.attempts):
   {done:correct||state.attempts>=2,correct};
 soundResult(correct?true:result.done?'final-wrong':false);
 $('tries').textContent='Attempt '+state.attempts+' / 2';
 $('feedback').hidden=false;
 $('feedback').className='feedback '+(correct?'good':result.done?'bad':'');
 $('feedback').textContent=correct?'Answer recorded. Continue to the next question.':
   result.done?'Two attempts used. The correct solution will appear in your results.':
   'One more chance. Read the question and check the signs.';
 if(result.done){
   $('answer').disabled=true;$('check').hidden=true;
   settle(p,correct);
 }
}
function advance(){
 if(!state.complete)return;
 state.q++;
 if(state.q<state.questions.length)return renderQuestion();
 $('questionPanel').hidden=true;$('results').hidden=false;
 $('questionCount').textContent=(state.mode==='quiz'?'Quiz':'Test')+' completed';
 updateScore();
 const first=state.records.filter(r=>r.ok&&r.attempts===1).length;
 $('results').innerHTML='<div class="score">'+state.points+' of '+state.questions.length+' correct · '+first+
   ' correct on the first attempt</div><h2>Review your reasoning</h2>'+
   state.records.map((r,i)=>'<p><strong>Question '+(i+1)+' · '+(r.ok?'Correct':'Review')+'</strong> — '+esc(r.p.prompt)+
   '<br><span class="small">'+esc(r.p.numbers)+' · Answer: '+esc(r.p.expected)+'</span><br>'+prettyWorking(r.p.explanation)+'</p>').join('')+
   '<button type="button" class="primary" id="again">Try another '+(state.mode==='quiz'?'quiz':'test')+'</button>';
 $('again').onclick=()=>start(state.mode);
 if(state.points===state.questions.length)soundResult('fanfare');
}
function explainCorrect(){
 if(!state.complete)return;
 const p=state.questions[state.q],correct=state.choices?.find(o=>o.correct);
 $('reviewPanel').hidden=false;$('reviewPanel').className='explanation-panel';
 $('reviewPanel').innerHTML='<strong>Correct method</strong><p>'+prettyWorking(correct?.work||p.explanation)+'</p>'+
   '<p><strong>Answer:</strong> '+esc(formatChoice(p.expected))+'</p>';
}
function explainMistake(){
 if(!state.complete)return;
 const wrong=state.choices?.[state.lastWrongChoice]||state.choices?.find(o=>!o.correct);
 if(!wrong){
  $('reviewPanel').hidden=false;$('reviewPanel').textContent='Review your working against the correct solution above.';return;
 }
 $('reviewPanel').hidden=false;$('reviewPanel').className='explanation-panel error';
 $('reviewPanel').innerHTML='<strong>Find the error</strong><p>'+prettyWorking(wrong.work)+'</p>'+
   '<p>'+esc(wrong.why)+'</p>';
}

document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
$('prev').onclick=()=>{state.step=Math.max(0,state.step-1);showLesson()};
$('next').onclick=()=>{state.step=Math.min(lesson.length-1,state.step+1);showLesson()};
$('read').onclick=()=>{if(!window.speechSynthesis)return;const on=$('spoken').checked;$('spoken').checked=true;read();$('spoken').checked=on};
document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{state.step=Math.min(lesson.length-1,Number(b.dataset.jump));showLesson()});
$('optionsBtn').onclick=()=>{let h=$('settings').hidden;$('settings').hidden=!h;$('optionsBtn').setAttribute('aria-expanded',String(h))};
$('closeSettings').onclick=()=>{$('settings').hidden=true;$('optionsBtn').setAttribute('aria-expanded','false')};
$('example').onchange=e=>{state.example=Number(e.target.value);state.step=0;showLesson()};
$('check').onclick=gradeTest;$('advance').onclick=advance;
$('showCorrect').onclick=explainCorrect;$('showMistake').onclick=explainMistake;
$('answer').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(state.complete)advance();else gradeTest()}};
document.addEventListener('keydown',e=>{
 if(state.mode==='quiz' && e.target.tagName!=='INPUT' && e.target.tagName!=='SELECT' && $('settings').hidden){
   if(['1','2','3','4'].includes(e.key)){e.preventDefault();choose(Number(e.key)-1);return}
   if(e.key==='Enter' && state.complete){e.preventDefault();advance();return}
 }
 if(state.mode!=='learn'||e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||!$('settings').hidden)return;
 if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();$('next').click()}
 if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();$('prev').click()}
});
start('learn');
})();