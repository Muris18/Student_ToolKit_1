import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Izpildās pirms pirmās atzīmēšanas: tēma, ierīces tips un splash statuss (bez mirgošanas)
  const init = `try{var d=document.documentElement,u=navigator.userAgent,w=innerWidth;var m=/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(u)||(navigator.maxTouchPoints>1&&/Macintosh/.test(u));d.dataset.device=(m&&w<1100)||w<768?'mobile':'desktop';d.dataset.splash=sessionStorage.getItem('sp-splash')?'off':'on';d.dataset.theme=localStorage.getItem('sp-theme')||'noir'}catch(e){document.documentElement.dataset.theme='noir';document.documentElement.dataset.device='desktop'}`;
  return (
    <Html lang="lv" data-theme="noir" data-device="desktop" data-splash="on">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0b0b0d" />
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  );
}
