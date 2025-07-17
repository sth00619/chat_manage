import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Personal Assistant - AI 기반 개인 비서 서비스" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}