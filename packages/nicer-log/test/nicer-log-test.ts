import hello from 'nicer-log';

QUnit.module('nicer-log tests');

QUnit.test('hello', assert => {
  assert.equal(hello(), 'Hello from nicer-log');
});
