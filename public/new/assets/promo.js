/* Промо-портфолио: фон hero, шапка, появление, перетекание цвета кейсов, оглавление, sticky-сцена, лайтбокс.
   Без библиотек. Всё, что движется, выключается при prefers-reduced-motion. */
(function () {
  var html = document.documentElement, body = document.body;
  html.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = body.getAttribute("data-state") || "";
  if (!reduce) html.classList.add("js-motion");
  /* страница кейса открывается с самого верха (заголовок и «Коротко»), если в адресе нет якоря */
  function jumpTop() { window.scrollTo(0, 0); }
  if (body.classList.contains("page-case") && !location.hash) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    jumpTop();
    /* пока человек сам не начал листать, страница стоит в самом верху: даже если браузер или просмотрщик
       восстановит прокрутку с прошлой страницы — при возврате «Назад», после load или чуть позже */
    var touched = false, guardUntil = Infinity;
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { addEventListener(ev, function () { touched = true; }, { passive: true }); });
    addEventListener("pageshow", function () { if (!touched) jumpTop(); });
    addEventListener("load", function () { if (!touched) jumpTop(); guardUntil = Date.now() + 1500; });
    addEventListener("scroll", function () { if (!touched && Date.now() < guardUntil && scrollY > 0) jumpTop(); }, { passive: true });
  }

  /* плавная прокрутка к якорю на этой же странице (меню на главной, оглавление «Продуктовые кейсы») */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    var off = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: reduce ? "auto" : "smooth" });
    if (history.pushState) history.pushState(null, "", url.hash);
  });
  if (state === "loading") body.classList.add("is-loading");

  /* ---------- фон hero: WebGL-шейдер ---------- */
  var FRAG = {
    // мягкий «шёлк»: доменное искажение шума, холодная палитра, тёплое свечение вокруг портрета
    silk: "precision mediump float;uniform vec2 r;uniform float t;uniform vec2 f;" +
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}" +
      "float n(vec2 p){vec2 i=floor(p),u=fract(p);u=u*u*(3.-2.*u);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1)),u.x),u.y);}" +
      "float fb(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}" +
      "void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;float s=t*.105;" +
      "vec2 q=vec2(fb(p+s),fb(p+vec2(5.2,1.3)-s));float v=fb(p+2.2*q+vec2(s*1.5,-s));" +
      "vec3 c=mix(vec3(.95,.965,1.),vec3(.77,.84,1.),smoothstep(.2,.65,v));c=mix(c,vec3(.52,.62,.97),.85*smoothstep(.5,.92,v*q.x+.2));c=mix(c,vec3(.80,.70,.99),.25*smoothstep(.55,.9,q.y));" +
      "c+=.004*sin(uv.y*600.+v*40.);float d=distance(uv*vec2(r.x/r.y,1.),f*vec2(r.x/r.y,1.));" +
      "c=mix(c,vec3(1.,.86,.77),.5*smoothstep(.55,.0,d));c=mix(c,vec3(1.),.6*smoothstep(.22,.0,d));" +
      "c=mix(c,vec3(1.),smoothstep(.12,.0,uv.y));gl_FragColor=vec4(c,1.);}",
    // dither/halftone: тот же шум, порог по матрице Байера 4×4, свечение вокруг портрета
    dither: "precision mediump float;uniform vec2 r;uniform float t;uniform vec2 f;" +
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}" +
      "float n(vec2 p){vec2 i=floor(p),u=fract(p);u=u*u*(3.-2.*u);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1)),u.x),u.y);}" +
      "float fb(vec2 p){float v=0.,a=.5;for(int k=0;k<4;k++){v+=a*n(p);p*=2.;a*=.5;}return v;}" +
      "float bay(vec2 g){vec2 m=mod(g,4.);float x=m.x,y=m.y;" +
      "return (x<1.?(y<1.?0.:y<2.?12.:y<3.?3.:15.):x<2.?(y<1.?8.:y<2.?4.:y<3.?11.:7.):x<3.?(y<1.?2.:y<2.?14.:y<3.?1.:13.):(y<1.?10.:y<2.?6.:y<3.?9.:5.))/16.;}" +
      "void main(){vec2 g=floor(gl_FragCoord.xy/3.);vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2;float s=t*.05;" +
      "float v=fb(p+vec2(fb(p+s),fb(p-s)));float d=distance(uv*vec2(r.x/r.y,1.),f*vec2(r.x/r.y,1.));" +
      "float l=clamp(v*.75+.6*smoothstep(.6,.0,d)-.25,0.,1.);float on=step(bay(g),l);" +
      "vec3 c=mix(vec3(.04,.04,.06),mix(vec3(.42,.31,.94),vec3(1.,.78,.6),smoothstep(.3,.0,d)),on);gl_FragColor=vec4(c,1.);}"
  };

  function startShader(canvas) {
    var gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    var kind = canvas.getAttribute("data-bg") || "silk";
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG[kind]));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var a = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uF = gl.getUniformLocation(pr, "f");
    var photo = document.querySelector("[data-hero-photo]");
    var focus = [0.7, 0.5], target = [0.7, 0.5], mouse = [0, 0];
    var mobile = window.matchMedia("(max-width: 1023px)").matches;
    var animate = !reduce && !mobile && state !== "loading";
    var scale = kind === "dither" ? 1 : 0.5; // шёлк рендерим в половинном разрешении: мягкий и дешёвый
    function size() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * scale)); canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (photo) {
        var cr = canvas.getBoundingClientRect(), pr2 = photo.getBoundingClientRect();
        target = [(pr2.left + pr2.width / 2 - cr.left) / cr.width, 1 - (pr2.top + pr2.height / 2 - cr.top) / cr.height];
        focus = target.slice();
      }
    }
    var t0 = performance.now(), raf = 0, visible = true;
    function draw(now) {
      var t = (now - t0) / 1000 + 12;
      focus[0] += (target[0] + mouse[0] * 0.04 - focus[0]) * 0.03; // свечение чуть тянется к курсору
      focus[1] += (target[1] + mouse[1] * 0.04 - focus[1]) * 0.03;
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, t); gl.uniform2f(uF, focus[0], focus[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (animate && visible && !document.hidden) raf = requestAnimationFrame(draw); else raf = 0;
    }
    size(); draw(performance.now()); canvas.classList.add("is-ready");
    window.addEventListener("resize", function () { size(); if (!raf) draw(performance.now()); });
    if (!animate) return;
    window.addEventListener("pointermove", function (e) { mouse = [e.clientX / innerWidth - 0.5, 0.5 - e.clientY / innerHeight]; }, { passive: true });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(draw); }).observe(canvas);
    document.addEventListener("visibilitychange", function () { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(draw); });
  }
  var bg = document.querySelector(".hero__bg");
  if (bg && state !== "loading") {
    // шейдер стартует после загрузки контента, чтобы не мешать LCP
    if (document.readyState === "complete") startShader(bg); else window.addEventListener("load", function () { startShader(bg); });
  }

  /* ---------- картинка не загрузилась: показываем подпись ---------- */
  document.querySelectorAll(".device img, .shot img, .retro-card img").forEach(function (im) {
    function broken() { var p = im.parentElement; p.classList.add("is-broken"); p.setAttribute("data-alt", im.alt || "Изображение не загрузилось"); }
    if (im.complete && !im.naturalWidth && im.getAttribute("src")) broken(); else im.addEventListener("error", broken);
  });
  if (state === "broken") document.querySelectorAll(".device img, .shot img").forEach(function (im) { im.dispatchEvent(new Event("error")); });

  /* ---------- шапка: бейдж hero сжимается в шапку ---------- */
  var badge = document.querySelector("[data-hero-badge]");
  if (badge) {
    new IntersectionObserver(function (es) { body.classList.toggle("is-scrolled", !es[0].isIntersecting); },
      { rootMargin: "-" + 56 + "px 0px 0px 0px" }).observe(badge);
  } else {
    body.classList.add("is-scrolled");
  }

  /* ---------- появление блоков: один раз ---------- */
  if (!reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { ro.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- count-up: одна цифра на кейс ---------- */
  function countUp(el) {
    var raw = el.getAttribute("data-countup"), m = raw.match(/^([^\d]*)([\d\s]+)(.*)$/);
    if (!m || reduce) return;
    // цифры одной секции стартуют по очереди: проявление со сдвигом, затем счёт
    var i = Array.prototype.indexOf.call(el.closest(".case__metrics, .cover__metrics, .results") ? el.closest(".case__metrics, .cover__metrics, .results").querySelectorAll("[data-countup]") : [el], el);
    var delay = Math.max(0, i) * 160;
    el.style.transitionDelay = delay + "ms";
    el.classList.add("is-counting");
    var to = parseInt(m[2].replace(/\s/g, ""), 10), t0 = 0, dur = 1300;
    function fmt(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
    function step(now) {
      if (!t0) t0 = now + delay;
      if (now < t0) { requestAnimationFrame(step); return; }
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = m[1] + fmt(Math.round(to * e)) + m[3];
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = m[1] + "0" + m[3];
    requestAnimationFrame(step);
  }
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-countup]").forEach(function (el) { co.observe(el); });

  /* ---------- главная: свечение ленты плавно меняет оттенок при скролле ---------- */
  var feed = document.querySelector(".cases"), glow = feed && feed.querySelector(".cases__glow i");
  if (glow) {
    var secs = Array.prototype.slice.call(feed.querySelectorAll(".case"));
    function rgb(v) { v = v.trim().replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(v.substr(i, 2), 16); }); }
    var cols = secs.map(function (s) { var cs = getComputedStyle(s); return [rgb(cs.getPropertyValue("--case-strong")), rgb(cs.getPropertyValue("--case-glow"))]; });
    function mix(a, b, t) { return a.map(function (x, i) { return Math.round(x + (b[i] - x) * t); }); }
    function paint() {
      var mid = innerHeight / 2, i = 0, t = 0;
      var centers = secs.map(function (s) { var r = s.getBoundingClientRect(); return r.top + r.height / 2; });
      if (mid <= centers[0]) { i = 0; t = 0; }
      else if (mid >= centers[centers.length - 1]) { i = centers.length - 1; t = 0; }
      else { while (centers[i + 1] < mid) i++; t = (mid - centers[i]) / (centers[i + 1] - centers[i]); }
      var j = Math.min(i + 1, cols.length - 1), e = t * t * (3 - 2 * t);
      var a = mix(cols[i][0], cols[j][0], e), b = mix(cols[i][1], cols[j][1], e);
      glow.style.setProperty("--glow-a", "rgba(" + a + ", 0.16)");
      glow.style.setProperty("--glow-b", "rgba(" + b + ", 0.26)");
    }
    var ticking = false;
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { paint(); ticking = false; }); } }, { passive: true });
    addEventListener("resize", paint); paint();
  }

  /* ---------- страница кейса: оглавление, прогресс, чип ---------- */
  var article = document.querySelector(".article");
  if (article) {
    var parts = article.querySelectorAll("section[id]");
    var links = document.querySelectorAll("[data-toc] a");
    var chipLabel = document.querySelector(".chip span");
    var bar = document.querySelector(".progress"), tbar = document.querySelector(".toc__bar i"), pct = document.querySelector(".toc__pct");
    function setActive(id) {
      links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "true" : "false"); });
      var a = document.querySelector('.toc a[href="#' + id + '"]');
      if (chipLabel && a) chipLabel.textContent = a.textContent;
    }
    /* активный раздел считается по положению, а не по событиям пересечения: тогда при прокрутке вверх
       длинный раздел («Решение») снова подсвечивается, а не остаётся висеть предыдущий */
    var lock = null, lockTimer;
    function current() {
      var doc = document.documentElement, id = parts[0].id;
      if (scrollY + innerHeight >= doc.scrollHeight - 2) return parts[parts.length - 1].id; // дочитал до конца
      // линия чуть ниже места, куда встаёт раздел после клика по оглавлению (scroll-margin-top + 96 px)
      var line = (parseFloat(getComputedStyle(parts[0]).scrollMarginTop) || 0) + 96;
      parts.forEach(function (p) { if (p.getBoundingClientRect().top <= line) id = p.id; });
      return id;
    }
    function onScroll() {
      var r = article.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      var k = Math.max(0, Math.min(1, (-r.top + innerHeight * 0.3) / total));
      if (parts[0] && !lock) setActive(current());
      if (bar) bar.style.transform = "scaleX(" + k + ")";
      if (tbar) tbar.style.transform = "scaleX(" + k + ")";
      if (pct) pct.textContent = "Прочитано " + Math.round(k * 100) + "%";
    }
    var tocTick = false;
    addEventListener("scroll", function () { if (!tocTick) { tocTick = true; requestAnimationFrame(function () { onScroll(); tocTick = false; }); } }, { passive: true });
    onScroll();
    /* клик по оглавлению: сразу подсвечиваем выбранный раздел (без перебора промежуточных),
       прокручиваем к нему и не пишем якорь в адрес — иначе «Назад» или обновление открывают кейс с середины */
    function unlock() { lock = null; onScroll(); }
    addEventListener("scrollend", function () { if (lock) { clearTimeout(lockTimer); unlock(); } });
    document.querySelectorAll('[data-toc] a, .chip-menu a').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var el = document.getElementById(a.getAttribute("href").slice(1));
        if (!el) return;
        e.preventDefault();
        lock = el.id; setActive(el.id);
        var off = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: reduce ? "auto" : "smooth" });
        clearTimeout(lockTimer); lockTimer = setTimeout(unlock, 1200);
      });
    });

    var chip = document.querySelector(".chip"), menu = document.querySelector(".chip-menu");
    if (chip && menu) {
      function toggle(open) { menu.hidden = !open; chip.setAttribute("aria-expanded", open ? "true" : "false"); }
      chip.addEventListener("click", function () { toggle(menu.hidden); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) toggle(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
      if (state === "toc-open") toggle(true);
    }

    /* sticky-сцена: активный шаг меняет экран */
    document.querySelectorAll(".flow").forEach(function (flow) {
      var steps = flow.querySelectorAll(".flow__step"), imgs = flow.querySelectorAll(".flow__screen img");
      var fo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var i = Array.prototype.indexOf.call(steps, e.target);
          steps.forEach(function (s, j) { s.classList.toggle("is-active", j === i); });
          imgs.forEach(function (im, j) { im.classList.toggle("is-active", j === i); });
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      steps.forEach(function (s) { fo.observe(s); });
      if (steps[0]) steps[0].classList.add("is-active");
    });
  }

  /* ---------- параллакс экранов на обложке (desktop, движение разрешено) ---------- */
  var cover = document.querySelector(".cover .stage");
  if (cover && !reduce && matchMedia("(min-width: 1024px)").matches) {
    var devs = cover.querySelectorAll(".device");
    addEventListener("scroll", function () {
      var y = Math.min(scrollY, 800);
      devs.forEach(function (d, i) { d.style.translate = "0 " + (-y * (i ? 0.12 : 0.06)) + "px"; });
    }, { passive: true });
  }

  /* ---------- лайтбокс ---------- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var shots = Array.prototype.slice.call(document.querySelectorAll(".shot")), cur = 0, last = null;
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), lbCount = lb.querySelector(".lightbox__count");
    function show(i) {
      cur = (i + shots.length) % shots.length;
      var s = shots[cur], im = s.querySelector("img");
      lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
      lbCap.textContent = s.getAttribute("data-caption") || "";
      lbCount.textContent = (cur + 1) + " / " + shots.length;
    }
    function open(i) { last = document.activeElement; show(i); lb.hidden = false; body.style.overflow = "hidden"; lb.querySelector(".lightbox__close").focus(); }
    function close() { lb.hidden = true; body.style.overflow = ""; if (last) last.focus(); }
    shots.forEach(function (s, i) { s.addEventListener("click", function () { open(i); }); });
    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    if (state === "lightbox" && shots.length) open(2);
  }
})();
