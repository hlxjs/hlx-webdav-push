const {Readable, Writable} = require('stream');
const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

test('webdav.writeData', async t => {
  class DummyReadable extends Readable {
    constructor(data) {
      super({objectMode: true});
      this.data = data;
    }

    _read() {
      this.push(this.data);
      this.push(null);
    }
  }

  class DummyWritable extends Writable {
    constructor() {
      super({objectMode: true});
    }

    _write(data, _, cb) {
      cb(null, data);
    }
  }

  const mockWebdavMethods = {
    stat(path) {
      if (path === '/webdav' || path === '/path/to/dir') {
        return {type: 'directory'};
      }
      if (path === '/path/to/file') {
        return {type: 'file'};
      }
      return null;
    },
    createDirectory(path) {
      return Promise.resolve(path);
    },
    putFileContents(path) {
      return Promise.resolve(path);
    },
    createWriteStream() {
      return new DummyWritable();
    }
  };

  const mockWebdav = {
    createClient() {
      return mockWebdavMethods;
    }
  };

  const WebDAVWriter = proxyquire('../../webdav', {webdav: mockWebdav});
  const putFileContentsSpy = sinon.spy(mockWebdavMethods, 'putFileContents');
  const createWriteStreamSpy = sinon.spy(mockWebdavMethods, 'createWriteStream');

  try {
    let writer = new WebDAVWriter({url: 'http://web.dav/dest/', inputDir: '/path/to'});
    let destPath = await writer.writeData({uri: 'abc.mp4', parentUri: 'file:///path/to/unknown/main.m3u8', data: Buffer.alloc(10)});
    t.is(destPath, '/dest/unknown/abc.mp4');
    t.is(putFileContentsSpy.callCount, 1);
    t.is(putFileContentsSpy.calledWith('/dest/unknown/abc.mp4'), true);
    t.is(createWriteStreamSpy.callCount, 0);

    writer = new WebDAVWriter({url: 'http://web.dav/dest/', inputDir: '/path/to/dir'});
    destPath = await writer.writeData({uri: 'def.mp4', parentUri: 'file:///path/to/dir/main.m3u8', data: new DummyReadable({})});
    t.is(destPath, '/dest/def.mp4');
    t.is(putFileContentsSpy.callCount, 1); // No additional call
    t.is(createWriteStreamSpy.callCount, 1);
    t.is(createWriteStreamSpy.calledWith('/dest/def.mp4'), true);

    writer = new WebDAVWriter({url: 'https://foo.bar/webdav'});
    destPath = await writer.writeData({uri: '/ghi.m3u8', data: 'text data'});
    t.is(destPath, '/webdav/ghi.m3u8');
    t.is(createWriteStreamSpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 2);
    t.is(putFileContentsSpy.getCall(1).args[0], '/webdav/ghi.m3u8');

    writer = new WebDAVWriter({url: 'http://web.dav/dest/'});
    destPath = await writer.writeData({uri: '/webdav/jkl.m3u8', data: 'text data'});
    t.is(destPath, '/dest/webdav/jkl.m3u8');
    t.is(createWriteStreamSpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 3);
    t.is(putFileContentsSpy.getCall(2).args[0], '/dest/webdav/jkl.m3u8');

    writer = new WebDAVWriter({url: 'https://foo.bar/webdav'});
    destPath = await writer.writeData({uri: '/ghi.m3u8?abc=def', data: 'text data'});
    t.is(destPath, '/webdav/ghi.m3u8');
    t.is(createWriteStreamSpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 4);
    t.is(putFileContentsSpy.getCall(3).args[0], '/webdav/ghi.m3u8');

    writer = new WebDAVWriter({url: 'https://foo.bar/webdav'});
    destPath = await writer.writeData({uri: '/ghi.m3u8#default', data: 'text data'});
    t.is(destPath, '/webdav/ghi.m3u8');
    t.is(createWriteStreamSpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 5);
    t.is(putFileContentsSpy.getCall(4).args[0], '/webdav/ghi.m3u8');
  } catch (err) {
    t.fail(err.stack);
  }
});
