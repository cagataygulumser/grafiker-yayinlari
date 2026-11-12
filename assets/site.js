(function(){
"use strict";
var G=window.GY||{},A=(G.assets||"/").replace(/\/?$/,"/"),D=document;
var $=function(s,r){return (r||D).querySelector(s)},esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var norm=function(s){return String(s||"").replace(/İ/g,"i").replace(/I/g,"ı").toLowerCase().replace(/[âàá]/g,"a").replace(/[îíì]/g,"i").replace(/[ûúù]/g,"u").replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u").replace(/[^a-z0-9]+/g," ").trim()};
var MARK='';
var DB=null,CAT={},BY={};
function load(){
  return fetch(A+"data/books.json?v="+(G.v||"1")).then(function(r){return r.json()}).then(function(d){
    DB=d;d.cats.forEach(function(c){CAT[c.id]=c});
    d.books.forEach(function(b){BY[b.i]=b;b._n=norm(b.t+" "+(b.n||"")+" "+(b.isbn||""))});
    d.books.sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:b.i-a.i});
    return d});
}
function burl(b){return b.u||("/kitap/"+b.s+".html")}
function curl(c){return "/search/label/"+encodeURIComponent(c.name)}
function purl(k){return (DB&&DB.pages&&DB.pages[k])||("/p/"+k+".html")}
function card(b){return '<a class="gy-card" href="'+burl(b)+'"><span class="c"><img loading="lazy" width="146" height="226" src="'+A+'img/k/'+b.i+'.jpg" alt=""></span><b>'+esc(b.t)+'</b>'+(b.a?'<span>'+esc(b.a)+'</span>':'')+(b.o?'<i>Tükendi</i>':'')+'</a>'}
function tocRow(c){return '<a href="'+curl(c)+'"><span class="gy-sw" style="background:'+c.color+'"></span><span class="gy-nm">'+esc(c.name)+'</span><span class="gy-dots"></span><span class="gy-num">'+c.count+'</span></a>'}

/* ---------- üst menü ---------- */
function chrome(){
  var s=$("#gy-series");if(s)s.innerHTML=DB.cats.filter(function(c){return c.count}).map(tocRow).join("")+'<a href="/search"><span class="gy-sw" style="background:#231F20"></span><span class="gy-nm"><b>Tüm kitaplar</b></span><span class="gy-dots"></span><span class="gy-num">'+DB.books.length+'</span></a>';
  D.querySelectorAll("[data-page]").forEach(function(a){a.href=purl(a.getAttribute("data-page"))});
  D.querySelectorAll("[data-asset]").forEach(function(a){a.href=A+a.getAttribute("data-asset")});
  D.addEventListener("click",function(e){
    var b=e.target.closest(".gy-dd>button");
    D.querySelectorAll(".gy-dd.open").forEach(function(d){if(!b||d!==b.parentNode)d.classList.remove("open")});
    if(b){var o=b.parentNode.classList.toggle("open");b.setAttribute("aria-expanded",o)}
    if(e.target.closest(".gy-burger"))$(".gy-nav").classList.toggle("open");
    if(e.target.closest(".gy-search-btn"))openSearch();
    if(e.target.closest(".gy-over .x"))closeSearch();
  });
  D.addEventListener("keydown",function(e){if(e.key==="Escape"){closeSearch();D.querySelectorAll(".gy-dd.open").forEach(function(d){d.classList.remove("open")})}
    if(e.key==="/"&&!/input|textarea|select/i.test(D.activeElement.tagName)){e.preventDefault();openSearch()}});
}
var over;
function openSearch(){
  if(!over){over=D.createElement("div");over.className="gy-over";over.innerHTML='<form action="/search" role="search"><input name="q" type="search" autocomplete="off" placeholder="Kitap, yazar ya da ISBN" aria-label="Katalogda ara"><button type="button" class="x">Kapat</button></form><div class="gy-sug"></div>';D.body.appendChild(over);
    var inp=$("input",over),sug=$(".gy-sug",over);
    inp.addEventListener("input",function(){var r=find(inp.value).slice(0,8);sug.innerHTML=r.map(function(b){return '<a href="'+burl(b)+'"><img src="'+A+'img/k/'+b.i+'.jpg" alt=""><span><b>'+esc(b.t)+'</b><span>'+esc(b.a||"")+'</span></span></a>'}).join("")+(inp.value.trim().length>1&&!r.length?'<p class="gy-empty">Bu aramayla eşleşen kitap yok.</p>':"")});}
  over.classList.add("on");$("input",over).focus();
}
function closeSearch(){if(over)over.classList.remove("on")}
function find(q){var w=norm(q).split(" ").filter(Boolean);if(!w.length||(w.length==1&&w[0].length<2))return[];
  return DB.books.filter(function(b){return w.every(function(x){return b._n.indexOf(x)>-1})}).sort(function(a,b){var x=norm(a.t).indexOf(w[0]),y=norm(b.t).indexOf(w[0]);return (x<0?999:x)-(y<0?999:y)})}

/* ---------- raf ---------- */
function spine(b,i){
  var th=Math.max(26,Math.min(64,Math.round((b.p||260)/9.5))),h=Math.round(Math.max(200,Math.min(360,(b.e||23.5)*13.2)));
  var fs=th<30?12.5:th<38?14:th<50?15.5:17,lines=th<34?1:th<52?2:3;
  var sur=(b.a||"").split(",")[0].replace(/\s+ve diğerleri$/,"").replace(/^(Ed\.|Hazırlayan(lar)?:|Çeviri:)\s*/,"").replace(/\b(Prof|Doç|Dr|Yrd|Öğr|Üyesi|Arş|Gör|Av|Uzm)\.?\s+/g,"");
  return '<a class="gy-spine'+(b.kd?" dark":"")+'" href="'+burl(b)+'" data-id="'+b.i+'" style="--i:'+i+';width:'+th+'px;height:'+h+'px;background:'+(b.k||"#444")+'" aria-label="'+esc(b.t)+'"><span class="t" style="font-size:'+fs+'px;-webkit-line-clamp:'+lines+';max-width:'+(th-8)+'px">'+esc(b.t)+'</span>'+(sur&&h>240?'<span class="a">'+esc(sur)+'</span>':'')+'<span class="m"></span></a>';
}
function shelf(el,books){
  el.classList.remove("in");
  el.innerHTML=books.map(function(b,i){return spine(b,i)}).join("");
  var sp=el.children;if(sp.length>14){var L=sp[Math.floor(sp.length*.62)];L.classList.add("lean");L.style.marginLeft=Math.round(parseInt(L.style.height)*.108)+"px"}
  void el.offsetWidth;el.classList.add("in");
}
function pick(n){
  var pool=DB.books.filter(function(b){return b.k}),feat=(DB.featured||[]).map(function(i){return BY[i]}).filter(Boolean),out=[],seen={};
  function add(b){if(b&&!seen[b.i]){seen[b.i]=1;out.push(b)}}
  for(var i=0;i<feat.length;i++)if(Math.random()<.55)add(feat[i]);
  while(out.length<n&&out.length<pool.length)add(pool[Math.floor(Math.random()*pool.length)]);
  for(i=out.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=out[i];out[i]=out[j];out[j]=t}
  return out;
}
function tips(el){
  var tip=D.createElement("div");tip.className="gy-tip";D.body.appendChild(tip);
  function show(a){var b=BY[a.getAttribute("data-id")];if(!b)return;
    tip.innerHTML='<img src="'+A+'img/k/'+b.i+'.jpg" alt=""><div><b>'+esc(b.t)+'</b><span>'+esc(b.a||"")+'</span><span>'+esc((CAT[b.c[0]]||{}).name||"")+'</span></div>';
    var r=a.getBoundingClientRect(),x=Math.max(12,Math.min(window.innerWidth-342,r.left+r.width/2-165));
    tip.style.left=(x+window.scrollX)+"px";tip.style.top=(r.top+window.scrollY-tip.offsetHeight-26)+"px";tip.classList.add("on")}
  el.addEventListener("mouseover",function(e){var a=e.target.closest(".gy-spine");if(a)show(a)});
  el.addEventListener("focusin",function(e){var a=e.target.closest(".gy-spine");if(a)show(a)});
  el.addEventListener("mouseleave",function(){tip.classList.remove("on")});
  el.addEventListener("focusout",function(){tip.classList.remove("on")});
}

/* ---------- ana sayfa ---------- */
function home(root){
  var cats=DB.cats.filter(function(c){return c.count}),n=DB.books.length;
  var newest=DB.books.slice(0,8),feat=(DB.featured||[]).map(function(i){return BY[i]}).filter(Boolean);
  root.innerHTML=
  '<section class="gy-hero"><div class="gy-wrap"><h1>Bilgiyle kalın.</h1><div class="gy-hero-row"><p>Grafiker Yayınları 2001’den beri Ankara’da kitap yayımlıyor. Katalogda Türk dili, edebiyatı, tarihi ve ilahiyat başta olmak üzere '+cats.length+' dizide '+n+' kitap var.</p>'+
  '<form class="gy-find" action="/search" role="search"><input type="search" name="q" placeholder="Kitap, yazar ya da ISBN" aria-label="Katalogda ara"><button>Ara</button></form></div></div>'+
  '<div class="gy-shelf-wrap"><div class="gy-shelf" id="gy-shelf"></div><div class="gy-board"></div><div class="gy-wrap gy-shelf-tools"><span>Sırt kalınlığı sayfa sayısına, boyu kitabın ebadına göre. Kitabı açmak için sırtına tıklayın.</span><button class="gy-link" id="gy-shuffle">Rafı yenile</button></div></div></section>'+
  '<div class="gy-wrap"><div class="gy-sec gy-two"><div><h2>Diziler</h2><p class="gy-lead">Her dizinin yanındaki sayı, o dizideki kitap sayısı.</p><nav class="gy-toc" aria-label="Diziler">'+cats.map(tocRow).join("")+'<a class="gy-all" href="/search"><span class="gy-nm">Tüm kitaplar</span><span class="gy-dots"></span><span class="gy-num">'+n+'</span></a></nav></div>'+
  '<div><h2>Yeni çıkanlar</h2><p class="gy-lead">Kataloğa en son eklenen sekiz kitap.</p><div class="gy-grid gy-4">'+newest.map(card).join("")+'</div></div></div></div>'+
  '<div class="gy-band"><div class="gy-wrap"><div class="gy-sec"><h2>El kitapları</h2><p class="gy-lead">Grafiker’in uzmanlık alanı çok yazarlı el kitapları: bir alanı, o alanda çalışan akademisyenlerin birlikte yazdığı tek ciltte toplayan başvuru kitapları.</p><div class="gy-row">'+feat.map(card).join("")+'</div></div></div></div>'+
  '<div class="gy-wrap"><div class="gy-sec"><h2>Uluslararası yayınevi</h2><p class="gy-lead">Grafiker Yayınları, akademik teşvik ve doçentlik başvurularında aranan “tanınmış uluslararası yayınevi” ölçütlerini karşılar. Belgeyi ve yıllık yayın indekslerini buradan indirebilirsiniz.</p>'+
  '<div class="gy-docs-list"><a class="gy-btn" href="'+A+'belgeler/uluslararasi-yayinevi-belgesi.pdf">Uluslararası Yayınevi Belgesi (PDF)</a><a class="gy-btn" href="'+A+'belgeler/yayin-indeksleri-2023.pdf">Yayın indeksleri 2023 (PDF)</a><a class="gy-btn" href="'+A+'belgeler/yayin-indeksleri-2022.pdf">Yayın indeksleri 2022 (PDF)</a></div></div></div>';
  var el=$("#gy-shelf"),cnt=Math.max(18,Math.min(46,Math.round(window.innerWidth/30)));
  shelf(el,pick(cnt));tips(el);
  $("#gy-shuffle").addEventListener("click",function(){shelf(el,pick(cnt));el.scrollLeft=0});
}

/* ---------- liste (dizi / arama / tümü) ---------- */
function list(root,opt){
  var base=opt.books,c=opt.cat;
  root.innerHTML='<div class="gy-wrap gy-list"><div class="gy-list-head"><p class="gy-crumb"><a href="/">Ana sayfa</a> / <a href="/search">Kitaplar</a></p><h1>'+(c?'<span class="gy-sw" style="background:'+c.color+'"></span>':'')+esc(opt.title)+'</h1><p id="gy-count"></p>'+
  '<div class="gy-tools"><input type="search" id="gy-f" placeholder="'+(opt.q!=null?"Aramayı değiştir":"Bu listede ara")+'" value="'+esc(opt.q||"")+'" aria-label="Listede ara"><select id="gy-s" aria-label="Sıralama"><option value="new">Yeniden eskiye</option><option value="az">A’dan Z’ye</option><option value="pg">Sayfa sayısına göre</option></select><label><input type="checkbox" id="gy-o"> Tükenenleri gizle</label></div></div><div class="gy-grid" id="gy-g"></div></div>';
  var f=$("#gy-f"),s=$("#gy-s"),o=$("#gy-o"),g=$("#gy-g"),cn=$("#gy-count");
  function draw(){
    var q=f.value,r=opt.q!=null?(q.trim()?find(q):[]):(q.trim()?base.filter(function(b){return norm(q).split(" ").every(function(x){return b._n.indexOf(x)>-1})}):base.slice());
    if(o.checked)r=r.filter(function(b){return !b.o});
    if(s.value==="az")r.sort(function(a,b){return a.t.localeCompare(b.t,"tr")});
    else if(s.value==="pg")r.sort(function(a,b){return (b.p||0)-(a.p||0)});
    else if(opt.q==null||s.dataset.t)r.sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0});
    cn.textContent=r.length+" kitap";
    g.innerHTML=r.length?r.map(card).join(""):'<p class="gy-empty">'+(opt.q!=null&&!q.trim()?"Aramak için kitap adı, yazar ya da ISBN yazın.":"Bu ölçütlere uyan kitap yok. Aramayı kısaltmayı ya da başka bir diziye bakmayı deneyin.")+'</p>';
  }
  f.addEventListener("input",draw);s.addEventListener("change",function(){s.dataset.t=1;draw()});o.addEventListener("change",draw);draw();
}

/* ---------- kitap sayfası ---------- */
function book(art){
  var bk=$(".gy-book",art);if(!bk){art.classList.add("is-page");return}
  art.classList.add("is-book");
  var b=BY[bk.getAttribute("data-id")];if(!b)return;
  var c=CAT[b.c[0]];
  var cr=D.createElement("p");cr.className="gy-crumb";cr.innerHTML='<a href="/">Ana sayfa</a> / <a href="/search">Kitaplar</a>'+(c?' / <a href="'+curl(c)+'">'+esc(c.name)+'</a>':'');
  art.insertBefore(cr,art.firstChild);
  var dz=$(".gy-dizi",bk);if(dz)dz.innerHTML=b.c.map(function(i){return CAT[i]?'<a href="'+curl(CAT[i])+'">'+esc(CAT[i].name)+'</a>':""}).filter(Boolean).join(", ");
  var rel=DB.books.filter(function(x){return x.i!==b.i&&x.c.indexOf(b.c[0])>-1});
  var ix=0;rel.forEach(function(x,i){if(Math.abs(x.i-b.i)<Math.abs(rel[ix].i-b.i))ix=i});
  rel=rel.slice(Math.max(0,Math.min(rel.length-7,ix-3)),Math.max(0,Math.min(rel.length-7,ix-3))+7);
  if(rel.length){var sec=D.createElement("section");sec.className="gy-related";sec.innerHTML='<h2>'+esc(c?c.name:"Aynı dizi")+' içinden</h2><div class="gy-row">'+rel.map(card).join("")+'</div>';art.parentNode.insertBefore(sec,art.nextSibling)}
}

/* ---------- eski adresler ---------- */
function legacy(){
  var p=decodeURIComponent(location.pathname),m=p.match(/\/sayfa\/(\d+)\.aspx$/i);
  if(m){var id=+m[1];if(BY[id]&&BY[id].u)return location.replace(BY[id].u),true;if(CAT[id])return location.replace(curl(CAT[id])),true}
  if(/hakkimizda\.aspx$/i.test(p))return location.replace(purl("hakkimizda")),true;
  if(/iletisim\.aspx$/i.test(p))return location.replace(purl("iletisim")),true;
  if(/default\.aspx$/i.test(p)||/^\/tr\/?$/i.test(p))return location.replace("/"),true;
  return false;
}

load().then(function(){
  chrome();
  var root=$("#gy-app"),art=$(".gy-post"),view=D.body.classList.contains("gy-is-error")?"error":(D.body.getAttribute("data-view")||"");
  var p=location.pathname,qs=new URLSearchParams(location.search);
  if(art){book(art);return}
  if(view==="error"||/\.aspx$/i.test(p)){if(legacy())return;root.innerHTML='<div class="gy-notfound"><h1>Bu sayfa rafta yok.</h1><p>Adres değişmiş ya da kitap katalogdan kaldırılmış olabilir. <a class="gy-link" href="/search">Tüm kitaplara</a> bakabilir ya da üstteki aramayı kullanabilirsiniz.</p></div>';return}
  var m=p.match(/^\/search\/label\/(.+)$/);
  if(m){var nm=decodeURIComponent(m[1]),c=DB.cats.filter(function(x){return x.name===nm})[0];
    if(c)return list(root,{title:c.name,cat:c,books:DB.books.filter(function(b){return b.c.indexOf(c.id)>-1})})}
  if(p.indexOf("/search")===0){var q=qs.get("q");return q!=null?list(root,{title:"Arama",q:q,books:DB.books}):list(root,{title:"Tüm kitaplar",books:DB.books})}
  home(root);
}).catch(function(e){console.error("[GY]",e)});
})();
