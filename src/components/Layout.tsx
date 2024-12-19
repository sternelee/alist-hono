import { html } from 'hono/html'

export const Layout = (props: { children: any }) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="static/uno.css" />
      <script src="static/htmx.min.js" defer></script>
      <script src="static/hyperscript.min.js" defer></script>
      <script src="static/alpine.min.js" defer></script>
      <title>Alist Hono</title>
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`
