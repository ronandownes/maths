(() => {
  const toggle=document.getElementById('menu-toggle'),menu=document.getElementById('main-menu');
  toggle?.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));menu.classList.toggle('open',!expanded);});
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
  document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>window.print()));
})();


// Large, cumulative step reveals for classroom projection.
document.querySelectorAll('[data-reveal-list]').forEach(list => {
  const box=list.parentElement,next=box.querySelector('[data-reveal-next]'),reset=box.querySelector('[data-reveal-reset]');
  const rows=[...list.querySelectorAll(':scope > li')];let count=0;
  function update(){rows.forEach((row,i)=>row.classList.toggle('visible',i<count)); if(next){next.disabled=count>=rows.length;next.textContent=count>=rows.length?'Complete ✓':`Reveal line ${count+1} →`;}}
  next?.addEventListener('click',()=>{count=Math.min(rows.length,count+1);update();});
  reset?.addEventListener('click',()=>{count=0;update();});update();
});
