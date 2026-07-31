const f=require('fs'),P=require('path'),O='dist';
// ══════════ CONFIGURA AQUI ══════════
const N='GasolinaMX',DOM='https://gasolinamx.pages.dev';
const MAIL='contacto.gasolinamx@gmail.com';   // <- cambia por el correo de contacto que quieras publicar
const MVERIFY='<meta name="monetag" content="93992a7ab07c1e69404da37a95d434a1">';
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

// ══ MUNICIPIOS: geocodificación inversa con caché ══
const CACHE='.geocache.json';
let GC={};
try{GC=JSON.parse(f.readFileSync(CACHE,'utf8'))}catch(x){}
const rk=(x,y)=>x.toFixed(3)+','+y.toFixed(3);   // ~100m de precisión
async function geo1(x,y){
 const k=rk(x,y);
 if(GC[k]!==undefined)return GC[k];
 try{
  const d=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${y}&longitude=${x}&localityLanguage=es`).then(r=>r.json());
  const mun=d.city||d.locality||null;
  const edo=d.principalSubdivision||null;
  const v=(mun&&edo)?{m:mun,e:edo}:null;
  GC[k]=v;return v;
 }catch(e){return null}
}
async function geocodificar(lista){
 const pend=lista.filter(g=>isFinite(g.x)&&isFinite(g.y)&&GC[rk(g.x,g.y)]===undefined);
 if(!pend.length){console.log('   ✓ municipios desde caché');return}
 console.log(`   geocodificando ${pend.length.toLocaleString('es-MX')} ubicaciones nuevas...`);
 const LOTE=40;
 for(let i=0;i<pend.length;i+=LOTE){
  await Promise.all(pend.slice(i,i+LOTE).map(g=>geo1(g.x,g.y)));
  if(i%800===0)process.stdout.write(`   ${i}/${pend.length}\r`);
 }
 try{f.writeFileSync(CACHE,JSON.stringify(GC))}catch(e){}
 console.log(`   ✓ ${pend.length.toLocaleString('es-MX')} ubicaciones geocodificadas     `);
}
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
.legal{max-width:760px}
.legal h2{font-size:1.34rem;margin:40px 0 14px}
.legal h3{font-size:1.06rem;font-weight:600;margin:26px 0 9px}
.legal p,.legal li{font-size:1rem;line-height:1.68;color:#1d1d1f;margin-bottom:13px}
.legal ul{margin:0 0 16px 22px}
.legal .fecha{color:#86868b;font-size:.86rem;margin-bottom:34px}
.legal a{color:#0071e3}
.legal a:hover{text-decoration:underline}
.fnav{margin-top:14px;display:flex;gap:20px;flex-wrap:wrap;justify-content:center}
.fnav a{color:#1d1d1f;opacity:.75;transition:opacity .2s}
.fnav a:hover{opacity:1;color:#0071e3}
#ck{position:fixed;left:16px;right:16px;bottom:16px;max-width:520px;margin:0 auto;background:rgba(255,255,255,.97);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border:1px solid rgba(0,0,0,.1);border-radius:18px;padding:20px 22px;box-shadow:0 8px 40px rgba(0,0,0,.16);z-index:9800;display:none}
#ck.on{display:block;animation:ckup .34s cubic-bezier(.32,.72,0,1)}
@keyframes ckup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
#ck p{font-size:.87rem;line-height:1.55;color:#1d1d1f;margin-bottom:15px}
#ck a{color:#0071e3}
.ckb{display:flex;gap:9px;flex-wrap:wrap}
.ckb button{flex:1;min-width:120px;padding:10px 18px;border-radius:980px;font-size:.88rem;font-family:inherit;cursor:pointer;border:1px solid #0071e3;transition:.16s}
#ckSi{background:#0071e3;color:#fff}
#ckSi:hover{background:#0077ed}
#ckNo{background:transparent;color:#0071e3}
#ckNo:hover{background:rgba(0,113,227,.06)}
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
const FOOT=(r)=>`<footer><div class="fin"><p>${N}. Precios de gasolina en México actualizados diariamente.</p><p style="margin-top:9px">Datos oficiales de la Comisión Reguladora de Energía (CRE). Los precios pueden variar; verifica en la estación antes de cargar. Última actualización: ${HOY}.</p>
<nav class="fnav"><a href="${r}aviso-de-privacidad.html">Aviso de privacidad</a><a href="${r}terminos.html">Términos de uso</a><a href="${r}cookies.html">Cookies</a><a href="${r}contacto.html">Contacto</a></nav></div></footer>
<div id="ck" role="dialog" aria-label="Aviso de cookies"><p>Usamos cookies propias y de terceros para mostrar publicidad y analizar el tráfico. Consulta el <a href="${r}aviso-de-privacidad.html">aviso de privacidad</a> y la <a href="${r}cookies.html">política de cookies</a>.</p><div class="ckb"><button id="ckNo" type="button">Solo necesarias</button><button id="ckSi" type="button">Aceptar</button></div></div>
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer'),s=document.getElementById('scrim');
function t(o){b.classList.toggle('open',o);d.classList.toggle('on',o);s.classList.toggle('on',o);document.body.classList.toggle('lock',o)}
if(b){b.addEventListener('click',function(){t(!d.classList.contains('on'))});s.addEventListener('click',function(){t(false)});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')t(false)});d.addEventListener('click',function(ev){if(ev.target.closest('a'))t(false)})}
// ── Consentimiento de cookies: los anuncios solo cargan si el usuario acepta
var KEY='ck_gmx',box=document.getElementById('ck');
function ads(){var f=document.getElementById('ads-tpl');if(!f)return;
 var h=f.innerHTML,w=document.createElement('div');w.innerHTML=h;
 [].forEach.call(w.querySelectorAll('script'),function(o){var n=document.createElement('script');
  [].forEach.call(o.attributes,function(a){n.setAttribute(a.name,a.value)});
  if(o.textContent)n.textContent=o.textContent;document.body.appendChild(n)});}
try{var v=localStorage.getItem(KEY);
 if(v==='1'){ads()}else if(v!=='0'&&box){box.classList.add('on')}
 if(box){document.getElementById('ckSi').addEventListener('click',function(){try{localStorage.setItem(KEY,'1')}catch(e){}box.classList.remove('on');ads()});
 document.getElementById('ckNo').addEventListener('click',function(){try{localStorage.setItem(KEY,'0')}catch(e){}box.classList.remove('on')})}
}catch(e){}
})();<\/script>
<template id="ads-tpl">${MTAG}</template>
</body></html>`;
const L=(t,d,c,b,r='')=>HEAD(t,d,c,r)+`<div class="shell"><aside class="side">${SIDE.replace(/href="/g,'href="'+r)}</aside><main>${b}</main></div>`+FOOT(r);
const PG=(cur,tot,fn)=>{if(tot<2)return'';let h='<div class="pg">';if(cur>1)h+=`<a href="${fn(cur-1)}">←</a>`;const a=Math.max(1,cur-2),z=Math.min(tot,cur+2);if(a>1)h+=`<a href="${fn(1)}">1</a>`+(a>2?'<span>…</span>':'');for(let i=a;i<=z;i++)h+=i===cur?`<span class="on">${i}</span>`:`<a href="${fn(i)}">${i}</a>`;if(z<tot)h+=(z<tot-1?'<span>…</span>':'')+`<a href="${fn(tot)}">${tot}</a>`;if(cur<tot)h+=`<a href="${fn(cur+1)}">→</a>`;return h+'</div>'};
const fila=(g,i,r='')=>`<tr><td class="rank">${i+1}</td><td class="nm"><a href="${r}estacion/${g._s}.html">${e(g.name)}</a><small>${e(g._mun?g._mun+', '+(g._edo||''):(g._edo||'México'))}</small></td><td class="pr g">${g.regular?mx(g.regular):'—'}</td><td class="pr">${g.premium?mx(g.premium):'—'}</td><td class="pr">${g.diesel?mx(g.diesel):'—'}</td></tr>`;
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
await geocodificar(D);
D.forEach(g=>{const v=(isFinite(g.x)&&isFinite(g.y))?GC[rk(g.x,g.y)]:null;
 if(v){g._mun=v.m;g._edo=v.e==='Estado de México'?'Estado de México':(v.e||g._edo)}else g._mun=null});

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

// ── PÁGINAS POR MUNICIPIO
const MUN={};
D.forEach(g=>{if(g._mun&&g._edo){const k=g._edo+'|'+g._mun;(MUN[k]=MUN[k]||[]).push(g)}});
const muns=Object.entries(MUN).filter(([k,l])=>l.length>=2).sort((a,b)=>b[1].length-a[1].length);
const slugMun=(edo,mun)=>`municipio-${s(mun)}-${s(edo)}.html`;
muns.forEach(([k,lista])=>{
 const [edo,mun]=k.split('|');
 const conR=lista.filter(g=>g.regular).sort((a,b)=>a.regular-b.regular);
 if(!conR.length)return;
 const pr=conR.reduce((a,g)=>a+g.regular,0)/conR.length;
 const pp=(a=>a.length?a.reduce((x,g)=>x+g.premium,0)/a.length:0)(lista.filter(g=>g.premium));
 const pd=(a=>a.length?a.reduce((x,g)=>x+g.diesel,0)/a.length:0)(lista.filter(g=>g.diesel));
 const dif=conR.length>1?conR[conR.length-1].regular-conR[0].regular:0;
 f.writeFileSync(P.join(O,slugMun(edo,mun)),L(
  `Gasolina más barata en ${mun}, ${edo} hoy | ${N}`,
  `Precio de gasolina en ${mun}, ${edo} hoy ${HOY}: Magna desde ${mx(conR[0].regular)}. ${lista.length} estaciones comparadas.`,
  `${DOM}/${slugMun(edo,mun)}`,
`<p class="crumb"><a href="index.html">Inicio</a> › <a href="estados.html">Estados</a> › <a href="estado-${s(edo)}.html">${e(edo)}</a> › ${e(mun)}</p>
<h1>Gasolina en ${e(mun)}</h1><p class="sub">${e(edo)} · ${lista.length} estaciones · precios del ${HOY}</p>
<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pr)}</div><div class="cap">promedio local</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${pp?mx(pp):'—'}</div><div class="cap">promedio local</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${pd?mx(pd):'—'}</div><div class="cap">promedio local</div></div>
</div>
${dif>0?`<p class="nota">La más barata está en <strong>${mx(conR[0].regular)}</strong> y la más cara en <strong>${mx(conR[conR.length-1].regular)}</strong>. Diferencia de <strong>${mx(dif)}</strong> por litro: <strong>${mx(dif*50)}</strong> en un tanque de 50 L.</p>`:'<p class="nota"></p>'}
<h2>Ordenadas de más barata a más cara</h2>
${tabla(conR)}
<div class="card"><h3>Precios en ${e(mun)}</h3><p>En ${e(mun)}, ${edo}, hay ${lista.length} estaciones que reportan precios a la CRE. El promedio de Magna es ${mx(pr)} por litro${dif>0?`, con ${mx(dif)} de diferencia entre la más económica y la más cara`:''}. Los datos corresponden al reporte del ${HOY} y pueden cambiar durante el día.</p></div>
<p style="margin-top:26px"><a class="btn a" href="estado-${s(edo)}.html">Ver todo ${e(edo)}</a></p>`));
});
console.log(`   ✓ ${muns.length} páginas de municipio`);

// ── PORTADA
const hero=`<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pReg)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${mx(pPre)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${mx(pDie)}</div><div class="cap">promedio nacional</div></div>
</div><p class="nota">Basado en ${D.length.toLocaleString('es-MX')} estaciones · datos de la CRE · ${HOY}</p>`;
const idxMun=JSON.stringify(muns.map(([k,l])=>{const [ed,mu]=k.split('|');
 const cr=l.filter(g=>g.regular);const mn=cr.length?Math.min(...cr.map(g=>g.regular)):0;
 return [mu,ed,slugMun(ed,mu),l.length,mn]}));
const idx=JSON.stringify(D.filter(g=>g.regular).slice(0,5000).map(g=>[g.name,g._s,g.regular,(g._mun?g._mun+', ':'')+(g._edo||'')]));
f.writeFileSync(P.join(O,'index.html'),L(
 `Precio de la gasolina hoy en México | ${N}`,
 `Precio de gasolina Magna, Premium y Diésel hoy ${HOY}. Consulta las gasolineras más baratas de México con datos oficiales de la CRE.`,DOM+'/',
`<h1>Precio de la gasolina hoy</h1><p class="sub">Consulta el precio de Magna, Premium y Diésel en ${D.length.toLocaleString('es-MX')} gasolineras de México. Datos oficiales, actualizados a diario.</p>
${hero}
<div class="finder"><h3>¿Dónde vives?</h3><p style="font-size:.88rem;color:#86868b;margin-bottom:12px">Escribe tu municipio o ciudad — por ejemplo: Tlajomulco, Zapopan, Mérida</p><input id="buscador" placeholder="Tu municipio o el nombre de la estación" autocomplete="off" enterkeyhint="search"><div id="resultados"></div></div>
<h2>Las 25 más baratas del país<a class="ver" href="baratas.html">Ver 200 →</a></h2>
${tabla(baratas.slice(0,25))}
<h2>Consulta por estado<a class="ver" href="estados.html">Ver todos →</a></h2>
<div class="chips">${edos.slice(0,12).map(([n,l])=>`<a href="estado-${s(n)}.html">${e(n)}<span class="nm2">${l.length}</span></a>`).join('')}</div>
<div class="card"><h3>¿Cómo funciona?</h3><p>Los precios provienen del reporte público de la Comisión Reguladora de Energía (CRE), que obliga a las estaciones a informar sus precios vigentes. La información se descarga y publica automáticamente cada día, por lo que siempre verás las cifras más recientes disponibles. Ten en cuenta que una estación puede modificar su precio durante el día sin reportarlo de inmediato.</p></div>
<script>var DB=${idx},MU=${idxMun};
function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
document.getElementById('buscador').addEventListener('input',function(ev){
 var q=nrm(ev.target.value.trim()),o=document.getElementById('resultados');
 if(q.length<3){o.innerHTML='';return}
 var mh=[];for(var i=0;i<MU.length&&mh.length<6;i++){if(nrm(MU[i][0]).indexOf(q)>-1)mh.push(MU[i])}
 var eh=[];for(var j=0;j<DB.length&&eh.length<12;j++){if(nrm(DB[j][0]).indexOf(q)>-1||nrm(DB[j][3]).indexOf(q)>-1)eh.push(DB[j])}
 var html='';
 if(mh.length)html+='<p style="font-size:.76rem;text-transform:uppercase;letter-spacing:.05em;color:#86868b;font-weight:600;margin:14px 0 8px">Municipios</p><table class="tabla"><tbody>'+mh.map(function(a){return '<tr><td class="nm"><a href="'+a[2]+'"><strong>'+a[0]+'</strong></a><small>'+a[1]+' · '+a[3]+' estaciones</small></td><td class="pr g">desde $'+a[4].toFixed(2)+'</td></tr>'}).join('')+'</tbody></table>';
 if(eh.length)html+='<p style="font-size:.76rem;text-transform:uppercase;letter-spacing:.05em;color:#86868b;font-weight:600;margin:18px 0 8px">Estaciones</p><table class="tabla"><tbody>'+eh.map(function(a){return '<tr><td class="nm"><a href="estacion/'+a[1]+'.html">'+a[0]+'</a><small>'+a[3]+'</small></td><td class="pr g">$'+a[2].toFixed(2)+'</td></tr>'}).join('')+'</tbody></table>';
 o.innerHTML=html||'<p style="color:#86868b;font-size:.9rem;margin-top:12px">Sin resultados para "'+ev.target.value+'"</p>';
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
${(()=>{const mm={};lista.forEach(g=>{if(g._mun)(mm[g._mun]=mm[g._mun]||[]).push(g)});
const arr=Object.entries(mm).filter(([m,l])=>l.length>=2).sort((a,b)=>b[1].length-a[1].length);
return arr.length?`<h2>Busca por municipio</h2><div class="chips">${arr.map(([m,l])=>`<a href="municipio-${s(m)}-${s(n)}.html">${e(m)}<span class="nm2">${l.length}</span></a>`).join('')}</div>`:''})()}
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
`<p class="crumb"><a href="../index.html">Inicio</a>${g._edo?` › <a href="../estado-${s(g._edo)}.html">${e(g._edo)}</a>`:''}${(g._mun&&g._edo&&MUN[g._edo+'|'+g._mun]&&MUN[g._edo+'|'+g._mun].length>=2)?` › <a href="../municipio-${s(g._mun)}-${s(g._edo)}.html">${e(g._mun)}</a>`:''} › ${e(g.name)}</p>
<h1>${e(g.name)}</h1><p class="sub">${g._mun?e(g._mun)+', ':''}${g._edo?e(g._edo)+' · ':''}Precios del ${HOY}</p>
<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${g.regular?mx(g.regular):'—'}</div><div class="cap">por litro</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${g.premium?mx(g.premium):'—'}</div><div class="cap">por litro</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${g.diesel?mx(g.diesel):'—'}</div><div class="cap">por litro</div></div>
</div>
<div class="dt">
 <div><b>Municipio</b>${e(g._mun||'—')}</div>
 <div><b>Estado</b>${e(g._edo||'—')}</div>
 <div><b>ID CRE</b>${e(g.id)}</div>
 ${isFinite(g.x)?`<div><b>Coordenadas</b>${g.y.toFixed(4)}, ${g.x.toFixed(4)}</div>`:''}
 ${vsNal!==null?`<div><b>vs. nacional</b>${vsNal>0?'+':''}${mx(vsNal)}</div>`:''}
</div>
${isFinite(g.x)?`<a class="btn" href="https://www.google.com/maps/search/?api=1&query=${g.y},${g.x}" target="_blank" rel="noopener nofollow">Ver en Google Maps</a>`:''}
${(g._mun&&g._edo&&MUN[g._edo+'|'+g._mun]&&MUN[g._edo+'|'+g._mun].length>=2)?`<a class="btn a" href="../municipio-${s(g._mun)}-${s(g._edo)}.html">Más baratas en ${e(g._mun)}</a>`:(g._edo?`<a class="btn a" href="../estado-${s(g._edo)}.html">Más baratas en ${e(g._edo)}</a>`:'')}
<div class="card"><h3>Análisis de precio</h3><p>${e(g.name)}${g._edo?` se ubica en ${g._edo}`:''} y ${g.regular?`vende la gasolina Magna en ${mx(g.regular)} por litro. Esto es ${Math.abs(vsNal)<0.05?'prácticamente igual al':vsNal>0?`${mx(Math.abs(vsNal))} más caro que el`:`${mx(Math.abs(vsNal))} más barato que el`} promedio nacional de ${mx(pReg)}`:'no reportó precio de Magna en el último corte'}. ${g.premium?`El Premium está en ${mx(g.premium)}. `:''}${g.diesel?`El Diésel en ${mx(g.diesel)}. `:''}Los datos provienen del reporte oficial de la CRE del ${HOY}.</p></div>
${mismos.length?`<h2>Otras estaciones en ${e(g._edo)}</h2>${tabla(mismos,'../')}`:''}
<script type="application/ld+json">${JSON.stringify(jl)}<\/script>`,'../'));
});
console.log(`   ✓ ${D.length.toLocaleString('es-MX')} fichas de estación`);


// ══════════ PAGINAS LEGALES ══════════
const LEG=(t,d,f,b)=>f&&f;
const pgLegal=(archivo,titulo,desc,cuerpo)=>{
 f.writeFileSync(P.join(O,archivo),L(`${titulo} | ${N}`,desc,`${DOM}/${archivo}`,
 `<p class="crumb"><a href="index.html">Inicio</a> › ${e(titulo)}</p><div class="legal"><h1>${e(titulo)}</h1><p class="fecha">Última actualización: ${HOY}</p>${cuerpo}</div>`));
};

pgLegal('aviso-de-privacidad.html','Aviso de privacidad',
 `Aviso de privacidad de ${N} conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.`,
`<p>En cumplimiento de la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> y su Reglamento, ${N} pone a disposición de los usuarios el presente aviso de privacidad.</p>

<h2>1. Responsable</h2>
<p>El responsable del tratamiento de los datos personales recabados a través de este sitio es el operador de <strong>${N}</strong>, sitio web disponible en ${DOM}. Para cualquier asunto relacionado con este aviso, el medio de contacto es el correo <a href="mailto:${MAIL}">${MAIL}</a>.</p>

<h2>2. Datos personales que se recaban</h2>
<p>Este sitio <strong>no solicita ni almacena datos personales de forma directa</strong>. No existen formularios de registro, suscripción ni compra. No pedimos nombre, teléfono, domicilio ni datos financieros.</p>
<p>De manera automática, y como ocurre en la mayoría de los sitios web, se pueden recabar los siguientes datos de navegación:</p>
<ul>
<li>Dirección IP (utilizada de forma agregada y para inferir la región aproximada)</li>
<li>Tipo de navegador, sistema operativo y dispositivo</li>
<li>Páginas visitadas, fecha y hora de acceso</li>
<li>Sitio de procedencia (referente)</li>
<li>Identificadores almacenados en cookies o tecnologías similares</li>
</ul>
<p>No se recaban <strong>datos personales sensibles</strong> en ningún caso.</p>

<h2>3. Finalidades del tratamiento</h2>
<h3>Finalidades necesarias</h3>
<ul>
<li>Permitir el funcionamiento técnico y la seguridad del sitio</li>
<li>Prevenir fraudes y usos abusivos</li>
</ul>
<h3>Finalidades que requieren su consentimiento</h3>
<ul>
<li>Mostrar publicidad, incluida publicidad personalizada según sus intereses</li>
<li>Medir el rendimiento y el alcance de los anuncios</li>
<li>Analizar de forma estadística el uso del sitio</li>
</ul>
<p>Usted puede negar el consentimiento para estas últimas finalidades sin que ello afecte su acceso al contenido del sitio. Al ingresar por primera vez se muestra un aviso donde puede elegir entre <em>Aceptar</em> o <em>Solo necesarias</em>.</p>

<h2>4. Uso de cookies y publicidad de terceros</h2>
<p>Este sitio se financia mediante publicidad servida por <strong>Monetag</strong>, una red publicitaria de terceros. Cuando usted acepta las cookies publicitarias, Monetag y sus socios pueden colocar cookies o identificadores en su navegador para mostrar y medir anuncios.</p>
<p>El tratamiento que dichos terceros realicen se rige por sus propias políticas de privacidad. Puede consultar la de Monetag en <a href="https://monetag.com/privacy-policy/" target="_blank" rel="noopener nofollow">monetag.com/privacy-policy</a>.</p>
<p>Para más detalle consulte nuestra <a href="cookies.html">política de cookies</a>.</p>

<h2>5. Transferencias</h2>
<p>No vendemos, comercializamos ni transferimos datos personales a terceros con fines distintos a los descritos. Los datos de navegación procesados por la red publicitaria y por el proveedor de alojamiento (Cloudflare) se tratan conforme a las políticas de cada proveedor y pueden implicar el procesamiento en servidores ubicados fuera de México.</p>

<h2>6. Derechos ARCO</h2>
<p>Usted tiene derecho a conocer qué datos personales tenemos, para qué los utilizamos y las condiciones de dicho uso (<strong>Acceso</strong>); solicitar la corrección de información inexacta (<strong>Rectificación</strong>); pedir que se elimine de nuestros registros cuando considere que no está siendo utilizada conforme a los principios y deberes de la ley (<strong>Cancelación</strong>); así como oponerse al uso de sus datos para fines específicos (<strong>Oposición</strong>).</p>
<p>Para ejercer cualquiera de estos derechos, envíe una solicitud al correo <a href="mailto:${MAIL}">${MAIL}</a> indicando su petición y un medio de contacto para responderle. Se dará respuesta en un plazo máximo de veinte días hábiles.</p>

<h2>7. Revocación del consentimiento</h2>
<p>Puede revocar en cualquier momento el consentimiento otorgado para cookies publicitarias. Basta con borrar los datos de navegación de este sitio en su navegador; al volver a ingresar se le mostrará nuevamente el aviso de cookies para elegir de nuevo.</p>

<h2>8. Medios para limitar el uso o divulgación</h2>
<p>Además de la opción anterior, usted puede configurar su navegador para bloquear o eliminar cookies, o utilizar extensiones de bloqueo de publicidad. El sitio seguirá siendo funcional.</p>

<h2>9. Cambios a este aviso</h2>
<p>Este aviso puede actualizarse para reflejar cambios legales o en nuestras prácticas. Cualquier modificación se publicará en esta misma página, indicando la fecha de última actualización.</p>

<h2>10. Autoridad</h2>
<p>Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir ante la autoridad competente en materia de protección de datos personales en México.</p>`);

pgLegal('terminos.html','Términos de uso',
 `Términos y condiciones de uso del sitio ${N}.`,
`<p>El acceso y uso de <strong>${N}</strong> implica la aceptación plena de los presentes términos. Si no está de acuerdo, le pedimos abstenerse de utilizar el sitio.</p>

<h2>1. Objeto del sitio</h2>
<p>${N} es un sitio <strong>informativo e independiente</strong> que consulta y presenta de forma ordenada los precios de combustibles publicados por la <strong>Comisión Reguladora de Energía (CRE)</strong> en su reporte público.</p>
<p>No vendemos combustible, no operamos estaciones de servicio ni intermediamos en ninguna transacción.</p>

<h2>2. Ausencia de vínculo oficial</h2>
<p>Este sitio <strong>no está afiliado, patrocinado ni respaldado</strong> por la Comisión Reguladora de Energía, por PEMEX, por la Secretaría de Energía ni por ninguna dependencia gubernamental. Tampoco mantiene relación con las marcas o estaciones de servicio mencionadas.</p>
<p>Los nombres comerciales y marcas que aparecen son propiedad de sus respectivos titulares y se utilizan únicamente con fines identificativos e informativos.</p>

<h2>3. Exactitud de la información</h2>
<p>Los precios se obtienen del reporte público de la CRE y se actualizan de forma automática una vez al día. Sin embargo:</p>
<ul>
<li>Una estación puede modificar su precio en cualquier momento sin reportarlo de inmediato</li>
<li>Pueden existir errores de captura en la fuente original</li>
<li>Puede haber retrasos o interrupciones en la publicación de los datos</li>
</ul>
<p>Por lo anterior, la información se ofrece <strong>"tal cual", sin garantía de exactitud, vigencia o disponibilidad</strong>. Verifique siempre el precio directamente en la estación antes de cargar combustible.</p>

<h2>4. Limitación de responsabilidad</h2>
<p>El operador de este sitio no será responsable por daños o perjuicios derivados del uso de la información aquí publicada, incluyendo diferencias de precio, traslados innecesarios o decisiones de compra basadas en los datos mostrados.</p>

<h2>5. Publicidad</h2>
<p>El sitio se financia mediante publicidad de terceros. No controlamos ni respaldamos el contenido de los anuncios mostrados, ni los productos o servicios que promocionan. Cualquier relación que usted establezca con un anunciante es ajena a este sitio.</p>

<h2>6. Uso permitido</h2>
<p>Usted puede consultar y compartir libremente la información del sitio. No está permitido:</p>
<ul>
<li>Realizar extracciones automatizadas masivas que afecten el servicio</li>
<li>Intentar vulnerar la seguridad del sitio</li>
<li>Reproducir el sitio en su totalidad haciéndolo pasar como propio</li>
</ul>

<h2>7. Propiedad intelectual</h2>
<p>Los datos de precios son información pública de la CRE. El diseño, la estructura, los textos originales y la presentación de este sitio son propiedad de su operador.</p>

<h2>8. Modificaciones</h2>
<p>Estos términos pueden actualizarse en cualquier momento. La versión vigente es la publicada en esta página.</p>

<h2>9. Contacto</h2>
<p>Para cualquier duda escriba a <a href="mailto:${MAIL}">${MAIL}</a>.</p>`);

pgLegal('cookies.html','Política de cookies',
 `Qué cookies utiliza ${N}, para qué sirven y cómo puede gestionarlas.`,
`<p>Una cookie es un pequeño archivo que un sitio web guarda en su navegador. Sirve para recordar información entre visitas. A continuación se explica cómo las utiliza <strong>${N}</strong>.</p>

<h2>1. Cookies necesarias</h2>
<p>Son imprescindibles para que el sitio funcione y no requieren su consentimiento.</p>
<ul>
<li><strong>Preferencia de consentimiento:</strong> guardamos en su navegador (mediante almacenamiento local) su elección respecto a las cookies, para no volver a preguntarle en cada visita. No contiene datos personales.</li>
<li><strong>Seguridad del proveedor:</strong> Cloudflare, nuestro proveedor de alojamiento, puede utilizar cookies técnicas para proteger el sitio frente a tráfico malicioso.</li>
</ul>

<h2>2. Cookies publicitarias</h2>
<p>Solo se activan si usted pulsa <em>Aceptar</em> en el aviso inicial.</p>
<p>Nuestro socio publicitario <strong>Monetag</strong> puede utilizar cookies e identificadores para:</p>
<ul>
<li>Mostrar anuncios y limitar cuántas veces ve el mismo</li>
<li>Medir si un anuncio fue visto o generó interacción</li>
<li>Personalizar la publicidad según sus intereses inferidos</li>
</ul>
<p>Estas cookies son gestionadas por el tercero y se rigen por su propia política: <a href="https://monetag.com/privacy-policy/" target="_blank" rel="noopener nofollow">monetag.com/privacy-policy</a>.</p>

<h2>3. Si elige "Solo necesarias"</h2>
<p>No se cargarán los scripts publicitarios y no se colocarán cookies de publicidad. El sitio funcionará con normalidad y podrá consultar todos los precios sin restricción.</p>

<h2>4. Cómo cambiar su decisión</h2>
<p>Puede modificar su elección en cualquier momento:</p>
<ul>
<li><strong>Borrando los datos del sitio</strong> en la configuración de su navegador. Al volver a entrar se le preguntará de nuevo.</li>
<li><strong>Configurando su navegador</strong> para bloquear cookies de terceros de forma permanente.</li>
<li><strong>Usando una extensión</strong> de bloqueo de publicidad.</li>
</ul>
<p>Todos los navegadores modernos permiten gestionar cookies desde su sección de privacidad o configuración.</p>

<h2>5. Más información</h2>
<p>Consulte también nuestro <a href="aviso-de-privacidad.html">aviso de privacidad</a>. Si tiene dudas, escríbanos a <a href="mailto:${MAIL}">${MAIL}</a>.</p>`);

pgLegal('contacto.html','Contacto',
 `Cómo contactar al equipo de ${N} para dudas, correcciones o reportes.`,
`<p>¿Detectó un precio incorrecto? ¿Tiene una duda o una sugerencia? Escríbanos.</p>

<h2>Correo</h2>
<p><a href="mailto:${MAIL}">${MAIL}</a></p>
<p>Respondemos en un plazo aproximado de tres días hábiles.</p>

<h2>Sobre correcciones de precio</h2>
<p>Los precios que mostramos provienen directamente del <strong>reporte público de la Comisión Reguladora de Energía</strong>. No los capturamos ni los modificamos.</p>
<p>Si un precio aparece incorrecto, lo más probable es que la estación no haya actualizado su reporte ante la CRE, o que exista un error en la fuente original. En esos casos la corrección debe realizarse ante la propia CRE; nosotros reflejaremos el cambio en la siguiente actualización diaria.</p>

<h2>Soy propietario de una estación</h2>
<p>Si su estación aparece con información incorrecta, verifique primero su reporte ante la CRE. Una vez corregido ahí, el cambio se reflejará automáticamente en este sitio dentro de las 24 horas siguientes.</p>
<p>Si desea que su estación sea retirada del sitio, escríbanos indicando el nombre y el identificador CRE.</p>

<h2>Ejercicio de derechos ARCO</h2>
<p>Para solicitudes relacionadas con datos personales, consulte el <a href="aviso-de-privacidad.html">aviso de privacidad</a> y escriba al mismo correo indicando su petición.</p>

<h2>Prensa y colaboraciones</h2>
<p>Para consultas de medios o propuestas de colaboración, utilice el correo anterior indicando el asunto.</p>`);
console.log(`   ✓ 4 páginas legales`);

// ── EXTRAS
f.writeFileSync(P.join(O,'s.css'),CSS);
f.writeFileSync(P.join(O,'_redirects'),'/index.html / 200\n');
f.writeFileSync(P.join(O,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n');

f.writeFileSync(P.join(O,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34" fill="none" stroke="#1d1d1f" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 31V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v26"/><path d="M1.5 31h16"/><path d="M6 8h7v5H6z"/><path d="M16 12h4a2 2 0 0 1 2 2v10a2.5 2.5 0 0 0 5 0V13l-3.5-4"/></svg>');
const U=['','baratas.html','estados.html','aviso-de-privacidad.html','terminos.html','cookies.html','contacto.html'].concat(edos.map(([n])=>`estado-${s(n)}.html`)).concat(muns.map(([k])=>{const[ed,mu]=k.split('|');return slugMun(ed,mu)})).concat(D.map(g=>`estacion/${g._s}.html`));
f.writeFileSync(P.join(O,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+U.map(u=>`<url><loc>${DOM}/${u}</loc><lastmod>${ISO}</lastmod></url>`).join('\n')+'\n</urlset>');
f.writeFileSync(P.join(O,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${DOM}/sitemap.xml\n`);
console.log(`   ✓ sitemap.xml (${U.length.toLocaleString('es-MX')} URLs) + robots.txt`);
let by=0,ct=0;(function W(d){f.readdirSync(d,{withFileTypes:true}).forEach(x=>{const p=P.join(d,x.name);x.isDirectory()?W(p):(by+=f.statSync(p).size,ct++)})})(O);
console.log(`\n✅ LISTO — ${ct.toLocaleString('es-MX')} archivos, ${(by/1048576).toFixed(1)} MB\n`);
})();
