const fs = require('fs');
const path = require('path');
const debug = require('debug');
const {createClient} = require('webdav');

const {getPathFromUrl, getPath, createUrl} = require('./util');

const print = debug('hlx-webdav-push');

class WebDAVWriter {
  constructor({url, user, pass, token, rootPath = getPathFromUrl(url), digest = false, agent}) {
    this.rootPath = rootPath;
    this.url = url;
    print(`WebDAVWriter#ctor: rootPath=${rootPath}`);
    if (user && pass) {
      this.client = createClient(url, {
        username: user,
        password: pass,
        digest,
        httpAgent: agent
      });
    } else {
      this.client = createClient(url, {
        token
      });
    }
    if (!path.isAbsolute(rootPath)) {
      rootPath = path.join('/', rootPath);
    }
  }

  async writeData({uri, data}) {
    const {client, rootPath} = this;

    print(`writeData: Enter. uri="${uri}", rootPath="${rootPath}"`);

    if (!data) {
      return Promise.reject(new Error('No data'));
    }

    let remotePath;

    // Remove query strings
    const obj = createUrl(uri, this.url);
    obj.search = '';
    obj.hash = '';
    uri = obj.href;

    if (path.isAbsolute(uri)) {
      if (fs.existsSync(uri)) {
        remotePath = path.join(rootPath, path.basename(uri));
      } else {
        remotePath = path.join(rootPath, getPathFromUrl(uri));
      }
    } else {
      remotePath = path.join(rootPath, getPath(uri));
    }

    print(`\tremotePath=${remotePath}`);

    // Create directory
    /*
    const dir = path.dirname(remotePath);
    const stat = await client.stat(dir);
    if (!stat || stat.type !== 'directory') {
      print(`\tCreate directory: ${dir}`);
      await client.createDirectory(dir);
    }
    */

    if (Buffer.isBuffer(data)) {
      print('\tWrite binary data');
      return client.putFileContents(remotePath, data, {overwrite: false}).then(() => remotePath);
    }

    if (typeof data === 'string') {
      print('\tWrite text data');
      return client.putFileContents(remotePath, data).then(() => remotePath);
    }

    if (typeof data.pipe === 'function') {
      print('\tWrite stream');
      return new Promise((resolve, reject) => {
        data.pipe(client.createWriteStream(remotePath))
        .on('finish', () => {
          return resolve(remotePath);
        })
        .on('error', err => {
          return reject(err);
        });
      });
    }
    return Promise.reject(new Error('data should be either a string, a buffer or a readable stream'));
  }
}

module.exports = WebDAVWriter;
