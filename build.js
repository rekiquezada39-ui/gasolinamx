const f=require('fs'),P=require('path'),O='dist';
// ══════════ CONFIGURA AQUI ══════════
const N='GasolinaMX',DOM='https://gasolinamx.pages.dev';
const MAIL='contacto.gasolinamx@gmail.com';   // <- cambia por el correo de contacto que quieras publicar
const MVERIFY='<meta name="monetag" content="93992a7ab07c1e69404da37a95d434a1"><meta name="google-site-verification" content="U9iGxs4sIb4prXPIHujTEdxOh7eu-x9UDdaeqOjKHjE">';
const MTAG=`<script>(function(s){s.dataset.zone='11471781',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script><script>(function(s){s.dataset.zone='11471783',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>`;
// ════════════════════════════════════
const s=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
const e=x=>String(x||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mx=n=>{const v=Number(n);return (v<0?'-$':'$')+Math.abs(v).toFixed(2)};
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
// normaliza nombres de estado que devuelve la API de geocodificacion
const EDOFIX={'Veracruz':'Veracruz de Ignacio de la Llave','Michoacán':'Michoacán de Ocampo',
 'Coahuila':'Coahuila de Zaragoza','México':'Estado de México','Estado de Mexico':'Estado de México',
 'Ciudad de Mexico':'Ciudad de México','Distrito Federal':'Ciudad de México'};
// solo se aceptan estados reales de Mexico
const EDOMX=new Set(['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
 'Chihuahua','Ciudad de México','Coahuila de Zaragoza','Colima','Durango','Estado de México',
 'Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán de Ocampo','Morelos','Nayarit','Nuevo León',
 'Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco',
 'Tamaulipas','Tlaxcala','Veracruz de Ignacio de la Llave','Yucatán','Zacatecas']);
const limpiaEdo=e=>{if(!e)return null;const x=EDOFIX[e]||e;return EDOMX.has(x)?x:null};

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

// ══ HISTÓRICO DE PRECIOS (se acumula día a día) ══
// ── Estaciones bloqueadas a mano (reportes de usuarios).
//    Archivo cerradas.json:  {"12345":"cerro, reporte 3 ago","6789":"precio falso"}
//    Se edita con:  node cerrar.js 12345 "motivo"
// ── Reportes automaticos (Google Form + Google Sheet). Opcional.
//    Lee GUIA-REPORTES.txt para armarlo en 5 minutos. Si lo dejas vacio,
//    el boton de ocultar sigue funcionando pero solo para cada usuario.
const FORM_ID='';        // el id largo del Google Form
const FORM_C_ID='';      // entry.XXXXXXX del campo "id de estacion"
const FORM_C_MOT='';     // entry.XXXXXXX del campo "motivo"
const SHEET_CSV='';      // URL de la hoja publicada como CSV
const UMBRAL_CIERRE=3;   // cuantos reportes de "cerro" para bloquearla sola
const CFILE='cerradas.json';
let CERRADAS={};
try{CERRADAS=JSON.parse(f.readFileSync(CFILE,'utf8'))}catch(x){}
const HFILE='historial.json';
const DIAS_HIST=30;
let HIST={fechas:[],est:{}};
try{HIST=JSON.parse(f.readFileSync(HFILE,'utf8'))}catch(x){}
function guardarHistorial(lista){
 const hoy=ISO;
 if(HIST.fechas[HIST.fechas.length-1]===hoy){HIST.fechas.pop();Object.keys(HIST.est).forEach(k=>HIST.est[k].pop())}
 HIST.fechas.push(hoy);
 const n=HIST.fechas.length;
 const vistos=new Set();
 lista.forEach(g=>{
  vistos.add(g.id);
  if(!HIST.est[g.id])HIST.est[g.id]=new Array(n-1).fill(null);
  while(HIST.est[g.id].length<n-1)HIST.est[g.id].push(null);
  HIST.est[g.id].push(g.regular||null);
 });
 Object.keys(HIST.est).forEach(k=>{
  if(!vistos.has(k)){while(HIST.est[k].length<n)HIST.est[k].push(null)}
 });
 if(HIST.fechas.length>DIAS_HIST){
  const c=HIST.fechas.length-DIAS_HIST;
  HIST.fechas=HIST.fechas.slice(c);
  Object.keys(HIST.est).forEach(k=>{
   HIST.est[k]=HIST.est[k].slice(c);
   if(HIST.est[k].every(v=>v===null))delete HIST.est[k];
  });
 }
 try{f.writeFileSync(HFILE,JSON.stringify(HIST))}catch(e){}
 console.log(`   ✓ histórico: ${HIST.fechas.length} día(s) registrado(s)`);
}
// helpers de tendencia
function serie(id){const a=HIST.est[id];return a?a.filter(v=>v!==null):[]}
// ── Frescura del dato: cuantos dias lleva la estacion sin reportar precio.
//    La CRE deja las gasolineras cerradas en el catalogo, solo dejan de
//    mandar precio. Asi las detectamos.
const DIAS_AVISO=3;    // a partir de aqui se avisa que el dato es viejo
const DIAS_OCULTA=7;   // a partir de aqui no se lista ni se manda a Google
function diasSinReportar(id){
 const a=HIST.est[id];
 if(!a||!a.length)return 0;
 let d=0;
 for(let i=a.length-1;i>=0;i--){if(a[i]!==null)break;d++}
 return d;
}
function fechaUltimoDato(id){
 const a=HIST.est[id];
 if(!a||!a.length)return null;
 for(let i=a.length-1;i>=0;i--)if(a[i]!==null)return HIST.fechas[i]||null;
 return null;
}
const fmtFecha=iso=>{if(!iso)return '';const[y,m,d]=iso.split('-');
 const M=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
 return `${+d} de ${M[+m-1]} de ${y}`};
function tendencia(id,actual){
 const a=HIST.est[id]; if(!a||a.length<2)return null;
 let prev=null;
 for(let i=a.length-2;i>=0;i--){if(a[i]!==null){prev=a[i];break}}
 if(prev===null||actual===null)return null;
 const d=actual-prev;
 return {d:d, pct:prev?d/prev*100:0, prev:prev};
}
function rango(id){
 const v=serie(id); if(!v.length)return null;
 return {min:Math.min(...v),max:Math.max(...v),n:v.length};
}
// mini gráfica SVG (sparkline)
function spark(id,w,h){
 const v=serie(id); if(v.length<2)return '';
 const mn=Math.min(...v),mx=Math.max(...v),r=(mx-mn)||1;
 const pts=v.map((p,i)=>`${(i/(v.length-1)*w).toFixed(1)},${(h-((p-mn)/r)*h*0.82-h*0.09).toFixed(1)}`).join(' ');
 const sube=v[v.length-1]>v[0];
 const col=sube?'#dc2626':'#16a34a';
 return `<svg class="spk" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ══ GENERADOR DE og.png (1200x630) — sin dependencias ══
const z=require('zlib');
const FK='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,-:/|!?()+% ';
const FD='ehhvhhhuhhuhhuehgggheuhhhhhuvgguggvvggugggehgnhhfhhhvhhhe44444e72222ichikokihggggggvhrllhhhhpljhhhehhhhheuhhugggehhhliduhhukihfgge11uv444444hhhhhhehhhhha4hhhllrhhha4ahhhha4444v1248gvehjlphe4c4444eeh1248vv2421he26aiv22vgu11he68guhhev124888ehhehheehhf12c4fke5u400000cc0000c48000v0000cc0cc0122488g44444444444404eh1640424888428422248044v4400000000';
const AL='0123456789abcdefghijklmnopqrstuv';
const GLY={};
for(let i=0;i<FK.length;i++){const rows=[];
 for(let j=0;j<7;j++)rows.push(AL.indexOf(FD[i*7+j]));
 GLY[FK[i]]=rows}
const SS=3;
function _lz(w,h,r,g,b){const W=w*SS,H=h*SS,p=Buffer.alloc(W*H*3);
 for(let i=0;i<W*H;i++){p[i*3]=r;p[i*3+1]=g;p[i*3+2]=b}return{w,h,W,H,p}}
function _rc(c,x,y,w,h,r,g,b){const X=Math.round(x*SS),Y=Math.round(y*SS),Wd=Math.round(w*SS),Ht=Math.round(h*SS);
 for(let j=Y;j<Y+Ht;j++){if(j<0||j>=c.H)continue;for(let i=X;i<X+Wd;i++){if(i<0||i>=c.W)continue;
  const k=(j*c.W+i)*3;c.p[k]=r;c.p[k+1]=g;c.p[k+2]=b}}}
function _tx(c,t,x0,y0,es,r,g,b){let x=x0;
 for(const ch of String(t).toUpperCase()){const gl=GLY[ch];
  if(gl)for(let ry=0;ry<7;ry++)for(let rx=0;rx<5;rx++){if((gl[ry]>>(4-rx))&1)_rc(c,x+rx*es,y0+ry*es,es,es,r,g,b)}
  x+=6*es}return x}
const _an=(t,es)=>String(t).length*6*es-es;
const _fit=(t,max,ini)=>{let e2=ini;while(e2>1&&_an(t,e2)>max)e2--;return e2};
function _png(c){
 const w=c.w,h=c.h,out=Buffer.alloc(w*h*3),n=SS*SS;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let R=0,G=0,B=0;
  for(let j=0;j<SS;j++)for(let i=0;i<SS;i++){const k=(((y*SS+j)*c.W)+(x*SS+i))*3;R+=c.p[k];G+=c.p[k+1];B+=c.p[k+2]}
  const o=(y*w+x)*3;out[o]=R/n;out[o+1]=G/n;out[o+2]=B/n}
 const raw=Buffer.alloc(h*(w*3+1));
 for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;out.copy(raw,y*(w*3+1)+1,y*w*3,(y+1)*w*3)}
 const T=[];for(let m=0;m<256;m++){let k=m;for(let j=0;j<8;j++)k=k&1?0xEDB88320^(k>>>1):k>>>1;T[m]=k>>>0}
 const crc=b=>{let k=0xFFFFFFFF;for(const x of b)k=T[(k^x)&255]^(k>>>8);return(k^0xFFFFFFFF)>>>0};
 const ck=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);
  const cb=Buffer.alloc(4);cb.writeUInt32BE(crc(td));return Buffer.concat([l,td,cb])};
 const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ck('IHDR',ih),
  ck('IDAT',z.deflateSync(raw,{level:9})),ck('IEND',Buffer.alloc(0))]);}
function ogPNG(titulo,sub,mg,pm,ds,pie){
 const c=_lz(1200,630,255,255,255);
 _rc(c,0,0,1200,10,0,113,227);
 _rc(c,70,76,8,50,29,29,31);_rc(c,70,76,38,8,29,29,31);
 _rc(c,70,118,48,8,29,29,31);_rc(c,86,92,16,14,29,29,31);
 _tx(c,'GASOLINAMX',140,86,7,29,29,31);
 _rc(c,70,162,1060,2,232,232,237);
 _tx(c,titulo,70,200,_fit(titulo,1060,11),29,29,31);
 _tx(c,sub,70,286,_fit(sub,1060,4),134,134,139);
 [['MAGNA',mg,22,163,74],['PREMIUM',pm,220,38,38],['DIESEL',ds,29,29,31]]
 .forEach((b,i)=>{const x=70+i*358;
  _rc(c,x,346,336,170,247,247,249);_rc(c,x,346,336,6,b[2],b[3],b[4]);
  _tx(c,b[0],x+28,382,4,134,134,139);
  _tx(c,b[1],x+28,418,_fit(b[1],280,9),b[2],b[3],b[4]);
  _tx(c,'PROMEDIO NACIONAL',x+28,482,3,150,150,155)});
 _tx(c,pie,70,556,_fit(pie,1060,4),134,134,139);
 _rc(c,0,614,1200,16,22,163,74);
 return _png(c);}

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
/* GEO */
.geo{background:linear-gradient(135deg,#0071e3,#00a2ff);border-radius:20px;padding:30px 28px;margin-bottom:18px;color:#fff}
.geo h3{font-size:1.32rem;font-weight:600;letter-spacing:-.02em;margin-bottom:7px}
.geo p{font-size:.94rem;opacity:.92;margin-bottom:18px;max-width:460px}
.geob{display:inline-flex;align-items:center;gap:9px;background:#fff;color:#0071e3;border:0;padding:14px 28px;border-radius:980px;font-size:1rem;font-weight:600;font-family:inherit;cursor:pointer;transition:transform .16s,box-shadow .2s;box-shadow:0 4px 14px rgba(0,0,0,.14)}
.geob:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.2)}
.geob:active{transform:translateY(0)}
.geob:disabled{opacity:.7;cursor:wait}
.geost{margin-top:14px;font-size:.88rem;opacity:.95;min-height:1.2em}
.geores{margin-top:22px}
.tabs{display:flex;gap:8px;margin:20px 0 4px;flex-wrap:wrap}
.tabs button{padding:9px 18px;border-radius:980px;border:1px solid #d2d2d7;background:#fff;color:#1d1d1f;font-size:.88rem;font-family:inherit;cursor:pointer;transition:.16s}
.tabs button:hover{border-color:#0071e3;color:#0071e3}
.tabs button.on{background:#1d1d1f;border-color:#1d1d1f;color:#fff;font-weight:500}
.tip{background:#eef6ff;border-left:3px solid #0071e3;padding:13px 16px;border-radius:9px;font-size:.89rem;color:#1d1d1f;margin:16px 0}
.dist{display:inline-block;background:#eef6ff;color:#0071e3;font-size:.74rem;font-weight:700;padding:3px 9px;border-radius:980px;margin-left:7px;vertical-align:middle;white-space:nowrap}
.mejor{background:#dcfce7;color:#15803d}
/* TENDENCIAS E HISTÓRICO */
.spk{width:56px;height:20px;vertical-align:middle;margin-left:8px;opacity:.85}
.trend{display:inline-flex;align-items:center;gap:3px;font-size:.75rem;font-weight:700;padding:2px 8px;border-radius:980px;margin-left:7px;vertical-align:middle;white-space:nowrap}
.trend.up{background:#fee2e2;color:#b91c1c}
.trend.down{background:#dcfce7;color:#15803d}
.trend.eq{background:#f1f1f4;color:#6e6e73}
.hcard{border:1px solid #d2d2d7;border-radius:16px;padding:22px;margin:20px 0}
.hcard h3{font-size:1.1rem;font-weight:600;margin-bottom:4px}
.hcard .hsub{font-size:.84rem;color:#86868b;margin-bottom:16px}
.chart{width:100%;height:150px;display:block}
.hstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:0;margin-top:16px;border-top:1px solid #ececee}
.hstats>div{padding:13px 14px 13px 0;font-size:1.02rem;font-weight:600;font-variant-numeric:tabular-nums}
.hstats b{display:block;color:#86868b;font-size:.72rem;font-weight:400;margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em}
.btn.r{background:#fff;color:#86868b;border:1px solid #d2d2d7}
.btn.r:hover{color:#1d1d1f;border-color:#86868b}
.tabla td.oc{width:34px;padding-right:0;text-align:right}
.ocb{background:none;border:0;color:#c7c7cc;font-size:1.25rem;line-height:1;cursor:pointer;padding:2px 5px;border-radius:7px;font-family:inherit;transition:.15s}
.ocb:hover{color:#dc2626;background:#fef2f2}
button.btn.r.ocb{font-size:.92rem;color:#86868b}
.ocm{position:fixed;inset:0;z-index:9900;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.42);backdrop-filter:blur(3px)}
.ocm.on{display:flex}
.ocmc{background:#fff;border-radius:20px;padding:28px;max-width:420px;width:100%;box-shadow:0 22px 60px rgba(0,0,0,.28)}
.ocmc h3{font-size:1.16rem;font-weight:600;margin-bottom:5px;letter-spacing:-.02em}
.ocmc .est{font-size:.87rem;color:#86868b;margin-bottom:20px;line-height:1.4}
.ocmc label{display:flex;align-items:center;gap:11px;padding:12px 13px;border:1px solid #e8e8ed;border-radius:12px;margin-bottom:8px;cursor:pointer;font-size:.93rem;transition:.15s}
.ocmc label:hover{background:#f5f5f7;border-color:#d2d2d7}
.ocmc label input{margin:0;accent-color:#0071e3;flex-shrink:0}
.ocmc .acc{display:flex;gap:9px;margin-top:19px}
.ocmc .acc button{flex:1;padding:12px;border-radius:980px;border:0;font-size:.93rem;font-weight:500;font-family:inherit;cursor:pointer;transition:.15s}
.ocmc .no{background:#f5f5f7;color:#1d1d1f}
.ocmc .si{background:#0071e3;color:#fff}
.ocmc .si:hover{background:#0077ed}
.ocmc .no:hover{background:#ebebf0}
.ocav{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(90px);background:#1d1d1f;color:#fff;padding:13px 20px;border-radius:14px;font-size:.9rem;z-index:9800;display:flex;align-items:center;gap:14px;box-shadow:0 10px 34px rgba(0,0,0,.3);transition:transform .3s cubic-bezier(.32,.72,0,1);max-width:calc(100vw - 32px)}
.ocav.on{transform:translateX(-50%) translateY(0)}
.ocav button{background:none;border:0;color:#5ac8fa;font-size:.9rem;font-weight:500;font-family:inherit;cursor:pointer;padding:0;white-space:nowrap}
.ocres{font-size:.83rem;color:#0071e3;cursor:pointer;margin:14px 0 0;display:none}
.ocres.on{display:block}
@media(max-width:734px){.tabla td.oc{width:30px}.ocmc{padding:22px}}
.avisoX{background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:12px;padding:16px 18px;margin:18px 0;font-size:.92rem;line-height:1.5;color:#7f1d1d}
.avisoW{background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:12px;padding:16px 18px;margin:18px 0;font-size:.92rem;line-height:1.5;color:#78350f}
.frescas{font-size:.82rem;color:#86868b;margin:10px 0 30px}
.alerta{background:linear-gradient(135deg,#111827,#1f2937);color:#fff;border-radius:20px;padding:28px;margin:26px 0}
.alerta h3{font-size:1.25rem;font-weight:600;margin-bottom:7px;letter-spacing:-.02em}
.alerta p{font-size:.92rem;opacity:.85;margin-bottom:18px;max-width:480px}
.alerta .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.alerta input{padding:12px 15px;border-radius:11px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.1);color:#fff;font-size:16px;font-family:inherit;width:120px}
.alerta input::placeholder{color:rgba(255,255,255,.5)}
.alerta button{background:#fff;color:#111827;border:0;padding:12px 24px;border-radius:980px;font-size:.93rem;font-weight:600;font-family:inherit;cursor:pointer;transition:transform .16s}
.alerta button:hover{transform:translateY(-2px)}
.alerta button:disabled{opacity:.55;cursor:default;transform:none}
.alerta .est{font-size:.85rem;margin-top:13px;opacity:.9;min-height:1.2em}
.resumen{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1px;background:#d2d2d7;border:1px solid #d2d2d7;border-radius:16px;overflow:hidden;margin:18px 0}
.resumen>div{background:#fff;padding:20px}
.resumen .k{font-size:.73rem;color:#86868b;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:7px}
.resumen .v{font-size:1.6rem;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.resumen .v.pos{color:#b91c1c}.resumen .v.neg{color:#15803d}
.resumen .c{font-size:.79rem;color:#86868b;margin-top:4px}
@media(max-width:734px){.hcard{padding:17px}.alerta{padding:22px}.alerta input{width:100%}.alerta .row{flex-direction:column;align-items:stretch}.alerta button{width:100%}}
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
const HEAD=(t,d,c,r,nx)=>`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${e(t)}</title><meta name="description" content="${e(d)}"><link rel="canonical" href="${c}">${nx?'<meta name="robots" content="noindex,follow">':''}${MVERIFY}<meta property="og:title" content="${e(t)}"><meta property="og:description" content="${e(d)}"><meta property="og:type" content="website"><meta property="og:url" content="${c}"><meta property="og:site_name" content="GasolinaMX"><meta property="og:locale" content="es_MX"><meta property="og:image" content="${DOM}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(t)}"><meta name="twitter:description" content="${e(d)}"><meta name="twitter:image" content="${DOM}/og.png"><meta name="theme-color" content="#ffffff"><link rel="icon" type="image/svg+xml" href="${r}favicon.svg"><link rel="stylesheet" href="${r}s.css"></head><body>
<header><div class="hin">
<button class="burger" id="burger" aria-label="Menú"><span></span><span></span><span></span></button>
<a href="${r}" class="lg">${LOGO}<span class="lgt">${N}</span></a>
<nav class="hnav"><a href="${r}">Inicio</a><a href="${r}estados">Estados</a><a href="${r}baratas">Más baratas</a></nav>
<span class="upd">Actualizado ${HOY}</span>
</div></header>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer"><div class="dhead">${LOGO}<span class="lgt">${N}</span></div><div class="dbody">${DRAWER.replace(/href="/g,'href="'+r)}</div></aside>`;
const FOOT=(r)=>`<footer><div class="fin"><p>${N}. Precios de gasolina en México actualizados diariamente.</p><p style="margin-top:9px">Datos oficiales de la Comisión Reguladora de Energía (CRE). Los precios pueden variar; verifica en la estación antes de cargar. Última actualización: ${HOY}.</p>
<nav class="fnav"><a href="${r}aviso-de-privacidad">Aviso de privacidad</a><a href="${r}terminos">Términos de uso</a><a href="${r}cookies">Cookies</a><a href="${r}contacto">Contacto</a></nav></div></footer>
<div id="ck" role="dialog" aria-label="Aviso de cookies"><p>Usamos cookies propias y de terceros para mostrar publicidad y analizar el tráfico. Consulta el <a href="${r}aviso-de-privacidad">aviso de privacidad</a> y la <a href="${r}cookies">política de cookies</a>.</p><div class="ckb"><button id="ckNo" type="button">Solo necesarias</button><button id="ckSi" type="button">Aceptar</button></div></div>
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer'),s=document.getElementById('scrim');
function t(o){b.classList.toggle('open',o);d.classList.toggle('on',o);s.classList.toggle('on',o);document.body.classList.toggle('lock',o)}
if(b){b.addEventListener('click',function(){t(!d.classList.contains('on'))});s.addEventListener('click',function(){t(false)});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')t(false)});d.addEventListener('click',function(ev){if(ev.target.closest('a'))t(false)})}
// ── Consentimiento de cookies: los anuncios solo cargan si el usuario acepta
var KEY='ck_gmx',box=document.getElementById('ck');
var _adsYa=false;
function _iny(){if(_adsYa)return;var f=document.getElementById('ads-tpl');if(!f)return;
 _adsYa=true;
 var h=f.innerHTML,w=document.createElement('div');w.innerHTML=h;
 [].forEach.call(w.querySelectorAll('script'),function(o){var n=document.createElement('script');
  [].forEach.call(o.attributes,function(a){n.setAttribute(a.name,a.value)});
  if(o.textContent)n.textContent=o.textContent;document.body.appendChild(n)});}
// El <template> vive al final del <body>, asi que este script corre ANTES de que exista.
// Si el visitante ya habia aceptado, hay que esperar a que el DOM termine de cargar.
function ads(){
 if(document.getElementById('ads-tpl')){_iny();return}
 if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',_iny,{once:true})}
 else{setTimeout(_iny,0)}}
try{var v=localStorage.getItem(KEY);
 if(v==='1'){ads()}else if(v!=='0'&&box){box.classList.add('on')}
 if(box){document.getElementById('ckSi').addEventListener('click',function(){try{localStorage.setItem(KEY,'1')}catch(e){}box.classList.remove('on');ads()});
 document.getElementById('ckNo').addEventListener('click',function(){try{localStorage.setItem(KEY,'0')}catch(e){}box.classList.remove('on')})}
}catch(e){}
})();<\/script>
<div class="ocm" id="ocm" role="dialog" aria-modal="true">
 <div class="ocmc">
  <h3>Ocultar esta estación</h3>
  <div class="est" id="ocmNom"></div>
  <label><input type="radio" name="ocmot" value="cerro" checked> Ya cerró o no existe</label>
  <label><input type="radio" name="ocmot" value="precio"> El precio no coincide</label>
  <label><input type="radio" name="ocmot" value="ubicacion"> La ubicación está mal</label>
  <label><input type="radio" name="ocmot" value="personal"> Solo no me interesa</label>
  <div class="acc">
   <button type="button" class="no" id="ocmNo">Cancelar</button>
   <button type="button" class="si" id="ocmSi">Ocultar</button>
  </div>
 </div>
</div>
<div class="ocav" id="ocav"><span id="ocavT">Estación oculta</span><button type="button" id="ocavU">Deshacer</button></div>
<script>
(function(){
 var K='oc_gmx', F={f:${JSON.stringify(FORM_ID)},i:${JSON.stringify(FORM_C_ID)},m:${JSON.stringify(FORM_C_MOT)}};
 function leer(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return {}}}
 function grabar(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
 // ocultar las filas ya marcadas
 function aplica(){
  var o=leer(), n=0;
  document.querySelectorAll('tr[data-eid]').forEach(function(tr){
   if(o[tr.getAttribute('data-eid')]){tr.style.display='none';n++}
   else tr.style.display='';
  });
  var r=document.getElementById('ocres');
  if(r){var t=Object.keys(o).length;
   if(t){r.textContent='Tienes '+t+' estación'+(t>1?'es':'')+' oculta'+(t>1?'s':'')+'. Mostrar de nuevo';r.classList.add('on')}
   else r.classList.remove('on')}
  return n;
 }
 // mandar el reporte al formulario (si esta configurado)
 function reporta(id,mot){
  if(!F.f||!F.i||mot==='personal')return;
  try{
   var d=new FormData();
   d.append(F.i,id); d.append(F.m,mot);
   fetch('https://docs.google.com/forms/d/e/'+F.f+'/formResponse',
    {method:'POST',mode:'no-cors',body:d}).catch(function(){});
  }catch(e){}
 }
 var M=document.getElementById('ocm'), AV=document.getElementById('ocav'), pend=null, ultimo=null, tmr=null;
 function abre(id,nom){
  if(!M)return;
  pend={id:id,nom:nom};
  document.getElementById('ocmNom').textContent=nom||('Estación '+id);
  M.classList.add('on');
 }
 function cierra(){if(M)M.classList.remove('on');pend=null}
 document.addEventListener('click',function(ev){
  var b=ev.target.closest('.ocb');
  if(b){ev.preventDefault();abre(b.getAttribute('data-eid'),b.getAttribute('data-nom'));return}
  if(ev.target===M)cierra();
 });
 var no=document.getElementById('ocmNo'); if(no)no.addEventListener('click',cierra);
 var si=document.getElementById('ocmSi');
 if(si)si.addEventListener('click',function(){
  if(!pend)return;
  var r=document.querySelector('input[name=ocmot]:checked');
  var mot=r?r.value:'personal';
  var o=leer(); o[pend.id]={m:mot,t:Date.now()}; grabar(o);
  reporta(pend.id,mot);
  ultimo=pend.id;
  var esFicha=!document.querySelector('tr[data-eid="'+pend.id+'"]');
  cierra(); aplica();
  if(AV){
   document.getElementById('ocavT').textContent='Estación oculta';
   AV.classList.add('on');
   clearTimeout(tmr); tmr=setTimeout(function(){AV.classList.remove('on')},5200);
  }
  if(esFicha)setTimeout(function(){location.href='/'},900);
 });
 var un=document.getElementById('ocavU');
 if(un)un.addEventListener('click',function(){
  if(!ultimo)return;
  var o=leer(); delete o[ultimo]; grabar(o); ultimo=null;
  AV.classList.remove('on'); aplica();
 });
 document.addEventListener('keydown',function(e){if(e.key==='Escape')cierra()});
 // enlace para restaurar todas
 var res=document.getElementById('ocres');
 if(res)res.addEventListener('click',function(){grabar({});aplica();location.reload()});
 aplica();
 window._ocAplica=aplica;   // para re-aplicar tras "cerca de mi"
})();
<\/script>
<template id="ads-tpl">${MTAG}</template>
</body></html>`;
const L=(t,d,c,b,r='',nx=false)=>HEAD(t,d,c,r,nx)+`<div class="shell"><aside class="side">${SIDE.replace(/href="/g,'href="'+r)}</aside><main>${b}</main></div>`+FOOT(r);
const PG=(cur,tot,fn)=>{if(tot<2)return'';let h='<div class="pg">';if(cur>1)h+=`<a href="${fn(cur-1)}">←</a>`;const a=Math.max(1,cur-2),z=Math.min(tot,cur+2);if(a>1)h+=`<a href="${fn(1)}">1</a>`+(a>2?'<span>…</span>':'');for(let i=a;i<=z;i++)h+=i===cur?`<span class="on">${i}</span>`:`<a href="${fn(i)}">${i}</a>`;if(z<tot)h+=(z<tot-1?'<span>…</span>':'')+`<a href="${fn(tot)}">${tot}</a>`;if(cur<tot)h+=`<a href="${fn(cur+1)}">→</a>`;return h+'</div>'};
const badge=g=>{const t=tendencia(g.id,g.regular);if(!t||Math.abs(t.d)<0.01)return '';
 return `<span class="trend ${t.d>0?'up':'down'}">${t.d>0?'▲':'▼'} ${mx(Math.abs(t.d))}</span>`};
const fila=(g,i,r='')=>`<tr data-eid="${g.id}"><td class="rank">${i+1}</td><td class="nm"><a href="${r}estacion/${g._s}">${e(g.name)}</a>${badge(g)}<small>${e(g._mun?g._mun+', '+(g._edo||''):(g._edo||'México'))}</small></td><td class="pr g">${g.regular?mx(g.regular):'—'}</td><td class="pr">${g.premium?mx(g.premium):'—'}</td><td class="pr">${g.diesel?mx(g.diesel):'—'}</td><td class="oc"><button class="ocb" type="button" data-eid="${g.id}" data-nom="${e(g.name)}" aria-label="Ocultar esta estación" title="Ocultar esta estación">&times;</button></td></tr>`;
const tabla=(arr,r='')=>`<table class="tabla"><thead><tr><th></th><th>Estación</th><th>Magna</th><th>Premium</th><th>Diésel</th><th></th></tr></thead><tbody>${arr.map((g,i)=>fila(g,i,r)).join('')}</tbody></table>`;

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
 // rangos realistas por combustible (la CRE tiene errores de captura)
 const okR=v=>v!==null&&v>=17&&v<=33;
 const okP=v=>v!==null&&v>=19&&v<=37;
 const okD=v=>v!==null&&v>=19&&v<=37;
 let R=okR(reg)?reg:null, PR=okP(pre)?pre:null, DI=okD(die)?die:null;
 // la Premium SIEMPRE cuesta mas que la Magna; si no, es captura invertida
 if(R!==null&&PR!==null&&R>=PR){R=null;PR=null}
 if(R===null&&PR===null&&DI===null)continue;
 const edo=(isFinite(c.x)&&isFinite(c.y))?edoDe(c.x,c.y):null;
 const rec={id,name:c.name,x:c.x,y:c.y,_edo:edo,
  regular:R,premium:PR,diesel:DI,
  _s:(s(c.name)||'estacion')+'-'+id};
 const prev=seen.get(id);
 const score=r=>(r.regular?1:0)+(r.premium?1:0)+(r.diesel?1:0);
 if(!prev||score(rec)>score(prev))seen.set(id,rec);
}
// ── auto-bloqueo por reportes acumulados de usuarios
const AUTO={};
if(SHEET_CSV){
 try{
  const csv=await fetch(SHEET_CSV).then(r=>r.text());
  const cta={};
  csv.split('\n').slice(1).forEach(ln=>{
   const c=ln.split(',');
   if(c.length<3)return;
   const id=(c[1]||'').replace(/[^0-9]/g,'');
   const mot=(c[2]||'').toLowerCase();
   if(!id)return;
   if(mot.includes('cerr')||mot.includes('existe')){cta[id]=(cta[id]||0)+1}
  });
  Object.entries(cta).forEach(([id,n])=>{if(n>=UMBRAL_CIERRE)AUTO[id]=n});
  const t=Object.keys(cta).length, a=Object.keys(AUTO).length;
  console.log(`   \u2713 reportes: ${t} estacion(es) reportada(s), ${a} auto-bloqueada(s)`);
 }catch(e){console.log('   reportes: no se pudo leer la hoja ('+e.message+')')}
}
const D=[...seen.values()].filter(g=>!CERRADAS[g.id]&&!AUTO[g.id]);
{const n=Object.keys(CERRADAS).length;
 if(n)console.log(`   \u2713 ${n} estacion(es) bloqueada(s) manualmente (cerradas.json)`);}
console.log(`   ✓ ${D.length.toLocaleString('es-MX')} estaciones con precio válido`);
await geocodificar(D);
D.forEach(g=>{const v=(isFinite(g.x)&&isFinite(g.y))?GC[rk(g.x,g.y)]:null;
 if(v){const le=limpiaEdo(v.e);g._mun=v.m;g._edo=le||limpiaEdo(g._edo)}
 else{g._mun=null;g._edo=limpiaEdo(g._edo)}});
// descartar estaciones que quedaron fuera de Mexico
{const antes=D.length;for(let i=D.length-1;i>=0;i--)if(!D[i]._edo)D.splice(i,1);
 if(antes!==D.length)console.log(`   \u2713 ${antes-D.length} estacion(es) fuera de Mexico descartadas`);}
guardarHistorial(D);
// marcar frescura de cada estacion
D.forEach(g=>{g._sin=diasSinReportar(g.id);g._ult=fechaUltimoDato(g.id)});
{const av=D.filter(g=>g._sin>=DIAS_AVISO&&g._sin<DIAS_OCULTA).length;
 const oc=D.filter(g=>g._sin>=DIAS_OCULTA).length;
 if(av||oc)console.log(`   \u2713 frescura: ${av} con aviso, ${oc} inactiva(s) ocultas`);}
// las inactivas salen de las listas publicas
const INACTIVAS=D.filter(g=>g._sin>=DIAS_OCULTA);
const ACT=D.filter(g=>g._sin<DIAS_OCULTA);

// agrupar por estado
const M={};ACT.forEach(g=>{if(g._edo)(M[g._edo]=M[g._edo]||[]).push(g)});
const edos=Object.entries(M).sort((a,b)=>a[0].localeCompare(b[0],'es'));
const conReg=ACT.filter(g=>g.regular);
const prom=t=>{const a=ACT.filter(g=>g[t]);return a.length?a.reduce((s,g)=>s+g[t],0)/a.length:0};
const pReg=prom('regular'),pPre=prom('premium'),pDie=prom('diesel');
const baratas=[...conReg].sort((a,b)=>a.regular-b.regular);

SIDE=`<div class="sttl">Consultar</div><a href="./">Inicio</a><a href="baratas">Más baratas</a><a href="estados">Todos los estados</a><div class="sttl">Estados</div>`+edos.map(([n,l])=>`<a href="estado-${s(n)}">${e(n)}</a>`).join('');
DRAWER=`<a href="./">Inicio</a><a href="baratas">Más baratas de México</a><a href="estados">Todos los estados</a><div class="dsep"></div><div class="dttl">Estados</div>`+edos.map(([n,l])=>`<a href="estado-${s(n)}">${e(n)}<span class="n">${l.length}</span></a>`).join('');

f.rmSync(O,{recursive:true,force:true});f.mkdirSync(P.join(O,'estacion'),{recursive:true});
console.log('📄 Generando HTML:');

// ── PÁGINAS POR MUNICIPIO
const MUN={};
ACT.forEach(g=>{if(g._mun&&g._edo){const k=g._edo+'|'+g._mun;(MUN[k]=MUN[k]||[]).push(g)}});
const muns=Object.entries(MUN).filter(([k,l])=>l.length>=2&&l.some(g=>g.regular)).sort((a,b)=>b[1].length-a[1].length);
const MUNOK=new Set(muns.map(([k])=>k));
const slugMun=(edo,mun)=>`municipio-${s(mun)}-${s(edo)}`;
muns.forEach(([k,lista])=>{
 const [edo,mun]=k.split('|');
 const conR=lista.filter(g=>g.regular).sort((a,b)=>a.regular-b.regular);
 if(!conR.length)return;
 const pr=conR.reduce((a,g)=>a+g.regular,0)/conR.length;
 const pp=(a=>a.length?a.reduce((x,g)=>x+g.premium,0)/a.length:0)(lista.filter(g=>g.premium));
 const pd=(a=>a.length?a.reduce((x,g)=>x+g.diesel,0)/a.length:0)(lista.filter(g=>g.diesel));
 const dif=conR.length>1?conR[conR.length-1].regular-conR[0].regular:0;
 f.writeFileSync(P.join(O,slugMun(edo,mun)+'.html'),L(
  `Gasolina más barata en ${mun}, ${edo} hoy | ${N}`,
  `Precio de gasolina en ${mun}, ${edo} hoy ${HOY}: Magna desde ${mx(conR[0].regular)}. ${lista.length} estaciones comparadas.`,
  `${DOM}/${slugMun(edo,mun)}`,
`<p class="crumb"><a href="./">Inicio</a> › <a href="estados">Estados</a> › <a href="estado-${s(edo)}">${e(edo)}</a> › ${e(mun)}</p>
<h1>Gasolina en ${e(mun)}</h1><p class="sub">${e(edo)} · ${lista.length} estaciones · precios del ${HOY}</p>
<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pr)}</div><div class="cap">promedio local</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${pp?mx(pp):'—'}</div><div class="cap">promedio local</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${pd?mx(pd):'—'}</div><div class="cap">promedio local</div></div>
</div>
${(()=>{let sube=0,baja=0,sumd=0,nd=0;
lista.forEach(g=>{const t=tendencia(g.id,g.regular);if(t&&Math.abs(t.d)>=0.01){t.d>0?sube++:baja++;sumd+=t.d;nd++}});
if(!nd)return '';
const prom2=sumd/nd;
return `<div class="resumen">
<div><div class="k">Cambio promedio</div><div class="v ${prom2>0?'pos':'neg'}">${prom2>0?'+':''}${mx(prom2)}</div><div class="c">respecto al día anterior</div></div>
<div><div class="k">Subieron</div><div class="v">${sube}</div><div class="c">estaciones</div></div>
<div><div class="k">Bajaron</div><div class="v">${baja}</div><div class="c">estaciones</div></div>
</div>`})()}
${dif>0?`<p class="nota">La más barata está en <strong>${mx(conR[0].regular)}</strong> y la más cara en <strong>${mx(conR[conR.length-1].regular)}</strong>. Diferencia de <strong>${mx(dif)}</strong> por litro: <strong>${mx(dif*50)}</strong> en un tanque de 50 L.</p>`:'<p class="nota"></p>'}
<h2>Ordenadas de más barata a más cara</h2>
${tabla(conR)}
<div class="card"><h3>Precios en ${e(mun)}</h3><p>En ${e(mun)}, ${edo}, hay ${lista.length} estaciones que reportan precios a la CRE. El promedio de Magna es ${mx(pr)} por litro${dif>0?`, con ${mx(dif)} de diferencia entre la más económica y la más cara`:''}. Los datos corresponden al reporte del ${HOY} y pueden cambiar durante el día.</p></div>
<p style="margin-top:26px"><a class="btn a" href="estado-${s(edo)}">Ver todo ${e(edo)}</a></p>`));
});
console.log(`   ✓ ${muns.length} páginas de municipio`);

// ── PORTADA
const hero=`<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pReg)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${mx(pPre)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${mx(pDie)}</div><div class="cap">promedio nacional</div></div>
</div><p class="nota">Basado en ${ACT.length.toLocaleString('es-MX')} estaciones · datos de la CRE · ${HOY}</p>`;
const idxMun=JSON.stringify(muns.map(([k,l])=>{const [ed,mu]=k.split('|');
 const cr=l.filter(g=>g.regular);const mn=cr.length?Math.min(...cr.map(g=>g.regular)):0;
 return [mu,ed,slugMun(ed,mu),l.length,mn]}));
const idx=JSON.stringify(ACT.filter(g=>g.regular).slice(0,5000).map(g=>[g.name,g._s,g.regular,(g._mun?g._mun+', ':'')+(g._edo||'')]));
// el indice del buscador va en archivo aparte: la home baja de ~680KB a ~30KB
f.writeFileSync(P.join(O,'busca.json'),`{"e":${idx},"m":${idxMun}}`);
f.writeFileSync(P.join(O,'index.html'),L(
 `Precio de la gasolina hoy en México | ${N}`,
 `Precio de gasolina Magna, Premium y Diésel hoy ${HOY}. Consulta las gasolineras más baratas de México con datos oficiales de la CRE.`,DOM+'/',
`<h1>Precio de la gasolina hoy</h1><p class="sub">Consulta el precio de Magna, Premium y Diésel en ${ACT.length.toLocaleString('es-MX')} gasolineras de México. Datos oficiales, actualizados a diario.</p>
${hero}
<p class="ocres" id="ocres"></p>
<p class="frescas">${INACTIVAS.length?`Ocultamos ${INACTIVAS.length.toLocaleString('es-MX')} estación(es) que llevan más de ${DIAS_OCULTA} días sin reportar precios a la CRE, porque probablemente ya cerraron.`:'Todas las estaciones mostradas reportaron precio en los últimos días.'}</p>
<div class="geo">
<h3>Gasolineras más baratas cerca de ti</h3>
<p>Activa tu ubicación y te mostramos las estaciones más económicas a tu alrededor, ordenadas por precio y distancia.</p>
<button class="geob" id="geoBtn" type="button">📍 Buscar cerca de mí</button>
<div class="geost" id="geoSt"></div>
</div>
<div class="geores" id="geoRes"></div>
<div class="finder"><h3>O busca por nombre</h3><p style="font-size:.88rem;color:#86868b;margin-bottom:12px">Escribe tu municipio o ciudad — por ejemplo: Tlajomulco, Zapopan, Mérida</p><input id="buscador" placeholder="Tu municipio o el nombre de la estación" autocomplete="off" enterkeyhint="search"><div id="resultados"></div></div>
<div class="alerta">
<h3>Avísame cuando baje el precio</h3>
<p>Activa las notificaciones y te avisamos cuando alguna gasolinera cerca de ti baje del precio que elijas.</p>
<div class="row">
<input id="alPrecio" type="number" step="0.10" min="15" max="40" placeholder="23.50" inputmode="decimal">
<button id="alBtn" type="button">Activar alerta</button>
</div>
<div class="est" id="alEst"></div>
</div>

<h2>Las 25 más baratas del país<a class="ver" href="baratas">Ver 200 →</a></h2>
${tabla(baratas.slice(0,25))}
<h2>Consulta por estado<a class="ver" href="estados">Ver todos →</a></h2>
<div class="chips">${edos.slice(0,12).map(([n,l])=>`<a href="estado-${s(n)}">${e(n)}<span class="nm2">${l.length}</span></a>`).join('')}</div>
<div class="card"><h3>¿Cómo funciona?</h3><p>Los precios provienen del reporte público de la Comisión Reguladora de Energía (CRE), que obliga a las estaciones a informar sus precios vigentes. La información se descarga y publica automáticamente cada día, por lo que siempre verás las cifras más recientes disponibles. Ten en cuenta que una estación puede modificar su precio durante el día sin reportarlo de inmediato.</p></div>

<script>
(function(){
var btn=document.getElementById('geoBtn'),st=document.getElementById('geoSt'),res=document.getElementById('geoRes'),GEO=null;
function km(la1,lo1,la2,lo2){
 var R=6371,dLa=(la2-la1)*Math.PI/180,dLo=(lo2-lo1)*Math.PI/180;
 var a=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2);
 return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function fd(d){return d<1?Math.round(d*1000)+' m':d.toFixed(1)+' km'}
function pinta(la,lo){
 var cerca=[];
 for(var i=0;i<GEO.length;i++){
  var g=GEO[i],d=km(la,lo,g[0],g[1]);
  if(d<=15)cerca.push({d:d,g:g});
 }
 if(!cerca.length){st.textContent='No encontramos estaciones en 15 km. Usa el buscador por municipio.';btn.disabled=false;btn.textContent='📍 Buscar cerca de mí';return}
 st.textContent=cerca.length+' estaciones en 15 km a la redonda';
 // dos criterios
 var porDist=cerca.slice().sort(function(a,b){return a.d-b.d});
 // "mejor opción": precio penalizado por distancia (ida y vuelta, ~10 km/L, 50 L de carga)
 var porValor=cerca.slice().sort(function(a,b){
   var ca=a.g[4]*50+(a.d*2/10)*a.g[4], cb=b.g[4]*50+(b.d*2/10)*b.g[4];
   return ca-cb;
 });
 function tabla(arr,modo){
  var h='<table class="tabla"><thead><tr><th></th><th>Estación</th><th>Magna</th><th>Premium</th><th>Diésel</th><th></th></tr></thead><tbody>';
  arr.forEach(function(o,n){
   var g=o.g,cls=(n===0)?' mejor':'';
   var _id=(String(g[3]).match(/-(\\d+)$/)||[])[1]||'';
   h+='<tr data-eid="'+_id+'"><td class="rank">'+(n+1)+'</td><td class="nm"><a href="estacion/'+g[3]+'">'+g[2]+'</a>'
    +'<span class="dist'+cls+'">'+fd(o.d)+'</span><small>'+(g[7]||'')+'</small></td>'
    +'<td class="pr g">$'+g[4].toFixed(2)+'</td><td class="pr">'+(g[5]?'$'+g[5].toFixed(2):'—')+'</td>'
    +'<td class="pr">'+(g[6]?'$'+g[6].toFixed(2):'—')+'</td>'
    +'<td class="oc"><button class="ocb" type="button" data-eid="'+_id+'" data-nom="'+g[2].replace(/"/g,'&quot;')+'" title="Ocultar">&times;</button></td></tr>';
  });
  return h+'</tbody></table>';
 }
 var A=porDist.slice(0,20), B=porValor.slice(0,20);
 var mc=porDist[0], mb=cerca.slice().sort(function(a,b){return a.g[4]-b.g[4]})[0];
 var ahorro=(mc.g[4]-mb.g[4])*50, extra=(mb.d-mc.d)*2/10*mb.g[4];
 var aviso='';
 if(ahorro>8&&mb.d>mc.d){
  var neto=ahorro-extra;
  aviso='<div class="tip">La más cercana está a <strong>'+fd(mc.d)+'</strong> a $'+mc.g[4].toFixed(2)+'. La más barata está a <strong>'+fd(mb.d)+'</strong> a $'+mb.g[4].toFixed(2)+'.<br>Ir hasta allá te ahorra <strong>$'+ahorro.toFixed(2)+'</strong> por tanque, pero gastas ~$'+extra.toFixed(2)+' de combustible extra. '+(neto>15?'<strong>Sí conviene el viaje ('+('$'+neto.toFixed(2))+' netos).</strong>':'<strong>Casi no conviene: mejor la de cerca.</strong>')+'</div>';
 }
 res.innerHTML='<h2>Gasolineras cerca de ti</h2>'
  +'<div class="tabs"><button id="tD" class="on" type="button">Más cercanas</button><button id="tV" type="button">Mejor precio-distancia</button></div>'
  +aviso+'<div id="tabBody">'+tabla(A,'d')+'</div>';
 document.getElementById('tD').addEventListener('click',function(){
  this.classList.add('on');document.getElementById('tV').classList.remove('on');
  document.getElementById('tabBody').innerHTML=tabla(A,'d');
 });
 document.getElementById('tV').addEventListener('click',function(){
  this.classList.add('on');document.getElementById('tD').classList.remove('on');
  document.getElementById('tabBody').innerHTML=tabla(B,'v');
 });
 btn.disabled=false;btn.textContent='📍 Actualizar mi ubicación';
 res.scrollIntoView({behavior:'smooth',block:'nearest'});
}
btn.addEventListener('click',function(){
 if(!navigator.geolocation){st.textContent='Tu navegador no soporta geolocalización.';return}
 btn.disabled=true;btn.textContent='Buscando…';st.textContent='Solicitando permiso de ubicación…';
 navigator.geolocation.getCurrentPosition(function(pos){
  var la=pos.coords.latitude,lo=pos.coords.longitude;
  st.textContent='Ubicación obtenida. Calculando…';
  if(GEO){pinta(la,lo);return}
  fetch('geo.json').then(function(r){return r.json()}).then(function(d){GEO=d;pinta(la,lo)})
   .catch(function(){st.textContent='No pudimos cargar los datos. Reintenta.';btn.disabled=false;btn.textContent='📍 Buscar cerca de mí'});
 },function(err){
  var m='No pudimos obtener tu ubicación.';
  if(err.code===1)m='Permiso denegado. Actívalo en los ajustes del navegador o usa el buscador por municipio.';
  else if(err.code===2)m='Ubicación no disponible. Revisa que el GPS esté encendido.';
  else if(err.code===3)m='Se agotó el tiempo de espera. Reintenta.';
  st.textContent=m;btn.disabled=false;btn.textContent='📍 Buscar cerca de mí';
 },{enableHighAccuracy:true,timeout:12000,maximumAge:300000});
});
})();
<\/script>

<script>
(function(){
var b=document.getElementById('alBtn'),inp=document.getElementById('alPrecio'),est=document.getElementById('alEst');
if(!b)return;
var KEY='al_gmx';
try{var g=JSON.parse(localStorage.getItem(KEY)||'null');
 if(g&&g.p){inp.value=g.p;est.textContent='Alerta activa: te avisamos si baja de $'+Number(g.p).toFixed(2)+'.';b.textContent='Actualizar alerta'}
}catch(e){}
b.addEventListener('click',function(){
 var p=parseFloat(inp.value);
 if(!p||p<15||p>40){est.textContent='Escribe un precio entre $15 y $40.';return}
 if(!('Notification' in window)){est.textContent='Tu navegador no soporta notificaciones.';return}
 b.disabled=true;est.textContent='Solicitando permiso…';
 Notification.requestPermission().then(function(perm){
  b.disabled=false;
  if(perm!=='granted'){est.textContent='Permiso denegado. Actívalo en los ajustes del navegador.';return}
  function guarda(la,lo){
   try{localStorage.setItem(KEY,JSON.stringify({p:p,la:la,lo:lo,t:Date.now()}))}catch(e){}
   est.textContent='Listo. Te avisaremos si una gasolinera cerca baja de $'+p.toFixed(2)+'.';
   b.textContent='Actualizar alerta';
   try{new Notification('Alerta activada',{body:'Te avisaremos cuando el precio baje de $'+p.toFixed(2)+'.',icon:'/favicon.svg'})}catch(e){}
  }
  if(navigator.geolocation){
   navigator.geolocation.getCurrentPosition(
    function(pos){guarda(pos.coords.latitude,pos.coords.longitude)},
    function(){guarda(null,null)},
    {timeout:9000,maximumAge:600000});
  }else guarda(null,null);
 });
});
// revisar al cargar si ya bajó de su umbral
try{
 var cfg=JSON.parse(localStorage.getItem(KEY)||'null');
 if(cfg&&cfg.la&&Notification.permission==='granted'){
  fetch('geo.json').then(function(r){return r.json()}).then(function(D){
   function km(a1,o1,a2,o2){var R=6371,da=(a2-a1)*Math.PI/180,dop=(o2-o1)*Math.PI/180;
    var x=Math.sin(da/2)*Math.sin(da/2)+Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dop/2)*Math.sin(dop/2);
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
   var mejor=null;
   for(var i=0;i<D.length;i++){var g2=D[i];
    if(g2[4]<cfg.p&&km(cfg.la,cfg.lo,g2[0],g2[1])<=15){if(!mejor||g2[4]<mejor[4])mejor=g2}}
   if(mejor){
    var ult=localStorage.getItem(KEY+'_avisado');
    if(ult!==mejor[3]){
     localStorage.setItem(KEY+'_avisado',mejor[3]);
     new Notification('Precio bajo cerca de ti',{body:mejor[2]+' — $'+mejor[4].toFixed(2)+' la Magna',icon:'/favicon.svg'});
    }
   }
  }).catch(function(){});
 }
}catch(e){}
})();
<\/script>
<script>var DB=[],MU=[],_bl=false;
function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function _carga(cb){if(_bl){cb();return}
 fetch('busca.json').then(function(r){return r.json()}).then(function(j){
  DB=j.e;MU=j.m;_bl=true;cb()}).catch(function(){})}
document.getElementById('buscador').addEventListener('input',function(ev){
 var q=nrm(ev.target.value.trim()),o=document.getElementById('resultados');
 if(q.length<3){o.innerHTML='';return}
 if(!_bl){o.innerHTML='<p style="color:#86868b;font-size:.9rem;margin-top:12px">Buscando...</p>';
  _carga(function(){document.getElementById('buscador').dispatchEvent(new Event('input'))});return}
 var mh=[];for(var i=0;i<MU.length&&mh.length<6;i++){if(nrm(MU[i][0]).indexOf(q)>-1)mh.push(MU[i])}
 var eh=[];for(var j=0;j<DB.length&&eh.length<12;j++){if(nrm(DB[j][0]).indexOf(q)>-1||nrm(DB[j][3]).indexOf(q)>-1)eh.push(DB[j])}
 var html='';
 if(mh.length)html+='<p style="font-size:.76rem;text-transform:uppercase;letter-spacing:.05em;color:#86868b;font-weight:600;margin:14px 0 8px">Municipios</p><table class="tabla"><tbody>'+mh.map(function(a){return '<tr><td class="nm"><a href="'+a[2]+'"><strong>'+a[0]+'</strong></a><small>'+a[1]+' · '+a[3]+' estaciones</small></td><td class="pr g">desde $'+a[4].toFixed(2)+'</td></tr>'}).join('')+'</tbody></table>';
 if(eh.length)html+='<p style="font-size:.76rem;text-transform:uppercase;letter-spacing:.05em;color:#86868b;font-weight:600;margin:18px 0 8px">Estaciones</p><table class="tabla"><tbody>'+eh.map(function(a){return '<tr><td class="nm"><a href="estacion/'+a[1]+'">'+a[0]+'</a><small>'+a[3]+'</small></td><td class="pr g">$'+a[2].toFixed(2)+'</td></tr>'}).join('')+'</tbody></table>';
 o.innerHTML=html||'<p style="color:#86868b;font-size:.9rem;margin-top:12px">Sin resultados para "'+ev.target.value+'"</p>';
});<\/script>`));

// ── MÁS BARATAS
f.writeFileSync(P.join(O,'baratas.html'),L(
 `Gasolina más barata de México hoy | ${N}`,
 `Las 200 gasolineras más baratas de México hoy ${HOY}. Precio de Magna desde ${mx(baratas[0].regular)}.`,DOM+'/baratas',
`<p class="crumb"><a href="./">Inicio</a> › Más baratas</p>
<h1>Gasolina más barata de México</h1><p class="sub">Las 200 estaciones con el precio de Magna más bajo del país, según el último reporte de la CRE.</p>
${tabla(baratas.slice(0,200))}`));

// ── ESTADOS (índice)
f.writeFileSync(P.join(O,'estados.html'),L(
 `Precio de la gasolina por estado | ${N}`,
 `Precio promedio de gasolina en los ${edos.length} estados de México. Consulta Magna, Premium y Diésel por entidad.`,DOM+'/estados',
`<p class="crumb"><a href="./">Inicio</a> › Estados</p>
<h1>Precio por estado</h1><p class="sub">${edos.length} entidades · ${D.length.toLocaleString('es-MX')} estaciones registradas</p>
<div class="chips">${edos.map(([n,l])=>`<a href="estado-${s(n)}">${e(n)}<span class="nm2">${l.length}</span></a>`).join('')}</div>`));

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
  `${DOM}/estado-${s(n)}`,
`<p class="crumb"><a href="./">Inicio</a> › <a href="estados">Estados</a> › ${e(n)}</p>
<h1>Gasolina en ${e(n)}</h1><p class="sub">${lista.length} estaciones registradas · precios del ${HOY}</p>
<div class="hero">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pr)}</div><div class="cap">promedio en ${e(n)}</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${pp?mx(pp):'—'}</div><div class="cap">promedio en ${e(n)}</div></div>
<div class="hbox die"><div class="lbl">Diésel</div><div class="val">${pd?mx(pd):'—'}</div><div class="cap">promedio en ${e(n)}</div></div>
</div>
${dif>0?`<p class="nota">Diferencia entre la más cara y la más barata: <strong>${mx(dif)}</strong> por litro. En un tanque de 50 litros son <strong>${mx(dif*50)}</strong> de ahorro.</p>`:'<p class="nota"></p>'}
${(()=>{const mm={};lista.forEach(g=>{if(g._mun)(mm[g._mun]=mm[g._mun]||[]).push(g)});
const arr=Object.entries(mm).filter(([m,l])=>MUNOK.has(n+'|'+m)).sort((a,b)=>b[1].length-a[1].length);
return arr.length?`<h2>Busca por municipio</h2><div class="chips">${arr.map(([m,l])=>`<a href="municipio-${s(m)}-${s(n)}">${e(m)}<span class="nm2">${l.length}</span></a>`).join('')}</div>`:''})()}
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
  `${DOM}/estacion/${g._s}`,
`<p class="crumb"><a href="../">Inicio</a>${g._edo?` › <a href="../estado-${s(g._edo)}">${e(g._edo)}</a>`:''}${(g._mun&&g._edo&&MUNOK.has(g._edo+'|'+g._mun))?` › <a href="../municipio-${s(g._mun)}-${s(g._edo)}">${e(g._mun)}</a>`:''} › ${e(g.name)}</p>
<h1>${e(g.name)}</h1><p class="sub">${g._mun?e(g._mun)+', ':''}${g._edo?e(g._edo)+' · ':''}${g._sin>=DIAS_AVISO?`Último dato: ${fmtFecha(g._ult)}`:`Precios del ${HOY}`}</p>
${g._sin>=DIAS_OCULTA?`<div class="avisoX"><strong>Esta estación podría estar cerrada.</strong> Lleva ${g._sin} días sin reportar precios a la CRE. Los datos que ves son del ${fmtFecha(g._ult)||'último reporte disponible'}. Te recomendamos confirmar antes de ir.</div>`:(g._sin>=DIAS_AVISO?`<div class="avisoW"><strong>Datos no actualizados.</strong> Esta estación no ha reportado precios en ${g._sin} días. La información es del ${fmtFecha(g._ult)||'último reporte'}.</div>`:'')}
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
<button class="btn r ocb" type="button" data-eid="${g.id}" data-nom="${e(g.name)}">Ocultar esta estación</button>
<a class="btn r" href="mailto:${MAIL}?subject=${encodeURIComponent('Reporte: '+g.name+' (ID '+g.id+')')}&body=${encodeURIComponent('Reporto un problema con esta estacion:\n\n'+g.name+'\n'+(g._mun||'')+', '+(g._edo||'')+'\nID CRE: '+g.id+'\n'+DOM+'/estacion/'+g._s+'\n\nQue pasa? (borra lo que no aplique)\n- Ya cerro / no existe\n- El precio no coincide\n- La ubicacion esta mal\n- Otro:\n\n')}">Reportar un problema</a>
${(g._mun&&g._edo&&MUNOK.has(g._edo+'|'+g._mun))?`<a class="btn a" href="../municipio-${s(g._mun)}-${s(g._edo)}">Más baratas en ${e(g._mun)}</a>`:(g._edo?`<a class="btn a" href="../estado-${s(g._edo)}">Más baratas en ${e(g._edo)}</a>`:'')}
${(()=>{const r=rango(g.id),t=tendencia(g.id,g.regular),v=serie(g.id);
if(!r||r.n<2)return '';
const w=600,h=150,mn=r.min,mx2=r.max,rg=(mx2-mn)||1;
const pts=v.map((p,i)=>`${(i/(v.length-1)*w).toFixed(1)},${(h-((p-mn)/rg)*h*0.78-h*0.11).toFixed(1)}`).join(' ');
const area=`0,${h} `+pts+` ${w},${h}`;
const sube=v[v.length-1]>v[0], col=sube?'#dc2626':'#16a34a';
return `<div class="hcard"><h3>Histórico de precio</h3><div class="hsub">Magna · últimos ${r.n} día(s) registrados</div>
<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="${area}" fill="${col}" opacity=".08"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
<div class="hstats">
<div><b>Mínimo</b>${mx(r.min)}</div>
<div><b>Máximo</b>${mx(r.max)}</div>
<div><b>Actual</b>${g.regular?mx(g.regular):'—'}</div>
${t?`<div><b>vs. ayer</b>${t.d>0?'+':''}${mx(t.d)}</div>`:''}
</div></div>`})()}
${(()=>{
// ── datos unicos de ESTA estacion: ranking, ahorro real, vecinas cercanas
if(!g.regular)return `<div class="card"><h3>Análisis de precio</h3><p>${e(g.name)} no reportó precio de Magna en el corte de la CRE del ${HOY}.</p></div>`;
const kMun=g._edo+'|'+g._mun, grupo=(MUNOK.has(kMun)?MUN[kMun]:(M[g._edo]||[])).filter(x=>x.regular);
const ambito=MUNOK.has(kMun)?g._mun:g._edo;
const ord=[...grupo].sort((a,b)=>a.regular-b.regular);
const pos=ord.findIndex(x=>x.id===g.id)+1, tot=ord.length;
const barata=ord[0], cara=ord[ord.length-1];
const promL=grupo.reduce((a,x)=>a+x.regular,0)/grupo.length;
const vsL=g.regular-promL;
const pct=tot>1?Math.round((1-(pos-1)/(tot-1))*100):100;
// vecinas por distancia real
let vec=[];
if(isFinite(g.x)&&isFinite(g.y)){
 const R=6371,rad=v=>v*Math.PI/180;
 vec=grupo.filter(x=>x.id!==g.id&&isFinite(x.x)&&isFinite(x.y)).map(x=>{
  const da=rad(x.y-g.y),dl=rad(x.x-g.x);
  const q=Math.sin(da/2)**2+Math.cos(rad(g.y))*Math.cos(rad(x.y))*Math.sin(dl/2)**2;
  return {g:x,d:R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}})
  .filter(v2=>v2.d<=8).sort((a,b)=>a.d-b.d).slice(0,6);
}
const masBarata=vec.filter(v2=>v2.g.regular<g.regular).sort((a,b)=>a.g.regular-b.g.regular)[0];
const ahorro40=masBarata?(g.regular-masBarata.g.regular)*40:0;
const veredicto=pct>=80?['barata','#16a34a']:pct>=55?['competitiva','#0071e3']:pct>=30?['promedio','#86868b']:['cara','#dc2626'];
return `<div class="card"><h3>Análisis de precio</h3>
<p><strong>${e(g.name)}</strong> vende la Magna en <strong>${mx(g.regular)}</strong> por litro. Dentro de ${e(ambito)} ocupa el <strong>lugar ${pos} de ${tot}</strong> estaciones ordenadas de más barata a más cara, lo que la coloca como una gasolinera <strong style="color:${veredicto[1]}">${veredicto[0]}</strong> de la zona.</p>
<p>El promedio local es de ${mx(promL)}, así que esta estación está ${Math.abs(vsL)<0.05?'prácticamente en el promedio':(vsL>0?`<strong>${mx(Math.abs(vsL))} arriba</strong>`:`<strong>${mx(Math.abs(vsL))} abajo</strong>`)} de lo que se cobra en ${e(ambito)}. Contra el promedio nacional de ${mx(pReg)} la diferencia es de ${vsNal>0?'+':''}${mx(vsNal)}.</p>
${masBarata?`<p>A ${masBarata.d<1?Math.round(masBarata.d*1000)+' metros':masBarata.d.toFixed(1)+' km'} está <a href="${masBarata.g._s}">${e(masBarata.g.name)}</a> vendiendo a ${mx(masBarata.g.regular)}. Llenar un tanque de 40 litros ahí te ahorra <strong>${mx(ahorro40)}</strong>.</p>`:`<p>De las estaciones a menos de 8 km, ninguna vende la Magna más barata que esta. ${vec.length?`Es la mejor opción de las ${vec.length+1} que hay en el radio.`:''}</p>`}
${g.premium?`<p>El Premium está en ${mx(g.premium)}${g.regular?`, es decir ${mx(g.premium-g.regular)} más que la Magna`:''}. `:''}${g.diesel?`${g.premium?'El':'<p>El'} Diésel en ${mx(g.diesel)}. `:''}${(g.premium||g.diesel)?'</p>':''}
<p>El rango en ${e(ambito)} va de ${mx(barata.regular)} hasta ${mx(cara.regular)}: una diferencia de <strong>${mx(cara.regular-barata.regular)}</strong> por litro, o ${mx((cara.regular-barata.regular)*40)} en un tanque de 40 litros. Datos del reporte oficial de la CRE del ${HOY}.</p></div>
${vec.length?`<div class="card"><h3>Gasolineras a menos de 8 km</h3><table class="tabla"><thead><tr><th>Estación</th><th>Distancia</th><th>Magna</th><th>Diferencia</th></tr></thead><tbody>${vec.map(v2=>{
 const df=v2.g.regular-g.regular;
 return `<tr><td class="nm"><a href="${v2.g._s}">${e(v2.g.name)}</a></td><td class="pr">${v2.d<1?Math.round(v2.d*1000)+' m':v2.d.toFixed(1)+' km'}</td><td class="pr g">${mx(v2.g.regular)}</td><td class="pr" style="color:${df<0?'#16a34a':df>0?'#dc2626':'#86868b'}">${df>0?'+':''}${Math.abs(df)<0.005?'igual':mx(df)}</td></tr>`}).join('')}</tbody></table></div>`:''}`})()}
${mismos.length?`<h2>Otras estaciones en ${e(g._edo)}</h2>${tabla(mismos,'../')}`:''}
<script type="application/ld+json">${JSON.stringify(jl)}<\/script>`,'../',true));
});
console.log(`   ✓ ${D.length.toLocaleString('es-MX')} fichas de estación`);


// ══════════ PAGINAS LEGALES ══════════
const LEG=(t,d,f,b)=>f&&f;
const pgLegal=(archivo,titulo,desc,cuerpo)=>{
 f.writeFileSync(P.join(O,archivo),L(`${titulo} | ${N}`,desc,`${DOM}/${archivo.replace('.html','')}`,
 `<p class="crumb"><a href="./">Inicio</a> › ${e(titulo)}</p><div class="legal"><h1>${e(titulo)}</h1><p class="fecha">Última actualización: ${HOY}</p>${cuerpo}</div>`));
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
<p>Para más detalle consulte nuestra <a href="cookies">política de cookies</a>.</p>

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
<p>Consulte también nuestro <a href="aviso-de-privacidad">aviso de privacidad</a>. Si tiene dudas, escríbanos a <a href="mailto:${MAIL}">${MAIL}</a>.</p>`);

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
<p>Para solicitudes relacionadas con datos personales, consulte el <a href="aviso-de-privacidad">aviso de privacidad</a> y escriba al mismo correo indicando su petición.</p>

<h2>Prensa y colaboraciones</h2>
<p>Para consultas de medios o propuestas de colaboración, utilice el correo anterior indicando el asunto.</p>`);
console.log(`   ✓ 4 páginas legales`);

// ── EXTRAS
f.writeFileSync(P.join(O,'s.css'),CSS);
// og.png para redes sociales (WhatsApp, Facebook, X)
try{f.writeFileSync(P.join(O,'og.png'),ogPNG(
 'GASOLINA HOY',
 `PRECIOS OFICIALES DE LA CRE EN ${D.length.toLocaleString('en-US')} GASOLINERAS`,
 mx(pReg),mx(pPre),mx(pDie),
 `GASOLINAMX.PAGES.DEV  -  ${HOY.toUpperCase()}`));
 console.log('   \u2713 og.png generado')}catch(err){console.log('   og.png fallo:',err.message)}
// índice geográfico para "cerca de mí" (se carga solo al pedirlo)
f.writeFileSync(P.join(O,'geo.json'),JSON.stringify(
 ACT.filter(g=>isFinite(g.x)&&isFinite(g.y)&&g.regular)
  .map(g=>[+g.y.toFixed(5),+g.x.toFixed(5),g.name,g._s,g.regular,g.premium||0,g.diesel||0,g._mun||''])
));
// ── sw.js de Monetag (verificacion + push notifications)
f.writeFileSync(P.join(O,'sw.js'), `self.options = {
    "domain": "3nbf4.com",
    "zoneId": 11471523
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
`);

// ── compatibilidad: algunos verificadores piden /index.html explícitamente
f.writeFileSync(P.join(O,'_redirects'),'/index.html / 200\n');
// ── 404 real. Sin este archivo Cloudflare respondia 200 con la portada
//    en cualquier URL inventada = soft-404, Google lo castiga.
f.writeFileSync(P.join(O,'404.html'),L(
 `Página no encontrada | ${N}`,
 'La página que buscas no existe. Consulta los precios de gasolina por estado o municipio.',
 DOM+'/404',
`<div class="legal" style="text-align:center;padding:60px 0">
<h1 style="font-size:4.5rem;margin-bottom:6px">404</h1>
<p class="sub" style="margin:0 auto 30px">No encontramos esa página. Puede que el enlace esté mal escrito o que la estación ya no exista en el reporte de la CRE.</p>
<p style="margin-bottom:34px"><a class="btn" href="/">Ir al inicio</a> <a class="btn a" href="/estados">Ver todos los estados</a></p>
<div class="hero" style="max-width:660px;margin:0 auto 18px">
<div class="hbox reg"><div class="lbl">Magna</div><div class="val">${mx(pReg)}</div><div class="cap">promedio nacional</div></div>
<div class="hbox pre"><div class="lbl">Premium</div><div class="val">${mx(pPre)}</div><div class="cap">promedio nacional</div></div>
</div>
<p class="nota">Precios del ${HOY} · datos oficiales de la CRE</p>
</div>`,'',true));
f.writeFileSync(P.join(O,'_headers'),
`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Cache-Control: public, max-age=600, stale-while-revalidate=86400

/*.json
  Cache-Control: public, max-age=600, s-maxage=3600, stale-while-revalidate=86400

/s.css
  Cache-Control: public, max-age=3600, stale-while-revalidate=604800
/favicon.svg
  Cache-Control: public, max-age=86400
/og.png
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/sw.js
  Cache-Control: no-cache
`);

f.writeFileSync(P.join(O,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34" fill="none" stroke="#1d1d1f" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 31V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v26"/><path d="M1.5 31h16"/><path d="M6 8h7v5H6z"/><path d="M16 12h4a2 2 0 0 1 2 2v10a2.5 2.5 0 0 0 5 0V13l-3.5-4"/></svg>');
// El sitemap solo lleva paginas con contenido unico. Las 13,797 fichas de estacion
// son 99% identicas entre si (thin content) -> llevan noindex y NO van al sitemap.
const U=['','baratas','estados','aviso-de-privacidad','terminos','cookies','contacto'].concat(edos.map(([n])=>`estado-${s(n)}`)).concat(muns.map(([k])=>{const[ed,mu]=k.split('|');return slugMun(ed,mu)}));
f.writeFileSync(P.join(O,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+U.map(u=>`<url><loc>${DOM}/${u}</loc><lastmod>${ISO}</lastmod></url>`).join('\n')+'\n</urlset>');
f.writeFileSync(P.join(O,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${DOM}/sitemap.xml\n`);
console.log(`   ✓ sitemap.xml (${U.length.toLocaleString('es-MX')} URLs) + robots.txt`);
let by=0,ct=0;(function W(d){f.readdirSync(d,{withFileTypes:true}).forEach(x=>{const p=P.join(d,x.name);x.isDirectory()?W(p):(by+=f.statSync(p).size,ct++)})})(O);
console.log(`\n✅ LISTO — ${ct.toLocaleString('es-MX')} archivos, ${(by/1048576).toFixed(1)} MB\n`);
})();
