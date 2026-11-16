(() => {
  'use strict';
  const data = window.FOOT_DATA || { ballon: [], coupe: [] };
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
  const setStats = (id, items) => { const el=$(id); if(el) el.innerHTML=items.map(([v,l])=>`<div class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join(''); };
  const setupMenu = () => { const b=document.querySelector('.menu-toggle'),n=document.querySelector('.main-nav'); if(b&&n)b.addEventListener('click',()=>{const open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open));}); };

  const setupBallon = () => {
    const list=$('ballon-list'); if(!list)return;
    const search=$('search-ballon'),decade=$('decade-ballon'),sort=$('sort-ballon'),empty=$('ballon-empty');
    if(!search||!decade||!sort){console.error('FootHistoire : contrôles du Ballon d’Or introuvables.');return;}
    const records=Array.isArray(data.ballon)?data.ballon:[];
    setStats('stats-ballon',[[records.length,'éditions renseignées'],[new Set(records.map(x=>x.vainqueur?.nom).filter(Boolean)).size,'vainqueurs différents'],['1956–2026','période couverte']]);
    const render=()=>{
      const term=normalize(search.value),selected=decade.value;
      const rows=records.filter(x=>{const w=x.vainqueur||{};const podium=[...(x.second||[]),...(x.troisieme||[])];const text=normalize([x.annee,w.nom,w.club,w.pays,...podium].join(' '));return(!term||text.includes(term))&&(selected==='all'||Math.floor(Number(x.annee)/10)*10===Number(selected));})
        .sort((a,b)=>sort.value==='asc'?a.annee-b.annee:b.annee-a.annee);
      list.innerHTML=rows.map(x=>{
        const w=x.vainqueur||{};const second=(x.second||[]).join(', ')||'Non renseigné';const third=(x.troisieme||[]).join(', ')||'Non renseigné';
        return `<article class="award-card"><div class="card-top"><span class="year-badge">${esc(x.annee)}</span><span class="winner-label">Podium</span></div><h3 class="winner-name">🥇 ${esc(w.nom||'Non renseigné')}</h3><p class="winner-meta">${esc(w.club||'')} · ${esc(w.pays||'')}</p><div class="runner-line"><b>🥈 Deuxième :</b> ${esc(second)}</div><div class="runner-line"><b>🥉 Troisième :</b> ${esc(third)}</div></article>`;
      }).join('');
      if(empty)empty.hidden=rows.length!==0;
    };
    search.addEventListener('input',render);decade.addEventListener('change',render);sort.addEventListener('change',render);render();
  };

  const setupCoupe = () => {
    const list=$('coupe-list');if(!list)return;
    const search=$('search-coupe'),country=$('country-coupe'),sort=$('sort-coupe'),empty=$('coupe-empty');
    if(!search||!country||!sort){console.error('FootHistoire : contrôles de la Coupe du monde introuvables.');return;}
    const records=Array.isArray(data.coupe)?data.coupe:[];
    const champions=[...new Set(records.map(x=>x.vainqueur).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
    country.innerHTML='<option value="all">Tous les champions</option>'+champions.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    setStats('stats-coupe',[[records.length,'éditions renseignées'],[champions.length,'nations championnes'],['1930–2026','période couverte']]);
    const render=()=>{
      const term=normalize(search.value);
      const rows=records.filter(x=>normalize([x.annee,x.vainqueur,x.finaliste,x.ville,x.score,...(x.buteurs||[]).flatMap(g=>[g.joueur,g.equipe,g.minute,g.type])].join(' ')).includes(term)&&(country.value==='all'||x.vainqueur===country.value))
        .sort((a,b)=>sort.value==='asc'?a.annee-b.annee:b.annee-a.annee);
      list.innerHTML=rows.map(x=>{
        const scorers=(x.buteurs||[]).length?x.buteurs.map(g=>`<div class="runner-line"><b>${esc(g.minute)}′</b> ${esc(g.joueur)} — ${esc(g.equipe)}${g.type?` (${esc(g.type)})`:''}</div>`).join(''):'<div class="runner-line">Aucun but marqué pendant le match.</div>';
        return `<article class="world-card"><div class="card-top"><span class="year-badge">${esc(x.annee)}</span><span class="winner-label">Champion</span></div><h3>${esc(x.vainqueur)}</h3><p>Finaliste : ${esc(x.finaliste)}<br>Ville : ${esc(x.ville)}</p><div class="final-score">Score : ${esc(x.score)}</div><div class="runner-line"><b>Buteurs de la finale :</b></div>${scorers}${x.note?`<div class="runner-line">${esc(x.note)}</div>`:''}</article>`;
      }).join('');
      if(empty)empty.hidden=rows.length!==0;
    };
    search.addEventListener('input',render);country.addEventListener('change',render);sort.addEventListener('change',render);render();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    setupMenu();document.querySelectorAll('.year-now').forEach(el=>el.textContent=new Date().getFullYear());
    if(document.body.dataset.page==='ballon')setupBallon();
    if(document.body.dataset.page==='coupe')setupCoupe();
    console.info('FootHistoire chargé :',data.ballon.length,'podiums et',data.coupe.length,'éditions de Coupe du monde.');
  });
})();
