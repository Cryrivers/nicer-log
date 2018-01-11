import nicerLogTypeScriptRemover from 'nicer-log-remover-typescript';
import * as ts from 'typescript';

QUnit.module('nicer-log-remover-typescript tests');

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

QUnit.test('it can strip all usages of nicer-log', assert => {
  const sourceFile = ts.createSourceFile('test.ts', exampleSourceCode, ts.ScriptTarget.ES2017, true, ts.ScriptKind.TS);
  const result = ts.transform<ts.SourceFile>(sourceFile, [nicerLogTypeScriptRemover]);
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });

  assert.equal(printer.printFile(result.transformed[0]), ';\n;\n;\nconst a = 0;\n;\n;\n;\n;\nconst dummyAssignment = 5;\nsomeDummyFunction();\n');
});
