import Thunder, { THUNDER } from './thunder';

export async function login(kv: KVNamespace, content) {
  const { driver, userId, username, password } = content;
  if (driver === THUNDER) {
    const thuner = new Thunder(kv, userId);
    const resp = (await thuner.login({ username, password })) as any;
    return resp;
  } else {
    return {};
  }
}

export async function save(
  kv: KVNamespace,
  params
): Promise<any> {
  const { driver, userId, name, url, folderId } = params;
  if (driver === THUNDER) {
    const thuner = new Thunder(kv, userId);
    const resp = await thuner.save({
      name,
      url,
      parent_id: folderId,
    });
    return resp;
  } else {
    return {};
  }
}

export async function logout(kv: KVNamespace, content) {
  const { driver, userId } = content;
  if (driver === THUNDER) {
    const thuner = new Thunder(kv, userId);
    const resp = (await thuner.logout()) as any;
    return resp;
  } else {
    return {};
  }
}
