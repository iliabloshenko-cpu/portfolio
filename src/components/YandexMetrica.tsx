import Script from "next/script";

const metricaId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID?.trim();
const isValidMetricaId = Boolean(metricaId && /^\d+$/.test(metricaId));

export default function YandexMetrica() {
  if (!isValidMetricaId) {
    return null;
  }

  return (
    <>
      <Script id="yandex-metrica" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j=0;j<document.scripts.length;j++) {
              if (document.scripts[j].src===r) return;
            }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${metricaId}","ym");

          ym(${metricaId}, "init", {
            ssr: true,
            webvisor: true,
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true
          });
        `}
      </Script>

      <noscript>
        <div>
          {/* The image fallback is part of Yandex Metrica's official tag. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${metricaId}`}
            width="1"
            height="1"
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
