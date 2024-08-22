import { v4 as uuidv4 } from "uuid";
import { decode } from "./utils/bencode";
import { insertD1Data, updateD1Data } from "./db/d1-data";
import { Bindings } from "./bindings";
import { savePan } from "./providers";
import { ILink } from "./providers/_types";

export const fetchFeeds = async (env: Bindings) => {
  const { results: feeds } = await env.D1DATA.prepare(
    "SELECT * FROM feeds",
  ).all();
  for (let feed of feeds) {
    const { id, folderId, userId, driver } = feed;
    const datas = await fetchFeed(feed.url as string);
    const { results: links }: { results: ILink[] } = await env.D1DATA.prepare(`SELECT * FROM links`).all();
    const titles = links.map((link) => link.title);
    for (let data of datas) {
      if (!titles.includes(data.title)) {
        let url = data.link;
        if (data.link.includes("acg.rip")) {
          url = await fetchBt(url);
        }
        await insertD1Data(env.D1DATA, "links", {
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
    "SELECT * FROM links WHERE saved = 0",
  ).all();
  for (let data of links) {
    const { userId, url, title, driver, folderId } = data as Record<
      string,
      string
    >;
    const res = await savePan(env.KVDATA, { userId, driver, url, title, folderId });
    await updateD1Data(env.D1DATA, 'links', {
      id: data.id,
      data: {
        saved: 1,
      }
    })
    console.log(res);
  }
};

export const fetchFeed = async (link: string) => {
  const text = await fetch(link).then((res) => res.text());
  const { titles, enclosureUrls } = extractRSSInfo(text);
  const links: { title: string; link: string }[] = [];
  for (let i = 0; i < titles.length; i++) {
    const link = enclosureUrls[i];
    links.push({
      title: titles[i],
      link,
    });
  }
  return links;
};

export const fetchBt = async (link: string) => {
  const btFile = await fetch(link).then((res) => res.arrayBuffer());
  const base64 = decode(btFile);
  return "magnet:?xt=urn:btih:" + base64;
};

function extractRSSInfo(rssContent: string) {
  const titles = [];
  const enclosureUrls = [];

  // 提取title
  const titleRegex = /<item>\s*<title>(.*?)<\/title>/g;
  let titleMatch;
  while ((titleMatch = titleRegex.exec(rssContent)) !== null) {
    // @ts-ignore
    titles.push(titleMatch[1]);
  }

  // 提取enclosure URL
  const enclosureRegex = /<enclosure url="(.*?)"/g;
  let enclosureMatch;
  while ((enclosureMatch = enclosureRegex.exec(rssContent)) !== null) {
    // @ts-ignore
    enclosureUrls.push(enclosureMatch[1]);
  }

  return { titles, enclosureUrls };
}
