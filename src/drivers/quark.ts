import { createHash } from 'crypto';
import { IncomingHttpHeaders } from 'http';

interface Resp {
    status: number;
    code: number;
    message: string;
    // reqId?: string;
    // timestamp?: number;
}

interface File {
    fid: string;
    fileName: string;
    // pdirFid?: string;
    // category?: number;
    // fileType?: number;
    size: number;
    // formatType?: string;
    // status?: number;
    // tags?: string;
    // lCreatedAt?: number;
    lUpdatedAt: number;
    // nameSpace?: number;
    // includeItems?: number;
    // riskType?: number;
    // backupSign?: number;
    // duration?: number;
    // fileSource?: string;
    file: boolean;
    // createdAt?: number;
    updatedAt: number;
    // privateExtra?: {};
    // objCategory?: string;
    // thumbnail?: string;
}

function fileToObj(f: File): model.Object {
    return {
        id: f.fid,
        name: f.fileName,
        size: f.size,
        modified: new Date(f.updatedAt),
        isFolder: !f.file,
    };
}

interface SortResp extends Resp {
    data: {
        list: File[];
    };
    metadata: {
        size: number;
        page: number;
        count: number;
        total: number;
        way: string;
    };
}

interface DownResp extends Resp {
    data: Array<{
        downloadUrl: string;
    }>;
    // metadata?: {
    //     acc2?: string;
    //     acc1?: string;
    // };
}

interface UpPreResp extends Resp {
    data: {
        taskId: string;
        finish: boolean;
        uploadId: string;
        objKey: string;
        uploadUrl: string;
        fid: string;
        bucket: string;
        callback: {
            callbackUrl: string;
            callbackBody: string;
        };
        formatType: string;
        size: number;
        authInfo: string;
    };
    metadata: {
        partThread: number;
        acc2: string;
        acc1: string;
        partSize: number; // 分片大小
    };
}

interface HashResp extends Resp {
    data: {
        finish: boolean;
        fid: string;
        thumbnail: string;
        formatType: string;
    };
    metadata: {};
}

interface UpAuthResp extends Resp {
    data: {
        authKey: string;
        speed: number;
        headers: any[];
    };
    metadata: {};
}

interface Addition {
    cookie: string;
    rootID: driver.RootID;
    orderBy: 'none' | 'file_type' | 'file_name' | 'updated_at';
    orderDirection: 'asc' | 'desc';
}

interface Conf {
    ua: string;
    referer: string;
    api: string;
    pr: string;
}

class QuarkOrUC implements driver.Driver {
    config: driver.Config;
    conf: Conf;

    constructor(config: driver.Config, conf: Conf) {
        this.config = config;
        this.conf = conf;
    }
}

function init() {
    op.registerDriver((): driver.Driver => {
        return new QuarkOrUC(
            {
                name: 'Quark',
                onlyLocal: true,
                defaultRoot: '0',
                noOverwriteUpload: true,
            },
            {
                ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/2.5.20 Chrome/100.0.4896.160 Electron/18.3.5.4-b478491100 Safari/537.36 Channel/pckk_other_ch',
                referer: 'https://pan.quark.cn',
                api: 'https://drive.quark.cn/1/clouddrive',
                pr: 'ucpro',
            }
        );
    });

    op.registerDriver((): driver.Driver => {
        return new QuarkOrUC(
            {
                name: 'UC',
                onlyLocal: true,
                defaultRoot: '0',
                noOverwriteUpload: true,
            },
            {
                ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) uc-cloud-drive/2.5.20 Chrome/100.0.4896.160 Electron/18.3.5.4-b478491100 Safari/537.36 Channel/pckk_other_ch',
                referer: 'https://drive.uc.cn',
                api: 'https://pc-api.uc.cn/1/clouddrive',
                pr: 'UCBrowser',
            }
        );
    });
}

class QuarkOrUC implements driver.Driver {
    config: driver.Config;
    conf: Conf;
    addition: Addition;

    constructor(config: driver.Config, conf: Conf, addition: Addition) {
        this.config = config;
        this.conf = conf;
        this.addition = addition;
    }

    Config(): driver.Config {
        return this.config;
    }

    GetAddition(): driver.Additional {
        return this.addition;
    }

    async Init(ctx: Context): Promise<Error | null> {
        try {
            await this.request('/config', 'GET', null, null);
            return null;
        } catch (err) {
            return err;
        }
    }

    async Drop(ctx: Context): Promise<Error | null> {
        return null;
    }

    async List(ctx: Context, dir: model.Obj, args: model.ListArgs): Promise<model.Obj[]> {
        try {
            const files = await this.GetFiles(dir.GetID());
            return utils.SliceConvert(files, (src: File) => fileToObj(src));
        } catch (err) {
            throw err;
        }
    }

    async Link(ctx: Context, file: model.Obj, args: model.LinkArgs): Promise<model.Link> {
        const data = {
            fids: [file.GetID()],
        };
        const ua = this.conf.ua;
        const resp: DownResp = await this.request('/file/download', 'POST', (req: RestyRequest) => {
            req.setHeader('User-Agent', ua).setBody(data);
        });

        return {
            URL: resp.data[0].downloadUrl,
            Header: {
                Cookie: this.addition.cookie,
                Referer: this.conf.referer,
                'User-Agent': ua,
            } as IncomingHttpHeaders,
            Concurrency: 2,
            PartSize: 10 * utils.MB,
        };
    }

    async MakeDir(ctx: Context, parentDir: model.Obj, dirName: string): Promise<Error | null> {
        const data = {
            dir_init_lock: false,
            dir_path: '',
            file_name: dirName,
            pdir_fid: parentDir.GetID(),
        };
        try {
            await this.request('/file', 'POST', (req: RestyRequest) => {
                req.setBody(data);
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            return null;
        } catch (err) {
            return err;
        }
    }

    async Move(ctx: Context, srcObj: model.Obj, dstDir: model.Obj): Promise<Error | null> {
        const data = {
            action_type: 1,
            exclude_fids: [],
            filelist: [srcObj.GetID()],
            to_pdir_fid: dstDir.GetID(),
        };
        try {
            await this.request('/file/move', 'POST', (req: RestyRequest) => {
                req.setBody(data);
            });
            return null;
        } catch (err) {
            return err;
        }
    }

    async Rename(ctx: Context, srcObj: model.Obj, newName: string): Promise<Error | null> {
        const data = {
            fid: srcObj.GetID(),
            file_name: newName,
        };
        try {
            await this.request('/file/rename', 'POST', (req: RestyRequest) => {
                req.setBody(data);
            });
            return null;
        } catch (err) {
            return err;
        }
    }

    async Copy(ctx: Context, srcObj: model.Obj, dstDir: model.Obj): Promise<Error | null> {
        return errs.NotSupport;
    }

    async Remove(ctx: Context, obj: model.Obj): Promise<Error | null> {
        const data = {
            action_type: 1,
            exclude_fids: [],
            filelist: [obj.GetID()],
        };
        try {
            await this.request('/file/delete', 'POST', (req: RestyRequest) => {
                req.setBody(data);
            });
            return null;
        } catch (err) {
            return err;
        }
    }

    async Put(ctx: Context, dstDir: model.Obj, stream: model.FileStreamer, up: driver.UpdateProgress): Promise<Error | null> {
        const tempFile = await stream.CacheFullInTempFile();
        try {
            const md5Hash = createHash('md5');
            await utils.CopyWithBuffer(md5Hash, tempFile);
            const md5Str = md5Hash.digest('hex');

            const sha1Hash = createHash('sha1');
            await utils.CopyWithBuffer(sha1Hash, tempFile);
            const sha1Str = sha1Hash.digest('hex');

            const pre = await this.upPre(stream, dstDir.GetID());
            const finish = await this.upHash(md5Str, sha1Str, pre.data.taskId);
            if (finish) return null;

            const partSize = pre.metadata.partSize;
            const defaultBytes = Buffer.alloc(partSize);
            const total = stream.GetSize();
            let left = total;
            let partNumber = 1;
            const md5s: string[] = [];

            while (left > 0) {
                if (utils.IsCanceled(ctx)) return ctx.err;

                const bytes = left > partSize ? defaultBytes : Buffer.alloc(left);
                await tempFile.read(bytes);
                left -= bytes.length;

                const m = await this.upPart(ctx, pre, stream.GetMimetype(), partNumber, bytes);
                if (m === 'finish') return null;

                md5s.push(m);
                partNumber++;
                up(100 * (total - left) / total);
            }

            await this.upCommit(pre, md5s);
            return this.upFinish(pre);
        } catch (err) {
            return err;
        } finally {
            await tempFile.close();
        }
    }

    private async request(path: string, method: string, configure: (req: RestyRequest) => void, response?: any): Promise<any> {
        // Implement the request logic using a library like axios or fetch
    }

    private async GetFiles(id: string): Promise<File[]> {
        // Implement the logic to get files
    }

    private async upPre(stream: model.FileStreamer, id: string): Promise<any> {
        // Implement the logic for upPre
    }

    private async upHash(md5Str: string, sha1Str: string, taskId: string): Promise<boolean> {
        // Implement the logic for upHash
    }

    private async upPart(ctx: Context, pre: any, mimetype: string, partNumber: number, bytes: Buffer): Promise<string> {
        // Implement the logic for upPart
    }

    private async upCommit(pre: any, md5s: string[]): Promise<void> {
        // Implement the logic for upCommit
    }

    private async upFinish(pre: any): Promise<void> {
        // Implement the logic for upFinish
    }
}
