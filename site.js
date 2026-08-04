
(() => {
  const intro = document.querySelector('.page-intro');
  window.addEventListener('load', () => setTimeout(() => intro?.classList.add('done'), 850));
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  btn?.addEventListener('click', () => { const open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('show'); observer.unobserve(e.target)} }), {threshold:.12});
  reveals.forEach(el => observer.observe(el));
  const progress = document.querySelector('.scroll-progress');
  const update = () => { const max = document.documentElement.scrollHeight - innerHeight; if(progress) progress.style.width = `${max ? scrollY/max*100 : 0}%`; };
  addEventListener('scroll', update, {passive:true}); update();
  const glow = document.querySelector('.cursor-glow');
  addEventListener('pointermove', e => { if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'} }, {passive:true});
  document.querySelectorAll('[data-copy]').forEach(el => el.addEventListener('click', async () => { try{await navigator.clipboard.writeText(el.dataset.copy); const old=el.textContent; el.textContent='Copied'; setTimeout(()=>el.textContent=old,1200)}catch(_){} }));
  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', e => { e.preventDefault(); const d = new FormData(form); const subject = encodeURIComponent(d.get('subject') || 'Portfolio enquiry'); const body = encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\n\n${d.get('message')}`); location.href=`mailto:ceo@abcde.com.bd?subject=${subject}&body=${body}`; });
})();
