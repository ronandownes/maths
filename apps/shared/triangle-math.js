(function(root){'use strict';
const triples=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[12,35,37],[9,40,41],[28,45,53],[11,60,61],[16,63,65],[33,56,65],[48,55,73],[13,84,85],[36,77,85],[39,80,89],[65,72,97],[20,99,101],[60,91,109],[15,112,113],[17,144,145],[44,117,125],[88,105,137]];
const rad=d=>d*Math.PI/180,round=(n,d=1)=>Number(n.toFixed(d)),hyp=(a,b)=>Math.hypot(a,b);
function sides(angle,h){return{hyp:h,opp:h*Math.sin(rad(angle)),adj:h*Math.cos(rad(angle))}}
const ratios={sin:['opp','hyp'],cos:['adj','hyp'],tan:['opp','adj']};
function trig(r,angle){return ({sin:Math.sin,cos:Math.cos,tan:Math.tan})[r](rad(angle))}
function surd(n){if(!Number.isSafeInteger(n)||n<0)return null;if(n===0)return '0';let out=1,inside=n;for(let i=2;i*i<=inside;i++){while(inside%(i*i)===0){out*=i;inside/=i*i}}return inside===1?String(out):(out===1?'':out)+'√'+inside}
function bank(){return triples.map(([a,b,c],i)=>({a,b,c,index:i,angle:Math.atan2(a,b)*180/Math.PI,other:Math.atan2(b,a)*180/Math.PI}))}
function triangle({angle=35,hypotenuse=10,marks={},highlight=[],angleAt='left'}={}){
 const s=sides(angle,hypotenuse),r=rad(angle),A=[70,340],B=[70+270*Math.cos(r),340],C=[B[0],340-270*Math.sin(r)];
 const parts={adj:[A,B],opp:[B,C],hyp:[A,C]},colors={adj:'#168447',opp:'#c17d25',hyp:'#1a73e8'},label={adj:'Adjacent',opp:'Opposite',hyp:'Hypotenuse'};
 let lines='';
 for(const k of ['adj','opp','hyp']){const [a,b]=parts[k];const x=k==='adj'?(a[0]+b[0])/2:k==='opp'?b[0]+33:(a[0]+b[0])/2-25,y=k==='adj'?a[1]+27:k==='opp'?(a[1]+b[1])/2:(a[1]+b[1])/2-11;
 lines+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+colors[k]+'" stroke-width="'+(highlight.includes(k)?10:5)+'" stroke-linecap="round"/><text x="'+x+'" y="'+y+'" font-size="20" font-family="Arial" font-weight="700" text-anchor="middle" stroke="white" stroke-width="5" paint-order="stroke" fill="#25435c">'+(Object.hasOwn(marks,k)?marks[k]:label[k])+'</text>'}
 return '<svg viewBox="0 0 445 405" role="img" aria-label="Right triangle with green adjacent, blue hypotenuse and amber opposite">'+lines+'<path d="M'+(B[0]-19)+' 340 v-19 h19" fill="none" stroke="#203d59" stroke-width="2"/><text x="115" y="314" font-size="24" fill="#1a73e8">'+(angleAt==='left'?'θ':'')+'</text></svg>'
}
root.TriangleMath=Object.freeze({triples,bank,sides,trig,ratios,round,hyp,surd,triangle});
})(window);