(()=>{'use strict';
const box=document.getElementById('factor-lab-app');if(!box||box.dataset.ready)return;box.dataset.ready='true';
const $=id=>document.getElementById(id),out=$('lab-result');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const superscript=n=>String(n).replace(/[0-9]/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
function key(vars){return Object.keys(vars).sort().map(k=>k+':'+vars[k]).join('|');}
function monomial(raw){
 let str=raw.replace(/\s/g,'').replace(/[·*×]/g,'');let sign=1;
 if(str[0]==='-'){sign=-1;str=str.slice(1);}else if(str[0]==='+')str=str.slice(1);
 if(!str)throw Error('A term is missing.');
 let m=str.match(/^\d+/),co=m?Number(m[0]):1;if(m)str=str.slice(m[0].length);
 if(!Number.isSafeInteger(co)||co>1e7)throw Error('Use coefficients no larger than 10,000,000.');
 const letters={};while(str){const v=str.match(/^([a-z])(?:\^(\d+))?/i);if(!v)throw Error('Use expressions such as 12x^3y^2, -9xy or 4z.');const letter=v[1].toLowerCase(),exp=v[2]===undefined?1:Number(v[2]);if(!Number.isInteger(exp)||exp>20)throw Error('Individual exponents must be 0–20.');letters[letter]=(letters[letter]||0)+exp;if(letters[letter]>100)throw Error('The total exponent of a variable is too large.');str=str.slice(v[0].length);}
 for(const k of Object.keys(letters))if(letters[k]===0)delete letters[k];
 return{c:sign*co,letters};
}
function simplify(terms){let map=new Map();for(const t of terms){const id=key(t.letters),entry=map.get(id);if(entry)entry.c+=t.c;else map.set(id,{c:t.c,letters:{...t.letters}});}return[...map.values()].filter(t=>t.c!==0).sort((a,b)=>{const degree=t=>Object.values(t.letters).reduce((s,n)=>s+n,0);if(degree(a)!==degree(b))return degree(b)-degree(a);const vars=[...new Set([...Object.keys(a.letters),...Object.keys(b.letters)])].sort();for(const k of vars){const d=(b.letters[k]||0)-(a.letters[k]||0);if(d)return d;}return 0;});}
function expression(source){let s=source.replace(/[−–]/g,'-').replace(/\s/g,'');if(!s)throw Error('Enter an expression.');const parts=s.replace(/-/g,'+-').split('+').filter(Boolean);if(parts.length>16)throw Error('Use up to 16 terms in each expression.');return simplify(parts.map(monomial));}
function fmt(t,absolute=false){const c=Math.abs(t.c),letters=Object.keys(t.letters).sort().map(k=>k+(t.letters[k]>1?superscript(t.letters[k]):'')).join('');if(!letters)return String(absolute?c:t.c);return(absolute?'':t.c<0?'−':'')+(c===1?'':c)+letters;}
function poly(ts){const t=simplify(ts);if(!t.length)return'0';return t.map((m,i)=>(i?(m.c<0?' − ':' + '):(m.c<0?'−':''))+fmt(m,true)).join('');}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;}
function prime(n){n=Math.abs(n);let factors=new Map();for(let p=2;p*p<=n;p+=(p===2?1:2)){while(n%p===0){factors.set(p,(factors.get(p)||0)+1);n/=p;}}if(n>1)factors.set(n,(factors.get(n)||0)+1);return factors;}
function primeDisplay(n){if(n===1)return '1';return[...prime(n)].map(([p,e])=>p+(e>1?superscript(e):'')).join(' × ');}
function calcHcf(source,min=2,max=8){let parts=source.split(',').map(s=>s.trim()).filter(Boolean);if(parts.length<min||parts.length>max)throw Error(`Enter ${min} to ${max} terms, separated by commas.`);
 const terms=parts.map(x=>{const t=expression(x);if(t.length!==1)throw Error('Each entry must be one nonzero monomial, not a sum.');return t[0];});
 const numeric=terms.reduce((a,t)=>gcd(a,Math.abs(t.c)),0);let letters={...terms[0].letters};for(const name of Object.keys(letters)){letters[name]=Math.min(...terms.map(t=>t.letters[name]||0));if(letters[name]===0)delete letters[name];}
 const factor={c:numeric,letters},quotient=terms.map(t=>{let v={c:t.c/numeric,letters:{...t.letters}};for(const k of Object.keys(letters)){v.letters[k]-=letters[k];if(!v.letters[k])delete v.letters[k];}return v;});return{terms,factor,quotient};}
function multiply(a,b){let prod=[];for(const t of a)for(const u of b){const letters={...t.letters};for(const k of Object.keys(u.letters))letters[k]=(letters[k]||0)+u.letters[k];const c=t.c*u.c;if(!Number.isSafeInteger(c))throw Error('The coefficients are too large.');prod.push({c,letters});}return prod;}
function stepper(title,question,steps){out.innerHTML='<h3>'+esc(title)+'</h3><div class="lab-equation">'+esc(question)+'</div><div id="lab-working"></div><button type="button" class="lab-toggle" id="lab-reveal">Reveal first step →</button>';
 let index=0;const work=$('lab-working'),btn=$('lab-reveal');btn.onclick=()=>{if(index>=steps.length)return;const line=document.createElement('div');line.className='lab-step';line.innerHTML=steps[index];work.appendChild(line);index++;btn.textContent=index===steps.length?'Solution complete ✓':'Reveal next step →';btn.disabled=index===steps.length;};}
const colour=(s,cl)=>'<span class="math-'+cl+'">'+esc(s)+'</span>';
function showNumbers(){try{let m=Number($('lab-number1').value),n=Number($('lab-number2').value);if(!Number.isSafeInteger(m)||!Number.isSafeInteger(n)||m<1||n<1||m>1000000||n>1000000)throw Error('Enter two positive whole numbers from 1 to 1,000,000.');const g=gcd(m,n),a=m/g,b=n/g;
 stepper('Numerical HCF — quotient method',`${m} / ${n}`,[
 `<b>Reduce the fraction fully</b>: ${esc(m)} / ${esc(n)} = ${colour(a,'blue')} / ${colour(b,'blue')}.`,
 `<b>Original numerator ÷ reduced numerator</b>: ${m} ÷ ${a} = ${colour(g,'red')}.`,
 `<b>Original denominator ÷ reduced denominator</b>: ${n} ÷ ${b} = ${colour(g,'red')}.`,
 `<b>Show the common factor</b>: ${m} = ${colour(g,'red')} × ${a}, &nbsp; ${n} = ${colour(g,'red')} × ${b}.`,
 `<b>Why is it highest?</b> The reduced numbers ${a} and ${b} are coprime: HCF(${a}, ${b}) = 1.`,
 `<b>Therefore</b>: HCF(${m}, ${n}) = ${colour(g,'green')}. <span class="math-black">Prime factors: ${m} = ${esc(primeDisplay(m))} and ${n} = ${esc(primeDisplay(n))}.</span>`
 ]);
 }catch(e){error(e);}}
function showTwo(){try{const{terms,factor,quotient}=calcHcf($('lab-terms-two').value,2,2),[a,b]=terms,[u,v]=quotient,g=fmt(factor);
 stepper('Two-term algebraic HCF — quotient method',`${fmt(a)} / ${fmt(b)}`,[
 `<b>Reduce the quotient fully</b>: ${esc(fmt(a))} / ${esc(fmt(b))} = ${colour(fmt(u),'blue')} / ${colour(fmt(v),'blue')}.`,
 `<b>Original numerator ÷ reduced numerator</b>: ${esc(fmt(a))} ÷ (${esc(fmt(u))}) = ${colour(g,'red')}.`,
 `<b>Original denominator ÷ reduced denominator</b>: ${esc(fmt(b))} ÷ (${esc(fmt(v))}) = ${colour(g,'red')}.`,
 `<b>Highest common factor</b>: ${colour(g,'green')}. The two reduced terms have no factor other than 1 in common.`,
 `<b>Factorise the expression</b>: ${esc(poly(terms))} = ${colour(g+'('+poly(quotient)+')','green')}.`,
 `<b>Check</b>: multiply the HCF into both terms of the bracket to recover the original expression.`
 ]);
 }catch(e){error(e);}}
function powersTable(terms){const primes=terms.map(t=>prime(t.c));let factors=new Set(primes.flatMap(p=>[...p.keys()]));let vars=new Set(terms.flatMap(t=>Object.keys(t.letters)));
 const rows=[...factors].sort((a,b)=>a-b).map(k=>({label:'Prime '+k,counts:primes.map(p=>p.get(k)||0)})).concat([...vars].sort().map(k=>({label:'Letter '+k,counts:terms.map(t=>t.letters[k]||0)})));
 let html='<div class="lab-table-scroll"><table class="lab-power-table"><thead><tr><th>Factor</th>'+terms.map((_,i)=>`<th>Term ${i+1}</th>`).join('')+'<th>Smallest</th></tr></thead><tbody>';
 for(const row of rows){const min=Math.min(...row.counts);html+=`<tr><th>${esc(row.label)}</th>`+row.counts.map(v=>`<td class="${v===0?'absent':''}">${v}</td>`).join('')+`<td class="${min?'retained':'absent'}">${min}${min?'':' (omit)'}</td></tr>`;}
 html+='</tbody></table></div>';return html;}
function showMany(){try{const{terms,factor,quotient}=calcHcf($('lab-terms-many').value,2,8),f=fmt(factor),numeric=terms.map(t=>Math.abs(t.c));const primeList=terms.map((t,i)=>`Term ${i+1}: ${Math.abs(t.c)} = ${primeDisplay(t.c)}`).join(';<wbr> ');
 stepper('HCF — lowest common powers',poly(terms),[
 `<b>Prime-factorise all numerical coefficients</b>: ${esc(primeList).replace(/&lt;wbr&gt;/g,'<wbr>')}.`,
 `<b>Compare every prime and every letter</b>. A missing factor has exponent <span class="math-red">0</span> and must be omitted.`+powersTable(terms),
 `<b>Multiply the lowest common powers</b>: numeric HCF = ${colour(factor.c,'red')}; common letters = ${colour(fmt({c:1,letters:factor.letters}),'blue')}.`,
 `<b>Therefore the HCF is</b> ${colour(f,'green')}.`,
 ...terms.map((t,i)=>`<b>Divide term ${i+1}</b>: ${esc(fmt(t))} ÷ (${esc(f)}) = ${colour(fmt(quotient[i]),'blue')}.`),
 `<b>Factorise</b>: ${esc(poly(terms))} = ${colour(f+'('+poly(quotient)+')','green')}.`,
 `<b>Check</b>: expanding the bracket recovers the starting expression.`
 ]);
 }catch(e){error(e);}}
function showExpand(challenge){try{const f1=expression($('lab-factor1').value),f2=expression($('lab-factor2').value);if(f1.length>5||f2.length>5)throw Error('Use no more than five terms per factor.');const all=multiply(f1,f2),a=poly(f1),b=poly(f2),product=poly(all),steps=[`<b>Multiply each term in the first bracket by every term in the second</b>: ${esc(all.map(fmt).join(', '))}.`,`<b>Collect like terms</b>: ${colour(product,'blue')}.`,`<b>Factorised form</b>: ${colour('('+a+')('+b+')','green')}.`];stepper(challenge?'Find the two factors':'Multiply out and simplify',challenge?product:`(${a})(${b})`,steps);
 }catch(e){error(e);}}
function error(e){out.replaceChildren();const p=document.createElement('p');p.className='lab-warning';p.textContent=e.message;out.appendChild(p);}
box.querySelectorAll('[data-lab-tab]').forEach(b=>b.addEventListener('click',()=>{box.querySelectorAll('[data-lab-tab]').forEach(t=>t.classList.toggle('active',t===b));box.querySelectorAll('[data-lab-view]').forEach(v=>{v.hidden=v.dataset.labView!==b.dataset.labTab;});out.innerHTML='<p>Enter the values, then use the main button to reveal the method.</p>';}));
const presets={numbers2:{'lab-number1':'84','lab-number2':'126'},twoHigh:{'lab-terms-two':'30x^5y^3z, 45x^4y^2z^2'},many4:{'lab-terms-many':'18x^3y^2z, 24x^2y^3z^2, -30x^2y^2, 42x^4y^2z^3'},missing:{'lab-terms-many':'18x^3y^2z, 30x^2y^4, 42x^2y^3z^2, 66x^3y^2'},'expand-high':{'lab-factor1':'2x^5y - 3x^2z','lab-factor2':'4xy + 5z'},'expand-negative':{'lab-factor1':'y - z','lab-factor2':'x - 3'}};
box.querySelectorAll('[data-lab-preset]').forEach(b=>b.addEventListener('click',()=>{for(const[k,v]of Object.entries(presets[b.dataset.labPreset]))$(k).value=v;out.innerHTML='<p>Example loaded. Select the main action to calculate.</p>';}));
const handlers={numbers:showNumbers,two:showTwo,many:showMany,expand:()=>showExpand(false),challenge:()=>showExpand(true)};
box.querySelectorAll('[data-lab-action]').forEach(b=>b.addEventListener('click',handlers[b.dataset.labAction]));
})();
