// =================== import packages ==================
import { Response } from 'express';
import request from 'request'
// ======================================================

export const generalResponse = (
  response: Response,
  data: any = null,
  message = '',
  responseType = 'success',
  toast = false,
  statusCode = 200,
) => {
  response.status(statusCode).send({
    data,
    message,
    toast,
    responseType,
  });
};

export const isExpired = (dateTime: string) => {
  return new Date().getTime() > new Date(dateTime).getTime();
};

export const isNumeric = (n: any) => {
  // eslint-disable-next-line no-restricted-globals
  return n && !isNaN(parseFloat(n)) && isFinite(n);
};

export const cleanObj = (obj: { [key: string]: any }) => {
  Object.keys(obj).forEach((key: string) => {
    try {
      if (obj[key] === '') {
        obj[key] = null;
      }
      if (!isNumeric(obj[key])) {
        obj[key] = JSON.parse(obj[key]);
      }
    } catch (err) {
      // do nothing
    }
  });
  return obj;
};

export const dateFormat = (value: string | Date | null | undefined) => {
  if (value) {
    if (!Number.isNaN(new Date(value).getTime())) {
      return new Date(value);
    }
    return null;
  }
  return null;
};

export const stringToJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

export const validateEmail = (inputText) => {
  var mailFormat =  /\S+@\S+\.\S+/;
  if (inputText.match(mailFormat)) {
    return true;
  } else {
    return false;
  }
}

export const toFindDuplicates = (arry: any[]) => {
  const uniqueElements = new Set(arry);
  const filteredElements = arry.filter(item => {
      if (uniqueElements.has(item)) {
          uniqueElements.delete(item);
      } else {
          return item;
      }
  });

  return [...new Set(filteredElements)]
}

export const stringAppender = (str: string, append: string) => {
  return str ? `${str} ${append}` : `${append}` 
}

export const doRequest = (url, append, key) => {
  return new Promise(function (resolve, reject) {
    request.get({url, encoding: null}, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let base64 = `data:image/png;base64,${Buffer.from(body).toString('base64')}`
        resolve({...append, [key]: base64});
      } else {
        reject(error);
      }
    });
  });
}

export const normalizeObject = (obj: Object) => {
  return JSON.parse(JSON.stringify(obj))
}

export const mySqlDateFormate = (value: Date) => {

  let year = value.getUTCFullYear()
  let month = value.getUTCMonth() < 10 ? `0${value.getUTCMonth() + 1}` : value.getUTCMonth() + 1
  let date = value.getUTCDate() < 10 ? `0${value.getUTCDate()}` : value.getUTCDate()
  
  let hour = value.getUTCHours() < 10 ? `0${value.getUTCHours()}` : value.getUTCHours()
  let minutes = value.getUTCMinutes() < 10 ? `0${value.getUTCMinutes()}` : value.getUTCMinutes()
  let seconds = value.getUTCSeconds() < 10 ? `0${value.getUTCSeconds()}` : value.getUTCSeconds()

  return `${year}-${month}-${date} ${hour}:${minutes}:${seconds}`
}