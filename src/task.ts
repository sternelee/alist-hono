import { v4 as uuidv4 } from 'uuid';
import { insertD1Data, updateD1Data } from './db/d1-data';
import { Bindings } from './bindings';
import { savePan } from './drivers';
import { ILink } from './drivers/_types';
import { fetchFeed, fetchBt } from './utils/extract';

export const fetchFeeds = async (env: Bindings) => {
  const { results: feeds } = await env.D1DATA.prepare(
    'SELECT * FROM feeds'
  ).all();
  for (let feed of feeds) {
    const { id, folderId, userId, driver } = feed;
    const datas = await fetchFeed(feed.url as string);
    const { results: links }: { results: ILink[] } =
      await env.D1DATA.prepare(`SELECT * FROM links`).all();
    const titles = links.map((link) => link.title);
    for (let data of datas) {
      if (!titles.includes(data.title)) {
        let url = data.link;
        if (data.link.includes('acg.rip')) {
          url = await fetchBt(url);
        }
        await insertD1Data(env.D1DATA, 'links', {
          id: uuidv4(),
          feedId: id,
          userId,
          url,
          title: data.title,
          checked: 1,
          saved: 0,
          driver,
          folderId,
        });
      }
    }
  }
};

export const fetchLinks = async (env: Bindings) => {
  const { results: links } = await env.D1DATA.prepare(
    'SELECT * FROM links WHERE saved = 0'
  ).all();
  for (let data of links) {
    const { userId, url, title, driver, folderId } = data as Record<
      string,
      string
    >;
    const res = await savePan(env.KVDATA, {
      userId,
      driver,
      url,
      title,
      folderId,
    });
    await updateD1Data(env.D1DATA, 'links', {
      id: data.id,
      data: {
        saved: 1,
      },
    });
    console.log(res);
  }
};
