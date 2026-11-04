/* MAX Journal Liquid Glass refraction — adapted from the ticket system's tested material. */
(()=>{'use strict';
const root=document.documentElement;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const reduceTransparency=matchMedia('(prefers-reduced-transparency: reduce)');
const lowPower=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||navigator.connection?.saveData===true;
const surfaces=['.login-card','#sidebar','body>.flex.min-h-screen>div.flex.min-w-0.flex-1.flex-col>header','.stat-panel','.journal-panel','#entries-container','#empty-state-container','#entry-modal>div','#view-modal>div'];
const cache=new Map(),observed=new WeakSet();let frame=0;
function distance(x,y,w,h,r){const qx=Math.abs(x-w/2)-(w/2-r),qy=Math.abs(y-h/2)-(h/2-r);return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r}
function displacementMap(w,h,r){
 const key=[w,h,r].join(':');if(cache.has(key))return cache.get(key);
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
 const img=ctx.createImageData(w,h),data=img.data,bezel=18,peak=14;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const inside=-distance(x+.5,y+.5,w,h,r);let nx=0,ny=0;
  if(inside>=0&&inside<bezel){const dx=distance(x+1.5,y+.5,w,h,r)-distance(x-.5,y+.5,w,h,r),dy=distance(x+.5,y+1.5,w,h,r)-distance(x+.5,y-.5,w,h,r),len=Math.hypot(dx,dy)||1;nx=dx/len;ny=dy/len}
  const strength=inside>=0&&inside<bezel?Math.sin((1-inside/bezel)*Math.PI)*peak:0,i=(y*w+x)*4;
  data[i]=Math.max(0,Math.min(255,128+nx*strength));data[i+1]=Math.max(0,Math.min(255,128+ny*strength));data[i+2]=128;data[i+3]=255;
 }
 ctx.putImageData(img,0,0);const url=canvas.toDataURL('image/png');cache.set(key,url);return url;
}
function filterFor(id,w,h,map){
 let svg=document.getElementById('max-lg-defs');
 if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='max-lg-defs';svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';document.body.append(svg)}
 let filter=document.getElementById(id);if(!filter){filter=document.createElementNS(svg.namespaceURI,'filter');filter.id=id;svg.append(filter)}
 filter.setAttribute('filterUnits','userSpaceOnUse');filter.setAttribute('primitiveUnits','userSpaceOnUse');filter.setAttribute('x','0');filter.setAttribute('y','0');filter.setAttribute('width',w);filter.setAttribute('height',h);filter.replaceChildren();
 const image=document.createElementNS(svg.namespaceURI,'feImage');image.setAttribute('href',map);image.setAttribute('width',w);image.setAttribute('height',h);image.setAttribute('preserveAspectRatio','none');image.setAttribute('result','bezel');filter.append(image);
 const style=getComputedStyle(root),scale=parseFloat(style.getPropertyValue('--lg-refraction'))||24,disp=parseFloat(style.getPropertyValue('--lg-dispersion'))||.035,sign=style.getPropertyValue('--lg-flip').trim()==='-1'?-1:1,channels=[];
 for(let n=0;n<3;n++){const shift=document.createElementNS(svg.namespaceURI,'feDisplacementMap');shift.setAttribute('in','SourceGraphic');shift.setAttribute('in2','bezel');shift.setAttribute('scale',scale*sign*(1+n*disp));shift.setAttribute('xChannelSelector','R');shift.setAttribute('yChannelSelector','G');shift.setAttribute('result','s'+n);filter.append(shift);
 const matrix=document.createElementNS(svg.namespaceURI,'feColorMatrix');matrix.setAttribute('in','s'+n);matrix.setAttribute('type','matrix');const rows=['0 0 0 0 0','0 0 0 0 0','0 0 0 0 0','0 0 0 1 0'];rows[n]=['1 0 0 0 0','0 1 0 0 0','0 0 1 0 0'][n];matrix.setAttribute('values',rows.join(' '));matrix.setAttribute('result','c'+n);filter.append(matrix);channels.push('c'+n)}
 const blend=document.createElementNS(svg.namespaceURI,'feBlend');blend.setAttribute('in',channels[0]);blend.setAttribute('in2',channels[1]);blend.setAttribute('mode','screen');blend.setAttribute('result','rg');filter.append(blend);
 const blend2=document.createElementNS(svg.namespaceURI,'feBlend');blend2.setAttribute('in','rg');blend2.setAttribute('in2',channels[2]);blend2.setAttribute('mode','screen');blend2.setAttribute('result','rgb');filter.append(blend2);
 const alpha=document.createElementNS(svg.namespaceURI,'feComposite');alpha.setAttribute('in','rgb');alpha.setAttribute('in2','SourceGraphic');alpha.setAttribute('operator','in');filter.append(alpha);
}
function apply(el,index){
 if(!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')return;
 const rect=el.getBoundingClientRect(),w=Math.max(1,Math.ceil(rect.width)),h=Math.max(1,Math.ceil(rect.height));if(w*h>1800000)return;
 const radius=Math.min(36,Math.round(parseFloat(getComputedStyle(el).borderTopLeftRadius)||18)),map=displacementMap(w,h,radius);if(!map)return;
 const id='max-lg-filter-'+index;filterFor(id,w,h,map);
 const blur=parseFloat(getComputedStyle(el).getPropertyValue('--lg-blur'))||9;
 el.style.backdropFilter='url("#'+id+'") blur('+blur+'px) saturate(145%)';el.style.webkitBackdropFilter=el.style.backdropFilter;
}
function refresh(){frame=0;if(reduceMotion.matches||reduceTransparency.matches||lowPower)return;let i=0;for(const selector of surfaces){document.querySelectorAll(selector).forEach(el=>{apply(el,i++);if(!observed.has(el)){const ro=new ResizeObserver(schedule);ro.observe(el);observed.add(el)}})}}
function schedule(){if(!frame)frame=requestAnimationFrame(refresh)}
function clear(){document.querySelectorAll(surfaces.join(',')).forEach(el=>{el.style.removeProperty('backdrop-filter');el.style.removeProperty('-webkit-backdrop-filter')})}
if(!reduceMotion.matches&&!reduceTransparency.matches&&!lowPower){root.dataset.refraction='on';addEventListener('load',schedule,{once:true});addEventListener('resize',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?clear():schedule());new MutationObserver(schedule).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});schedule()}else root.dataset.refraction='off';
addEventListener('pageshow',schedule);addEventListener('max:glass-update',()=>{cache.clear();schedule()});
})();