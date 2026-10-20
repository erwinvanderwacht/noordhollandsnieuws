/* Noord-Hollands Nieuws: gedeelde code voor alle pagina's */
(function(){
'use strict';

/* ---------------- gegevens ---------------- */
const REGIONS = {
  amsterdam:{n:'Amsterdam en Amstelland'},
  'zaanstreek-waterland':{n:'Zaanstreek en Waterland'},
  haarlem:{n:'Haarlem en Zuid-Kennemerland'},
  ijmond:{n:'IJmond'},
  haarlemmermeer:{n:'Haarlemmermeer en Schiphol'},
  alkmaar:{n:'Regio Alkmaar'},
  'west-friesland':{n:'West-Friesland'},
  noordkop:{n:'Kop van Noord-Holland'},
  gooi:{n:'Gooi en Vechtstreek'},
  provincie:{n:'Heel Noord-Holland'}
};
const G = [
  ['Aalsmeer',52.26,4.76,'amsterdam'],['Alkmaar',52.63,4.75,'alkmaar'],['Amstelveen',52.30,4.86,'amsterdam'],['Amsterdam',52.37,4.90,'amsterdam'],
  ['Bergen',52.66,4.70,'alkmaar'],['Beverwijk',52.48,4.66,'ijmond'],['Blaricum',52.27,5.24,'gooi'],['Bloemendaal',52.40,4.63,'haarlem'],
  ['Castricum',52.55,4.67,'alkmaar'],['Den Helder',52.96,4.76,'noordkop'],['Diemen',52.34,4.96,'amsterdam'],['Dijk en Waard',52.67,4.82,'alkmaar'],
  ['Drechterland',52.66,5.18,'west-friesland'],['Edam-Volendam',52.50,5.07,'zaanstreek-waterland'],['Enkhuizen',52.70,5.29,'west-friesland'],
  ['Gooise Meren',52.27,5.16,'gooi'],['Haarlem',52.38,4.64,'haarlem'],['Haarlemmermeer',52.30,4.69,'haarlemmermeer'],['Heemskerk',52.51,4.67,'ijmond'],
  ['Heemstede',52.35,4.62,'haarlem'],['Heiloo',52.60,4.70,'alkmaar'],['Hilversum',52.22,5.18,'gooi'],['Hollands Kroon',52.88,4.98,'noordkop'],
  ['Hoorn',52.64,5.06,'west-friesland'],['Huizen',52.30,5.24,'gooi'],['Koggenland',52.64,4.95,'west-friesland'],['Landsmeer',52.43,4.92,'zaanstreek-waterland'],
  ['Laren',52.26,5.23,'gooi'],['Medemblik',52.77,5.11,'west-friesland'],['Opmeer',52.71,4.94,'west-friesland'],['Ouder-Amstel',52.30,4.92,'amsterdam'],
  ['Purmerend',52.50,4.95,'zaanstreek-waterland'],['Schagen',52.79,4.80,'noordkop'],['Stede Broec',52.69,5.23,'west-friesland'],['Texel',53.06,4.80,'noordkop'],
  ['Uitgeest',52.53,4.71,'alkmaar'],['Uithoorn',52.24,4.83,'amsterdam'],['Velsen',52.46,4.62,'ijmond'],['Waterland',52.46,5.04,'zaanstreek-waterland'],
  ['Wijdemeren',52.23,5.10,'gooi'],['Wormerland',52.49,4.81,'zaanstreek-waterland'],['Zaanstad',52.44,4.83,'zaanstreek-waterland'],['Zandvoort',52.37,4.53,'haarlem']
].map(([n,lat,lon,r])=>({n,lat,lon,r}));
const GBY = Object.fromEntries(G.map(g=>[g.n,g]));
const DAGEN=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
const MAANDEN=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];

const store={get(k,d){try{const v=localStorage.getItem('nhn:'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('nhn:'+k,JSON.stringify(v))}catch(e){}}};
const qs=new URLSearchParams(location.search);
const $=s=>document.querySelector(s);
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
const pad=n=>String(n).padStart(2,'0');
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
function datum(d,withDay=true){return (withDay?DAGEN[d.getDay()]+' ':'')+d.getDate()+' '+MAANDEN[d.getMonth()]+' '+d.getFullYear()}
function wanneer(iso){
  const d=new Date(iso),n=new Date(),y=new Date();y.setDate(n.getDate()-1);
  if(d.toDateString()===n.toDateString()) return hm(d);
  if(d.toDateString()===y.toDateString()) return 'gisteren '+hm(d);
  return d.getDate()+' '+MAANDEN[d.getMonth()].slice(0,3)+' '+hm(d);
}
function myG(){const g=store.get('gemeente','Alkmaar');return GBY[g]?g:'Alkmaar'}

/* ---------------- lettergrootte ---------------- */
const SIZES=['','groot','extra-groot'];
function applySize(){const s=store.get('size','');document.documentElement.classList.remove('groot','extra-groot');if(s)document.documentElement.classList.add(s)}
applySize();

/* ---------------- weer ---------------- */
const WMO={0:['Onbewolkt','sun'],1:['Overwegend zonnig','sun'],2:['Half bewolkt','partly'],3:['Bewolkt','cloud'],45:['Mist','fog'],48:['Mist met rijp','fog'],
 51:['Lichte motregen','drizzle'],53:['Motregen','drizzle'],55:['Dichte motregen','drizzle'],56:['IJzel','drizzle'],57:['IJzel','drizzle'],
 61:['Lichte regen','rain'],63:['Regen','rain'],65:['Zware regen','rain'],66:['IJzel','rain'],67:['IJzel','rain'],71:['Lichte sneeuw','snow'],73:['Sneeuw','snow'],75:['Zware sneeuw','snow'],77:['Sneeuwkorrels','snow'],
 80:['Regenbuien','showers'],81:['Regenbuien','showers'],82:['Zware buien','showers'],85:['Sneeuwbuien','snow'],86:['Sneeuwbuien','snow'],95:['Onweer','storm'],96:['Onweer met hagel','storm'],99:['Onweer met hagel','storm']};
function icon(code){
  const k=(WMO[code]||['','cloud'])[1];
  const sun='<circle class="sun" cx="20" cy="20" r="9"/>';
  const cloud=(c='cloud')=>`<path class="${c}" d="M14 40h22a8 8 0 0 0 0-16 11 11 0 0 0-21-3 7.5 7.5 0 0 0-1 19z"/>`;
  const drops='<path class="drop" d="M17 43l-2 5M25 43l-2 5M33 43l-2 5" stroke="currentColor" stroke-width="0"/><rect class="drop" x="15" y="43" width="2.5" height="6" rx="1.2" transform="rotate(15 16 46)"/><rect class="drop" x="23" y="43" width="2.5" height="6" rx="1.2" transform="rotate(15 24 46)"/><rect class="drop" x="31" y="43" width="2.5" height="6" rx="1.2" transform="rotate(15 32 46)"/>';
  const m={
    sun:'<circle class="sun" cx="26" cy="26" r="11"/>'+[0,45,90,135,180,225,270,315].map(a=>`<rect class="sun" x="25" y="5" width="2.4" height="7" rx="1.2" transform="rotate(${a} 26 26)"/>`).join(''),
    partly:sun+cloud(),
    cloud:cloud(),
    fog:'<path class="fog" d="M10 22h32M8 30h36M12 38h28"/>',
    drizzle:cloud()+drops,
    rain:cloud('dark')+drops,
    showers:sun+cloud()+drops,
    snow:cloud()+'<circle class="snow" cx="17" cy="46" r="2.5"/><circle class="snow" cx="26" cy="47" r="2.5"/><circle class="snow" cx="35" cy="46" r="2.5"/>',
    storm:cloud('dark')+'<path class="bolt" d="M26 40l-6 9h5l-2 7 8-10h-5l3-6z"/>'
  };
  return `<svg class="wx-ico" viewBox="0 0 52 56" aria-hidden="true">${m[k]||m.cloud}</svg>`;
}
const desc=c=>(WMO[c]||['Onbekend'])[0];
function bft(kmh){const t=[1,6,12,20,29,39,50,62,75,89,103,118];let b=0;while(b<t.length&&kmh>=t[b])b++;return b}
async function weer(g){
  const key='wx:'+g.n;
  try{const c=JSON.parse(sessionStorage.getItem(key)||'null');if(c&&Date.now()-c.t<20*60000)return c.d}catch(e){}
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${g.lat}&longitude=${g.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=Europe%2FAmsterdam&forecast_days=7`;
  const r=await fetch(u);if(!r.ok)throw new Error('weer '+r.status);
  const d=await r.json();
  try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),d}))}catch(e){}
  return d;
}
function windRichting(deg){return ['N','NO','O','ZO','Z','ZW','W','NW'][Math.round(deg/45)%8]}

/* ---------------- gemeente-API ---------------- */
async function bekendmakingen(name,n=8){
  const r=await fetch(`/api/bekendmakingen?g=${encodeURIComponent(name)}&n=${n}`);
  if(!r.ok||!(r.headers.get('content-type')||'').includes('json')) throw new Error('geen data');
  return r.json();
}
function govList(items){
  const ul=el('ul','gov');
  items.forEach(i=>{
    const li=el('li');const a=el('a',null,i.title);a.href=i.url;a.target='_blank';a.rel='noopener';
    const m=el('div','meta');m.append(Object.assign(el('span','pill',i.type||'Bekendmaking')),document.createTextNode(i.date?new Date(i.date).toLocaleDateString('nl-NL',{day:'numeric',month:'long'}):''));
    li.append(a,m);ul.append(li);
  });
  return ul;
}

/* ---------------- artikelen ---------------- */
let ARTS=null;
async function articles(){
  if(ARTS) return ARTS;
  const r=await fetch('/data/articles.json');const j=await r.json();
  ARTS=j.articles.sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)||new Date(b.published)-new Date(a.published));return ARTS;
}
const artUrl=a=>'/artikel.html?id='+encodeURIComponent(a.id);
function storyEl(a,big){
  const link=el('a',big?'lead-story':'story');link.href=artUrl(a);
  link.append(el('span','kicker',a.category+' · '+(a.places[0]||REGIONS[a.region]?.n||'')));
  link.append(el(big?'h2':'h3',null,a.title));
  link.append(el('p',null,a.lead));
  link.append(el('span','meta',wanneer(a.published)+' · bron: '+a.source.name));
  return link;
}
function rowEl(a){
  const li=el('li');const r=el('a','row');r.href=artUrl(a);
  r.append(el('span','tm',wanneer(a.published).replace('gisteren ','gist. ')));
  const b=el('span');b.append(el('span','t',a.title),el('div','meta',(a.places[0]||REGIONS[a.region]?.n)+' · '+a.category));r.append(b);li.append(r);return li;
}

/* ---------------- kop en voet ---------------- */
function header(page){
  const now=new Date();
  const g=myG();
  const top=el('div','topstrip');
  top.innerHTML=`<div class="wrap"><div class="ts-left"><span>${datum(now)}</span><a class="ts-weer" id="tsWeer" href="/weer.html"><span>Weer laden…</span></a></div>
  <div class="ts-right"><label for="gSel">Mijn gemeente</label><select id="gSel">${G.map(x=>`<option${x.n===g?' selected':''}>${x.n}</option>`).join('')}</select>
  <span class="sizebtns" role="group" aria-label="Lettergrootte"><button type="button" data-s="" aria-label="Normale letters">A</button><button type="button" data-s="groot" aria-label="Grotere letters">A+</button><button type="button" data-s="extra-groot" aria-label="Extra grote letters">A++</button></span></div></div>`;
  const mh=el('header','masthead');
  mh.innerHTML=`<div class="wrap"><a class="brandlink" href="/" aria-label="Noord-Hollands Nieuws, naar de voorpagina">
   <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true"><rect width="46" height="46" rx="9" fill="#fff"/><path d="M19 40l2.2-17h3.6L27 40z" fill="#12294d"/><g fill="#c4161c" transform="rotate(20 23 19)"><rect x="21.6" y="4" width="2.8" height="15" rx="1"/><rect x="21.6" y="19" width="2.8" height="15" rx="1"/><rect x="8" y="17.6" width="15" height="2.8" rx="1"/><rect x="23" y="17.6" width="15" height="2.8" rx="1"/><rect x="24.4" y="5" width="4" height="10" rx=".6" opacity=".55"/><rect x="17.6" y="23" width="4" height="10" rx=".6" opacity=".55"/><rect x="9" y="13.6" width="10" height="4" rx=".6" opacity=".55"/><rect x="27" y="20.4" width="10" height="4" rx=".6" opacity=".55"/></g><circle cx="23" cy="19" r="2.6" fill="#12294d"/></svg>
   <span class="wordmark">Noord-Hollands Nieuws<small>Nieuws uit uw gemeente, elke dag bijgewerkt</small></span></a>
   <div class="mh-date">Editie ${datum(now)}</div></div>`;
  const nav=el('nav','main');nav.setAttribute('aria-label','Hoofdmenu');
  const links=[['/','Voorpagina','home'],['/regio.html','Regio’s','regio'],['/gemeente.html','Uw gemeente','gemeente'],['/weer.html','Weer','weer'],['/puzzels.html','Puzzels','puzzels']];
  nav.innerHTML='<div class="wrap">'+links.map(([h,t,k])=>`<a href="${h}"${k===page?' aria-current="page"':''}>${t}</a>`).join('')+'</div>';
  const host=$('#hdr');host.replaceChildren(top,mh,nav);
  $('#gSel').addEventListener('change',e=>{store.set('gemeente',e.target.value);location.reload()});
  document.querySelectorAll('.sizebtns button').forEach(b=>{b.setAttribute('aria-pressed',store.get('size','')===b.dataset.s);b.onclick=()=>{store.set('size',b.dataset.s);applySize();document.querySelectorAll('.sizebtns button').forEach(x=>x.setAttribute('aria-pressed',x===b))}});
  weer(GBY[g]).then(d=>{$('#tsWeer').innerHTML=icon(d.current.weather_code)+`<span>${Math.round(d.current.temperature_2m)}° in ${g}</span>`}).catch(()=>{$('#tsWeer').textContent='Weer'});
}
function footer(){
  const f=el('footer','site');
  f.innerHTML=`<div class="wrap">
  <div><h4>Noord-Hollands Nieuws</h4><p>Regionaal nieuws uit alle 43 gemeenten van Noord-Holland, het weer en dagelijkse puzzels. Onafhankelijk en niet verbonden aan NH Nieuws, de provincie of een gemeente.</p></div>
  <div><h4>Hoe wij werken</h4><p>Onze berichten zijn in eigen woorden herschreven op basis van regionale en landelijke nieuwsbronnen. Onder elk bericht staat de bron met een link naar het originele artikel.</p></div>
  <div><h4>Open data</h4><p>Weer: <a href="https://open-meteo.com" rel="noopener">Open-Meteo</a>. Gemeentenieuws: Officiële bekendmakingen van de overheid (KOOP), rechtstreeks uit de openbare API.</p></div>
  </div>`;
  $('#ftr').replaceChildren(f);
}

/* ---------------- pagina: voorpagina ---------------- */
async function pageHome(){
  const arts=await articles();const g=myG();
  const main=$('#content');main.replaceChildren();
  const grid=el('div','grid-home');const col=el('div');const side=el('aside','side');
  const st=el('div','sec-title');st.append(el('h2',null,'Vandaag in Noord-Holland'));col.append(st);
  col.append(storyEl(arts[0],true));
  const s=el('div','stories');arts.slice(1,5).forEach(a=>s.append(storyEl(a)));col.append(s);

  const st2=el('div','sec-title');st2.style.marginTop='30px';st2.append(el('h2',null,'Nieuws per regio'));const al=el('a',null,'Alle regio’s');al.href='/regio.html';st2.append(al);col.append(st2);
  const rg=el('div','regions');
  Object.entries(REGIONS).filter(([k])=>k!=='provincie').forEach(([k,v])=>{
    const list=arts.filter(a=>a.region===k);
    const a=el('a','region card');a.href='/regio.html?r='+k;a.append(el('b',null,v.n),el('span',null,list.length?list.length+(list.length===1?' bericht':' berichten'):'Nog geen berichten vandaag'));
    if(list[0])a.append(el('span','last',list[0].title));rg.append(a);
  });
  col.append(rg);
  const st3=el('div','sec-title');st3.style.marginTop='30px';st3.append(el('h2',null,'Al het nieuws'));col.append(st3);
  const ul=el('ul','list');arts.slice(5).forEach(a=>ul.append(rowEl(a)));col.append(ul);

  side.append(await weerWidget(g));
  const pz=el('div','card wx');pz.innerHTML=`<div class="wx-head"><h3>Puzzel van de dag</h3><span class="meta">${datum(new Date(),false)}</span></div><p style="margin:8px 0 12px;font-size:.92em">Elke dag een nieuwe sudoku en woordzoeker, in grote letters.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn primary" href="/puzzels.html#sudoku">Sudoku</a><a class="btn" href="/puzzels.html#woordzoeker">Woordzoeker</a></div>`;
  side.append(pz);
  const gv=el('div','card wx');gv.innerHTML=`<div class="wx-head"><h3>Uit de gemeente ${g}</h3></div><p class="meta" style="margin:4px 0 6px">Officiële bekendmakingen, rechtstreeks van de overheid</p><div id="govHome"><p class="meta">Laden…</p></div><a class="btn" style="margin-top:12px" href="/gemeente.html">Alles uit ${g}</a>`;
  side.append(gv);
  bekendmakingen(g,5).then(d=>$('#govHome').replaceChildren(d.items.length?govList(d.items):el('p','meta','Geen recente bekendmakingen.'))).catch(()=>$('#govHome').replaceChildren(el('p','meta','De bekendmakingen zijn nu niet bereikbaar.')));
  grid.append(col,side);main.append(grid);
}
async function weerWidget(g){
  const box=el('div','card wx');box.innerHTML=`<div class="wx-head"><h3>Weer in ${g}</h3><a class="meta" href="/weer.html">Verwachting</a></div><p class="meta">Laden…</p>`;
  try{
    const d=await weer(GBY[g]);const c=d.current;
    box.innerHTML=`<div class="wx-head"><h3>Weer in ${g}</h3><a class="meta" href="/weer.html">7 dagen</a></div>
    <div class="wx-now">${icon(c.weather_code)}<div><div class="wx-temp">${Math.round(c.temperature_2m)}°</div><div class="wx-desc">${desc(c.weather_code)}, wind ${windRichting(c.wind_direction_10m)} ${bft(c.wind_speed_10m)} Bft</div></div></div>
    <div class="wx-days">${[0,1,2,3].map(i=>{const dt=new Date(d.daily.time[i]);return `<div><span>${i?DAGEN[dt.getDay()].slice(0,2):'Vand.'}</span>${icon(d.daily.weather_code[i])}<b>${Math.round(d.daily.temperature_2m_max[i])}°</b><span class="meta">${Math.round(d.daily.temperature_2m_min[i])}°</span></div>`}).join('')}</div>`;
  }catch(e){box.querySelector('p').textContent='Het weer is nu niet beschikbaar.'}
  return box;
}

/* ---------------- pagina: artikel ---------------- */
async function pageArtikel(){
  const arts=await articles();const a=arts.find(x=>x.id===qs.get('id'));const main=$('#content');
  if(!a){main.innerHTML='<h1>Bericht niet gevonden</h1><p><a href="/">Naar de voorpagina</a></p>';return}
  document.title=a.title+' | Noord-Hollands Nieuws';
  const grid=el('div','grid-home');const art=el('article','full');
  art.append(el('span','kicker',a.category+' · '+(a.places.join(', ')||REGIONS[a.region].n)),el('h1',null,a.title));
  const by=el('div','byline');const d=new Date(a.published);by.append(el('span',null,'Redactie Noord-Hollands Nieuws'),el('span',null,datum(d)+', '+hm(d)));art.append(by);
  art.append(el('p','lead',a.lead));a.body.forEach(p=>art.append(el('p',null,p)));
  const sb=el('div','sourcebox');sb.innerHTML='Dit bericht is in eigen woorden herschreven. Bron: ';
  const s1=el('a',null,a.source.name);s1.href=a.source.url;s1.target='_blank';s1.rel='noopener';sb.append(s1);
  (a.also||[]).forEach(s=>{sb.append(document.createTextNode(', '));const x=el('a',null,s.name);x.href=s.url;x.target='_blank';x.rel='noopener';sb.append(x)});
  art.append(sb);
  const tags=el('div','tags');a.places.forEach(p=>{const t=el('a','tag',p);t.href='/regio.html?g='+encodeURIComponent(p);tags.append(t)});
  const rt=el('a','tag',REGIONS[a.region].n);rt.href='/regio.html?r='+a.region;tags.append(rt);art.append(tags);
  const side=el('aside','side');
  const more=el('div','card wx');more.append(el('h3',null,'Meer nieuws'));const ul=el('ul','list');arts.filter(x=>x.id!==a.id).slice(0,6).forEach(x=>ul.append(rowEl(x)));more.append(ul);
  side.append(await weerWidget(a.places[0]&&GBY[a.places[0]]?a.places[0]:myG()),more);
  grid.append(art,side);main.replaceChildren(grid);
}

/* ---------------- pagina: regio ---------------- */
async function pageRegio(){
  const arts=await articles();const main=$('#content');main.replaceChildren();
  const r=qs.get('r'),g=qs.get('g');
  let title='Nieuws per regio',list=arts;
  if(g){title='Nieuws uit '+g;list=arts.filter(a=>a.places.includes(g)||(GBY[g]&&a.region===GBY[g].r))}
  else if(r&&REGIONS[r]){title=REGIONS[r].n;list=arts.filter(a=>a.region===r)}
  document.title=title+' | Noord-Hollands Nieuws';
  const fb=el('div','filterbar');
  Object.entries(REGIONS).filter(([k])=>k!=='provincie').forEach(([k,v])=>{const b=el('button',null,v.n);b.type='button';b.setAttribute('aria-pressed',k===r);b.onclick=()=>location.href='/regio.html?r='+k;fb.append(b)});
  const st=el('div','sec-title');st.append(el('h1',null,title));
  main.append(st,fb);
  if(!r&&!g){
    const rg=el('div','regions');
    Object.entries(REGIONS).filter(([k])=>k!=='provincie').forEach(([k,v])=>{
      const a=el('a','region card');a.href='/regio.html?r='+k;const gs=G.filter(x=>x.r===k).map(x=>x.n);
      a.append(el('b',null,v.n),el('span',null,gs.join(', ')));rg.append(a);
    });main.append(rg);return;
  }
  const grid=el('div','grid-home');const col=el('div');
  if(r){const gs=G.filter(x=>x.r===r);const tg=el('div','tags');tg.style.margin='0 0 18px';gs.forEach(x=>{const t=el('a','tag',x.n);t.href='/regio.html?g='+encodeURIComponent(x.n);tg.append(t)});col.append(tg)}
  if(list.length){col.append(storyEl(list[0],true));const s=el('div','stories');list.slice(1).forEach(a=>s.append(storyEl(a)));col.append(s)}
  else col.append(el('p','notice','Er is vandaag nog geen nieuws uit deze regio. Kijk bij de officiële bekendmakingen hiernaast of op de voorpagina.'));
  const side=el('aside','side');
  const gname=g&&GBY[g]?g:(r?G.find(x=>x.r===r)?.n:myG());
  side.append(await weerWidget(gname));
  const gv=el('div','card wx');gv.innerHTML=`<h3>Bekendmakingen ${gname}</h3><div id="govR"><p class="meta">Laden…</p></div><a class="btn" style="margin-top:12px" href="/gemeente.html?g=${encodeURIComponent(gname)}">Meer uit ${gname}</a>`;side.append(gv);
  bekendmakingen(gname,5).then(d=>$('#govR').replaceChildren(govList(d.items))).catch(()=>$('#govR').replaceChildren(el('p','meta','Nu niet bereikbaar.')));
  grid.append(col,side);main.append(grid);
}

/* ---------------- pagina: gemeente ---------------- */
async function pageGemeente(){
  const g=GBY[qs.get('g')]?qs.get('g'):myG();const main=$('#content');main.replaceChildren();
  document.title='Gemeentenieuws '+g+' | Noord-Hollands Nieuws';
  const st=el('div','sec-title');st.append(el('h1',null,'Uw gemeente: '+g));
  const sel=el('select');sel.id='gPage';sel.setAttribute('aria-label','Kies een gemeente');G.forEach(x=>{const o=el('option',null,x.n);if(x.n===g)o.selected=true;sel.append(o)});
  sel.onchange=()=>location.href='/gemeente.html?g='+encodeURIComponent(sel.value);st.append(sel);main.append(st);
  const grid=el('div','grid-home');const col=el('div');const side=el('aside','side');
  col.append(el('p','notice','Hieronder ziet u de nieuwste officiële bekendmakingen van de gemeente '+g+' en van de provincie: vergunningen, verkeersbesluiten, regels en plannen. De gegevens komen rechtstreeks uit de openbare API van de overheid en worden elk kwartier ververst.'));
  const fb=el('div','filterbar');fb.style.marginTop='14px';col.append(fb);
  const box=el('div');box.innerHTML='<p class="meta">Laden…</p>';col.append(box);
  try{
    const d=await bekendmakingen(g,40);let f='alle';
    const types=[...new Set(d.items.map(i=>i.type).filter(Boolean))].slice(0,7);
    const render=()=>{box.replaceChildren(govList(d.items.filter(i=>f==='alle'||i.type===f)));fb.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===f))};
    ['alle',...types].forEach(t=>{const b=el('button',null,t==='alle'?'Alles':t);b.type='button';b.dataset.f=t;b.onclick=()=>{f=t;render()};fb.append(b)});
    render();
    const tot=el('p','meta',`${d.total.toLocaleString('nl-NL')} bekendmakingen van ${g} in totaal beschikbaar. Bron: Officiële bekendmakingen (KOOP).`);tot.style.marginTop='12px';col.append(tot);
  }catch(e){box.replaceChildren(el('p','notice','De bekendmakingen zijn op dit moment niet bereikbaar. Probeer het later opnieuw.'))}
  const local=(await articles()).filter(a=>a.places.includes(g)||a.region===GBY[g].r);
  side.append(await weerWidget(g));
  const nb=el('div','card wx');nb.append(el('h3',null,'Nieuws uit de regio'));
  if(local.length){const ul=el('ul','list');local.slice(0,6).forEach(a=>ul.append(rowEl(a)));nb.append(ul)}else nb.append(el('p','meta','Vandaag nog geen nieuws uit deze regio.'));
  const pv=el('div','card wx');pv.innerHTML='<h3>Provincie Noord-Holland</h3><div id="govP"><p class="meta">Laden…</p></div>';
  side.append(nb,pv);
  bekendmakingen('Noord-Holland',5).then(d=>$('#govP').replaceChildren(govList(d.items))).catch(()=>$('#govP').replaceChildren(el('p','meta','Nu niet bereikbaar.')));
  grid.append(col,side);main.append(grid);
}

/* ---------------- pagina: weer ---------------- */
async function pageWeer(){
  const g=GBY[qs.get('g')]?qs.get('g'):myG();const main=$('#content');main.replaceChildren();
  const st=el('div','sec-title');st.append(el('h1',null,'Het weer in '+g));
  const sel=el('select');sel.setAttribute('aria-label','Kies een plaats');G.forEach(x=>{const o=el('option',null,x.n);if(x.n===g)o.selected=true;sel.append(o)});
  sel.onchange=()=>location.href='/weer.html?g='+encodeURIComponent(sel.value);st.append(sel);main.append(st);
  try{
    const d=await weer(GBY[g]);const c=d.current;
    const now=el('div','card wx');
    now.innerHTML=`<div class="wx-now">${icon(c.weather_code)}<div><div class="wx-temp">${Math.round(c.temperature_2m)}°</div><div class="wx-desc">${desc(c.weather_code)} · gevoelstemperatuur ${Math.round(c.apparent_temperature)}° · wind ${windRichting(c.wind_direction_10m)} ${bft(c.wind_speed_10m)} Bft (${Math.round(c.wind_speed_10m)} km/u)</div><div class="meta">Zon op ${d.daily.sunrise[0].slice(11)} · onder ${d.daily.sunset[0].slice(11)}</div></div></div>`;
    main.append(now);
    const h2=el('div','sec-title');h2.style.marginTop='26px';h2.append(el('h2',null,'De komende uren'));main.append(h2);
    const hrs=el('div','hours');const startH=d.hourly.time.findIndex(t=>new Date(t)>=new Date(Date.now()-3600e3));
    for(let i=startH;i<startH+24&&i<d.hourly.time.length;i+=1){const t=new Date(d.hourly.time[i]);const h=el('div','hour card');h.innerHTML=`<span>${pad(t.getHours())}:00</span>${icon(d.hourly.weather_code[i])}<b>${Math.round(d.hourly.temperature_2m[i])}°</b><span class="meta">${d.hourly.precipitation_probability[i]??0}% regen</span>`;hrs.append(h)}
    main.append(hrs);
    const h3=el('div','sec-title');h3.style.marginTop='26px';h3.append(el('h2',null,'Verwachting per dag'));main.append(h3);
    const fc=el('div','forecast');
    d.daily.time.forEach((t,i)=>{const dt=new Date(t);const c2=el('div','fc card');
      c2.innerHTML=`<span class="d">${i===0?'Vandaag':i===1?'Morgen':DAGEN[dt.getDay()][0].toUpperCase()+DAGEN[dt.getDay()].slice(1)}</span><span class="meta">${dt.getDate()} ${MAANDEN[dt.getMonth()]}</span>${icon(d.daily.weather_code[i])}<span class="temps">${Math.round(d.daily.temperature_2m_max[i])}° <span>/ ${Math.round(d.daily.temperature_2m_min[i])}°</span></span><span class="row2"><span>${desc(d.daily.weather_code[i])}</span><span>Regen ${d.daily.precipitation_sum[i].toLocaleString('nl-NL')} mm (${d.daily.precipitation_probability_max[i]??0}%)</span><span>Wind tot ${bft(d.daily.wind_speed_10m_max[i])} Bft</span></span>`;fc.append(c2)});
    main.append(fc);
    main.append(Object.assign(el('p','meta','Weergegevens: Open-Meteo, bijgewerkt elk kwartier. Windkracht in Beaufort.'),{style:'margin-top:16px'}));
  }catch(e){main.append(el('p','notice','Het weer kan nu niet worden geladen. Probeer het later opnieuw.'))}
}

/* ---------------- puzzels ---------------- */
function seeded(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dayKey(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
function shuffle(arr,rnd){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}

/* sudoku */
function canPlace(b,i,v){const r=Math.floor(i/9),c=i%9,br=r-r%3,bc=c-c%3;for(let k=0;k<9;k++){if(b[r*9+k]===v||b[k*9+c]===v)return false;const rr=br+Math.floor(k/3),cc=bc+k%3;if(b[rr*9+cc]===v)return false}return true}
function fill(b,rnd){const i=b.indexOf(0);if(i<0)return true;for(const v of shuffle([1,2,3,4,5,6,7,8,9],rnd)){if(canPlace(b,i,v)){b[i]=v;if(fill(b,rnd))return true;b[i]=0}}return false}
function countSol(b,lim=2){const i=b.indexOf(0);if(i<0)return 1;let n=0;for(let v=1;v<=9&&n<lim;v++){if(canPlace(b,i,v)){b[i]=v;n+=countSol(b,lim-n);b[i]=0}}return n}
function makeSudoku(seed,givens){
  const rnd=seeded(seed);const sol=Array(81).fill(0);fill(sol,rnd);
  const p=sol.slice();const order=shuffle([...Array(81).keys()],rnd);let left=81;
  for(const i of order){if(left<=givens)break;const keep=p[i];p[i]=0;if(countSol(p.slice())!==1){p[i]=keep}else left--}
  return {puzzle:p,solution:sol};
}
const LEVELS={makkelijk:{n:'Makkelijk',g:40},gemiddeld:{n:'Gemiddeld',g:33},moeilijk:{n:'Moeilijk',g:28}};
function sudokuUI(host){
  let lvl=store.get('sdk-lvl','makkelijk');
  let game,state,sel=-1,showErr=false;
  const key=()=>'sdk:'+dayKey()+':'+lvl;
  function load(){
    const seed=dayKey()*7+Object.keys(LEVELS).indexOf(lvl);
    game=makeSudoku(seed,LEVELS[lvl].g);
    state=store.get(key(),null)||game.puzzle.slice();sel=-1;showErr=false;draw();
  }
  const wrap=el('div','puzzle-wrap');const left=el('div');const grid=el('div','sudoku');grid.setAttribute('role','grid');grid.setAttribute('aria-label','Sudoku');
  const padEl=el('div','pad');
  [1,2,3,4,5,6,7,8,9].forEach(v=>{const b=el('button',null,String(v));b.type='button';b.onclick=()=>put(v);padEl.append(b)});
  const wis=el('button','',"Wis");wis.type='button';wis.onclick=()=>put(0);padEl.append(wis);
  left.append(grid,padEl);
  const info=el('div','pz-info');
  const lv=el('div','levels');Object.entries(LEVELS).forEach(([k,v])=>{const b=el('button',null,v.n);b.type='button';b.onclick=()=>{lvl=k;store.set('sdk-lvl',k);load()};b.dataset.k=k;lv.append(b)});
  const status=el('p');status.style.margin='0';
  const chk=el('button','btn','Controleer mijn invulling');chk.type='button';chk.onclick=()=>{showErr=!showErr;chk.textContent=showErr?'Verberg fouten':'Controleer mijn invulling';draw()};
  const reset=el('button','btn','Opnieuw beginnen');reset.type='button';reset.onclick=()=>{state=game.puzzle.slice();store.set(key(),state);showErr=false;draw()};
  info.append(el('h2',null,'Sudoku van de dag'),el('p','meta','Vul elke rij, kolom en elk blok van 3 bij 3 met de cijfers 1 tot en met 9. Tik op een vakje en daarna op een cijfer. Uw voortgang wordt bewaard.'),lv,status,chk,reset);
  wrap.append(left,info);host.append(wrap);
  function put(v){if(sel<0||game.puzzle[sel])return;state[sel]=v;store.set(key(),state);draw()}
  function draw(){
    lv.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===lvl));
    grid.replaceChildren();
    const sr=sel>=0?Math.floor(sel/9):-1,sc=sel%9,sv=sel>=0?state[sel]:0;
    for(let i=0;i<81;i++){
      const r=Math.floor(i/9),c=i%9;const b=el('button');b.type='button';
      const given=!!game.puzzle[i];if(given)b.classList.add('given');
      if(c===2||c===5)b.classList.add('bR');if(r===2||r===5)b.classList.add('bB');
      if(sel>=0&&(r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3))))b.classList.add('peer');
      if(sv&&state[i]===sv)b.classList.add('same');
      if(i===sel)b.classList.add('sel');
      if(showErr&&state[i]&&state[i]!==game.solution[i])b.classList.add('err');
      b.textContent=state[i]||'';b.setAttribute('aria-label',`Rij ${r+1}, kolom ${c+1}${state[i]?', '+state[i]:', leeg'}`);
      b.onclick=()=>{sel=i;draw()};grid.append(b);
    }
    const empty=state.filter(x=>!x).length;const solved=state.every((v,i)=>v===game.solution[i]);
    status.className=solved?'done':'';status.textContent=solved?'Gefeliciteerd, opgelost!':empty+' vakjes nog in te vullen';
  }
  document.addEventListener('keydown',e=>{if(!host.isConnected||host.hidden)return;if(/^[1-9]$/.test(e.key))put(+e.key);else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0')put(0);
    else if(sel>=0&&e.key.startsWith('Arrow')){e.preventDefault();const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-9,ArrowDown:9}[e.key];sel=(sel+d+81)%81;draw()}});
  load();
}

/* woordzoeker */
const WORDS=['ALKMAAR','HOORN','ZAANDAM','HAARLEM','TEXEL','VOLENDAM','EDAM','MOLEN','KAAS','TULP','POLDER','DIJK','BEEMSTER','DUINEN','STRAND','GRACHT','SCHAGEN','HELDER','MARKEN','KANAAL','SLUIS','KLOMP','BOLLEN','HAVEN','ZEILEN','WIERINGEN','GOOI','LAREN','ENKHUIZEN','PURMEREND','VELSEN','ZANDVOORT','FIETS','SCHAPEN','KOEIEN','WEILAND'];
function makeWS(seed,size=12,count=9){
  const rnd=seeded(seed);const grid=Array(size*size).fill('');const dirs=[[0,1],[1,0],[1,1]];const placed=[];
  for(const w of shuffle(WORDS.filter(w=>w.length<=size),rnd)){
    if(placed.length>=count)break;
    for(let t=0;t<120;t++){
      const [dr,dc]=dirs[Math.floor(rnd()*dirs.length)];const r0=Math.floor(rnd()*size),c0=Math.floor(rnd()*size);
      const r1=r0+dr*(w.length-1),c1=c0+dc*(w.length-1);if(r1>=size||c1>=size)continue;
      let ok=true;for(let k=0;k<w.length;k++){const ch=grid[(r0+dr*k)*size+c0+dc*k];if(ch&&ch!==w[k]){ok=false;break}}
      if(!ok)continue;const cells=[];for(let k=0;k<w.length;k++){const i=(r0+dr*k)*size+c0+dc*k;grid[i]=w[k];cells.push(i)}
      placed.push({w,cells});break;
    }
  }
  const AB='ABCDEEEFGHIJKLMNNOPRSTTUVWZ';for(let i=0;i<grid.length;i++)if(!grid[i])grid[i]=AB[Math.floor(rnd()*AB.length)];
  return {size,grid,placed:placed.sort((a,b)=>a.w.localeCompare(b.w))};
}
function wsUI(host){
  const g=makeWS(dayKey()*13);const key='ws:'+dayKey();let found=new Set(store.get(key,[]));let start=-1;
  const wrap=el('div','puzzle-wrap');const left=el('div');const grid=el('div','ws');grid.style.gridTemplateColumns=`repeat(${g.size},1fr)`;
  const info=el('div','pz-info');const ul=el('ul','words');const status=el('p');status.style.margin='0';
  info.append(el('h2',null,'Woordzoeker van de dag'),el('p','meta','Zoek de Noord-Hollandse woorden. Ze staan van links naar rechts, van boven naar beneden of schuin naar rechtsonder. Tik op de eerste letter en daarna op de laatste letter van een woord.'),status,ul);
  left.append(grid);wrap.append(left,info);host.append(wrap);
  function line(a,b){const s=g.size;const r0=Math.floor(a/s),c0=a%s,r1=Math.floor(b/s),c1=b%s;const dr=Math.sign(r1-r0),dc=Math.sign(c1-c0);const n=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
    if(!(r0===r1||c0===c1||Math.abs(r1-r0)===Math.abs(c1-c0)))return null;const out=[];for(let k=0;k<=n;k++)out.push((r0+dr*k)*s+c0+dc*k);return out}
  function tap(i){
    if(start<0){start=i;draw();return}
    const cells=line(start,i)||[];start=-1;
    const hit=g.placed.find(p=>!found.has(p.w)&&(same(p.cells,cells)||same(p.cells,cells.slice().reverse())));
    if(hit){found.add(hit.w);store.set(key,[...found])}
    draw();
  }
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  function draw(){
    const fc=new Set(g.placed.filter(p=>found.has(p.w)).flatMap(p=>p.cells));
    grid.replaceChildren(...g.grid.map((ch,i)=>{const b=el('button',null,ch);b.type='button';if(fc.has(i))b.classList.add('found');if(i===start)b.classList.add('pick');b.onclick=()=>tap(i);return b}));
    ul.replaceChildren(...g.placed.map(p=>{const li=el('li',found.has(p.w)?'ok':null,p.w);return li}));
    const done=found.size===g.placed.length;status.className=done?'done':'';status.textContent=done?'Alle woorden gevonden, knap gedaan!':`${found.size} van ${g.placed.length} woorden gevonden`;
  }
  draw();
}
function pagePuzzels(){
  const main=$('#content');main.replaceChildren();
  const st=el('div','sec-title');st.append(el('h1',null,'Puzzels van '+datum(new Date(),true)));main.append(st);
  const tabs=el('div','tabs');tabs.setAttribute('role','tablist');
  const p1=el('section');p1.id='sudoku';const p2=el('section');p2.id='woordzoeker';
  const t1=el('button',null,'Sudoku'),t2=el('button',null,'Woordzoeker');[t1,t2].forEach(t=>{t.type='button';t.setAttribute('role','tab')});
  tabs.append(t1,t2);main.append(tabs,p1,p2);
  sudokuUI(p1);wsUI(p2);
  function show(id){p1.hidden=id!=='sudoku';p2.hidden=id!=='woordzoeker';t1.setAttribute('aria-selected',id==='sudoku');t2.setAttribute('aria-selected',id==='woordzoeker');try{history.replaceState(null,'','#'+id)}catch(e){}}
  t1.onclick=()=>show('sudoku');t2.onclick=()=>show('woordzoeker');
  show(location.hash==='#woordzoeker'?'woordzoeker':'sudoku');
}

/* ---------------- start ---------------- */
const page=document.body.dataset.page;
header(page);footer();
({home:pageHome,artikel:pageArtikel,regio:pageRegio,gemeente:pageGemeente,weer:pageWeer,puzzels:pagePuzzels}[page]||(()=>{}))();
})();
