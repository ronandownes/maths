/* Reusable Unifying Strand language and click-through guidance for Maths Apps.
 * Add ../shared/unifying-strand.js; call MathsUnifying.mount({context:'place-value'}).
 */
(function () {
  'use strict';
  const names = ['Building blocks','Representation','Connections','Problem solving','Generalisation and proof','Communication'];
  const meanings = [
    'What ideas and procedures do we need?',
    'How else can we show the same mathematics?',
    'What does this connect to?',
    'What can we work out when the method is not supplied?',
    'What is always true, and how can we justify it?',
    'How can we make our thinking clear to somebody else?'
  ];
  const contexts = {
    'place-value': [
      'Recall factors, terms, the distributive law, powers and place-value columns. Begin with the highest power in one factor; count the extra powers contributed by the other.',
      'Show the same product using repeated brackets, four partial products, an area model and aligned power columns. Which layout best prevents a missing term?',
      'Link 12 × 13 = (10 + 2)(10 + 3) with (x + 2)(x + 3). The organisation is the same. Compare this app with other expansion methods.',
      'Work backwards: if the area is known, what dimensions could produce it? Decide whether expansion, factorisation, trial or a diagram helps.',
      'Explain why (a + b)(c + d) = ac + ad + bc + bd. Test the false claim (a + b)² = a² + b² and find a counterexample.',
      'In pairs, one explains the columns and one checks that every partial product is present. Swap roles and justify your choices using correct notation.'
    ],
    'complex-numbers': [
      'Recognise a + bi, the real and imaginary parts, and the essential rule i² = −1.',
      'Translate between a complex number in rectangular form and its point (a,b) on the Argand plane.',
      'Connect adding and subtracting complex numbers with coordinate operations and vectors; connect multiplication with expanding brackets.',
      'Given two numbers, choose an operation, calculate accurately, and check whether the diagram is consistent with the answer.',
      'Explain why (a+bi)(a−bi)=a²+b². What follows when a+bi is not zero?',
      'Work in pairs: one gives a graphical explanation, the other an algebraic one. Swap and challenge one another using correct mathematical language.'
    ],
    'trigonometry': [
      'Name the reference angle. From that angle, identify the opposite side, the adjacent side and the hypotenuse.',
      'Represent sine, cosine and tangent as ratios of side lengths. Label a right triangle and write the ratio using words and symbols.',
      'Connect similar right triangles: scaling both corresponding sides by the same factor leaves the ratio unchanged.',
      'Choose a ratio from the sides you know. Calculate a missing side or angle, estimate first, and check whether the result is possible.',
      'For acute angles, sine increases from a limit of 0 to a limit of 1, cosine decreases from 1 to 0, and tangent increases without bound as the angle approaches 90° from below.',
      'Explain why the endpoints are limits rather than angles in a non-degenerate right triangle. Use the diagram, ratio and correct side names to justify your reasoning.'
    ],
    'expansions': [
      'Name the factors and terms; multiply every term in the first bracket by every term in the second.',
      'Compare a two-by-two area model, partial products, crossed pairings and vertical working.',
      'Connect multiplying brackets to rectangular area and ordinary whole-number multiplication.',
      'Choose a representation for a new problem without being told which method to use.',
      'Explain why all term pairings are necessary. Find a counterexample to an incomplete shortcut.',
      'Use the words factor, term and partial product to explain your method to a partner. Listen, question and swap roles.'
    ]
  };
  let mounted = false;
  function node(tag, cls, label) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (label !== undefined) el.textContent = label;
    return el;
  }
  function mount(options) {
    if (mounted) return;
    mounted = true;
    const context = contexts[(options||{}).context] || contexts.expansions;
    const style=document.createElement('style');
    style.textContent=[
      '.unifying-launch{position:fixed;right:12px;bottom:12px;z-index:9998;font:600 .82rem system-ui,sans-serif;padding:6px 10px;min-height:36px;border:1px solid #9eb9d1;background:#edf5fd;color:#174469;border-radius:20px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 10px #0002}',
      '.unifying-panel[hidden],.unifying-launch[hidden]{display:none!important}',
      '.unifying-panel{position:fixed;z-index:9999;top:64px;right:12px;width:min(425px,calc(100vw - 24px));max-height:calc(100dvh - 78px);overflow:auto;background:white;border:2px solid #28658d;border-radius:12px;box-shadow:0 12px 36px #0003;padding:16px;color:#172b3d;font:16px/1.48 system-ui,sans-serif;text-align:left}',
      '.unifying-panel h2{font:bold 1.26rem/1.3 system-ui,sans-serif;margin:10px 0}',
      '.unifying-panel p{font:inherit;margin:10px 0}',
      '.unifying-panel .unifying-count{font-size:.78rem;color:#516679;font-weight:700}',
      '.unifying-panel .unifying-question{font-weight:650;color:#174469}',
      '.unifying-panel .unifying-actions{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:16px 0 4px}',
      '.unifying-panel button{font:600 .9rem system-ui,sans-serif;padding:9px 12px;min-height:42px;border:1px solid #9aaec2;background:#f6f9fc;border-radius:8px;color:#174469;cursor:pointer}',
      '.unifying-panel button:disabled{opacity:.38;cursor:default}',
      '.unifying-panel .unifying-close{float:right;font-size:.8rem;min-height:34px;padding:4px 10px}',
      '.unifying-panel a{color:#134f88;font-weight:600;text-decoration:underline}',
      '@media(max-width:650px){.unifying-launch{padding:5px 7px;font-size:.73rem}.unifying-panel{top:8px;left:8px;right:8px;width:auto;max-height:calc(100dvh - 16px)}}'
    ].join('\n');
    document.head.appendChild(style);
    const launch = node('button','unifying-launch','Six thinking skills');
    launch.type='button';
    launch.setAttribute('aria-expanded','false');
    launch.setAttribute('aria-controls','unifying-strand-panel');
    launch.setAttribute('aria-label','Open the six elements of the Unifying Strand');
    const header = document.querySelector('header');
    if(header) header.appendChild(launch);
    else document.body.insertBefore(launch,document.body.firstChild);
    const panel=node('section','unifying-panel');
    panel.id='unifying-strand-panel';
    panel.hidden=true;
    panel.setAttribute('aria-label','Unifying Strand: six elements');
    const close=node('button','unifying-close','Close ×');
    close.type='button';
    const count=node('div','unifying-count');
    const title=node('h2');
    const question=node('p','unifying-question');
    const explanation=node('p');
    const actions=node('div','unifying-actions');
    const prev=node('button',null,'← Previous');
    const next=node('button',null,'Next →');
    const book=node('a',null,'Read in the Book');
    book.href=(options||{}).bookHref||'https://ronandownes.github.io/book/';
    book.target='_blank';
    book.rel='noopener';
    actions.append(prev,book,next);
    panel.append(close,count,title,question,explanation,actions);
    document.body.appendChild(panel);
    let step=0;
    function draw(){
      count.textContent='Element '+(step+1)+' of '+names.length;
      title.textContent=names[step];
      question.textContent=meanings[step];
      explanation.textContent=context[step];
      prev.disabled=step===0;
      next.textContent=step===names.length-1?'Start again ↺':'Next →';
    }
    function open(on){
      panel.hidden=!on;
      launch.setAttribute('aria-expanded',String(on));
      launch.hidden=on;
      if(on){draw();close.focus();}
      else launch.focus();
    }
    launch.addEventListener('click',()=>open(panel.hidden));
    close.addEventListener('click',()=>open(false));
    prev.addEventListener('click',()=>{step=Math.max(0,step-1);draw();});
    next.addEventListener('click',()=>{step=(step+1)%names.length;draw();});
    document.addEventListener('keydown',(ev)=>{
      if(panel.hidden || ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
      if(['Escape','ArrowRight','ArrowLeft','PageDown','PageUp'].includes(ev.key)){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if(ev.key==='Escape') open(false);
        else if(ev.key==='ArrowRight'||ev.key==='PageDown') step=(step+1)%names.length;
        else step=Math.max(0,step-1);
        if(ev.key!=='Escape') draw();
      }
    },true);
    draw();
  }
  window.MathsUnifying = Object.freeze({names:Object.freeze(names.slice()),meanings:Object.freeze(meanings.slice()),mount});
})();