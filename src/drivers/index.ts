import { save as thunderSave, login as thunderLogin, THUNDER } from './thunder';
import { ISaveBody } from './_types';

export async function login(kv: KVNamespace, content) {
  const { driver, userId, username, password } = content;
  if (driver === THUNDER) {
    const resp = (await thunderLogin({ username, password })) as any;
    console.log('resp:', resp);
    if (resp.login) {
      await kv.put(`${userId}_${driver}`, JSON.stringify(resp));
      return resp.login;
    } else {
      return resp;
    }
  } else {
    return {};
  }
}

export async function savePan(kv: KVNamespace, params: ISaveBody) {
  const { driver, userId, title, url, folderId } = params;
  if (driver === THUNDER) {
    const res = await thunderSave(kv, userId, {
      name: title,
      url,
      parent_id: folderId,
    });
    console.log(res);
  } else {
    return {};
  }
}
