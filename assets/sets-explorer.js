(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('diagram');
const el=id=>document.getElementById(id);
const A={x:315,y:250,r:150},B={x:515,y:250,r:150};
const elements=[
 {n:1,x:213,y:203},{n:2,x:315,y:313},{n:3,x:435,y:230},{n:4,x:550,y:322},
 {n:5,x:650,y:125},{n:6,x:402,y:337},{n:7,x:710,y:405},{n:8,x:125,y:342}
];
let mode='regions',activeDrag=null,showElements=false;
const operations={
 regions:['Regions of A and B','Red: A only. Blue: B only. Purple: both.'],
 union:['A ∪ B','In A or B (or both).'],
 intersection:['A ∩ B','In A and B.'],
 'a-b':['A \\ B','In A but not in B.'],
 'b-a':['B \\ A','In B but not in A.'],
 complement:['Aᶜ','In the universal region U but outside A.'],
 neither:['(A ∪ B)ᶜ','Outside both A and B, but still in U.']
};
const opacity={
 regions:[.22,.22,.33,0,0],
 union:[.60,.60,.72,0,0],
 intersection:[.05,.05,.82,0,0],
 'a-b':[.72,.05,.05,0,0],
 'b-a':[.05,.72,.05,0,0],
 complement:[0,0,0,0,.55],
 neither:[0,0,0,.62,0]
};
const clipIds={
 A:['a-only','both','border-a','mask-a','mask-union-a'],
 B:['b-only','clip-b-circle','border-b','mask-b','mask-union-b']
};
function svgPos(ev){
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 const ctm=svg.getScreenCTM();return ctm?pt.matrixTransform(ctm.inverse()):{x:0,y:0};
}
function inside(p,s){return Math.hypot(p.x-s.x,p.y-s.y)<=s.r;}
function bound(s){s.x=Math.max(28+s.r,Math.min(812-s.r,s.x));s.y=Math.max(26+s.r,Math.min(473-s.r,s.y));}
function setCircle(id,s){const t=el(id);t.setAttribute('cx',s.x);t.setAttribute('cy',s.y);t.setAttribute('r',s.r);}
function relation(){
 const d=Math.hypot(A.x-B.x,A.y-B.y),sum=A.r+B.r,diff=Math.abs(A.r-B.r);
 if(d<1&&diff<1)return ['A = B','The two regions coincide exactly.'];
 if(d>sum+1)return ['A ∩ B = ∅','Disjoint regions: there is no overlap.'];
 if(Math.abs(d-sum)<=1)return ['Touching','The circles touch at one boundary point.'];
 if(d+A.r<=B.r+1)return ['A ⊆ B','Every point of region A lies inside region B.'];
 if(d+B.r<=A.r+1)return ['B ⊆ A','Every point of region B lies inside region A.'];
 if(Math.abs(d-diff)<=1)return ['Internally tangent','One region touches the other at its boundary.'];
 return ['Overlapping sets','A and B share a region, but each has a part outside the other.'];
}
function updateNumbers(){
 el('numbers').replaceChildren();
 if(!showElements)return;
 const setA=[],setB=[],inter=[],uni=[];
 for(const p of elements){
  const inA=inside(p,A),inB=inside(p,B);
  if(inA)setA.push(p.n);
  if(inB)setB.push(p.n);
  if(inA&&inB)inter.push(p.n);
  if(inA||inB)uni.push(p.n);
  const g=document.createElementNS(NS,'g');g.classList.add('chip');g.setAttribute('data-number',p.n);
  const circ=document.createElementNS(NS,'circle');
  circ.setAttribute('r',17);circ.setAttribute('fill','#fff');circ.setAttribute('stroke','#35495c');circ.setAttribute('stroke-width','1.8');
  const txt=document.createElementNS(NS,'text');
  txt.setAttribute('text-anchor','middle');txt.setAttribute('dominant-baseline','central');
  txt.setAttribute('font-size','20');txt.setAttribute('font-family','Arial');txt.setAttribute('font-weight','bold');
  txt.setAttribute('fill','#1e2e3e');txt.textContent=p.n;
  g.setAttribute('transform','translate('+p.x+' '+p.y+')');g.append(circ,txt);el('numbers').append(g);
 }
 const format=a=>'{'+a.join(', ')+'}';
 el('elements-sets').textContent='A = '+format(setA)+'    B = '+format(setB);
 el('elements-counts').textContent='#A = '+setA.length+'   #B = '+setB.length+'   #(A ∩ B) = '+inter.length+'   #(A ∪ B) = '+uni.length;
}
function render(){
 for(const id of clipIds.A)setCircle(id,A);
 for(const id of clipIds.B)setCircle(id,B);
 setCircle('both',A);setCircle('border-a',A);setCircle('border-b',B);
 let laY=Math.max(72,A.y-A.r+32), lbY=Math.max(72,B.y-B.r+32);
 if(Math.hypot(A.x-B.x,A.y-B.y)<35){lbY=Math.min(452,lbY+47);}
 const lA=el('label-a'),lB=el('label-b');
 lA.setAttribute('x',A.x);lA.setAttribute('y',laY);
 lB.setAttribute('x',B.x);lB.setAttribute('y',lbY);
 const vals=opacity[mode];['a-only','b-only','both','outside-shade','complement-shade'].forEach((id,i)=>el(id).setAttribute('opacity',vals[i]));
 const rel=relation();el('relationship').textContent=rel[0];el('relationship-detail').textContent=rel[1];
 el('operation-name').textContent=operations[mode][0];
 el('operation-description').textContent=operations[mode][1];
 el('explanation').textContent='As drawn: '+rel[1]+' '+operations[mode][1];
 document.querySelectorAll('[data-operation]').forEach(b=>{const on=b.dataset.operation===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 el('size-a').value=A.r;el('size-b').value=B.r;
 updateNumbers();
}
function setPreset(which){
 let a,b;
 switch(which){
 case 'apart':a=[225,245,115];b=[610,245,115];break;
 case 'ainb':a=[440,260,88];b=[440,260,190];break;
 case 'bina':a=[440,260,190];b=[440,260,88];break;
 case 'equal':a=[420,255,155];b=[420,255,155];break;
 default:a=[315,250,150];b=[515,250,150];
 }
 [A.x,A.y,A.r]=a;[B.x,B.y,B.r]=b;render();
 document.querySelectorAll('[data-preset]').forEach(btn=>btn.classList.toggle('active',btn.dataset.preset===which));
}
svg.addEventListener('pointerdown',ev=>{
 const p=svgPos(ev);if(!Number.isFinite(p.x))return;
 const chip=ev.target.closest('.chip');
 if(showElements&&chip){const n=Number(chip.getAttribute('data-number'));const e=elements.find(z=>z.n===n);activeDrag={type:'element',object:e,dx:e.x-p.x,dy:e.y-p.y};}
 else{
  const hitA=inside(p,A),hitB=inside(p,B);
  if(!hitA&&!hitB)return;
  const obj=(hitA&&hitB)?(Math.hypot(p.x-A.x,p.y-A.y)<=Math.hypot(p.x-B.x,p.y-B.y)?A:B):hitA?A:B;
  activeDrag={type:'set',object:obj,dx:obj.x-p.x,dy:obj.y-p.y};
 }
 svg.setPointerCapture(ev.pointerId);ev.preventDefault();
});
svg.addEventListener('pointermove',ev=>{
 if(!activeDrag)return;const p=svgPos(ev),obj=activeDrag.object;
 obj.x=p.x+activeDrag.dx;obj.y=p.y+activeDrag.dy;
 if(activeDrag.type==='set')bound(obj);
 else {obj.x=Math.max(43,Math.min(795,obj.x));obj.y=Math.max(42,Math.min(455,obj.y));}
 document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('active'));render();
});
function stopDrag(){activeDrag=null;}
svg.addEventListener('pointerup',stopDrag);svg.addEventListener('pointercancel',stopDrag);svg.addEventListener('lostpointercapture',stopDrag);
document.querySelectorAll('[data-operation]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.operation;render();}));
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>setPreset(b.dataset.preset)));
for(const [id,obj] of [['size-a',A],['size-b',B]])el(id).addEventListener('input',e=>{obj.r=Number(e.target.value);bound(obj);document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('active'));render();});
el('show-elements').addEventListener('change',e=>{showElements=e.target.checked;el('numbers').hidden=!showElements;el('elements-output').style.display=showElements?'block':'none';render();});
el('full-screen').addEventListener('click',()=>{
 const host=document.querySelector('.set-explorer');
 if(document.fullscreenElement){document.exitFullscreen();}
 else if(host && host.requestFullscreen){host.requestFullscreen().catch(()=>{});}
});
document.addEventListener('fullscreenchange',()=>{
 el('full-screen').textContent=document.fullscreenElement?'Exit full screen ×':'Full screen ⛶';
});
const challenges=[
 ['Move A and B so their intersection is empty.','apart','intersection','A ∩ B = ∅ when the circles are disjoint.'],
 ['Make A a proper subset of B.','ainb','regions','Every point in A is also in B.'],
 ['Make B a proper subset of A.','bina','regions','Every point in B is also in A.'],
 ['Make A and B equal.','equal','intersection','Equal regions have identical members and the same union and intersection.'],
 ['Show A ∪ B when the circles overlap.','overlap','union','The union contains both circles, including their overlap.'],
 ['Show A \\ B when the circles overlap.','overlap','a-b','Only the part of A outside B is selected.'],
 ['Show the complement of A.','overlap','complement','Aᶜ is everything in U outside A.']
];
let questionIndex=0;
function newQuestion(){
 questionIndex=(questionIndex+1)%challenges.length;
 const q=challenges[questionIndex];el('question').textContent=q[0];el('challenge-status').textContent='';
}
el('new-question').addEventListener('click',newQuestion);
el('reveal-question').addEventListener('click',()=>{
 const q=challenges[questionIndex];setPreset(q[1]);mode=q[2];render();el('challenge-status').textContent=q[3];
});
el('question').textContent=challenges[0][0];render();
})();
