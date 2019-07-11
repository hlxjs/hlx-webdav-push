const test = require('ava');
const {getPath, createUrl, getPathFromUrl} = require('../../util');

test('util.getPath', t => {
  t.is(getPath('http://example.com'), './');
  t.is(getPath('http://example.com/'), './');
  t.is(getPath('http://example.com/abc'), './abc');
  t.is(getPath('http://example.com/abc/'), './abc/');
  t.is(getPath('http://example.com/abc/def'), './abc/def');
  t.is(getPath('http://example.com/abc/def/'), './abc/def/');
  t.is(getPath('http://example.com/abc/..'), './');
  t.is(getPath('http://example.com/abc/../'), './');
  t.is(getPath('http://example.com/abc/../def'), './def');
  t.is(getPath('http://example.com/abc/../def/'), './def/');
  t.is(getPath(''), './');
  t.is(getPath('/'), './');
  t.is(getPath('.'), './');
  t.is(getPath('./'), './');
  t.is(getPath('abc'), './abc');
  t.is(getPath('abc/'), './abc/');
  t.is(getPath('/abc'), './abc');
  t.is(getPath('/abc/'), './abc/');
  t.is(getPath('./abc'), './abc');
  t.is(getPath('./abc/'), './abc/');
  t.is(getPath('abc/def'), './abc/def');
  t.is(getPath('abc/def/'), './abc/def/');
  t.is(getPath('/abc/def'), './abc/def');
  t.is(getPath('/abc/def/'), './abc/def/');
  t.is(getPath('./abc/def'), './abc/def');
  t.is(getPath('./abc/def/'), './abc/def/');
  t.falsy(getPath('../abc'));
  t.falsy(getPath('../abc/'));
  t.is(getPath('abc/../def'), './def');
  t.is(getPath('abc/../def/'), './def/');
  t.is(getPath('/abc/../def'), './def');
  t.is(getPath('/abc/../def/'), './def/');
  t.is(getPath('./abc/../def'), './def');
  t.is(getPath('./abc/../def/'), './def/');
});

test('util.createUrl', t => {
  t.is(createUrl('http://foo.bar/dir/file').pathname, '/dir/file');
  t.is(createUrl('/dir/file').pathname, '/dir/file');
  t.is(createUrl('/dir2/file2', 'http://foo.bar/dir/file').pathname, '/dir2/file2');
  t.is(createUrl('/dir2/file2', 'http://foo.bar/dir/file').href, 'http://foo.bar/dir2/file2');
});

test('util.getPathFromUrl', t => {
  t.is(getPathFromUrl('http://foo.bar/dir/file'), '/dir/file');
  t.is(getPathFromUrl('/dir/file'), '/dir/file');
});
