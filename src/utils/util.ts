// base32字母表
const RFC4648_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * ArrayBuffer转换为可操作视图
 * @param data { ArrayBuffer }
 * @returns { DataView }
 */
const _toDataView = (data: ArrayBuffer) => {
    if (data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      return new DataView(data.buffer, data.byteOffset, data.byteLength);
    }
    if (data instanceof ArrayBuffer) {
      return new DataView(data);
    }
    throw new TypeError("Expected `data` to be an ArrayBuffer, Buffer, Int8Array, Uint8Array or Uint8ClampedArray");
}

/**
 * 将存储十六进制数据的ArrayBuffer转成base32字符串
 * @param data { ArrayBuffer }
 * @param alphabet { string } base32标准字母表
 * @returns { string } base32字符串
 */
const _base32Encode = (data: ArrayBuffer, alphabet: string) => {
    const view = _toDataView(data);
    let bits = 0, value = 0, output = "";
    for (let i = 0; i < view.byteLength; i++) {
        value = value << 8 | view.getUint8(i);
        bits += 8;
        while (bits >= 5) {
            output += alphabet[value >>> bits - 5 & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += alphabet[value << 5 - bits & 31];
    }
    return output;
}

/**
 * 16进制字符串转base32字符串
 * @param s { string } 十六进制字符串
 * @param alphabet { string } base32标准字母表
 * @returns { string } base32字符串
 */
export const hexToBase32 = (s: string, alphabet = RFC4648_ALPHABET) => {
    const buffer = new Array()
    const chars = s.split('');
    for (let i = 0; i < s.length; i+=2) {
        buffer.push(parseInt(`${chars[i]}${chars[i + 1]}`, 16));
    }
    return _base32Encode(new Uint8Array(buffer), alphabet);
}


/**
 * 返回字符在字母表中对应的序号
 * @param char { string } 单个字符
 * @param alphabet { string } base32标准字母表
 * @returns { number } 字符char在alphabet字母表中对应的序号
 */
const _readChar = (char: string, alphabet: string,) => {
    var index = alphabet.indexOf(char)

    if (index === -1) {
        throw new Error('Invalid character found: ' + char)
    }

    return index
}

/**
 * 十六进制字符串转ArrayBuffer
 * @param input { string } 16进制字符串
 * @param alphabet { string } base32标准字母表
 * @returns { ArrayBuffer } input对应的arrayBuffer
 */
const _base32Decode = (input: string, alphabet: string) => {
    const length = input.length
    let bits = 0, value = 0, index = 0;
    let output = new Uint8Array((length * 5 / 8) | 0);

    for (let i = 0; i < length; i++) {
        value = (value << 5) | _readChar(input[i], alphabet);
        bits += 5;
        if (bits >= 8) {
            output[index++] = (value >>> (bits -= 8)) & 255;
        }
    }

    return output.buffer
}

/**
 * base32字符串转16进制字符串
 * @param s { string } base32字符串
 * @param alphabet { string } base32标准字母表
 * @returns { string } 十六进制字符串
 */
export const base32ToHex = (s: string, alphabet = RFC4648_ALPHABET) =>
    Array.from(new Uint8Array(_base32Decode(s, alphabet))).map(x => x.toString(16)).join('');
