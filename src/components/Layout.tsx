import { html } from 'hono/html'

export const Layout = (props: { children: any }) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
      <script src="https://unpkg.com/htmx.org@2.0.3" defer></script>
      <script src="https://unpkg.com/hyperscript.org@0.9.13" defer></script>
      <script src="https://unpkg.com/alpinejs" defer></script>
      <title>Alist Hono</title>
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`
