/* Shared classroom presentation mode. No external dependencies or build step.
   The same API is suitable for algebra, geometry, number and other Maths Apps. */
(function(root){
 'use strict';
 function attach(options){
  options=options||{};
  var target=typeof options.target==='string'?document.querySelector(options.target):options.target;
  var button=typeof options.button==='string'?document.querySelector(options.button):options.button;
  if(!target||!button)throw new Error('Classroom full-screen target and button are required.');
  target.classList.add('maths-classroom-surface');
  button.classList.add('maths-classroom-toggle');
  button.type='button';
  var fallback=false;
  var label=options.label||'Full screen';
  function nativeActive(){return document.fullscreenElement===target||document.webkitFullscreenElement===target;}
  function active(){return nativeActive()||fallback;}
  function update(){
   var on=active();
   button.textContent=on?'Exit full screen':label;
   button.setAttribute('aria-pressed',String(on));
   button.setAttribute('aria-label',on?'Exit classroom full screen':'Enter classroom full screen');
   if(typeof options.onChange==='function')options.onChange(on);
  }
  async function close(){
   if(nativeActive()){
    if(document.exitFullscreen)await document.exitFullscreen();
    else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
   }
   fallback=false;
   target.classList.remove('maths-classroom-focus');
   document.body.classList.remove('maths-classroom-scroll-lock');
   update();
  }
  async function open(){
   try{
    if(target.requestFullscreen)await target.requestFullscreen();
    else if(target.webkitRequestFullscreen)target.webkitRequestFullscreen();
    else throw new Error('Fullscreen API unavailable');
   }catch(err){
    fallback=true;
    target.classList.add('maths-classroom-focus');
    document.body.classList.add('maths-classroom-scroll-lock');
   }
   update();
  }
  button.addEventListener('click',function(){
   if(active())close().catch(function(){update()});
   else open().catch(function(){update()});
  });
  function sync(){
   if(!nativeActive()&&fallback){
    target.classList.add('maths-classroom-focus');
   }
   update();
  }
  document.addEventListener('fullscreenchange',sync);
  document.addEventListener('webkitfullscreenchange',sync);
  document.addEventListener('keydown',function(ev){
   if(ev.key==='Escape'&&fallback){
    ev.preventDefault();close().catch(function(){update()});
   }
  });
  update();
  return {open:open,close:close,isActive:active,update:update};
 }
 root.MathsClassroomFullscreen={attach:attach};
})(window);
