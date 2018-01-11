import * as Babel from 'babel-core';
import nicerLogRemoverBabel from 'nicer-log-remover-babel';

QUnit.module('nicer-log-remover-babel tests');

const exampleSourceCode = `
import nicerLog, { setNicerLogWhitelist as setWhitelist, setNicerLogBlacklist } from 'nicer-log';
setWhitelist(['a']);
setNicerLogBlacklist(['b']);
const a = 0, b = nicerLog('test');
const c = nicerLog('test2');
b('log something');
b.async('dummy promise test', Promise.resolve());
c('hi');
const dummyAssignment = 5;
someDummyFunction();
`;

QUnit.test('hello', assert => {
  const result = Babel.transform(exampleSourceCode, {
    plugins: [nicerLogRemoverBabel]
  });
  assert.equal(result.code, '\nconst a = 0;\n\nconst dummyAssignment = 5;\nsomeDummyFunction();');
});
