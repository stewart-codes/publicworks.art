// pages/_document.js

import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          {/*<link*/}
          {/*  href="https://fonts.googleapis.com/css2?family=Lexend+Mega:wght@200&family=Manrope:wght@200;300;400;500;600;700;800&family=Advent+Pro:wght@100;200;300;400;500;600;700&family=Roboto:wght@100;200;300;400;500;600;700&family=Roboto+Flex:opsz,wght@8..144,100;8..144,200;8..144,300;8..144,400;8..144,500;8..144,600;8..144,700;8..144,800;8..144,900;8..144,1000&display=swap"*/}
          {/*  rel="stylesheet"*/}
          {/*/>*/}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        {/* <script
          data-goatcounter="https://stats.stewart.codes/count"
          async
          src="//stats.stewart.codes/count.js"
        /> */}
        {/* // this is my personal analytics trackers */}
        <script
          src="https://dingdong.stewart.codes/tracker.js"
          data-endpoint="https://dingdong.stewart.codes"
          async
        ></script>
      </Html>
    );
  }
}

export default MyDocument;
