(()=>{
'use strict';
const root=document.querySelector('[data-sets-quiz]');
if(!root)return;
const Q=[
 {stage:'Foundations',q:'A = {1, 3, 5} and B = {5, 1, 3}. Which statement is correct?',a:['A = B','A is a proper subset of B','A ≠ B'],right:0,
 why:'Sets are equal when their elements agree. The order of a listing does not matter.',
 fb:['Correct: both sets contain exactly 1, 3 and 5.','A is a subset of B, but not a proper subset because the sets are equal.','Changing the order of elements does not produce a different set.']},
 {stage:'Foundations',q:'Let A = {2, 4, 6}. Which statement is valid?',a:['4 ⊆ A','{4} ⊆ A','{4} ∈ A'],right:1,
 why:'4 is an element of A, whereas {4} is a set with one element. Every element of {4} belongs to A.',
 fb:['The subset symbol compares sets; 4 is a number. The correct notation for membership is 4 ∈ A.','Correct: the only element of {4} lies in A.','A contains the number 4, not the set {4} as an element.']},
 {stage:'Subsets',q:'If A ⊆ B and B ⊆ A, what must we conclude?',a:['A and B are disjoint','A = B','#A < #B'],right:1,
 why:'Every member of A is in B and every member of B is in A. The sets contain precisely the same elements.',
 fb:['Disjointness means the intersection is empty, not that each set is included in the other.','Correct: inclusion both ways proves equality.','Both sets have equal cardinality because they are equal; neither has strictly fewer elements.']},
 {stage:'Subsets',q:'Which set is a subset of every set A?',a:['{0}','∅','U'],right:1,
 why:'The empty set contains no element that could fail to belong to A. Thus ∅ ⊆ A, including when A = ∅.',
 fb:['Zero is a number, and some sets do not contain zero.','Correct: ∅ is always a subset of A.','A universal set U need not be a subset of an arbitrary A.']},
 {stage:'Operations',q:'A = {1, 3, 5}, B = {3, 5, 7}. What is A ∩ B?',a:['{3, 5}','{1, 3, 5, 7}','{1, 7}'],right:0,
 why:'The intersection consists exactly of the elements present in both sets: 3 and 5.',
 fb:['Correct: 3 and 5 are shared.','That is the union A ∪ B, not the intersection.','Those elements are not shared: 1 lies only in A and 7 only in B.']},
 {stage:'Operations',q:'A = {1, 3, 5}, B = {3, 5, 7}. What is A ∪ B?',a:['{3, 5}','{1, 3, 5, 7}','{1, 7}'],right:1,
 why:'The union contains all elements belonging to either set (or both), without duplicating elements.',
 fb:['That is only the overlap, A ∩ B.','Correct: include 1, 3, 5 and 7 once each.','You have left out the common elements 3 and 5.']},
 {stage:'Connections',q:'Suppose A ⊆ B. Which is always true?',a:['A ∩ B = A','A ∩ B = B','A ∪ B = A'],right:0,
 why:'When A lies entirely inside B, every element of A belongs to both, so A ∩ B = A. Also, A ∪ B = B.',
 fb:['Correct: every member of A is already in B.','Only when A = B can the intersection equal B as well.','The union is B, since B already includes all of A.']},
 {stage:'Cardinality',q:'If #A = 7, #B = 5 and #(A ∩ B) = 3, what is #(A ∪ B)?',a:['12','9','15'],right:1,
 why:'#(A ∪ B) = #A + #B − #(A ∩ B) = 7 + 5 − 3 = 9. Subtract the three elements counted twice.',
 fb:['Adding the two counts double-counts the three shared elements.','Correct: subtract the intersection once to avoid double-counting.','The total cannot exceed 12 distinct elements here.']},
 {stage:'Proof and counterexample',q:'If #A = #B for finite sets A and B, must A = B?',a:['Yes, because they have the same size','No, because the elements could differ','Only when A and B are disjoint'],right:1,
 why:'A = {1, 2} and B = {3, 4} have the same cardinality but different elements.',
 fb:['Equal cardinality means the same number of elements, not necessarily the same elements.','Correct: a counterexample is A = {1, 2}, B = {3, 4}.','Disjoint sets can have equal size and still be different.']},
 {stage:'Proof and counterexample',q:'Is set difference commutative: A \\ B = B \\ A for all A and B?',a:['Yes, always','No, not in general','Yes, whenever A and B overlap'],right:1,
 why:'For A = {1, 2} and B = {2, 3}, A \\ B = {1}, while B \\ A = {3}.',
 fb:['A single counterexample disproves the claim; try {1} and {2}.','Correct: reversing the order usually changes the result.','Even with overlap, the differences need not be equal.']},
 {stage:'Challenge',q:'Can A ⊆ B and A ∩ B = ∅ both be true?',a:['Never','Yes, when A = ∅','Yes, whenever A = B'],right:1,
 why:'If A ⊆ B then A ∩ B = A. For that intersection to be empty, A must be ∅.',
 fb:['The empty set is an important exception.','Correct: the empty set is a subset of B and has empty intersection with B.','If A = B is nonempty, their intersection is nonempty.']},
 {stage:'Challenge',q:'Which claim is always true for sets A and B?',a:['A ∪ B = B ∪ A','A \\ B = B \\ A','A ∩ B = ∅'],right:0,
 why:'A ∪ B = B ∪ A, because “in A or B” does not depend on the order. Union is commutative.',
 fb:['Correct: union is commutative.','Difference is generally not commutative.','Two sets need not be disjoint.']}
];
let index=0;
const answers=Array(Q.length).fill(false),wrongAttempts=Array(Q.length).fill(false);
const get=id=>document.getElementById(id);
const stage=get('sets-quiz-stage'),progress=get('sets-progress'),fill=get('sets-progress-fill');
const question=get('sets-quiz-question'),options=get('sets-quiz-options'),feedback=get('sets-quiz-feedback'),explanation=get('sets-quiz-explanation'),reason=get('sets-quiz-reason');
const back=get('sets-quiz-back'),next=get('sets-quiz-next');
function render(){
 const q=Q[index];
 stage.textContent=q.stage;progress.textContent='Question '+(index+1)+' of '+Q.length+' · '+answers.filter(Boolean).length+' understood';
 fill.style.width=(100*answers.filter(Boolean).length/Q.length)+'%';
 question.textContent=q.q;feedback.replaceChildren();feedback.removeAttribute('data-kind');reason.open=false;
 explanation.textContent=q.why;reason.hidden=!answers[index];
 options.replaceChildren();
 q.a.forEach((choice,i)=>{
  const b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+'.  '+choice;
  if(answers[index]){b.disabled=true;if(i===q.right)b.classList.add('correct');}
  b.addEventListener('click',()=>{
   if(i===q.right){answers[index]=true;feedback.dataset.kind='right';feedback.textContent='✓ '+q.fb[i];renderSolved(i);}
   else{wrongAttempts[index]=true;feedback.dataset.kind='wrong';feedback.textContent='Not quite. '+q.fb[i]+' Try again.';b.classList.add('wrong');}
  });
  options.append(b);
 });
 if(answers[index]){feedback.dataset.kind='right';feedback.textContent=wrongAttempts[index]?'Correct after revising your idea. Explain the reasoning before continuing.':'Correct. Explain the reasoning before continuing.';}
 back.disabled=index===0;next.disabled=!answers[index];next.textContent=index===Q.length-1?'Finish ✓':'Next question →';
}
function renderSolved(){
 render();
 feedback.textContent='Correct. '+Q[index].fb[Q[index].right]+' Explain the reasoning before continuing.';
}
back.addEventListener('click',()=>{if(index>0){index--;render();}});
next.addEventListener('click',()=>{
 if(!answers[index])return;
 if(index<Q.length-1){index++;render();}
 else{
   stage.textContent='Completed';progress.textContent=Q.length+' questions completed';fill.style.width='100%';
   question.textContent='You have completed the concept check.';
   options.replaceChildren();feedback.textContent='You can revisit any question using Previous or Start again.';feedback.dataset.kind='right';
   reason.hidden=true;back.disabled=false;next.disabled=true;
 }
});
get('sets-quiz-reset').addEventListener('click',()=>{
 answers.fill(false);wrongAttempts.fill(false);index=0;render();
});
render();
})();