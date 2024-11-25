import md5 from "blueimp-md5";
import qs from "qs";

const API_URL = "https://api-pan.xunlei.com/drive/v1";
const FILE_API_URL = API_URL + "/files";
const USER_API_URL = "https://xluser-ssl.xunlei.com/v1";
const FOLDER = "drive#folder";
const FILE = "drive#file";
const UPLOAD_TYPE_URL = "UPLOAD_TYPE_URL";
export const THUNDER = "thunder";

interface ErrResp {
  error_code: number;
  error: string;
  error_description: string;
}

const IsError = (e: ErrResp) => {
  return e.error_code != 0 || e.error != "" || e.error_description != "";
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

/*
 * 登录
 **/
interface TokenResp {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
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
  login_type: "user",
  sign_type: "algorithms", // algorithms,captcha_sign
  username: "",
  password: "",
  algorithms: [
    "uWRwO7gPfdPB/0NfPtfQO+71",
    "F93x+qPluYy6jdgNpq+lwdH1ap6WOM+nfz8/V",
    "0HbpxvpXFsBK5CoTKam",
    "dQhzbhzFRcawnsZqRETT9AuPAJ+wTQso82mRv",
    "SAH98AmLZLRa6DB2u68sGhyiDh15guJpXhBzI",
    "unqfo7Z64Rie9RNHMOB",
    "7yxUdFADp3DOBvXdz0DPuKNVT35wqa5z0DEyEvf",
    "RBG",
    "ThTWPG5eC0UBqlbQ+04nZAptqGCdpv9o55A",
  ],
  // 必要且影响登录,由签名决定
  deviceID: "9aa5c268e7bcfc197a9ad88e2fb330e5",
  clientID: "ZUBzD9J_XPXfn7f7",
  clientSecret: "yESVmHecEe6F0aou69vl-g",
  clientVersion: "1.10.0.2633",
  packageName: "com.xunlei.browser",
  userAgent:
    "ANDROID-com.xunlei.downloadprovider/7.51.0.8196 netWorkType/4G appid/40 deviceName/Xiaomi_M2004j7ac deviceModel/M2004J7AC OSVersion/12 protocolVersion/301 platformVersion/10 sdkVersion/220200 Oauth2Client/0.9 (Linux 4_14_186-perf-gdcf98eab238b) (JAVA 0)",
  //不影响登录,影响下载速度
  downloadUserAgent:
    "AndroidDownloadManager/13 (Linux; U; Android 13; M2004J7AC Build/SP1A.210812.016)",
  //优先使用视频链接代替下载链接
  useVideoUrl: false,
};

const getAction = (method: string, url: string): string => {
  const reg = RegExp(`://[^/]+((/[^/\s?#]+)*)`);
  // @ts-ignore
  const urlpath = url.match(reg)[1];
  return method + ":" + urlpath;
};

const Headers = {
  "user-agent": Config.userAgent,
  accept: "application/json;charset=UTF-8",
  "x-device-id": Config.deviceID,
  "x-client-id": Config.clientID,
  "x-client-version": Config.clientVersion,
};

const getUserName = (username: string) => {
  return username.length >= 11 && username.length <= 18
    ? `+86 ${username}`
    : username;
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
  captchaSign = "1." + captchaSign;
  return {
    timestamp,
    captchaSign,
  };
};

const refreshToken = async (refresh_token: string): Promise<TokenResp> => {
  return (await fetch(USER_API_URL + "/auth/token", {
    headers: Headers,
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token,
      client_id: Config.clientID,
      client_secret: Config.clientSecret,
    }),
  }).then((res) => res.json())) as TokenResp;
};

class Thunder {
  kv: KVNamespace;
  userId: string;
  kvKey: string;
  constructor(kv: KVNamespace, userId: string) {
    this.kv = kv;
    this.userId = userId;
    this.kvKey = `${userId}_${THUNDER}`;
  }
  // 登录
  async login(params: Pick<SignInRequest, "username" | "password">) {
    const { username, password } = params;
    const url = USER_API_URL + "/auth/signin";
    const captcha_token = await this.refreshCaptchaTokenInLogin({
      username,
      action: getAction("POST", url),
    });
    const body: SignInRequest = {
      captcha_token,
      client_id: Config.clientID,
      client_secret: Config.clientSecret,
      username: getUserName(username),
      password,
    };
    try {
      const resp: TokenResp = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      }).then((res) => res.json());
      await this.kv.put(this.kvKey + "_token", JSON.stringify(resp), { expirationTtl: resp.expires_in })
      return resp;
    } catch (err) {
      return err;
    }
  }
  // 登出
  async logout() {
    const kvToken = await this.kv.get<TokenResp>(this.kvKey + "_token", "json");
    const url = USER_API_URL + "/auth/revoke";
    try {
      const resp: TokenResp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          token: kvToken?.access_token
        }),
        headers: {
          'X-Client-id': Config.clientID,
          'X-Device-id': Config.deviceID,
        }
      }).then((res) => res.json());
      await this.kv.delete(this.kvKey + "_token")
      return resp;
    } catch (err) {
      return err;
    }
  }
  // 刷新验证码token(登录时)
  async refreshCaptchaTokenInLogin(params: {
    action: string;
    username: string;
  }) {
    const { action, username } = params;
    const meta: Meta = {};
    if (username.match(RegExp(`\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*`))) {
      meta["email"] = username;
    } else if (username.length >= 11 && username.length <= 18) {
      meta["phone_number"] = `+86 ${username}`;
    } else {
      meta["username"] = username;
    }
    return await this.refreshCaptchaToken({ action, meta, captcha_token: "" });
  }

  // 刷新验证码token
  async refreshCaptchaToken(
    params: Pick<CaptchaTokenRequest, "action" | "captcha_token" | "meta">,
  ) {
    console.log('refreshCaptchaToken params:', params);
    const { action, captcha_token, meta } = params;
    const body: CaptchaTokenRequest = {
      action,
      captcha_token,
      client_id: Config.clientID,
      device_id: Config.deviceID,
      meta,
      redirect_uri: "xlaccsdk01://xunlei.com/callback?state=harbor",
    };
    const resp = (await fetch(USER_API_URL + "/shield/captcha/init", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json())) as CaptchaTokenResponse;
    console.log("refreshCaptchaToken:", resp);
    if (resp.captcha_token === "") {
      console.log("empty captchaToken");
    }
    if (resp.captcha_token && resp.expires_in) {
      await this.kv.put(this.kvKey + "_captcha_token", resp.captcha_token)
    }
    return resp.captcha_token;
  }
  // 刷新验证码token(登录后)
  async refreshCaptchaTokenAtLogin(params: {
    action: string;
    user_id: string;
    captcha_token: string;
  }) {
    const { user_id, captcha_token, action } = params;
    const { timestamp, captchaSign } = getCaptchaSign();
    const meta: Meta = {
      client_version: Config.clientVersion,
      package_name: Config.packageName,
      user_id,
      timestamp,
      captcha_sign: captchaSign,
    };
    return await this.refreshCaptchaToken({ action, meta, captcha_token });
  }

  async request(
    url: string,
    method: "GET" | "POST",
    data: Record<string, any>,
  ) {
    const kvToken = await this.kv.get<TokenResp>(this.kvKey + "_token", "json");
    console.log('kvToken:', kvToken);
    if (!kvToken) {
      return { error_code: 401, error: "未登录, token过期" };
    }
    const kvCaptcha = await this.kv.get(this.kvKey + "_captcha_token", "text") || "";
    const captcha_token = await this.refreshCaptchaTokenAtLogin({
      // action: getAction(method, url),
      action: "GET:CAPTCHA_TOKEN",
      user_id: kvToken.user_id,
      captcha_token: kvCaptcha,
    });
    if (!captcha_token) {
      return { error_code: 402, error: "refreshToken 无效" };
    }
    const headers = {
      ...Headers,
      Authorization: token(kvToken),
      "X-Captcha-Token": captcha_token,
    };
    let body: undefined | string = undefined;
    if (method === "GET") {
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
			console.log('request resp:', resp);
      if (resp.error && resp.error_code) {
        const err = resp as unknown as ErrResp;
        if ([4122, 4121, 10, 16].includes(err.error_code)) {
          // refreshToken 过期
          try {
            const loginResp = await refreshToken(captcha_token);
            await this.kv.put(this.kvKey + "_token", JSON.stringify(loginResp))
            return this.request(
              url,
              method,
              data,
            );
          } catch (error) {
            const err = error as unknown as ErrResp;
            console.log(err.error_description);
          }
        }
        // if (err.error_code === 9) {
        //   // 验证码token过期
        //   await this.refreshCaptchaTokenAtLogin({
        //     action: getAction(method, url),
        //     user_id: kvToken.user_id,
        //     captcha_token,
        //   });
        //   return this.request(
        //     url,
        //     method,
        //     data,
        //   );
        // }
      }
      return resp;
    } catch (error) {
      console.log('erroo:', error);
      return error;
    }
  }

  // 列表
  async list(
    params: any = {},
  ): Promise<FileList> {
    const {
      space = "",
      __type = "drive",
      refresh = true,
      __sync = true,
      parent_id = "",
      page_token = "",
      with_audit = true,
      limit = 100,
      filters = '{"phase":{"eq":"PHASE_TYPE_COMPLETE"},"trashed":{"eq":false}}',
    } = params;
    const resp = await this.request(FILE_API_URL, "GET", {
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
  }

  // 云添加
  async save(
    params: {
      name: string;
      url: string;
      parent_id: string;
    },
  ) {
    const { name, url, parent_id } = params;
    const resp = await this.request(FILE_API_URL, "POST", {
      kind: FILE,
      name,
      upload_type: UPLOAD_TYPE_URL,
      url: {
        url,
      },
      parent_id,
      folder_type: "",
    });
    return resp;
  }
}

export default Thunder;
