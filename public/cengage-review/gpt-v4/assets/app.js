document.querySelectorAll('[data-search-input]').forEach(input=>{input.addEventListener('input',()=>{const root=document.querySelector(input.dataset.searchInput);if(!root)return;const q=input.value.toLowerCase().trim();let found=0;root.querySelectorAll('[data-search]').forEach(row=>{const show=row.dataset.search.toLowerCase().includes(q);row.hidden=!show;if(show)found++});const status=document.getElementById(input.dataset.status);if(status)status.textContent=found+' matching records';});});
document.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll(button.dataset.expand+' details').forEach(d=>d.open=button.dataset.action==='open')}));
function revealHash(){const id=decodeURIComponent(location.hash.slice(1));const target=id&&document.getElementById(id);if(target){let el=target;while(el){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement;}requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
window.addEventListener('hashchange',revealHash);if(location.hash)revealHash();
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.getAttribute('href')===location.hash)revealHash();});
(function(){const links=[...document.querySelectorAll('nav a[data-group]')];const marks=[...document.querySelectorAll('main #top, main .section-banner[id]')];let ticking=false;const spy=()=>{ticking=false;const line=window.innerHeight*0.3;let cur=marks[0];marks.forEach(m=>{if(m.getBoundingClientRect().top<=line)cur=m;});const hit=links.find(a=>a.dataset.group.split(' ').includes(cur.id));links.forEach(a=>{const on=a===hit;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});};window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(spy);}},{passive:true});window.addEventListener('resize',spy);spy();})();
(function(){const btn=document.getElementById('copy-email');if(!btn)return;const status=document.getElementById('copy-status');const email=btn.dataset.copy;let timer;const say=t=>{status.textContent=t;clearTimeout(timer);timer=setTimeout(()=>{status.textContent=''},4000)};const fallback=()=>{const el=document.getElementById('email');try{const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}say('Could not copy. The address is selected: press Ctrl+C or Cmd+C.')};btn.addEventListener('click',()=>{if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(email).then(()=>say('Copied'),fallback)}else{fallback()}});})();

// Reading navigation follows the section, or the current chapter inside the outline.
(function(){
 const sections=[...document.querySelectorAll('main .section-banner[id]')];
 const chapters=[...document.querySelectorAll('#outline-body .chap[id]')];
 const parts=[...document.querySelectorAll('#outline-body > .part[id]')];
 const prev=document.getElementById('journey-prev'),next=document.getElementById('journey-next'),current=document.getElementById('journey-current'),part=document.getElementById('journey-part');
 let pending=false;
 function update(){
  pending=false;const line=Math.min(180,innerHeight*.28);let index=-1;
  sections.forEach((e,i)=>{if(e.getBoundingClientRect().top<=line)index=i});
  const section=sections[Math.max(0,index)];
  const outline=document.getElementById('outline'),after=document.getElementById('technology');
  const inOutline=outline.getBoundingClientRect().top<=line&&after.getBoundingClientRect().top>line;
  if(inOutline){
   let ci=-1;chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<=line)ci=i});
   const c=chapters[Math.max(0,ci)];
   const prefix=c.querySelector('.cn').textContent,name=c.querySelector('h4').textContent;
   current.textContent=name.toLowerCase().startsWith(prefix.toLowerCase())?name:prefix+' · '+name;
   prev.href=ci>0?'#'+chapters[ci-1].id:'#outline';
   next.href=ci<chapters.length-1?'#'+chapters[Math.max(0,ci+1)].id:'#technology';
   prev.setAttribute('aria-label','Previous chapter');next.setAttribute('aria-label','Next chapter');
   const np=parts.find(p=>p.getBoundingClientRect().top>line+1);
   part.href=np?'#'+np.id:'#technology';part.textContent=np?'Next book part →':'Technology →';
  }else{
   current.textContent=index<0?'Using Data to Drive Business Performance':section.querySelector('h2').textContent;
   prev.href=index<=0?'#top':'#'+sections[index-1].id;
   next.href=index<sections.length-1?'#'+sections[index+1].id:'#top';
   prev.setAttribute('aria-label','Previous section');next.setAttribute('aria-label','Next section');
   part.href='#outline';part.textContent='Chapter outline ↑';
  }
  const max=document.documentElement.scrollHeight-innerHeight;
  document.querySelector('.reading-progress span').style.width=(max>0?scrollY/max*100:0)+'%';
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('hashchange',request);update();
})();
