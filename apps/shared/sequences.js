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
function start(mode){
 state.mode=mode;state.step=0;state.questions=problems();state.q=0;state.attempts=0;state.complete=false;state.points=0;state.records=[];
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 $('learn').hidden=mode!=='learn';$('assessment').hidden=mode==='learn';$('results').hidden=true;$('questionPanel').hidden=false;
 if(mode==='learn')showLesson();else renderQuestion();
}
function renderQuestion(){
 const p=state.questions[state.q];
 $('questionCount').textContent='Question '+(state.q+1)+' of '+state.questions.length+' · '+(state.mode==='quiz'?'Quiz':'Test');
 $('questionText').textContent=p.prompt;$('numbers').textContent=p.numbers;
 $('answer').value='';$('answer').disabled=false;$('check').hidden=false;$('check').disabled=false;
 $('advance').hidden=true;$('feedback').hidden=true;$('feedback').className='feedback';
 $('tries').textContent='Two attempts maximum';state.attempts=0;state.complete=false;
 $('answer').focus();
}
function grade(){
 if(state.complete)return;
 let p=state.questions[state.q],value=$('answer').value;if(!value.trim())return;
 state.attempts++;const ok=check(p,value),out=window.MathsAssessment?MathsAssessment.outcome(ok,state.attempts):{done:ok||state.attempts>=2,correct:ok,feedback:ok?'Correct':state.attempts>=2?'Two attempts used':'One more chance'};
 if(window.MathsAssessment)MathsAssessment.playSound(ok?true:out.done?'final-wrong':false,$('sound').checked);
 $('tries').textContent='Attempt '+state.attempts+' of 2';
 $('feedback').hidden=false;$('feedback').className='feedback '+(ok?'good':out.done?'bad':'');
 if(ok){state.points++;state.complete=true;state.records.push({p,ok:true,attempts:state.attempts});$('feedback').textContent='Correct! '+(state.mode==='quiz'?p.explanation:'');}
 else if(out.done){state.complete=true;state.records.push({p,ok:false,attempts:state.attempts});$('feedback').textContent=state.mode==='quiz'?'Two attempts used. '+p.explanation+' Answer: '+p.expected:'Two attempts used. The solution will appear in your test review.';}
 else {$('feedback').textContent='One more chance. Your second answer is final.';}
 if(state.complete){$('answer').disabled=true;$('check').hidden=true;$('advance').hidden=false;$('advance').textContent=state.q===state.questions.length-1?'View results':'Next question →';}
}
function advance(){
 state.q++;if(state.q<state.questions.length)return renderQuestion();
 $('questionPanel').hidden=true;$('results').hidden=false;
 const first=state.records.filter(r=>r.ok&&r.attempts===1).length;
 $('results').innerHTML='<div class="score">'+state.points+' of '+state.questions.length+' correct · '+first+' correct on the first attempt</div>'+
 '<h2>Review your reasoning</h2>'+state.records.map((r,i)=>'<p><strong>Question '+(i+1)+' · '+(r.ok?'Correct':'Review')+'</strong> — '+esc(r.p.prompt)+'<br><span class="small">'+esc(r.p.numbers)+' · Answer: '+esc(r.p.expected)+' · '+esc(r.p.explanation)+'</span></p>').join('')+
 '<button type="button" class="primary" id="again">Try another '+(state.mode==='quiz'?'quiz':'test')+'</button>';
 $('again').onclick=()=>start(state.mode);
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
$('prev').onclick=()=>{state.step=Math.max(0,state.step-1);showLesson()};
$('next').onclick=()=>{state.step=Math.min(lesson.length-1,state.step+1);showLesson()};
$('read').onclick=()=>{if(!window.speechSynthesis)return;const on=$('spoken').checked;$('spoken').checked=true;read();$('spoken').checked=on};
document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{state.step=Math.min(lesson.length-1,Number(b.dataset.jump));showLesson()});
$('optionsBtn').onclick=()=>{let h=$('settings').hidden;$('settings').hidden=!h;$('optionsBtn').setAttribute('aria-expanded',String(h))};
$('closeSettings').onclick=()=>{$('settings').hidden=true;$('optionsBtn').setAttribute('aria-expanded','false')};
$('example').onchange=e=>{state.example=Number(e.target.value);state.step=0;showLesson()};
$('check').onclick=grade;$('advance').onclick=advance;
$('answer').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();state.complete?advance():grade()}};
document.addEventListener('keydown',e=>{
 if(state.mode!=='learn'||e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||!$('settings').hidden)return;
 if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();$('next').click()}
 if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();$('prev').click()}
});
start('learn');
})();