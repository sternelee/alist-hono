import md5 from 'blueimp-md5';
import qs from 'qs';

const API_URL = 'https://api-pan.xunlei.com/drive/v1';
const FILE_API_URL = API_URL + '/files';
const XLUSER_API_URL = 'https://xluser-ssl.xunlei.com/v1';
const FOLDER = 'drive#folder';
const FILE = 'drive#file';
const UPLOAD_TYPE_URL = 'UPLOAD_TYPE_URL';
export const ROUTER = 'thunder';

interface ErrResp {
  error_code: number;
  error: string;
  error_description: string;
}

const IsError = (e: ErrResp) => {
  return e.error_code != 0 || e.error != '' || e.error_description != '';
};

type Meta = Record<string, string>;
/*
 * 验证码Token
 **/
interface CaptchaTokenRequest {
  action: string;
  captcha_token: string;
  client_id: string;
  device_id: string;
  meta: Meta;
  redirect_uri: string;
}

interface CaptchaTokenResponse {
  captcha_token: string;
  expires_in: number;
  url: string;
}

export interface IKVData {
  login: TokenResp;
  captcha_token: string;
}

/*
 * 登录
 **/
interface TokenResp {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: string;
  sub: string;
  user_id: string;
}

const token = (t: TokenResp) => {
  return `${t.token_type} ${t.access_token}`;
};

interface SignInRequest {
  captcha_token: string;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
}

/*
 * 文件
 **/

interface FileList {
  kind: string;
  next_page_token: string;
  files: File[];
  version: string;
  version_outdated: boolean;
}

interface Link {
  url: string;
  token: string;
  expire: string;
  type: string;
}

interface File {
  kind: string;
  id: string;
  parent_id: string;
  name: string;
  size: string;
  web_content_link: string;
  created_time: string;
  modified_time: string;
  icon_link: string;
  thumbnail_link: string;
  hash: string;
  medias: {
    link: Link;
  }[];
  trashed: boolean;
  delete_time: string;
  original_url: string;
}

const isDir = (f: File) => f.kind === FOLDER;

const Config = {
  login_type: 'user',
  sign_type: 'algorithms', // algorithms,captcha_sign
  username: '',
  password: '',
  algorithms: [
    'HPxr4BVygTQVtQkIMwQH33ywbgYG5l4JoR,GzhNkZ8pOBsCY+7,v+l0ImTpG7c7/,e5ztohgVXNP,t,EbXUWyVVqQbQX39Mbjn2geok3/0WEkAVxeqhtx857++kjJiRheP8l77gO,o7dvYgbRMOpHXxCs,6MW8TD8DphmakaxCqVrfv7NReRRN7ck3KLnXBculD58MvxjFRqT+,kmo0HxCKVfmxoZswLB4bVA/dwqbVAYghSb,j,4scKJNdd7F27Hv7tbt',
  ],
  // 必要且影响登录,由签名决定
  deviceID: '9aa5c268e7bcfc197a9ad88e2fb330e5',
  clientID: 'Xp6vsxz_7IYVw2BB',
  clientSecret: 'Xp6vsy4tN9toTVdMSpomVdXpRmES',
  clientVersion: '7.51.0.8196',
  packageName: 'com.xunlei.downloadprovider',
  userAgent:
    'ANDROID-com.xunlei.downloadprovider/7.51.0.8196 netWorkType/4G appid/40 deviceName/Xiaomi_M2004j7ac deviceModel/M2004J7AC OSVersion/12 protocolVersion/301 platformVersion/10 sdkVersion/220200 Oauth2Client/0.9 (Linux 4_14_186-perf-gdcf98eab238b) (JAVA 0)',
  //不影响登录,影响下载速度
  downloadUserAgent:
    'Dalvik/2.1.0 (Linux; U; Android 12; M2004J7AC Build/SP1A.210812.016)',
  //优先使用视频链接代替下载链接
  useVideoUrl: false,
};

const getAction = (method: string, url: string): string => {
  const reg = RegExp(`://[^/]+((/[^/\s?#]+)*)`);
  // @ts-ignore
  const urlpath = url.match(reg)[1];
  return method + ':' + urlpath;
};

const Headers = {
  'user-agent': Config.userAgent,
  accept: 'application/json;charset=UTF-8',
  'x-device-id': Config.deviceID,
  'x-client-id': Config.clientID,
  'x-client-version': Config.clientVersion,
};

// 刷新验证码token(登录后)
const refreshCaptchaTokenAtLogin = async (params: {
  action: string;
  user_id: string;
  captcha_token: string;
}) => {
  const { user_id, captcha_token, action } = params;
  const { timestamp, captchaSign } = getCaptchaSign();
  const meta: Meta = {
    client_version: Config.clientVersion,
    package_name: Config.packageName,
    user_id,
    timestamp,
    captcha_sign: captchaSign,
  };
  return await refreshCaptchaToken({ action, meta, captcha_token });
};

const getUserName = (username: string) => {
  if (username.length >= 11 && username.length <= 18) {
    return `+86 ${username}`;
  }
  return username;
};

// 刷新验证码token(登录时)
const refreshCaptchaTokenInLogin = async (params: {
  action: string;
  username: string;
  captcha_token: string;
}) => {
  const { action, username, captcha_token } = params;
  const meta: Meta = {};
  if (username.match(RegExp(`\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*`))) {
    meta['email'] = username;
  } else if (username.length >= 11 && username.length <= 18) {
    meta['phone_number'] = `+86 ${username}`;
  } else {
    meta['username'] = username;
  }
  return await refreshCaptchaToken({ action, meta, captcha_token });
};

// 获取验证码签名
const getCaptchaSign = () => {
  const timestamp = String(Date.now());
  let captchaSign =
    Config.clientID +
    Config.clientVersion +
    Config.packageName +
    Config.deviceID +
    timestamp;
  Config.algorithms.forEach((item) => {
    captchaSign = md5(`${captchaSign}${item}`);
  });
  captchaSign = '1.' + captchaSign;
  return {
    timestamp,
    captchaSign,
  };
};

// 刷新验证码token
const refreshCaptchaToken = async (
  params: Pick<CaptchaTokenRequest, 'action' | 'captcha_token' | 'meta'>
) => {
  const { action, captcha_token, meta } = params;
  const body: CaptchaTokenRequest = {
    action,
    captcha_token,
    client_id: Config.clientID,
    device_id: Config.deviceID,
    meta,
    redirect_uri: 'xlaccsdk01://xunlei.com/callback?state=harbor',
  };
  const resp: CaptchaTokenResponse = await fetch(
    XLUSER_API_URL + '/shield/captcha/init',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  ).then((res) => res.json());
  console.log('refreshCaptchaToken:', resp);
  if (resp.captcha_token === '') {
    console.log('empty captchaToken');
  }
  return resp.captcha_token;
};

// 登录
export const login = async (
  params: Pick<SignInRequest, 'username' | 'password'>
) => {
  const { username, password } = params;
  const url = XLUSER_API_URL + '/auth/signin';
  const captcha_token = await refreshCaptchaTokenInLogin({
    username,
    action: getAction('POST', url),
    captcha_token: '',
  });
  const body: SignInRequest = {
    captcha_token,
    client_id: Config.clientID,
    client_secret: Config.clientSecret,
    username: getUserName(username),
    password,
  };
  try {
    const resp: any = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((res) => res.json());
    console.log('login:', resp);
    return {
      login: resp,
      captcha_token,
    };
  } catch (err) {
    return err;
  }
};

const refreshToken = async (refresh_token: string): Promise<TokenResp> => {
  return await fetch(XLUSER_API_URL + '/auth/token', {
    headers: Headers,
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: Config.clientID,
      client_secret: Config.clientSecret,
    }),
  }).then((res) => res.json());
};

const baseRequest = async (
  kv: KVNamespace,
  kvKey: string,
  cache: IKVData,
  url: string,
  method: 'GET' | 'POST',
  data: Record<string, any>
) => {
  let { login, captcha_token } = cache;
  const headers = {
    ...Headers,
    Authorization: token(login),
    'X-Captcha-Token': captcha_token || '',
  };
  let body: undefined | string = undefined;
  if (method === 'GET') {
    url += `?${qs.stringify(data)}`;
  } else {
    body = JSON.stringify(data);
  }
  try {
    const resp: any = await fetch(url, {
      method,
      headers,
      body,
    }).then((res) => res.json());
    await kv.put(kvKey, JSON.stringify(cache));
    return resp;
  } catch (error) {
    const err = error as unknown as ErrResp;
    if ([4122, 4121, 10, 16].includes(err.error_code)) {
      // refreshToken 过期
      try {
        const loginData = await refreshToken(cache.login.refresh_token);
        return baseRequest(
          kv,
          kvKey,
          {
            captcha_token,
            login: loginData,
          },
          url,
          method,
          data
        );
      } catch (error) {
        const err = error as unknown as ErrResp;
        console.log(err.error_description);
      }
    }
    if (err.error_code === 9) {
      // 验证码token过期
      getAction(method, url), login.user_id, captcha_token;
      captcha_token = await refreshCaptchaTokenAtLogin({
        action: getAction(method, url),
        user_id: login.user_id,
        captcha_token,
      });
      return baseRequest(
        kv,
        kvKey,
        {
          captcha_token,
          login,
        },
        url,
        method,
        data
      );
    }
    return err;
  }
};

// 列表
export const list = async (
  kv: KVNamespace,
  kvKey,
  cache: IKVData,
  params: any = {}
) => {
  const {
    space = '',
    __type = 'drive',
    refresh = true,
    __sync = true,
    parent_id = '',
    page_token = '',
    with_audit = true,
    limit = 100,
    filters = '{"phase":{"eq":"PHASE_TYPE_COMPLETE"},"trashed":{"eq":false}}',
  } = params;
  const resp = await baseRequest(kv, kvKey, cache, FILE_API_URL, 'GET', {
    space,
    __type,
    refresh,
    __sync,
    parent_id,
    page_token,
    with_audit,
    limit,
    filters,
  });
  return resp;
};

// 云添加
export const save = async (
  kv: KVNamespace,
  kvKey: string,
  cache: IKVData,
  name: string,
  url: string,
  parent_id: string
) => {
  const resp = await baseRequest(kv, kvKey, cache, FILE_API_URL, 'POST', {
    kind: FILE,
    name,
    upload_type: UPLOAD_TYPE_URL,
    url: {
      url,
    },
    parent_id,
    folder_type: '',
  });
  return resp;
};
