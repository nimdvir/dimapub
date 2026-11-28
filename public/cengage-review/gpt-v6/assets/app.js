document.documentElement.classList.add('js');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function revealHash(){
 let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}
 const el=id&&document.getElementById(id);if(!el)return;
 for(let p=el;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
 requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:reduceMotion?'auto':'smooth'}));
}
addEventListener('hashchange',revealHash);if(location.hash)revealHash();
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.getAttribute('href')===location.hash)revealHash()});
document.querySelectorAll('[data-search-input]').forEach(input=>input.addEventListener('input',()=>{
 const root=document.querySelector(input.dataset.searchInput),q=input.value.toLowerCase().trim();let count=0;
 if(!root)return;root.querySelectorAll('[data-search]').forEach(row=>{const match=row.dataset.search.toLowerCase().includes(q);row.hidden=!match;if(match)count++});
 const status=document.getElementById(input.dataset.status);if(status)status.textContent=count+' matching records';
}));
const header=document.querySelector('.site-header'),links=[...document.querySelectorAll('.site-header [data-group]')],stops=[...document.querySelectorAll('[data-stop]')];
const outline=document.getElementById('complete-outline'),chapters=[...document.querySelectorAll('#outline-body .part-h,#outline-body .chap[id]')];
const outlineId=el=>el.id||el.parentElement.id;
const nav=document.querySelector('.journey-nav'),prev=document.getElementById('read-prev'),next=document.getElementById('read-next'),current=document.getElementById('read-current');
let pending=false;
function updateReading(){
 pending=false;const line=Math.min(180,innerHeight*.28);let idx=-1;
 stops.forEach((s,i)=>{if(s.getBoundingClientRect().top<=line)idx=i});
 const stop=stops[Math.max(0,idx)],id=idx<0?'top':stop.id;
 const group=links.find(a=>a.dataset.group.split(' ').includes(id));
 for(const a of links){const active=a===group;a.classList.toggle('active',active);active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current')}
 const darks=[...document.querySelectorAll('.hero,.major-header')];header.classList.toggle('night',darks.some(e=>{const r=e.getBoundingClientRect();return r.top<=80&&r.bottom>=35}));
 const inOutline=outline.open&&outline.getBoundingClientRect().top<=line&&outline.getBoundingClientRect().bottom>line;
 if(inOutline){
  let ci=-1;chapters.forEach((ch,i)=>{if(ch.getBoundingClientRect().top<=line)ci=i});const ch=chapters[Math.max(0,ci)];
  const label=ch.querySelector('.cn,.label').textContent;
  current.textContent=label.replace('Midterm integration studio','Midterm studio')+' · '+ch.querySelector('h3,h4').textContent.replace(/^(Preface:|Closing:)\s*/, '');
  prev.href=ci>0?'#'+outlineId(chapters[ci-1]):'#outline';next.href=ci<chapters.length-1?'#'+outlineId(chapters[Math.max(0,ci+1)]):'#coursework';
  prev.setAttribute('aria-label','Previous chapter or part');next.setAttribute('aria-label','Next chapter or part');
 }else{
  current.textContent=idx<0?'Book overview':stop.dataset.label;
  prev.href=idx<=0?'#top':'#'+stops[idx-1].id;next.href=idx<stops.length-1?'#'+stops[idx+1].id:'#top';
  prev.setAttribute('aria-label','Previous section');next.setAttribute('aria-label','Next section');
 }
 nav.classList.toggle('at-top',scrollY<350);
 const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress span').style.width=(max>0?scrollY/max*100:0)+'%';
}
function requestUpdate(){if(!pending){pending=true;requestAnimationFrame(updateReading)}}
addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);outline.addEventListener('toggle',requestUpdate);updateReading();
// Small reveals add life without delaying reading or hiding content when scripts are absent.
const revealables=[...document.querySelectorAll('.study-heading,.working-proposal,.research-decisions,.intro-grid,.classroom-story,.final-thought')];
if(!reduceMotion&&'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target)}}),{threshold:.05,rootMargin:'100px'});
 revealables.forEach(el=>{el.classList.add('reveal','ready');observer.observe(el)});
 setTimeout(()=>revealables.forEach(el=>el.classList.add('seen')),5000);
}
