import Bencode from 'bencode'
import cryptoJs from 'crypto-js'
import { hexToBase32 } from './util';

export type CODE_TYPE = '32' | '40'

export function decode (buf: ArrayBuffer, codeType: CODE_TYPE = '40') {
    const buffer = new Uint8Array(buf);
    // @ts-ignore
		const { info } = Bencode.decode(buffer);
		const encodeInfo = Bencode.encode(info);
		const wordArray = cryptoJs.lib.WordArray.create(encodeInfo);
		let hash = cryptoJs.SHA1(wordArray).toString(cryptoJs.enc.Hex);
    if (codeType === '32') {
      hash = hexToBase32(hash);
    }
    return hash
}
