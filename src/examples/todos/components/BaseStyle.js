// Tell Babel to transform JSX into h() calls:
/** @jsx h */

import { h } from 'preact';

const MainStyle = /* @css */`
  *, *:before, *:after {
    box-sizing: border-box;
  }

  html, body, main {
    height: 100vh;
  }

  html, body {
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 15px;
    font-family: sans-serif;
  }

  main {
    padding: 1rem;
  }

  .overflow {
    overflow: auto;
  }

  /*textarea, input[type="text"] {
    max-width: 100%;
    width: 100%;
    padding: .5rem;
    border: 1px solid #999;
  }*/
`;
export const BaseStyle = () => (
  /*
    Workaround for an issue where server-side rendering is different from client.
    This maybe due to the fact that theres source maps in the css, and that
    gets removed when it hits the client.
  */
  <div dangerouslySetInnerHTML={{
    __html: `<style>${MainStyle}</style>`
  }}
  />
);
