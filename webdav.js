const path = require('path');
const {URL} = require('url');
const debug = require('debug');
const {createClient} = require('webdav');

const {tryCatch, buildLocalPath} = require('hlx-util');

const print = debug('hlx-webdav-push');

function createUrl(url, base) {
  return tryCatch(
    () => new URL(url),
    () => new URL(url, base),
    () => null
  );
}

class WebDAVWriter {
  constructor({url, user, pass, token, digest = false, agent, inputDir = '/'}) {
    this.url = url;
    if (!path.isAbsolute(inputDir)) {
      inputDir = path.join(process.cwd(), inputDir);
    }
    this.inputDir = inputDir;
    this.outputDir = createUrl(url).pathname;
    print(`WebDAVWriter#ctor: inputDir=${this.inputDir}, outputDir=${this.outputDir}`);
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
  }

  writeData({uri, parentUri, data}) {
    const {client, inputDir, outputDir} = this;

    const remotePath = buildLocalPath(uri, parentUri, inputDir, outputDir);

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
