import { v4 as uuidv4 } from 'uuid';
import { insertD1Data, updateD1Data } from './db/d1-data';
import { Bindings } from './bindings';
import { save } from './drivers';
import { ILink } from './drivers/_types';
import { fetchFeed, fetchBt } from './utils/extract';
import wxPush from './utils/wxpusher';

export const fetchFeeds = async (env: Bindings) => {
  const { results: feeds } = await env.D1DATA.prepare(
    'SELECT * FROM feeds'
  ).all();
  console.log('feeds:', feeds);
  for (let feed of feeds) {
    const { id, folderId, userId, driver, wxUid } = feed;
    const datas = await fetchFeed(feed.url as string);
    const { results: links }: { results: ILink[] } =
      await env.D1DATA.prepare(`SELECT * FROM links`).all();
    const titles = links.map((link) => link.title);
    for (let data of datas) {
      console.log('data:', data);
      if (!titles.includes(data.title)) {
        let url = data.link;
        console.log('url:', url);
        if (url.includes('.torrent')) {
          url = await fetchBt(url);
        }
        await insertD1Data(env.D1DATA, 'links', {
          id: uuidv4(),
          feedId: id,
          userId,
          wxUid,
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
  console.log('links:', links);
  for (let data of links) {
    const { userId, url, title, driver, folderId, wxUid } = data as Record<
      string,
      string
    >;
    const res = await save(env.KVDATA, {
      userId,
      driver,
      url,
      title,
      folderId,
    });
    console.log(res);
    if (res.error) {
      wxUid && (await wxPush(wxUid, res.error_description));
    } else {
      await updateD1Data(env.D1DATA, 'links', {
        id: data.id,
        data: {
          saved: 1,
        },
      });
    }
  }
};
