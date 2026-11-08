(function(root){
'use strict';
const triples=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[12,35,37],[9,40,41],[28,45,53],[11,60,61],[16,63,65],[33,56,65],[48,55,73],[13,84,85],[36,77,85],[39,80,89],[65,72,97],[20,99,101],[60,91,109],[15,112,113],[17,144,145],[44,117,125],[88,105,137]];
const rad=d=>d*Math.PI/180,round=(n,d=1)=>Number(n.toFixed(d)),hyp=(a,b)=>Math.hypot(a,b);
function sides(angle,h){return{hyp:h,opp:h*Math.sin(rad(angle)),adj:h*Math.cos(rad(angle))}}
const ratios={sin:['opp','hyp'],cos:['adj','hyp'],tan:['opp','adj']};
function trig(r,angle){return ({sin:Math.sin,cos:Math.cos,tan:Math.tan})[r](rad(angle))}
function surd(n){if(!Number.isSafeInteger(n)||n<0)return null;if(n===0)return '0';let out=1,inside=n;for(let i=2;i*i<=inside;i++){while(inside%(i*i)===0){out*=i;inside/=i*i}}return inside===1?String(out):(out===1?'':out)+'√'+inside}
function bank(){return triples.map(([a,b,c],i)=>({a,b,c,index:i,angle:Math.atan2(a,b)*180/Math.PI,other:Math.atan2(b,a)*180/Math.PI}))}
let diagramSerial=0;
const sideColors={adj:'#2369d1',opp:'#c63d43',hyp:'#18834b'};
function angleArc(vertex,p1,p2,radius){
 const a1=Math.atan2(p1[1]-vertex[1],p1[0]-vertex[0]);
 const a2=Math.atan2(p2[1]-vertex[1],p2[0]-vertex[0]);
 let delta=(a2-a1+Math.PI*3)%(Math.PI*2)-Math.PI;
 const pts=Array.from({length:19},(_,i)=>{const a=a1+delta*i/18;return[vertex[0]+radius*Math.cos(a),vertex[1]+radius*Math.sin(a)]});
 return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' ');
}
function triangle({angle=35,hypotenuse=10,marks={},highlight=[],arrows=[],included=null,angleAt='left',angleLabel='θ'}={}){
 const serial=++diagramSerial,theta=rad(Math.max(.1,Math.min(89.9,angle)));
 const maxHeight=230,base=Math.min(390,maxHeight/Math.tan(theta)),rise=base*Math.tan(theta);
 const A=[56,286],B=[A[0]+base,A[1]],C=[B[0],B[1]-rise];
 const parts={adj:[A,B],opp:[B,C],hyp:[A,C]};
 let lines='';
 const positions={
  adj:[(A[0]+B[0])/2,B[1]+27],
  opp:[B[0]+31,(B[1]+C[1])/2],
  hyp:[(A[0]+C[0])/2-23,(A[1]+C[1])/2-10]
 };
 for(const k of ['adj','opp','hyp']){
  const [p,q]=parts[k],color=sideColors[k],label=Object.hasOwn(marks,k)?marks[k]:'';
  lines+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'" stroke="'+color+'" stroke-width="'+(highlight.includes(k)?6.5:5)+'" stroke-linecap="round"/>';
  if(label!==''&&label!==null&&label!==undefined){const [x,y]=positions[k];lines+='<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" font-size="18" font-family="Arial" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="white" stroke-width="5" stroke-linejoin="round" fill="#20394f">'+label+'</text>'}
 }
 const arrowId='trig-arrow-'+serial;
 const arrowLines=arrows.map(k=>{const[p,q]=parts[k],t1=.44,t2=.64;return'<path d="M'+(p[0]+(q[0]-p[0])*t1).toFixed(2)+' '+(p[1]+(q[1]-p[1])*t1).toFixed(2)+' L'+(p[0]+(q[0]-p[0])*t2).toFixed(2)+' '+(p[1]+(q[1]-p[1])*t2).toFixed(2)+'" fill="none" stroke="'+sideColors[k]+'" stroke-width="2.2" marker-end="url(#'+arrowId+')"/>'}).join('');
 const cAngle=90-angle;
 const arcA=angleArc(A,B,C,27),arcC=angleArc(C,B,A,25);
 const arcAWidth=included==='marked'?4:2.2,arcCWidth=included==='unmarked'?4:2.2;
 const rightColor=sideColors.hyp,rightOpacity=included==='right'?1:.75;
 const rightMarker='<path d="M'+(B[0]-21)+' '+B[1]+' v-21 h21" fill="none" stroke="'+rightColor+'" stroke-width="'+(included==='right'?4:2.5)+'"/><text x="'+(B[0]-35).toFixed(1)+'" y="'+(B[1]-27).toFixed(1)+'" font-size="12" font-family="Arial" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="white" stroke-width="4" fill="'+rightColor+'">90°</text>';
 const angleText=angleLabel?'<text x="'+(A[0]+47*Math.cos(theta/2)).toFixed(1)+'" y="'+(A[1]-47*Math.sin(theta/2)).toFixed(1)+'" transform="rotate('+(-angle/2).toFixed(2)+' '+(A[0]+47*Math.cos(theta/2)).toFixed(1)+' '+(A[1]-47*Math.sin(theta/2)).toFixed(1)+')" font-size="15" font-family="Arial" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="white" stroke-width="6" stroke-linejoin="round" fill="'+sideColors.opp+'">'+angleLabel+'</text>':'';
 const topArcLabel=included==='unmarked'?'<text x="'+(C[0]-22).toFixed(1)+'" y="'+(C[1]+38).toFixed(1)+'" font-size="11" font-family="Arial" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="white" stroke-width="4" fill="'+sideColors.adj+'">unmarked</text>':'';
 return '<svg viewBox="0 0 520 330" role="img" aria-label="Right triangle. Red side is opposite the marked angle, blue side is adjacent, green side is the hypotenuse. The right angle is marked 90 degrees."><defs><marker id="'+arrowId+'" markerWidth="7" markerHeight="7" refX="5.8" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L7 3.5 L0 7 z" fill="#20394f"/></marker></defs>'+lines+arrowLines+'<path d="'+arcA+'" fill="none" stroke="'+sideColors.opp+'" stroke-width="'+arcAWidth+'" stroke-linecap="round"/><path d="'+arcC+'" fill="none" stroke="'+sideColors.adj+'" stroke-width="'+arcCWidth+'" stroke-linecap="round"/>'+rightMarker+angleText+topArcLabel+'</svg>';
}
root.TriangleMath=Object.freeze({triples,bank,sides,trig,ratios,round,hyp,surd,triangle,sideColors});
})(window);
