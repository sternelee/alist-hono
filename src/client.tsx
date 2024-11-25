import { Hono } from 'hono/quick'
import { pipe, object, string, minLength } from 'valibot'
import { vValidator } from '@hono/valibot-validator'
import { AppContextEnv } from './db';

import { Layout } from './components/Layout'
import { Item } from './components/Todo'

const client = new Hono<AppContextEnv>()

client.get('/', (c) => {
  return c.html(
    <Layout>
			Home
    </Layout>
  )
})

client.post(
  '/todo',
  vValidator(
    'form',
    object({
      title: pipe(string(), minLength(1))
    })
  ),
  async (c) => {
    const { title } = c.req.valid('form')
    const id = crypto.randomUUID()
    await c.env.D1DATA.prepare(`INSERT INTO todo(id, title) VALUES(?, ?);`).bind(id, title).run()
    return c.html(<Item title={title} id={id} />)
  }
)

client.delete('/todo/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.D1DATA.prepare(`DELETE FROM todo WHERE id = ?;`).bind(id).run()
  c.status(200)
  return c.body(null)
})

export default client
