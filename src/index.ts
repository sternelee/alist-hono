import app from './server';
import { Bindings } from './bindings';

async function handleSchedule(
  event: ScheduledEvent,
  env: Bindings
): Promise<Response> {
  const cron = parseCron(event.cron);

  /*
   * Handling specific event to trigger for a CRON trigger
   */
  if (cron === '*/3 * * * *') {
    console.log('cron triggered!');
  }
  console.log('no event triggered');
  return new Response(null, {
    status: 500,
    statusText: 'Internal server error, cron not detected',
  });
}

function parseCron(cron: string): string {
  cron = cron.replaceAll('/', '');
  if (cron.length > 9) {
    cron = cron.substring(cron.length - 9);
  }
  cron = cron.replaceAll('+', ' ');
  return cron;
}

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  fetch: app.fetch,
  scheduled: async (
    controller: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext
  ) => {
    ctx.waitUntil(handleSchedule(controller, env));
  },
};
