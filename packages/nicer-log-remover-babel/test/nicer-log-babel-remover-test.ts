import hello from 'nicer-log-babel-remover';

QUnit.module('nicer-log-babel-remover tests');

QUnit.test('hello', assert => {
  assert.equal(hello(), 'Hello from nicer-log-babel-remover');
});
