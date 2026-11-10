/* Shared polynomial question configuration and coefficient generator.
   Reusable by Maths Apps: expanding, factorising, place-value and related activities. */
(function(root){
'use strict';
const KEY='maths.polynomial.question-settings.v1';
const defaults=Object.freeze({
 level:1,pattern:'ll',basePattern:'ll',variableMode:'different',
 onesMode:'off',doublePattern:'inner',signA:'positive',signB:'positive',
 hcfEnabled:false,centralZero:false,manual:false
});
function read(){
 try{const obj=JSON.parse(root.localStorage.getItem(KEY)||'{}');
 return {...defaults,...(obj&&typeof obj==='object'?obj:{})};}
 catch(_){return {...defaults}}
}
function save(s){
 try{root.localStorage.setItem(KEY,JSON.stringify(
 Object.fromEntries(Object.keys(defaults).map(k=>[k,s[k]??defaults[k]]))));}catch(_){}
}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a;}
function gcdArray(a){return a.reduce((v,x)=>gcd(v,x),0);}
function coefficients(degree,level,next){
 const max=level===1?5:level===2?15:level===3?41:level===4?99:999;
 // Level 1 draws from 1–11; 2, 3, 5 and 7 have double weight.
 const values=level===1?[1,2,2,3,3,4,5,5,6,7,7,8,9,10,11]
  :Array.from({length:max-1},(_,i)=>i+2);
 let a=Array.from({length:degree+1},()=>values[next(0,values.length-1)]);
 if(degree===0)return a;
 if(gcdArray(a)>1){
  const base=a.slice(0,-1);
  const possible=values.filter(v=>gcdArray([...base,v])===1);
  if(possible.length)a[a.length-1]=possible[next(0,possible.length-1)];
  else a[a.length-1]=a[a.length-1]+1;
 }
 return a;
}
function signOptions(degree){
 if(degree===0)return [''];
 return Array.from({length:2**degree},(_,n)=>Array.from({length:degree},(_,i)=>(n&(1<<(degree-1-i)))?'−':'+').join(''));
}
function signPattern(pattern,degree,next){
 const choices=signOptions(degree);
 if(pattern==='positive')return '+'.repeat(degree);
 if(pattern==='negative')return '−'.repeat(degree);
 if(pattern==='random')return choices[next(0,choices.length-1)];
 if(!choices.includes(pattern))return '+'.repeat(degree);
 return pattern;
}
function chooseSlots(A,B,mode,doublePattern,next){
 const slots=[
  ...A.map((_,index)=>({factor:0,index})),
  ...B.map((_,index)=>({factor:1,index}))
 ];
 const pick=(factor,index)=>slots.find(s=>s.factor===factor&&s.index===index);
 const centre=slots.slice(Math.floor((slots.length-1)/2),Math.floor((slots.length-1)/2)+2);
 const leads=[pick(0,0),pick(1,0)];
 const trails=[pick(0,A.length-1),pick(1,B.length-1)];
 const outer=[pick(0,0),pick(1,B.length-1)];
 const inner=[pick(0,A.length-1),pick(1,0)];
 const first=[pick(0,0),pick(0,A.length-1)];
 const second=[pick(1,0),pick(1,B.length-1)];
 let selected=[];
 if(mode==='lead')selected=[leads[0]];
 else if(mode==='middle'){
  // Prefer an actual interior coefficient; for lin x lin take the inner pair's first.
  const interior=slots.filter(s=>s.index>0&&s.index<(s.factor?B:A).length-1);
  selected=[interior[0]||inner[0]||centre[0]];
 }
 else if(mode==='trail')selected=[trails[1]];
 else if(mode==='double'){
  const sets={lead:leads,trail:trails,inner,outer,first,second};
  selected=sets[doublePattern]||inner;
 }
 else if(mode==='triple'){
  const positions=[slots[0],slots[Math.floor((slots.length-1)/2)],slots[slots.length-1]];
  selected=positions;
  for(const slot of slots)if(selected.length<3&&!selected.includes(slot))selected.push(slot);
 }
 const unique=[];
 for(const s of selected){if(s&&!unique.some(v=>v.factor===s.factor&&v.index===s.index))unique.push(s)}
 const needed=mode==='double'?2:mode==='triple'?3:unique.length;
 if(unique.length<needed)for(const s of slots){if(unique.length>=needed)break;
  if(!unique.some(v=>v.factor===s.factor&&v.index===s.index))unique.push(s);}
 return unique;
}
function generate({degreeA,degreeB,level=1,onesMode='off',doublePattern='inner',
 signA='+',signB='+',hcfEnabled=false,centralZero=false,next}){
 let A=coefficients(degreeA,level,next),B=coefficients(degreeB,level,next);
 // Each sign is for a non-leading coefficient, ordered by descending power.
 const signPatternA=signPattern(signA,degreeA,next),signPatternB=signPattern(signB,degreeB,next);
 for(let i=1;i<A.length;i++)if(signPatternA[i-1]==='−')A[i]*=-1;
 for(let i=1;i<B.length;i++)if(signPatternB[i-1]==='−')B[i]*=-1;
 const chosen=chooseSlots(A,B,onesMode,doublePattern,next);
 // The 1s controls govern exactly which positions may be 1. Replace
 // incidental ones elsewhere, preserving the Level 1 non-one weights.
 const nonOnePool=level===1?[2,2,3,3,4,5,5,6,7,7,8,9,10,11]:null;
 if(nonOnePool){
  [A,B].forEach((arr,factor)=>arr.forEach((value,index)=>{
   if(value===1&&!chosen.some(s=>s.factor===factor&&s.index===index))
    arr[index]=nonOnePool[next(0,nonOnePool.length-1)];
  }));
 }
 // A central zero is allowed only at an interior (non-leading/non-constant)
 // position, never where an explicit coefficient-1 position was selected.
 if(centralZero){
  const possible=[];
  [A,B].forEach((arr,factor)=>{for(let i=1;i<arr.length-1;i++)
   if(!chosen.some(slot=>slot.factor===factor&&slot.index===i))possible.push({factor,index:i});});
  if(possible.length){const slot=possible[next(0,possible.length-1)];
   (slot.factor?B:A)[slot.index]=0;}
 }
 for(const slot of chosen){
  const signs=slot.factor?signPatternB:signPatternA;
  const sign=slot.index>0&&signs[slot.index-1]==='−'?-1:1;
  (slot.factor?B:A)[slot.index]=sign;
 }
 // Keep coefficient-1 choices intact. HCF is an exterior scalar so the two
 // factors can remain monic while the total expression has a common factor.
 const scalar=hcfEnabled?2+next(0,2):1;
 return {A,B,scalar,signPatternA,signPatternB};
}
root.PolynomialQuestionSettings=Object.freeze({
 KEY,defaults,read,save,signOptions,chooseSlots,generate
});
})(window);
