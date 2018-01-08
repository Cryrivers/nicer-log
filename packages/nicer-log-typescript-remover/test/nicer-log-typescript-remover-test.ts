import hello from 'nicer-log-typescript-remover';

QUnit.module('nicer-log-typescript-remover tests');

QUnit.test('hello', assert => {
  assert.equal(hello(), 'Hello from nicer-log-typescript-remover');
});
