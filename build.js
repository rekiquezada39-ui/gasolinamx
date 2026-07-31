const f=require('fs'),P=require('path'),O='dist';
// ══════════ CONFIGURA AQUI ══════════
const N='GasolinaMX',DOM='https://gasolinamx.pages.dev';
const MVERIFY='<meta name="monetag" content="PEGA_AQUI_TU_META">';
const MTAG=`<!-- PEGA AQUI TUS SCRIPTS DE MONETAG -->`;
// ════════════════════════════════════
const s=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
const e=x=>String(x||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mx=n=>'$'+Number(n).toFixed(2);
// estados chicos primero para que ganen sobre los grandes
const EDOS=[
["Ciudad de México",-99.365,-98.94,19.048,19.593],["Tlaxcala",-98.7,-97.6,19.1,19.75],
["Morelos",-99.5,-98.5,18.33,19.13],["Aguascalientes",-102.88,-101.84,21.62,22.45],
["Colima",-104.75,-103.44,18.65,19.52],["Querétaro",-100.6,-99.03,20.02,21.67],
["Nuevo León",-101.2,-98.4,23.15,27.8],["Guanajuato",-102.09,-99.67,19.92,21.85],
["Hidalgo",-99.9,-97.98,19.6,21.4],["Estado de México",-100.6,-98.5,18.35,20.28],
["Nayarit",-105.77,-103.72,20.6,23.08],["Tabasco",-94.2,-90.9,17.25,18.7],
["Yucatán",-90.5,-87.4,19.5,21.65],["Quintana Roo",-89.3,-86.7,17.8,21.6],
["Campeche",-92.5,-89.1,17.8,20.9],["Jalisco",-105.8,-101.4,18.9,22.8],
["Michoacán",-103.8,-100.0,17.9,20.4],["Puebla",-99.1,-96.7,17.9,20.85],
["Veracruz",-98.7,-93.6,17.1,22.5],["Guerrero",-102.2,-97.9,16.3,18.9],
["Oaxaca",-98.6,-93.8,15.6,18.7],["Chiapas",-94.2,-90.3,14.5,17.99],
["San Luis Potosí",-102.3,-98.3,21.1,24.5],["Zacatecas",-104.4,-100.7,21.0,25.2],
["Tamaulipas",-100.2,-97.1,22.2,27.7],["Coahuila",-103.97,-99.85,24.55,29.9],
["Durango",-107.3,-102.4,22.3,26.9],["Sinaloa",-109.5,-105.3,22.4,27.05],
["Chihuahua",-109.1,-103.2,25.5,31.8],["Sonora",-115.1,-108.4,26.2,32.5],
["Baja California",-118.4,-112.6,28.0,32.72],["Baja California Sur",-115.9,-109.4,22.8,28.05]];
const edoDe=(x,y)=>{for(const[n,x1,x2,y1,y2]of EDOS)if(x>=x1&&x<=x2&&y>=y1&&y<=y2)return n;return null};
const HOY=new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Mexico_City'});
const ISO=new Date().toISOString().slice(0,10);

const CSS=`
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Helvetica,Arial,sans-serif;background:#fff;color:#1d1d1f;line-height:1.47;-webkit-font-smoothing:antialiased;letter-spacing:-.01em}
a{color:inherit;text-decoration:none}
::selection{background:#0071e3;color:#fff}
body.lock{overflow:hidden}
header{background:rgba(255,255,255,.86);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(0,0,0,.08);position:sticky;top:0;z-index:9000}
.hin{max-width:1180px;margin:0 auto;padding:0 26px;height:70px;display:flex;align-items:center;gap:28px}
.burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:42px;height:42px;background:none;border:0;cursor:pointer;margin-left:-9px;flex-shrink:0}
.burger span{display:block;width:21px;height:1.8px;background:#1d1d1f;border-radius:2px;transition:transform .32s cubic-bezier(.4,0,.2,1),opacity .2s;margin:0 auto}
.burger.open span:nth-child(1){transform:translateY(6.8px) rotate(45deg)}
.burger.open span:nth-child(2){opacity:0}
.burger.open span:nth-child(3){transform:translateY(-6.8px) rotate(-45deg)}
.lg{display:flex;align-items:center;gap:11px;flex-shrink:0}
.lgt{font-size:1.42rem;font-weight:600;letter-spacing:-.03em}
.hnav{display:flex;gap:30px;font-size:.86rem;margin-left:10px}
.hnav a{opacity:.8;transition:opacity .2s}.hnav a:hover{opacity:1}
.upd{margin-left:auto;font-size:.76rem;color:#86868b;white-space:nowrap}
.scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:9400;opacity:0;transition:opacity .3s;backdrop-filter:blur(2px)}
.scrim.on{display:block;opacity:1}
.drawer{position:fixed;top:0;left:0;bottom:0;width:min(85vw,320px);background:#fff;z-index:9500;transform:translateX(-100%);transition:transform .36s cubic-bezier(.32,.72,0,1);overflow-y:auto;box-shadow:2px 0 26px rgba(0,0,0,.13)}
.drawer.on{transform:translateX(0)}
.dhead{display:flex;align-items:center;gap:11px;padding:22px 24px 20px;border-bottom:1px solid #e8e8ed;position:sticky;top:0;background:#fff}
.dbody{padding:14px 14px 44px}
.dttl{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#86868b;padding:18px 12px 8px}
.drawer a{display:flex;align-items:center;justify-content:space-between;padding:12px;font-size:.97rem;border-radius:11px;transition:background .16s}
.drawer a:active{background:#f0f0f3}
.drawer a .n{font-size:.8rem;color:#86868b;font-variant-numeric:tabular-nums}
.dsep{height:1px;background:#e8e8ed;margin:10px 12px}
.shell{max-width:1180px;margin:0 auto;padding:0 26px;display:grid;grid-template-columns:196px 1fr;gap:52px;align-items:start}
.side{position:sticky;top:94px;max-height:calc(100vh - 118px);overflow-y:auto;padding:40px 0}
.side::-webkit-scrollbar{width:0}
.sttl{font-size:.69rem;font-weight:600;text-transform:uppercase;letter-spacing:.075em;color:#86868b;margin:26px 0 10px}
.sttl:first-child{margin-top:0}
.side a{display:block;padding:6px 0;font-size:.86rem;opacity:.8;transition:.16s}
.side a:hover{opacity:1;color:#0071e3}
main{min-width:0;padding:40px 0 90px}
h1{font-size:2.8rem;font-weight:600;letter-spacing:-.032em;line-height:1.07;margin-bottom:12px}
.sub{color:#86868b;font-size:1.08rem;margin-bottom:44px;max-width:640px}
h2{font-size:1.5rem;font-weight:600;letter-spacing:-.024em;margin:64px 0 22px;display:flex;align-items:baseline;gap:14px}
h2 .ver{margin-left:auto;font-size:.86rem;font-weight:400;color:#0071e3;white-space:nowrap}
h2 .ver:hover{text-decoration:underline}
/* HERO PRECIOS */
.hero{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1px;background:#d2d2d7;border:1px solid #d2d2d7;border-radius:18px;overflow:hidden;margin-bottom:16px}
.hbox{background:#fff;padding:26px 24px}
.hbox .lbl{font-size:.78rem;color:#86868b;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:9px}
.hbox .val{font-size:2.5rem;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1}
.hbox .cap{font-size:.8rem;color:#86868b;margin-top:7px}
.hbox.reg .val{color:#16a34a}.hbox.pre .val{color:#dc2626}.hbox.die .val{color:#1d1d1f}
.nota{font-size:.82rem;color:#86868b;margin-bottom:44px}
/* BUSCADOR */
.finder{background:#f5f5f7;border-radius:18px;padding:26px;margin-bottom:20px}
.finder h3{font-size:1.12rem;font-weight:600;margin-bottom:14px}
#buscador{width:100%;padding:14px 18px;border-radius:12px;border:1px solid #d2d2d7;font-size:16px;font-family:inherit;background:#fff}
#buscador:focus{outline:none;border-color:#0071e3;box-shadow:0 0 0 3px rgba(0,113,227,.14)}
#resultados{margin-top:14px}
/* TABLA */
.tabla{width:100%;border-collapse:collapse;font-size:.93rem;margin-bottom:14px}
.tabla thead th{text-align:left;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:#86868b;font-weight:600;padding:0 14px 11px 0;border-bottom:1px solid #d2d2d7}
.tabla td{padding:15px 14px 15px 0;border-bottom:1px solid #ececee;vertical-align:top}
.tabla tr:hover td{background:#fafafa}
.tabla .nm{font-weight:500;max-width:340px}
.tabla .nm small{display:block;color:#86868b;font-weight:400;font-size:.79rem;margin-top:2px}
.tabla .pr{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}
.tabla .pr.g{color:#16a34a}
.rank{color:#86868b;font-variant-numeric:tabular-nums;width:34px}
.badge{display:inline-block;background:#dcfce7;color:#15803d;font-size:.7rem;font-weight:700;padding:3px 9px;border-radius:980px;margin-left:7px;vertical-align:middle}
/* GRID ESTADOS */
.chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:#d2d2d7;border:1px solid #d2d2d7;border-radius:14px;overflow:hidden;margin-bottom:30px}
.chips a{background:#fff;padding:19px 22px;font-size:.95rem;display:flex;align-items:center;justify-content:space-between;transition:background .16s}
.chips a:hover{background:#f5f5f7;color:#0071e3}
.chips .nm2{color:#86868b;font-size:.83rem;font-variant-numeric:tabular-nums}
/* FICHA */
.dt{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0;margin:30px 0;border-top:1px solid #d2d2d7}
.dt>div{padding:18px 18px 18px 0;border-bottom:1px solid #d2d2d7;font-size:1.02rem;font-weight:500;font-variant-numeric:tabular-nums}
.dt b{display:block;color:#86868b;font-size:.75rem;font-weight:400;margin-bottom:5px}
.card{border-top:1px solid #d2d2d7;padding:36px 0 4px;margin-top:18px}
.card h3{font-size:1.26rem;font-weight:600;margin-bottom:13px;letter-spacing:-.02em}
.card p{color:#1d1d1f;font-size:1rem;max-width:730px;line-height:1.62}
.btn{display:inline-block;background:#0071e3;color:#fff;padding:12px 25px;border-radius:980px;font-size:.91rem;margin:8px 9px 8px 0;transition:background .2s}
.btn:hover{background:#0077ed}
.btn.a{background:transparent;color:#0071e3;border:1px solid #0071e3}
.pg{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:60px 0 8px}
.pg a,.pg span{min-width:40px;text-align:center;padding:9px 13px;border-radius:9px;font-size:.87rem;transition:.16s;font-variant-numeric:tabular-nums}
.pg a:hover{background:#f5f5f7}
.pg .on{background:#1d1d1f;color:#fff;font-weight:500}
.crumb{font-size:.8rem;color:#86868b;margin-bottom:24px}
.crumb a:hover{color:#0071e3}
footer{background:#f5f5f7;border-top:1px solid #d2d2d7;margin-top:36px;padding:46px 26px;color:#86868b;font-size:.77rem;line-height:1.7}
footer .fin{max-width:1180px;margin:0 auto}
@media(max-width:1000px){.shell{grid-template-columns:1fr;gap:0}.side{display:none}.burger{display:flex}.hnav{display:none}}
@media(max-width:734px){
 .hin{height:60px;gap:12px;padding:0 16px}.lgt{font-size:1.2rem}.upd{font-size:.7rem}
 .shell{padding:0 16px}main{padding:26px 0 66px}
 h1{font-size:1.95rem}.sub{font-size:.98rem;margin-bottom:30px}
 h2{font-size:1.28rem;margin:46px 0 18px}
 .hbox{padding:20px 18px}.hbox .val{font-size:2rem}
 .tabla{font-size:.87rem}.tabla td{padding:13px 10px 13px 0}.tabla .nm{max-width:190px}
 .chips{grid-template-columns:1fr}
 .finder{padding:20px}
}`;
const LOGO='<svg viewBox="0 0 30 34" width="27" height="30" fill="none" stroke="#1d1d1f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 31V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v26"/><path d="M1.5 31h16"/><path d="M6 8h7v5H6z"/><path d="M16 12h4a2 2 0 0 1 2 2v10a2.5 2.5 0 0 0 5 0V13l-3.5-4"/></svg>';

let SIDE='',DRAWER='';
const HEAD=(t,d,c,r)=>`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${e(t)}</title><meta name="description" content="${e(d)}"><link rel="canonical" href="${c}">${MVERIFY}<meta property="og:title" content="${e(t)}"><meta name="theme-color" content="#ffffff"><link rel="icon" type="image/svg+xml" href="${r}favicon.svg"><link rel="stylesheet" href="${r}s.css"></head><body>
<header><div class="hin">
<button class="burger" id="burger" aria-label="Menú"><span></span><span></span><span></span></button>
<a href="${r}index.html" class="lg">${LOGO}<span class="lgt">${N}</span></a>
<nav class="hnav"><a href="${r}index.html">Inicio</a><a href="${r}estados.html">Estados</a><a href="${r}baratas.html">Más baratas</a></nav>
<span class="upd">Actualizado ${HOY}</span>
</div></header>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer"><div class="dhead">${LOGO}<span class="lgt">${N}</span></div><div class="dbody">${DRAWER.replace(/href="/g,'href="'+r)}</div></aside>`;
const FOOT=(r)=>`<footer><div class="fin"><p>${N}. Precios de gasolina en México actualizados diariamente.</p><p style="margin-top:9px">Datos oficiales de la Comisión Reguladora de Energía (CRE). Los precios pueden variar; verifica en la estación antes de cargar. Última actualización: ${HOY}.</p></div></footer>
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer'),s=document.getElementById('scrim');
function t(o){b.classList.toggle('open',o);d.classList.toggle('on',o);s.classList.toggle('on',o);document.body.classList.toggle('lock',o)}
if(b){b.addEventListener('click',function(){t(!d.classList.contains('on'))});s.addEventListener('click',function(){t(false)});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')t(false)});d.addEventListener('click',function(ev){if(ev.target.closest('a'))t(false)})}})();<\/script>${MTAG}</body></html>`;
const L=(t,d,c,b,r='')=>HEAD(t,d,c,r)+`<div class="shell"><aside class="side">${SIDE.replace(/href="/g,'href="'+r)}</aside><main>${b}</main></div>`+FOOT(r);
const PG=(cur,tot,fn)=>{if(tot<2)return'';let h='<div class="pg">';if(cur>1)h+=`<a href="${fn(cur-1)}">←</a>`;const a=Math.max(1,cur-2),z=Math.min(tot,cur+2);if(a>1)h+=`<a href="${fn(1)}">1</a>`+(a>2?'<span>…</span>':'');for(let i=a;i<=z;i++)h+=i===cur?`<span class="on">${i}</span>`:`<a href="${fn(i)}">${i}</a>`;if(z<tot)h+=(z<tot-1?'<span>…</span>':'')+`<a href="${fn(tot)}">${tot}</a>`;if(cur<tot)h+=`<a href="${fn(cur+1)}">→</a>`;return h+'</div>'};
const fila=(g,i,r='')=>`<tr><td class="rank">${i+1}</td><td class="nm"><a href="${r}estacion/${g._s}.html">${e(g.name)}</a><small>${e(g._edo||'México')}</small></td><td class="pr g">${g.regular?mx(g.regular):'—'}</td><td class="pr">${g.premium?mx(g.premium):'—'}</td><td class="pr">${g.diesel?mx(g.diesel):'—'}</td></tr>`;
const tabla=(arr,r='')=>`<table class="tabla"><thead><tr><th></th><th>Estación</th><th>Magna</th><th>Premium</th><th>Diésel</th></tr></thead><tbody>${arr.map((g,i)=>fila(g,i,r)).join('')}</tbody></table>`;

(async()=>{
console.log(`\n⛽ Generando ${N}...\n📥 Bajando datos oficiales de la CRE:`);
const UA={'User-Agent':N+'/1.0'};
let xPre='',xPla='';
for(let i=0;i<4;i++){try{
 const [a,b]=await Promise.all([
  fetch('https://publicacionexterna.azurewebsites.net/publicaciones/prices',{headers:UA}).then(r=>r.text()),
  fetch('https://publicacionexterna.azurewebsites.net/publicaciones/places',{headers:UA}).then(r=>r.text())]);
 if(a.length>1000&&b.length>1000){xPre=a;xPla=b;break}
}catch(x){console.log('   reintento '+(i+1)+'...');await new Promise(z=>setTimeout(z,3000))}}
if(!xPre||!xPla){console.log('❌ La CRE no respondió. Reintenta en unos minutos.');process.exit(1)}
console.log(`   ✓ precios ${(xPre.length/1048576).toFixed(1)}MB · catálogo ${(xPla.length/1048576).toFixed(1)}MB`);

// parsear catálogo
const cat={};
for(const m of xPla.matchAll(/<place place_id="(\d+)">([\s\S]*?)<\/place>/g)){
 const id=m[1],b=m[2];
 const nm=(b.match(/<name>([\s\S]*?)<\/name>/)||[])[1];
 const x=parseFloat((b.match(/<x>([-\d.]+)<\/x>/)||[])[1]);
 const y=parseFloat((b.match(/<y>([-\d.]+)<\/y>/)||[])[1]);
 if(nm)cat[id]={name:nm.trim(),x,y};
}
// parsear precios y unir
const seen=new Map();
for(const m of xPre.matchAll(/<place place_id="(\d+)">([\s\S]*?)<\/place>/g)){
 const id=m[1],b=m[2],c=cat[id];
 if(!c)continue;
 const g=t=>{const r=b.match(new RegExp(`<gas_price type="${t}">([\\d.]+)</gas_price>`));return r?parseFloat(r[1]):null};
 const reg=g('regular'),pre=g('premium'),die=g('diesel');
 // filtrar precios absurdos (errores de captura de la CRE)
 const ok=v=>v!==null&&v>=10&&v<=40;
 if(!ok(reg)&&!ok(pre)&&!ok(die))continue;
 const edo=(isFinite(c.x)&&isFinite(c.y))?edoDe(c.x,c.y):null;
 const rec={id,name:c.name,x:c.x,y:c.y,_edo:edo,
  regular:ok(reg)?reg:null,premium:ok(pre)?pre:null,diesel:ok(die)?die:null,
  _s:(s(c.name)||'estacion')+'-'+id};
 const prev=seen.get(id);
 const score=r=>(r.regular?1:0)+(r.premium?1:0)+(r.diesel?1:0);
 if(!prev||score(rec)>score(prev))seen.set(id,rec);
}
const D=[...seen.values()];
console.log(`   ✓ ${D.length.toLocaleString('es-MX')} estaciones con precio válido`);

// agrupar por estado
const M={};D.forEach(g=>{if(g._edo)(M[g._edo]=M[g._edo]||[]).push(g)});
const edos=Object.entries(M).sort((a,b)=>a[0].localeCompare(b[0],'es'));
const conReg=D.filter(g=>g.regular);
const prom=t=>{const a=D.filter(g=>g[t]);return a.length?a.reduce((s,g)=>s+g[t],0)/a.length:0};
const pReg=prom('regular'),pPre=prom('premium'),pDie=prom('diesel');
const baratas=[...conReg].sort((a,b)=>a.regular-b.regular);

SIDE=`<div class="sttl">Consultar</div><a href="index.html">Inicio</a><a href="baratas.html">Más baratas</a><a href="estados.html">Todos los estados</a><div class="sttl">Estados</div>`+edos.map(([n,l])=>`<a href="estado-${s(n)}.html">${e(n)}</a>`).join('');
DRAWER=`<a href="index.html">Inicio</a><a href="baratas.html">Más baratas de México</a><a href="estados.html">Todos los estados</a><div class="dsep"></div><div class="dttl">Estados</div>`+edos.map(([n,l])=>`<a href="estado-${s(n)}.html">${e(n)}<span class="n">${l.length}</span></a>`).join('');

f.rmSync(O,{recursive:true,force:true});f.mkdirSync(P.join(O,'estacion'),{recursive:true});
console.log('📄 Generando HTML:');

// ── PORTADA
const hero=`<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pReg)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${mx(pPre)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${mx(pDie)}</div><div class="cap">promedio nacional</div></div>
</div><p class="nota">Basado en ${D.length.toLocaleString('es-MX')} estaciones · datos de la CRE · ${HOY}</p>`;
const idx=JSON.stringify(D.filter(g=>g.regular).slice(0,4000).map(g=>[g.name,g._s,g.regular,g._edo||'']));
f.writeFileSync(P.join(O,'index.html'),L(
 `Precio de la gasolina hoy en México | ${N}`,
 `Precio de gasolina Magna, Premium y Diésel hoy ${HOY}. Consulta las gasolineras más baratas de México con datos oficiales de la CRE.`,DOM+'/',
`<h1>Precio de la gasolina hoy</h1><p class="sub">Consulta el precio de Magna, Premium y Diésel en ${D.length.toLocaleString('es-MX')} gasolineras de México. Datos oficiales, actualizados a diario.</p>
${hero}
<div class="finder"><h3>Busca tu gasolinera</h3><input id="buscador" placeholder="Escribe el nombre o el estado…" autocomplete="off"><div id="resultados"></div></div>
<h2>Las 25 más baratas del país<a class="ver" href="baratas.html">Ver 200 →</a></h2>
${tabla(baratas.slice(0,25))}
<h2>Consulta por estado<a class="ver" href="estados.html">Ver todos →</a></h2>
<div class="chips">${edos.slice(0,12).map(([n,l])=>`<a href="estado-${s(n)}.html">${e(n)}<span class="nm2">${l.length}</span></a>`).join('')}</div>
<div class="card"><h3>¿Cómo funciona?</h3><p>Los precios provienen del reporte público de la Comisión Reguladora de Energía (CRE), que obliga a las estaciones a informar sus precios vigentes. La información se descarga y publica automáticamente cada día, por lo que siempre verás las cifras más recientes disponibles. Ten en cuenta que una estación puede modificar su precio durante el día sin reportarlo de inmediato.</p></div>
<script>var DB=${idx};
document.getElementById('buscador').addEventListener('input',function(ev){
 var q=ev.target.value.toLowerCase().trim(),o=document.getElementById('resultados');
 if(q.length<3){o.innerHTML='';return}
 var h=[];for(var i=0;i<DB.length&&h.length<15;i++){if(DB[i][0].toLowerCase().indexOf(q)>-1||DB[i][3].toLowerCase().indexOf(q)>-1)h.push(DB[i])}
 o.innerHTML=h.length?'<table class="tabla"><tbody>'+h.map(function(a){return '<tr><td class="nm"><a href="estacion/'+a[1]+'.html">'+a[0]+'</a><small>'+a[3]+'</small></td><td class="pr g">$'+a[2].toFixed(2)+'</td></tr>'}).join('')+'</tbody></table>':'<p style="color:#86868b;font-size:.9rem;margin-top:12px">Sin resultados para "'+q+'"</p>';
});<\/script>`));

// ── MÁS BARATAS
f.writeFileSync(P.join(O,'baratas.html'),L(
 `Gasolina más barata de México hoy | ${N}`,
 `Las 200 gasolineras más baratas de México hoy ${HOY}. Precio de Magna desde ${mx(baratas[0].regular)}.`,DOM+'/baratas.html',
`<p class="crumb"><a href="index.html">Inicio</a> › Más baratas</p>
<h1>Gasolina más barata de México</h1><p class="sub">Las 200 estaciones con el precio de Magna más bajo del país, según el último reporte de la CRE.</p>
${tabla(baratas.slice(0,200))}`));

// ── ESTADOS (índice)
f.writeFileSync(P.join(O,'estados.html'),L(
 `Precio de la gasolina por estado | ${N}`,
 `Precio promedio de gasolina en los ${edos.length} estados de México. Consulta Magna, Premium y Diésel por entidad.`,DOM+'/estados.html',
`<p class="crumb"><a href="index.html">Inicio</a> › Estados</p>
<h1>Precio por estado</h1><p class="sub">${edos.length} entidades · ${D.length.toLocaleString('es-MX')} estaciones registradas</p>
<div class="chips">${edos.map(([n,l])=>`<a href="estado-${s(n)}.html">${e(n)}<span class="nm2">${l.length}</span></a>`).join('')}</div>`));

// ── PÁGINA POR ESTADO
let npe=0;
edos.forEach(([n,lista])=>{
 const conR=lista.filter(g=>g.regular).sort((a,b)=>a.regular-b.regular);
 const pr=conR.length?conR.reduce((s,g)=>s+g.regular,0)/conR.length:0;
 const pp=(a=>a.length?a.reduce((s,g)=>s+g.premium,0)/a.length:0)(lista.filter(g=>g.premium));
 const pd=(a=>a.length?a.reduce((s,g)=>s+g.diesel,0)/a.length:0)(lista.filter(g=>g.diesel));
 const dif=conR.length>1?conR[conR.length-1].regular-conR[0].regular:0;
 f.writeFileSync(P.join(O,`estado-${s(n)}.html`),L(
  `Precio de la gasolina en ${n} hoy | ${N}`,
  `Precio de gasolina en ${n} hoy ${HOY}: Magna ${mx(pr)} promedio. ${lista.length} estaciones. Encuentra la más barata.`,
  `${DOM}/estado-${s(n)}.html`,
`<p class="crumb"><a href="index.html">Inicio</a> › <a href="estados.html">Estados</a> › ${e(n)}</p>
<h1>Gasolina en ${e(n)}</h1><p class="sub">${lista.length} estaciones registradas · precios del ${HOY}</p>
<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pr)}</div><div class="cap">promedio en ${e(n)}</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${pp?mx(pp):'—'}</div><div class="cap">promedio en ${e(n)}</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${pd?mx(pd):'—'}</div><div class="cap">promedio en ${e(n)}</div></div>
</div>
${dif>0?`<p class="nota">Diferencia entre la más cara y la más barata: <strong>${mx(dif)}</strong> por litro. En un tanque de 50 litros son <strong>${mx(dif*50)}</strong> de ahorro.</p>`:'<p class="nota"></p>'}
<h2>Las más baratas de ${e(n)}</h2>
${tabla(conR.slice(0,60))}
<div class="card"><h3>Sobre los precios en ${e(n)}</h3><p>En ${e(n)} hay ${lista.length} estaciones de servicio que reportan precios a la CRE. El promedio de Magna es de ${mx(pr)} por litro${dif>0?`, con una diferencia de ${mx(dif)} entre la estación más económica y la más cara`:''}. Los precios mostrados corresponden al último reporte disponible y pueden cambiar durante el día.</p></div>`));
 npe++;
});
console.log(`   ✓ ${npe} páginas de estado`);

// ── FICHAS DE ESTACIÓN
D.forEach(g=>{
 const mismos=g._edo?(M[g._edo]||[]).filter(x=>x.id!==g.id&&x.regular).sort((a,b)=>a.regular-b.regular).slice(0,8):[];
 const vsNal=g.regular?g.regular-pReg:null;
 const jl={'@context':'https://schema.org','@type':'GasStation',name:g.name,
  address:{'@type':'PostalAddress',addressRegion:g._edo||'México',addressCountry:'MX'},
  geo:isFinite(g.x)?{'@type':'GeoCoordinates',latitude:g.y,longitude:g.x}:undefined};
 f.writeFileSync(P.join(O,'estacion',g._s+'.html'),L(
  `${g.name} — Precio de gasolina hoy | ${N}`,
  `Precio de gasolina en ${g.name}${g._edo?', '+g._edo:''} hoy ${HOY}: Magna ${g.regular?mx(g.regular):'no disponible'}.`,
  `${DOM}/estacion/${g._s}.html`,
`<p class="crumb"><a href="../index.html">Inicio</a>${g._edo?` › <a href="../estado-${s(g._edo)}.html">${e(g._edo)}</a>`:''} › ${e(g.name)}</p>
<h1>${e(g.name)}</h1><p class="sub">${g._edo?e(g._edo)+' · ':''}Precios del ${HOY}</p>
<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${g.regular?mx(g.regular):'—'}</div><div class="cap">por litro</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${g.premium?mx(g.premium):'—'}</div><div class="cap">por litro</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${g.diesel?mx(g.diesel):'—'}</div><div class="cap">por litro</div></div>
</div>
<div class="dt">
 <div><b>Estado</b>${e(g._edo||'—')}</div>
 <div><b>ID CRE</b>${e(g.id)}</div>
 ${isFinite(g.x)?`<div><b>Coordenadas</b>${g.y.toFixed(4)}, ${g.x.toFixed(4)}</div>`:''}
 ${vsNal!==null?`<div><b>vs. nacional</b>${vsNal>0?'+':''}${mx(vsNal)}</div>`:''}
</div>
${isFinite(g.x)?`<a class="btn" href="https://www.google.com/maps/search/?api=1&query=${g.y},${g.x}" target="_blank" rel="noopener nofollow">Ver en Google Maps</a>`:''}
${g._edo?`<a class="btn a" href="../estado-${s(g._edo)}.html">Más baratas en ${e(g._edo)}</a>`:''}
<div class="card"><h3>Análisis de precio</h3><p>${e(g.name)}${g._edo?` se ubica en ${g._edo}`:''} y ${g.regular?`vende la gasolina Magna en ${mx(g.regular)} por litro. Esto es ${Math.abs(vsNal)<0.05?'prácticamente igual al':vsNal>0?`${mx(Math.abs(vsNal))} más caro que el`:`${mx(Math.abs(vsNal))} más barato que el`} promedio nacional de ${mx(pReg)}`:'no reportó precio de Magna en el último corte'}. ${g.premium?`El Premium está en ${mx(g.premium)}. `:''}${g.diesel?`El Diésel en ${mx(g.diesel)}. `:''}Los datos provienen del reporte oficial de la CRE del ${HOY}.</p></div>
${mismos.length?`<h2>Otras estaciones en ${e(g._edo)}</h2>${tabla(mismos,'../')}`:''}
<script type="application/ld+json">${JSON.stringify(jl)}<\/script>`,'../'));
});
console.log(`   ✓ ${D.length.toLocaleString('es-MX')} fichas de estación`);

// ── EXTRAS
f.writeFileSync(P.join(O,'s.css'),CSS);
f.writeFileSync(P.join(O,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34" fill="none" stroke="#1d1d1f" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 31V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v26"/><path d="M1.5 31h16"/><path d="M6 8h7v5H6z"/><path d="M16 12h4a2 2 0 0 1 2 2v10a2.5 2.5 0 0 0 5 0V13l-3.5-4"/></svg>');
const U=['','baratas.html','estados.html'].concat(edos.map(([n])=>`estado-${s(n)}.html`)).concat(D.map(g=>`estacion/${g._s}.html`));
f.writeFileSync(P.join(O,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+U.map(u=>`<url><loc>${DOM}/${u}</loc><lastmod>${ISO}</lastmod></url>`).join('\n')+'\n</urlset>');
f.writeFileSync(P.join(O,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${DOM}/sitemap.xml\n`);
console.log(`   ✓ sitemap.xml (${U.length.toLocaleString('es-MX')} URLs) + robots.txt`);
let by=0,ct=0;(function W(d){f.readdirSync(d,{withFileTypes:true}).forEach(x=>{const p=P.join(d,x.name);x.isDirectory()?W(p):(by+=f.statSync(p).size,ct++)})})(O);
console.log(`\n✅ LISTO — ${ct.toLocaleString('es-MX')} archivos, ${(by/1048576).toFixed(1)} MB\n`);
})();
