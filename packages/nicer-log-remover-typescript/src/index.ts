import * as ts from 'typescript';

const PACKAGE_NAME = 'nicer-log';

/**
 * @description
 * Try to find `import nicerLog from 'nicer-log';` in the source code, so
 * we can remove it later on.
 * @param {ts.Node} node a TypeScript node
 */
function isNicerLogImport(node: ts.Node): node is ts.ImportDeclaration {
  if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
    return node.moduleSpecifier.text === PACKAGE_NAME;
  }
  return false;
}

function removeNode(node: ts.Node): ts.EmptyStatement {
  return ts.createEmptyStatement();
}

const transformer: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
  let defaultColorfulConsoleExportName: string = '';
  const functionsToBeStripped: string[] = [];
  const visitor: ts.Visitor = node => {
    if (isNicerLogImport(node)) {
      if (node.importClause && node.importClause.name) {
        defaultColorfulConsoleExportName = node.importClause.name.text;
        if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          // Remove `setNicerLogBlacklist` and `setNicerLogWhitelist`
          for (const element of node.importClause.namedBindings.elements) {
            functionsToBeStripped.push(element.name.text);
          }
        }
      }
      return removeNode(node);
    } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      // Remove `log('blablabla');
      if (functionsToBeStripped.includes(node.expression.text)) {
        return removeNode(node);
      }
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression)) {
      // Remove `log.async('blablabla');
      if (functionsToBeStripped.includes(node.expression.expression.text)) {
        return removeNode(node);
      }
    } else if (ts.isVariableStatement(node)) {
      const onlyOneDeclaration = node.declarationList.declarations.length === 1;
      for (const subnode of node.declarationList.declarations) {
        if (
          subnode.initializer &&
          ts.isCallExpression(subnode.initializer) &&
          ts.isIdentifier(subnode.initializer.expression)
        ) {
          if (subnode.initializer.expression.text === defaultColorfulConsoleExportName) {
            if (ts.isIdentifier(subnode.name)) {
              functionsToBeStripped.push(subnode.name.text);
            }
            if (onlyOneDeclaration) {
              return removeNode(node);
            } else {
              node.declarationList.declarations = ts.createNodeArray(
                node.declarationList.declarations.filter(item => item !== subnode)
              );
            }
          }
        }
      }
    }
    return ts.visitEachChild(node, visitor, context);
  };
  return sourceFile => {
    return ts.visitNode(sourceFile, visitor);
  };
};

export default transformer;
