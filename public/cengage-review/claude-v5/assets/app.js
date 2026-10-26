document.querySelectorAll('[data-search-input]').forEach(input=>{input.addEventListener('input',()=>{const root=document.querySelector(input.dataset.searchInput);if(!root)return;const q=input.value.toLowerCase().trim();let found=0;root.querySelectorAll('[data-search]').forEach(row=>{const show=row.dataset.search.toLowerCase().includes(q);row.hidden=!show;if(show)found++});const status=document.getElementById(input.dataset.status);if(status)status.textContent=found+' matching records';});});
document.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll(button.dataset.expand+' details').forEach(d=>d.open=button.dataset.action==='open')}));
function revealHash(){const id=decodeURIComponent(location.hash.slice(1));const target=id&&document.getElementById(id);if(target){let el=target;while(el){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement;}requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
window.addEventListener('hashchange',revealHash);if(location.hash)revealHash();
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.getAttribute('href')===location.hash)revealHash();});
(function(){const btn=document.getElementById('copy-email');if(!btn)return;const status=document.getElementById('copy-status');const email=btn.dataset.copy;let timer;const say=t=>{status.textContent=t;clearTimeout(timer);timer=setTimeout(()=>{status.textContent=''},4000)};const fallback=()=>{const el=document.getElementById('email');try{const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}say('Could not copy. The address is selected: press Ctrl+C or Cmd+C.')};btn.addEventListener('click',()=>{if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(email).then(()=>say('Copied'),fallback)}else{fallback()}});})();

// 2026-10-26 dimapub pass: quiet two-row navigation, night header over the hero, reveal on scroll.
document.documentElement.classList.add('js');
(function(){
 const header=document.querySelector('[data-header]'),hero=document.getElementById('top');
 const groups=[...header.querySelectorAll('.groups a[data-sections]')];
 const rows=[...header.querySelectorAll('.sub-group')];
 const now=header.querySelector('.group-now');
 const menuBtn=header.querySelector('.nav-menu-btn'),menu=document.getElementById('nav-menu');
 const marks=[...document.querySelectorAll('main #top, main .section-banner[id]')];
 const groupOf=id=>groups.find(a=>a.dataset.sections.split(' ').includes(id));
 let ticking=false,lastGroup=null;
 function spy(){
  ticking=false;
  header.classList.toggle('night',hero.getBoundingClientRect().bottom>header.offsetHeight);
  const line=Math.min(200,innerHeight*.3);let cur=marks[0];
  marks.forEach(m=>{if(m.getBoundingClientRect().top<=line)cur=m});
  const hit=groupOf(cur.id)||groups[0],g=hit.dataset.group;
  groups.forEach(a=>{const on=a===hit;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  rows.forEach(r=>{r.hidden=r.dataset.group!==g});
  if(g!==lastGroup){now.textContent=hit.textContent;lastGroup=g}
  const row=rows.find(r=>!r.hidden);
  row.querySelectorAll('a').forEach(a=>{const on=a.getAttribute('href')==='#'+cur.id;a.classList.toggle('current',on);if(on){a.setAttribute('aria-current','location');if(row.scrollWidth>row.clientWidth)row.scrollLeft=a.offsetLeft-row.clientWidth/2+a.offsetWidth/2}else a.removeAttribute('aria-current')});
 }
 const setH=()=>document.documentElement.style.setProperty('--hdr',header.offsetHeight+'px');setH();addEventListener('resize',setH);
 function request(){if(!ticking){ticking=true;requestAnimationFrame(spy)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);spy();
 function closeMenu(){menu.hidden=true;menuBtn.setAttribute('aria-expanded','false')}
 menuBtn.addEventListener('click',()=>{const open=menuBtn.getAttribute('aria-expanded')==='true';menu.hidden=open;menuBtn.setAttribute('aria-expanded',String(!open))});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuBtn.focus()}});
})();

// Reading navigation follows the section, or the current chapter inside the outline.
(function(){
 const sections=[...document.querySelectorAll('main .section-banner[id]')];
 const chapters=[...document.querySelectorAll('#outline-body .chap[id]')];
 const parts=[...document.querySelectorAll('#outline-body > .part[id], #appendices')];
 const outline=document.getElementById('outline'),after=sections[sections.indexOf(outline)+1];
 const prev=document.getElementById('journey-prev'),next=document.getElementById('journey-next'),current=document.getElementById('journey-current'),part=document.getElementById('journey-part');
 const label=(a,t)=>{a.setAttribute('aria-label',t)};
 let pending=false;
 function update(){
  pending=false;const line=Math.min(180,innerHeight*.28);let index=-1;
  sections.forEach((e,i)=>{if(e.getBoundingClientRect().top<=line)index=i});
  const section=sections[Math.max(0,index)];
  const inOutline=outline.getBoundingClientRect().top<=line&&after.getBoundingClientRect().top>line;
  if(inOutline){
   let ci=-1;chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<=line)ci=i});
   const c=chapters[Math.max(0,ci)];
   const prefix=c.querySelector('.cn').textContent,name=c.querySelector('h4').textContent;
   current.textContent=name.toLowerCase().startsWith(prefix.toLowerCase())?name:prefix+' · '+name;
   prev.href=ci>0?'#'+chapters[ci-1].id:'#outline';
   next.href=ci<chapters.length-1?'#'+chapters[Math.max(0,ci+1)].id:'#'+after.id;
   label(prev,'Previous chapter');label(next,'Next chapter');
   const np=parts.find(p=>p.getBoundingClientRect().top>line+1);
   part.href=np?'#'+np.id:'#'+after.id;part.textContent=np?'Next part →':after.querySelector('h2').textContent+' →';part.hidden=false;
  }else{
   current.textContent=index<0?'Using Data to Drive Business Performance':section.querySelector('h2').textContent;
   prev.href=index<=0?'#top':'#'+sections[index-1].id;
   next.href=index<sections.length-1?'#'+sections[index+1].id:'#top';
   label(prev,'Previous section');label(next,'Next section');
   part.hidden=true;
  }
  const max=document.documentElement.scrollHeight-innerHeight;
  document.querySelector('.reading-progress span').style.width=(max>0?scrollY/max*100:0)+'%';
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);addEventListener('hashchange',request);update();
})();

// Cards and figures fade up once; the course arc draws its line. Reduced motion: everything is shown at once.
(function(){
 const arcs=[...document.querySelectorAll('.arc-line')];
 const still=matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window);
 if(still){arcs.forEach(a=>a.classList.add('in'));return}
 const items=[...document.querySelectorAll('.who-card, .rhythm li, .project, .glance a, .status-grid .callout, .final-thought, .closing-cta, #market .fig, #industry .fig, #textbooks .fig')];
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
 items.forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)return;el.classList.add('reveal');el.style.setProperty('--d',(i%3)*0.07+'s');io.observe(el)});
 arcs.forEach(a=>io.observe(a));
})();
