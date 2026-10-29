/* Лайтбокс: широкий веб-экран на телефоне показываем в натуральную высоту с прокруткой вбок (класс is-wide). */
(function () {
  var lb = document.querySelector(".lightbox");
  if (!lb) return;
  var img = lb.querySelector("img");
  function fit() {
    var wide = img.naturalWidth > img.naturalHeight * 1.3 && window.matchMedia("(max-width: 767px)").matches;
    lb.classList.toggle("is-wide", wide);
    if (wide) lb.querySelector("figure").scrollLeft = 0;
  }
  img.addEventListener("load", fit);
  new MutationObserver(fit).observe(lb, { attributes: true, attributeFilter: ["hidden"] });
})();
