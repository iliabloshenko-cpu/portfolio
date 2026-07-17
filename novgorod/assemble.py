# -*- coding: utf-8 -*-
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
data = (BASE_DIR / 'data.json').read_text(encoding='utf-8')


def load_yandex_maps_key():
    key = os.environ.get('YANDEX_MAPS_API_KEY', '').strip()
    env_path = BASE_DIR / '.env.local'
    if not key and env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            name, separator, value = line.partition('=')
            if separator and name.strip() == 'YANDEX_MAPS_API_KEY':
                key = value.strip().strip('"').strip("'")
                break
    if not key:
        raise SystemExit(
            'Не найден YANDEX_MAPS_API_KEY. Добавьте его в novgorod/.env.local '
            'или передайте через переменную окружения.'
        )
    return key


yandex_maps_key = load_yandex_maps_key()

HTML = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Маршрут по Нижнему Новгороду на 23–26 июля 2026: карта, места, еда и концерты.">
<meta name="theme-color" content="#171230">
<title>Нижний Новгород · 23–26 июля 2026</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Oranienbaum&display=swap');
:root{
  --paper:#FBF7EF; --paper2:#F3ECDF;
  --ink:#221B33; --muted:#7C7290;
  --night:#171230; --night2:#2A2150;
  --gold:#E0913C; --gold-soft:#F2A65A;
  --rose:#D9566B; --violet:#7A5CC8;
  --line:rgba(34,27,51,.10); --lineD:rgba(245,239,230,.14);
  --shadow:0 6px 24px rgba(34,20,60,.10);
}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  background:var(--paper); color:var(--ink);
  font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  line-height:1.5;
}
.wrap{max-width:1080px;margin:0 auto;padding:0 14px 56px}

/* header */
.top{padding:26px 4px 8px;text-align:center}
.eyebrow{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
.top h1{font-family:'Oranienbaum',Georgia,serif;font-weight:400;font-size:40px;line-height:1.04;letter-spacing:.01em}
.top .dates{color:var(--muted);font-size:14px;margin-top:4px}

/* weather */
.weather{
  --sky-top:#58A9E6;--sky-mid:#8BC7EC;--sky-bottom:#F0C18F;--sun-x:82%;--sun-y:24%;
  margin:16px 0 6px;border-radius:20px;color:#fff;overflow:hidden;isolation:isolate;
  background:
    linear-gradient(180deg,var(--sky-top) 0%,var(--sky-mid) 58%,var(--sky-bottom) 125%);
  box-shadow:0 10px 30px rgba(53,119,164,.22);position:relative;
  text-shadow:0 1px 8px rgba(32,73,104,.34);transition:background .35s ease,box-shadow .35s ease;
}
.weather.theme-sun{--sky-top:#3E9DE0;--sky-mid:#79C2EE;--sky-bottom:#F6CE92;--sun-x:84%;--sun-y:18%}
.weather.theme-pc{--sky-top:#579FD5;--sky-mid:#8BBBD8;--sky-bottom:#E9BD91;--sun-x:78%;--sun-y:24%}
.weather.theme-cloud{--sky-top:#718FA8;--sky-mid:#A9BBC7;--sky-bottom:#D5C7B8;--sun-x:82%;--sun-y:18%}
.weather.theme-rain{--sky-top:#506F89;--sky-mid:#8297A8;--sky-bottom:#B2ADB0;--sun-x:84%;--sun-y:18%}
.weather::before{content:"";position:absolute;z-index:-2;left:var(--sun-x);top:var(--sun-y);width:190px;height:190px;
  transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,
  rgba(255,246,198,.96) 0 11%,rgba(255,229,158,.58) 22%,rgba(255,225,154,.18) 48%,transparent 69%)}
.weather::after{content:"";position:absolute;z-index:-1;inset:0;opacity:.68;transition:opacity .35s ease;
  background:
    radial-gradient(ellipse 34% 25% at 77% 49%,rgba(255,255,255,.68) 0 44%,transparent 47%),
    radial-gradient(ellipse 25% 18% at 62% 54%,rgba(255,255,255,.48) 0 42%,transparent 46%),
    radial-gradient(ellipse 38% 20% at 92% 58%,rgba(255,255,255,.40) 0 40%,transparent 44%),
    linear-gradient(180deg,transparent 0 63%,rgba(255,255,255,.10) 100%)}
.weather.theme-sun::after{opacity:.20}
.weather.theme-cloud::after{opacity:.90}
.weather.theme-rain::after{opacity:.76;filter:saturate(.62)}
.wtop{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 22px 8px;position:relative}
.wtemp{font-size:52px;font-weight:300;line-height:1;letter-spacing:-.02em}
.wcity{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.82);margin-bottom:10px}
.wcond{text-align:right}
.wcond b{font-size:16px;font-weight:600;display:block}
.wcond span{font-size:12px;color:rgba(255,255,255,.80)}
.wnote{padding:0 22px 14px;font-size:12.5px;color:rgba(255,255,255,.84);position:relative}
.wdays{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.28);position:relative}
.wday{padding:12px 6px;text-align:center;border-right:1px solid rgba(255,255,255,.24);transition:background .2s ease}
.wday:last-child{border-right:none}
.wday.active{background:rgba(255,255,255,.16)}
.wday .wd{font-size:12px;color:rgba(255,255,255,.80);margin-bottom:6px}
.wday .wi{font-size:17px;line-height:1;margin-bottom:5px}
.wday .wt{font-size:16px;font-weight:600}
.wdisc{padding:9px 22px 14px;font-size:11px;color:rgba(255,255,255,.72);position:relative;
  border-top:1px solid rgba(255,255,255,.14)}

/* tabs */
.tabs{position:sticky;top:0;z-index:1000;display:flex;gap:7px;overflow-x:auto;
  margin:14px -14px 14px;padding:12px 14px;background:rgba(251,247,239,.9);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--line);
  -ms-overflow-style:none;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:0 0 auto;appearance:none;border:1px solid var(--line);background:#fff;cursor:pointer;
  font:inherit;font-size:14px;color:var(--ink);padding:9px 16px;border-radius:999px;white-space:nowrap;transition:.15s}
.tab b{font-weight:700}
.tab.on{background:var(--night);color:#fff;border-color:var(--night)}
.tab:focus-visible,.scenario-btn:focus-visible,.cacts a:focus-visible,.map-action:focus-visible{
  outline:3px solid rgba(224,145,60,.48);outline-offset:2px
}

/* layout */
.stage{display:block}
.mapwrap{position:relative;border-radius:18px;overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--line);background:#dfeaf0}
#map{height:290px;width:100%}
.map-loading{height:100%;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px}
.map-controls{position:absolute;z-index:5;top:10px;right:10px;display:grid;gap:6px}
.map-control{appearance:none;width:38px;height:38px;border:0;border-radius:11px;background:rgba(255,255,255,.96);
  color:var(--ink);font:700 20px/1 -apple-system,'Segoe UI',sans-serif;cursor:pointer;box-shadow:0 2px 10px rgba(34,27,51,.18)}
.map-control.geo,.map-control.full{font-size:17px}
.mapwrap.fallback .map-controls{display:none}
.map-fallback{display:block;width:100%;height:100%;border:0}
.ymarker{position:relative;appearance:none;width:30px;height:30px;border:3px solid #fff;border-radius:50%;
  color:#fff;font:700 12px/1 -apple-system,'Segoe UI',sans-serif;cursor:pointer;transform:translate(-50%,-50%);
  box-shadow:0 2px 8px rgba(34,27,51,.42);transition:opacity .18s,transform .18s}
.ymarker.is-active{transform:translate(-50%,-50%) scale(1.16);z-index:2}
.ymarker.is-active::after{content:attr(data-label);position:absolute;left:50%;bottom:35px;transform:translateX(-50%);
  width:max-content;max-width:210px;padding:7px 9px;border-radius:9px;background:#fff;color:var(--ink);font-size:11.5px;
  font-weight:600;line-height:1.2;white-space:normal;box-shadow:0 3px 14px rgba(34,27,51,.22);pointer-events:none}
.maprow{display:flex;gap:8px;align-items:center;margin:10px 2px 4px;flex-wrap:wrap}
.legend{display:flex;gap:12px;font-size:12px;color:var(--muted);flex-wrap:wrap}
.legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:middle}
.i-place{background:var(--gold)} .i-food{background:var(--rose)} .i-event{background:var(--violet)}
.scenario{display:none;gap:7px;margin:12px 2px 8px;align-items:center;flex-wrap:wrap}
.scenario.show{display:flex}
.scenario-label{font-size:12px;color:var(--muted);margin-right:2px}
.scenario-btn{appearance:none;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit;
  font-size:12.5px;padding:7px 11px;border-radius:999px;cursor:pointer}
.scenario-btn.on{background:var(--night);color:#fff;border-color:var(--night)}

/* day head */
.dhead{margin:16px 2px 12px}
.dhead h2{font-family:'Oranienbaum',Georgia,serif;font-weight:400;font-size:26px;line-height:1.1}
.dhead p{color:var(--muted);font-size:14px;margin-top:4px}
.dayalert{display:flex;gap:8px;align-items:flex-start;margin-top:10px;padding:9px 11px;border-radius:12px;
  color:#5a4458;background:rgba(224,145,60,.12);font-size:12.5px}
.dayalert strong{color:#B26A18;white-space:nowrap}

/* cards */
.list{display:grid;gap:12px}
.card{display:flex;gap:0;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;
  box-shadow:var(--shadow);cursor:pointer;transition:transform .12s, box-shadow .12s}
.card:active{transform:scale(.995)}
.card.sel{outline:2px solid var(--gold);outline-offset:-2px}
.card.scenario-off{opacity:.58}
.thumb{position:relative;flex:0 0 108px;width:108px;background:linear-gradient(135deg,#efe6f2,#e7d9ea);overflow:hidden}
.thumb img{position:relative;width:100%;height:100%;object-fit:cover;display:block}
.thumb .no{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:'Oranienbaum',Georgia,serif;font-size:34px;color:rgba(34,27,51,.18)}
.thumb.no-photo.place{background:linear-gradient(145deg,#f7d49c,#dba263)}
.thumb.no-photo.food{background:linear-gradient(145deg,#efb1b8,#c85e72)}
.thumb.no-photo .no{position:relative;z-index:1;height:100%;padding:12px 9px;flex-direction:column;gap:5px;
  color:#fff;text-align:center;text-shadow:0 1px 8px rgba(34,27,51,.24)}
.thumb.no-photo .no span{font-size:24px;line-height:1}
.thumb.no-photo .no small{font:600 10.5px/1.15 -apple-system,'Segoe UI',sans-serif}
.pinno{position:absolute;left:7px;top:7px;width:22px;height:22px;border-radius:50%;color:#fff;
  font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 5px rgba(0,0,0,.35)}
.pinno.place{background:var(--gold)} .pinno.food{background:var(--rose)} .pinno.event{background:var(--violet)}
.cbody{flex:1;padding:11px 13px 12px;min-width:0}
.crow{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.ctime{font-size:12.5px;font-weight:700;color:var(--gold)}
.crate{font-size:12.5px;color:var(--gold);white-space:nowrap}
.crate .rv{color:var(--muted)}
.cname{font-size:16px;font-weight:650;margin:3px 0 2px;line-height:1.2}
.ccat{font-size:12px;color:var(--muted)}
.cdesc{font-size:13px;color:#4b4360;margin-top:6px}
.cacts{display:flex;gap:8px;margin-top:10px}
.cacts a,.map-action{flex:1;text-align:center;text-decoration:none;font:inherit;font-size:12.5px;color:var(--ink);
  border:1px solid var(--line);border-radius:10px;padding:8px 4px}
.cacts a.ya{border-color:rgba(224,145,60,.5);color:#B26A18}
.map-action{appearance:none;background:transparent;cursor:pointer}
.cacts a.only{flex:0 0 auto;padding:8px 16px}
.evtag{display:inline-block;font-size:11px;color:#5B44A8;border:1px solid rgba(122,92,200,.4);
  background:rgba(122,92,200,.08);border-radius:999px;padding:2px 9px;margin-bottom:2px}

footer{margin-top:22px;text-align:center;color:var(--muted);font-size:11.5px;line-height:1.6}

/* desktop split */
@media(min-width:860px){
  #map{height:72vh}
  .stage.split{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  .stage.split .left{position:sticky;top:74px}
  .dhead{margin-top:0}
}
@media(max-width:430px){
  .wrap{padding-left:12px;padding-right:12px}
  .top h1{font-size:36px}
  .wtop{padding-left:18px;padding-right:18px}
  .wcond{max-width:58%}
  .thumb{flex-basis:96px;width:96px}
  .cacts{flex-wrap:wrap}
  .cacts a,.map-action{min-width:88px}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">

  <header class="top">
    <div class="eyebrow">Поездка для своих</div>
    <h1>Нижний Новгород</h1>
    <div class="dates">23–26 июля 2026 · четыре дня между Окой и Волгой</div>
  </header>

  <section class="weather" id="weather" aria-label="Погода на даты поездки"></section>

  <nav class="tabs" id="tabs" aria-label="Дни поездки"></nav>

  <div class="stage split" id="stage">
    <div class="left">
      <div class="mapwrap" id="mapwrap">
        <div id="map" role="region" aria-label="Интерактивная карта маршрута"></div>
        <div class="map-controls" aria-label="Управление картой">
          <button class="map-control" id="mapZoomIn" type="button" aria-label="Приблизить">+</button>
          <button class="map-control" id="mapZoomOut" type="button" aria-label="Отдалить">−</button>
          <button class="map-control geo" id="mapGeo" type="button" aria-label="Моё местоположение">◎</button>
          <button class="map-control full" id="mapFull" type="button" aria-label="На весь экран">⛶</button>
        </div>
      </div>
      <div class="scenario" id="scenario" aria-label="Финал воскресенья"></div>
      <div class="maprow">
        <div class="legend">
          <span><i class="i-place"></i>достопримечательности</span>
          <span><i class="i-food"></i>еда</span>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="dhead" id="dhead"></div>
      <div class="list" id="list"></div>
    </div>
  </div>

  <footer>
    Карта: Яндекс Карты · рейтинги: 2ГИС, срез 15 июля 2026.<br>
    Часть локальных обложек — иллюстративная. Часы и цены сверяйте перед выходом.
  </footer>
</div>

<script src="https://api-maps.yandex.ru/v3/?apikey=__YANDEX_API_KEY__&lang=ru_RU"></script>
<script>
var DATA = __DATA__;

/* ---- weather ---- */
(function(){
  var w = DATA.weather, ic={sun:'☀️',pc:'⛅',cloud:'☁️',rain:'🌧️'};
  var d = w.days.map(function(x,i){
    return '<div class="wday'+(i===0?' active':'')+'" data-weather-index="'+i+'"><div class="wd">'+x.d+'</div><div class="wi">'+(ic[x.i]||'☀️')+'</div><div class="wt">'+x.t+'</div></div>';
  }).join('');
  document.getElementById('weather').innerHTML =
    '<div class="wtop"><div><div class="wcity">Нижний Новгород · <span id="wselected">'+w.days[0].d+'</span></div><div class="wtemp" id="wtemp">'+w.days[0].t+'</div></div>'+
    '<div class="wcond"><b id="wcondition">Облачно с прояснениями</b><span>'+w.note+'</span></div></div>'+
    '<div class="wdays">'+d+'</div>'+
    '<div class="wdisc">'+w.disc+'</div>';
})();

function updateWeather(index){
  var weather=document.getElementById('weather');
  var item=DATA.weather.days[index] || DATA.weather.days[0];
  var labels={sun:'Ясно',pc:'Облачно с прояснениями',cloud:'Облачно',rain:'Дождь'};
  weather.className='weather theme-'+(item.i||'pc');
  document.getElementById('wselected').textContent=item.d;
  document.getElementById('wtemp').textContent=item.t;
  document.getElementById('wcondition').textContent=labels[item.i]||DATA.weather.cond;
  document.querySelectorAll('.wday').forEach(function(day,i){day.classList.toggle('active',i===index);});
}

/* ---- tabs ---- */
var tabsEl=document.getElementById('tabs');
DATA.days.forEach(function(day,i){
  var b=document.createElement('button'); b.className='tab'+(i===0?' on':'');
  var parts=day.tab.split(' ');
  b.innerHTML='<b>'+parts[0]+'</b> '+(parts[1]||'');
  b.setAttribute('aria-pressed',i===0?'true':'false');
  b.onclick=function(){selectDay(i,true);};
  tabsEl.appendChild(b);
});

/* ---- map ---- */
var map=null, YMapMarkerClass=null, YMapFeatureClass=null, routeEntity=null;
var COLORS={place:'#E0913C',food:'#D9566B',event:'#7A5CC8'};
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function escAttr(s){return esc(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function yaSearch(q){return 'https://yandex.ru/maps/?text='+encodeURIComponent(q);}

var markers=[], cards=[], curDay=0, activeRouteId='';

function placeByNumber(day,n){
  return day.places.find(function(p){return p.n===n;});
}

function routePlaces(day,routeId){
  var spec;
  if(day.routes && day.routes.length){
    spec=day.routes.find(function(r){return r.id===routeId;}) || day.routes[0];
  }
  var entries=spec ? spec.places : (day.route || day.places.map(function(p){return p.n;}));
  return entries.map(function(entry){
    var n=typeof entry==='number' ? entry : entry.place;
    return placeByNumber(day,n);
  }).filter(Boolean);
}

function drawRoute(day,routeId,fit){
  var chosen=routePlaces(day,routeId);
  var coords=chosen.map(function(p){return [p.lng,p.lat];});
  if(map && routeEntity){map.removeChild(routeEntity);routeEntity=null;}
  if(map && YMapFeatureClass && coords.length>1){
    routeEntity=new YMapFeatureClass({
      geometry:{type:'LineString',coordinates:coords},
      style:{stroke:[{color:'#7A5CC8A8',width:4}]}
    });
    map.addChild(routeEntity);
  }
  var pts=chosen.map(function(p){return p.lat+'%2C'+p.lng;}).join('~');
  var fallback=document.getElementById('mapFallback');
  if(fallback){fallback.src='https://yandex.ru/map-widget/v1/?rtext='+pts+'&rtt=pd';}
  markers.forEach(function(m,idx){
    var p=day.places[idx];
    m.element.style.opacity=!p.scenario || p.scenario===routeId ? '1' : '.42';
  });
  cards.forEach(function(card,idx){
    var p=day.places[idx];
    card.classList.toggle('scenario-off',Boolean(p.scenario && p.scenario!==routeId));
  });
  document.querySelectorAll('.scenario-btn').forEach(function(btn){
    var on=btn.dataset.route===routeId;
    btn.classList.toggle('on',on);
    btn.setAttribute('aria-pressed',on?'true':'false');
  });
  if(fit && map && coords.length){fitMap(coords,true);}
}

function fitMap(coords,animated){
  if(!map || !coords.length){return;}
  if(coords.length===1){map.setLocation({center:coords[0],zoom:14,duration:animated?260:0});return;}
  var lngs=coords.map(function(c){return c[0];}),lats=coords.map(function(c){return c[1];});
  map.setLocation({
    bounds:[[Math.min.apply(null,lngs),Math.min.apply(null,lats)],[Math.max.apply(null,lngs),Math.max.apply(null,lats)]],
    duration:animated?260:0
  });
}

function renderScenario(day){
  var box=document.getElementById('scenario'); box.innerHTML='';
  box.classList.toggle('show',Boolean(day.routes && day.routes.length));
  if(!day.routes || !day.routes.length){return;}
  var label=document.createElement('span'); label.className='scenario-label'; label.textContent='Выберите финал:'; box.appendChild(label);
  day.routes.forEach(function(route,idx){
    var btn=document.createElement('button'); btn.type='button'; btn.className='scenario-btn'+(idx===0?' on':'');
    btn.dataset.route=route.id; btn.textContent=route.label; btn.setAttribute('aria-pressed',idx===0?'true':'false');
    btn.onclick=function(){activeRouteId=route.id;drawRoute(day,activeRouteId,true);};
    box.appendChild(btn);
  });
}

function selectDay(i,shouldScroll){
  curDay=i;
  updateWeather(i);
  document.querySelectorAll('.tab').forEach(function(t,j){
    var on=j===i;t.classList.toggle('on',on);t.setAttribute('aria-pressed',on?'true':'false');
  });
  var day=DATA.days[i];
  activeRouteId=day.routes && day.routes.length ? day.routes[0].id : '';
  document.getElementById('dhead').innerHTML='<h2>'+esc(day.title)+'</h2><p>'+esc(day.sub)+'</p>'+
    (day.alert?'<div class="dayalert"><strong>Учтите</strong><span>'+esc(day.alert)+'</span></div>':'');
  renderScenario(day);

  // map markers
  if(map){
    markers.forEach(function(m){map.removeChild(m.entity);});
    markers=[];
    if(routeEntity){map.removeChild(routeEntity);routeEntity=null;}
    day.places.forEach(function(p){
      var el=document.createElement('button');el.type='button';el.className='ymarker';el.textContent=p.n;
      el.style.background=COLORS[p.type];el.dataset.label=p.name;el.setAttribute('aria-label',p.n+'. '+p.name+', '+p.t);
      el.onclick=function(){highlight(p.n);};
      var entity=new YMapMarkerClass({coordinates:[p.lng,p.lat]},el);
      map.addChild(entity);markers.push({entity:entity,element:el,point:p});
    });
    fitMap(day.places.map(function(p){return [p.lng,p.lat];}),false);
  }else{
    markers=[];
  }

  // cards
  var list=document.getElementById('list'); list.innerHTML=''; cards=[];
  day.places.forEach(function(p,idx){
    var card=document.createElement('article'); card.className='card'; card.dataset.n=p.n;
    var thumb = '<div class="no" aria-hidden="true"><span>'+(p.type==='food'?'◆':'⌁')+'</span><small>'+esc(p.name)+'</small></div>'+
      (p.ph?'<img loading="lazy" src="'+escAttr(p.ph)+'" alt="'+escAttr(p.name)+'" onerror="this.style.display=\'none\'">':'');
    var rate = p.rate
      ? '<div class="crate">★ '+p.rate+' <span class="rv">'+(p.rev?p.rev+' · ':'')+esc(p.src)+'</span></div>'
      : '<div class="crate rv" style="color:#7C7290">'+esc(p.src)+'</div>';
    var evtag = p.type==='event' ? '<div class="evtag">Событие вечера</div>' : '';
    var acts = '<div class="cacts"><button type="button" class="map-action">На карте</button>'+
      '<a class="ya" href="'+yaSearch(p.ya)+'" target="_blank" rel="noopener">Яндекс Карты</a>'+
      (p.url?'<a href="'+escAttr(p.url)+'" target="_blank" rel="noopener">'+esc(p.urlLabel||'Подробнее')+'</a>':'')+
      (p.tel?'<a href="tel:'+escAttr(p.tel)+'">Позвонить</a>':'')+'</div>';
    card.innerHTML =
      '<div class="thumb '+(p.ph?'':'no-photo ') + p.type+'">'+thumb+'<div class="pinno '+p.type+'">'+p.n+'</div></div>'+
      '<div class="cbody"><div class="crow"><span class="ctime">'+esc(p.t)+'</span>'+rate+'</div>'+
      evtag+'<div class="cname">'+esc(p.name)+'</div><div class="ccat">'+esc(p.cat)+'</div>'+
      '<div class="cdesc">'+esc(p.desc)+'</div>'+acts+'</div>';
    function showOnMap(){
      highlight(p.n);
      if(map && markers[idx]){
        map.setLocation({center:[p.lng,p.lat],zoom:14,duration:300});
      }
    }
    card.querySelector('.map-action').onclick=showOnMap;
    card.onclick=function(event){if(!event.target.closest('a,button')){showOnMap();}};
    list.appendChild(card); cards.push(card);
  });
  drawRoute(day,activeRouteId,false);
  if(shouldScroll){tabsEl.scrollIntoView({block:'start',behavior:'auto'});}
}
function highlight(n){
  cards.forEach(function(c){c.classList.toggle('sel',c.dataset.n==n);});
  markers.forEach(function(m){m.element.classList.toggle('is-active',m.point.n==n);});
}

async function initMap(){
  try{
    await ymaps3.ready;
    var YMap=ymaps3.YMap,YMapDefaultSchemeLayer=ymaps3.YMapDefaultSchemeLayer;
    var YMapDefaultFeaturesLayer=ymaps3.YMapDefaultFeaturesLayer;
    YMapMarkerClass=ymaps3.YMapMarker;YMapFeatureClass=ymaps3.YMapFeature;
    map=new YMap(document.getElementById('map'),{
      location:{center:[44.0059,56.3269],zoom:12},
      behaviors:['drag','dblClick','multiTouch'],showScaleInCopyrights:true
    },[new YMapDefaultSchemeLayer({}),new YMapDefaultFeaturesLayer({})]);
    if(map.setMargin){map.setMargin([48,48,48,48]);}
    selectDay(curDay,false);
  }catch(error){
    showMapFallback();
  }
}

function showMapFallback(){
  document.getElementById('mapwrap').classList.add('fallback');
  document.getElementById('map').innerHTML='<iframe class="map-fallback" id="mapFallback" title="Интерактивная карта" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  drawRoute(DATA.days[curDay],activeRouteId,false);
}

document.getElementById('mapZoomIn').onclick=function(){if(map){map.setLocation({center:map.center,zoom:Math.min(map.zoom+1,20),duration:180});}};
document.getElementById('mapZoomOut').onclick=function(){if(map){map.setLocation({center:map.center,zoom:Math.max(map.zoom-1,2),duration:180});}};
document.getElementById('mapFull').onclick=function(){var box=document.getElementById('mapwrap');if(box.requestFullscreen){box.requestFullscreen();}};
document.getElementById('mapGeo').onclick=function(){
  if(!map || !navigator.geolocation){return;}
  navigator.geolocation.getCurrentPosition(function(pos){
    map.setLocation({center:[pos.coords.longitude,pos.coords.latitude],zoom:14,duration:300});
  });
};
selectDay(0,false);
if(window.ymaps3){
  initMap();
}else{
  showMapFallback();
}
</script>
</body>
</html>'''

HTML = HTML.replace('__YANDEX_API_KEY__', yandex_maps_key)
HTML = HTML.replace('__DATA__', data)

output_path = BASE_DIR / 'nn-plan-interactive.html'
output_path.write_text(HTML, encoding='utf-8')
print('written:', output_path)
print('bytes:', len(HTML.encode('utf-8')))
