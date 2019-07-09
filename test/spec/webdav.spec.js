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

  const mockFs = {
    existsSync(path) {
      return path === '/webdav' || path === '/path/to/dir';
    }
  };

  const WebDAVWriter = proxyquire('../../webdav', {fs: mockFs, webdav: mockWebdav});
  const createDirectorySpy = sinon.spy(mockWebdavMethods, 'createDirectory');
  const putFileContentsSpy = sinon.spy(mockWebdavMethods, 'putFileContents');
  const createWriteStreamSpy = sinon.spy(mockWebdavMethods, 'createWriteStream');

  try {
    let writer = new WebDAVWriter({rootPath: '/path/to/unknown'});
    let destPath = await writer.writeData({uri: 'abc.mp4', data: Buffer.alloc(10)});
    t.is(destPath, '/path/to/unknown/abc.mp4');
    t.is(createDirectorySpy.callCount, 1);
    t.is(createDirectorySpy.calledWith('/path/to/unknown'), true);
    t.is(putFileContentsSpy.callCount, 1);
    t.is(putFileContentsSpy.calledWith('/path/to/unknown/abc.mp4'), true);
    t.is(createWriteStreamSpy.callCount, 0);

    writer = new WebDAVWriter({rootPath: '/path/to/dir'});
    destPath = await writer.writeData({uri: 'def.mp4', data: new DummyReadable({})});
    t.is(destPath, '/path/to/dir/def.mp4');
    t.is(createDirectorySpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 1); // No additional call
    t.is(createWriteStreamSpy.callCount, 1);
    t.is(createWriteStreamSpy.calledWith('/path/to/dir/def.mp4'), true);

    writer = new WebDAVWriter({url: 'https://foo.bar/webdav'});
    destPath = await writer.writeData({uri: 'ghi.m3u8', data: 'text data'});
    t.is(destPath, '/webdav/ghi.m3u8');
    t.is(createDirectorySpy.callCount, 1); // No additional call
    t.is(createWriteStreamSpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 2);
    t.is(putFileContentsSpy.getCall(1).args[0], '/webdav/ghi.m3u8');

    writer = new WebDAVWriter({rootPath: '/path/to/dir'});
    destPath = await writer.writeData({uri: '/webdav/jkl.m3u8', data: 'text data'});
    t.is(destPath, '/webdav/jkl.m3u8');
    t.is(createDirectorySpy.callCount, 1); // No additional call
    t.is(createWriteStreamSpy.callCount, 1); // No additional call
    t.is(putFileContentsSpy.callCount, 3);
    t.is(putFileContentsSpy.getCall(2).args[0], '/webdav/jkl.m3u8');
  } catch (err) {
    t.fail(err.stack);
  }
});
