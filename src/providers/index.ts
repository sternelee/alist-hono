import {
  save as thunderSave,
  login as thunderLogin,
  ROUTER as thunderRouter,
} from './thunder';

export async function login(kv: KVNamespace, content) {
  const { driver, userId, username, password } = content;
  if (driver === thunderRouter) {
    const resp = await thunderLogin({ username, password });
    if (resp.login) {
      await kv.put(`${userId}_${driver}`, JSON.stringify(resp));
      return resp.login;
    } else {
      return resp;
    }
  }
}

export async function savePan(
  kv: KVNamespace,
  kvKey: string,
  driver: string,
  kvData: any,
  url: string,
  title: string,
  folderId: string
) {
  if (driver === thunderRouter) {
    const res = await thunderSave(kv, kvKey, kvData, title, url, folderId);
    console.log(res);
  }
}
