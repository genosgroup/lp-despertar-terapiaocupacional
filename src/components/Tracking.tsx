import Script from "next/script";
import {
  ADS_ID,
  CLARITY_ID,
  CONTENT_GROUP,
  GA_ID,
  META_PIXEL_ID,
} from "@/lib/medicao";

/**
 * Medicao da LP. Montado no layout raiz, dentro do <body>.
 *
 * Copiado do template-lp de genosgroup/padroes. A diferenca e que os IDs nao
 * ficam aqui: estao em src/lib/medicao.ts, porque esta e uma LP de cliente e
 * usa os IDs da Despertar (ver AGENTS.md). Cada tag so carrega se o ID dela
 * estiver preenchido.
 *
 * O gtag.js carrega uma vez so e serve ao GA4 e ao Google Ads. Enquanto o GA4
 * nao existir, ele carrega pelo ID do Google Ads.
 */
const GTAG_LOADER_ID = GA_ID || ADS_ID;

export default function Tracking() {
  const configs = [
    GA_ID ? `gtag("config", "${GA_ID}", {content_group: "${CONTENT_GROUP}"});` : "",
    ADS_ID ? `gtag("config", "${ADS_ID}");` : "",
  ].join("\n");

  return (
    <>
      {GTAG_LOADER_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_LOADER_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
${configs}`}
          </Script>
        </>
      ) : null}
      {META_PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
      {CLARITY_ID ? (
        <Script id="clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      ) : null}
    </>
  );
}

export function TrackingNoScript() {
  if (!META_PIXEL_ID) return null;
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
