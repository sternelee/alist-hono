import { decode } from './bencode';

interface ILink {
  title: string;
  link: string;
}

export const fetchFeed = async (link: string): Promise<ILink[]> => {
  const text = await fetch(link).then((res) => res.text());
  const links: ILink[] = [];
  if (text.indexOf('<?xml') === 0) {
    extractRss(text, links);
  } else if (text.indexOf('<!DOCTYPE html') === 0) {
    extractHtml(text, links);
  }
  return links;
};

export const extractRss = (text: string, links: ILink[]) => {
  const { titles, enclosureUrls } = extractRSSInfo(text);
  for (let i = 0; i < titles.length; i++) {
    const link = enclosureUrls[i];
    links.push({
      title: titles[i],
      link,
    });
  }
  return links;
};

export const extractHtml = (text: string, links: ILink[]) => {
  return extractMagnet(text, links);
};

export const fetchBt = async (link: string) => {
  const btFile = await fetch(link).then((res) => res.arrayBuffer());
  const base64 = decode(btFile);
  return 'magnet:?xt=urn:btih:' + base64;
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

function extractMagnet(text: string, links: ILink[]) {
  // https://www.dy2018.com/i/111938.html
  const magnetRegex = /<a href="magnet(.*?)"/g;
  let magnetMatch;
  while ((magnetMatch = magnetRegex.exec(text)) !== null) {
    // @ts-ignore
    const magnet = magnetMatch[1] as string;
    links.push({
      title: magnet.split('dn=')[1] || magnet,
      link: magnet,
    });
  }
}
