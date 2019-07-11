const {URL} = require('url');
const path = require('path');

function tryCatch(...params) {
  const func = params.shift();
  try {
    return func();
  } catch (err) {
    if (params.length > 0) {
      return tryCatch(...params);
    }
    throw err;
  }
}

function createUrl(url, base) {
  return tryCatch(
    () => {
      return new URL(url);
    },
    () => {
      return new URL(url, base);
    },
    () => {
      return {pathname: url, href: url};
    }
  );
}

function getPath(url) {
  const {pathname} = createUrl(url);
  let p = path.normalize(pathname);
  if (p.startsWith('..')) {
    return null;
  }
  if (p === '.') {
    return './';
  }
  if (p.startsWith('/')) {
    p = p.slice(1);
  }
  if (!p.startsWith('./')) {
    p = `./${p}`;
  }
  return p;
}

function getPathFromUrl(url) {
  return createUrl(url).pathname;
}

module.exports = {
  createUrl,
  getPathFromUrl,
  getPath
};
