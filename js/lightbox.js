
(function(){
  const o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.9);display:none;align-items:center;justify-content:center;z-index:9999;padding:20px';
  const i=document.createElement('img'); i.style.maxWidth='100%'; i.style.maxHeight='100%';
  o.appendChild(i);
  o.addEventListener('click',()=>o.style.display='none');
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') o.style.display='none'; });
  document.body.appendChild(o);
  window.openLightbox=(src)=>{ i.src=src; o.style.display='flex'; };
})();
