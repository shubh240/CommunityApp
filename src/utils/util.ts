// =================== import packages ====================
import * as fs from 'fs';
import _ from 'lodash';
import { randomBytes } from 'crypto';
import CryptoJS from 'crypto-js';
// ======================================================
import { SECRET_KEY } from '@/config';

export const convertISODate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  const pad = (num: number) => {
    let r = String(num);
    if (r.length === 1) {
      r = '0' + r;
    }
    return r;
  };

  const toISO = () => {
    return (
      dateObj.getFullYear() +
      '-' +
      pad(dateObj.getMonth() + 1) +
      '-' +
      pad(dateObj.getDate()) +
      'T' +
      pad(dateObj.getHours()) +
      ':' +
      pad(dateObj.getMinutes()) +
      ':' +
      pad(dateObj.getSeconds()) +
      '.' +
      String((dateObj.getMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
      'Z'
    );
  };

  return toISO();
};

export const fileDelete = (path: string, filename: string): boolean => {
  try {
    if (fs.existsSync(`${path}/${filename}`)) {
      fs.unlinkSync(`${path}/${filename}`);
      return true;
    }
  } catch (err) {
    return true;
  }
};

export const ucFirst = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;

export function createRandomToken() {
  return randomBytes(20).toString('hex');
}

// Encrypt
export const encrypt = (data: string) => {
  const cipherText = encodeURIComponent(CryptoJS.AES.encrypt(data, SECRET_KEY).toString());
  return cipherText;
};

export const convertUTCDate = (date: Date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDay(), date.getHours(), date.getMinutes(), date.getSeconds()),
  );
};

// Decrypt
export const decrypt = (data: string) => {
  const bytes = CryptoJS.AES.decrypt(decodeURIComponent(data), SECRET_KEY).toString(CryptoJS.enc.Utf8);
  return bytes;
};

export const parseData = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

export const removeFields = (obj: Object, keys: string[]) => {
  if (obj && Object.keys(obj).length) {
    keys.forEach((key) => delete obj[key]);
  }
  return obj;
};

export const isNumberValue = (text: string) => {
  return text && !_.isNaN(+text) && Number.isFinite(+text);
};

export const slugify = (str: string) => {
  return (
    str &&
    str
      .trim()
      .split(' ')
      .map((value) => value.toLowerCase())
      .join('_')
  );
};

export const fromBase64 = (str: string) => {
  return JSON.parse(Buffer.from(str, 'base64').toString());
};

export const convertBase64 = (data: Record<string, any>) => {
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

export const handleErrorMessage = (value: any) => {
  return value?.message ? value?.message : value;
};

export const isValidDate = (date: string | Date) => {
  if (typeof date === 'string') {
    return Object.prototype.toString.call(new Date(date)).slice(8, -1) === 'Date';
  }

  return date instanceof Date;
};

export const hasOwnProperty = (obj: Object, key: string) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};