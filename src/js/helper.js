import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploaddata = undefined) {
  try {
    const fetchPro = uploaddata
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploaddata),
        })
      : fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    if (!res.ok)
      throw new Error(`🐔Cannot get Data ${data.message}  (${res.status})`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(`${url}`), timeout(TIMEOUT_SEC)]);
    // 'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886zz'

    const data = await res.json();
    // console.log(data);
    // console.log(typeof data);

    if (!res.ok)
      throw new Error(`🐔Cannot get Data ${data.message}  (${res.status})`);
    return data;
  } catch (err) {
    throw err;
    // throw new Error(`(${res.status}) ${err}`);
  }
};

export const sendJSON = async function (url, uploaddata) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploaddata),
    });
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok)
      throw new Error(`🐔Cannot Send Data ${data.message}  (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};
*/
