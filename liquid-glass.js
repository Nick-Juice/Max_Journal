/* Shared MAX Journal motion: restrained entrance and pointer response. */
(()=>{'use strict';
 const root=document.documentElement;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const lowPower=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||navigator.connection?.saveData===true;
 const gsap=window.gsap;
 if(gsap&&!reduce){
   const auth=document.querySelector('.create-page .login-card');
   if(auth)gsap.fromTo(auth,{opacity:0,y:18,scale:.99},{opacity:1,y:0,scale:1,duration:.8,ease:'power3.out',clearProps:'transform'});
   const cards=[...document.querySelectorAll('.journal-panel,.stat-panel,#entries-container,#empty-state-container')];
   if(cards.length)gsap.fromTo(cards,{opacity:0,y:12},{opacity:1,y:0,duration:.58,stagger:.065,ease:'power2.out',clearProps:'transform',delay:.05});
   const header=document.querySelector('body > .flex.min-h-screen > div.flex.min-w-0.flex-1.flex-col > header');
   if(header)gsap.fromTo(header,{opacity:0,y:-8},{opacity:1,y:0,duration:.5,ease:'power2.out'});
 }
 if(!reduce&&!lowPower&&window.Lenis&&document.querySelector('.page')){
   const lenis=new Lenis({duration:1.05,smoothWheel:true,gestureOrientation:'vertical'});
   const tick=t=>lenis.raf(t);
   if(gsap)gsap.ticker.add(tick);else{
     let frame;const loop=t=>{lenis.raf(t);frame=requestAnimationFrame(loop)};frame=requestAnimationFrame(loop);
   }
   if(gsap)gsap.ticker.lagSmoothing(0);
 }
 if(!reduce&&!lowPower){
   document.querySelectorAll('.journal-panel,.login-card').forEach(el=>{
     el.addEventListener('pointermove',e=>{
       const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
       el.style.setProperty('--pointer-x',(x*100).toFixed(1)+'%');
       el.style.setProperty('--pointer-y',(y*100).toFixed(1)+'%');
     },{passive:true});
     el.addEventListener('pointerleave',()=>{el.style.removeProperty('--pointer-x');el.style.removeProperty('--pointer-y')},{passive:true});
   });
 }
 document.addEventListener('pointerdown',e=>{const button=e.target.closest('button');if(button&&!reduce){button.dataset.pressed='';}});
 document.addEventListener('pointerup',()=>document.querySelectorAll('[data-pressed]').forEach(el=>delete el.dataset.pressed));
 document.addEventListener('pointercancel',()=>document.querySelectorAll('[data-pressed]').forEach(el=>delete el.dataset.pressed));
})();