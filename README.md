[![Build Status](https://travis-ci.org/hlxjs/hlx-webdav-push.svg?branch=master)](https://travis-ci.org/hlxjs/hlx-webdav-push)
[![Coverage Status](https://coveralls.io/repos/github/hlxjs/hlx-webdav-push/badge.svg?branch=master)](https://coveralls.io/github/hlxjs/hlx-webdav-push?branch=master)
[![Dependency Status](https://david-dm.org/hlxjs/hlx-webdav-push.svg)](https://david-dm.org/hlxjs/hlx-webdav-push)
[![Development Dependency Status](https://david-dm.org/hlxjs/hlx-webdav-push/dev-status.svg)](https://david-dm.org/hlxjs/hlx-webdav-push#info=devDependencies)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

# hlx-webdav-push
A writable stream to send HLS streams to an external WebDAV server

## Features
* Being used with other [`hlx`](https://github.com/hlxjs) objects, it provides a functionality to send every HLS related data (playlist and segments) to an external webdav endpoint.

## Install
[![NPM](https://nodei.co/npm/hlx-webdav-push.png?mini=true)](https://nodei.co/npm/hlx-webdav-push/)

## Usage

```js
const hlx = require('hlx');
const {createWriteStream} = require('hlx-webdav-push');

const webdav = createWriteStream({
  url: 'http://foo.bar/webdav',
  user: '{webdav user}',
  pass: '{webdav password}'
});

// Send files to an external webdav endpoint
hlx.src('http://example.com/master.m3u8')
.pipe(decryptor)
.pipe(hlx.dest(webdav))
.on('error', err => {
  console.log(err.stack);
});
```
## API
The features are built on top of the Node's [transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform).

### `createWriteStream(options)`
Creates a new `TransformStream` object.

#### params
| Name    | Type   | Required | Default | Description   |
| ------- | ------ | -------- | ------- | ------------- |
| options | object | Yes       | N/A      | See below     |

#### options
| Name        | Type   | Default | Description                       |
| ----------- | ------ | ------- | --------------------------------- |
| url | string | N/A     | URL of the destination (webdav server endpoint) |
| user | string | N/A   | Basic auth user name |
| pass | string | N/A   | Basic auth password for the server |
| token | object | N/A   | An object holding Access Token parameters issued by [OAuth 2.0](https://tools.ietf.org/html/rfc6749) auth server. Client must specify either `token` or `user`/`path`. `token` is ignored when `user`/`pass` are present. |
| rootPath | string | The path included in `url` | Will be used when the playlist contains relative urls |
| concurrency | number | 6       | Max number of requests concurrently sent |


#### return value
An instance of `TransformStream`.
