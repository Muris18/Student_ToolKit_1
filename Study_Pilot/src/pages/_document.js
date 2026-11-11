import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Izpildās pirms pirmās atzīmēšanas: tēma, ierīces tips un splash statuss (bez mirgošanas)
  const init = `try{var d=document.documentElement,u=navigator.userAgent,w=innerWidth;var m=/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(u)||(navigator.maxTouchPoints>1&&/Macintosh/.test(u));d.dataset.device=(m&&w<1100)||w<768?'mobile':'desktop';d.dataset.splash=sessionStorage.getItem('sp-splash')?'off':'on';if(localStorage.getItem('sp-session'))d.dataset.auth='1';var t=localStorage.getItem('sp-theme');if(t!=='paper')t='night';d.dataset.theme=t}catch(e){document.documentElement.dataset.theme='night';document.documentElement.dataset.device='desktop'}`;
  return (
    <Html lang="lv" data-theme="night" data-device="desktop" data-splash="on">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#080a10" />
        <meta name="description" content="Study Pilot — AI skolotājs un treniņi 9. un 12. klases valsts eksāmeniem. Mājieni, nevis gatavas atbildes." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  );
}
