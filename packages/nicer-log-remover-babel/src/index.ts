function isNicerLogImport(path) {
  return path.node.source.value === 'nicer-log';
}

export default function(babel) {
  const { types: t } = babel;

  const plugin = {
    pre() {
      this.defaultColorfulConsoleExportName = '';
      this.functionsToBeStripped = [];
    },
    visitor: {
      ImportDeclaration(path) {
        if (isNicerLogImport(path)) {
          for (const specifier of path.node.specifiers) {
            if (t.isImportDefaultSpecifier(specifier)) {
              this.defaultColorfulConsoleExportName = specifier.local.name;
            } else {
              this.functionsToBeStripped.push(specifier.local.name);
            }
          }
          path.remove();
        }
      },
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          if (this.functionsToBeStripped.includes(path.node.callee.name)) {
            path.remove();
          }
        } else if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.object)) {
          if (this.functionsToBeStripped.includes(path.node.callee.object.name)) {
            path.remove();
          }
        }
      },
      VariableDeclaration(path) {
        const onlyOneDeclaration = path.node.declarations.length === 1;
        for (const subnode of path.node.declarations) {
          if (
            t.isCallExpression(subnode.init) &&
            t.isIdentifier(subnode.init.callee) &&
            subnode.init.callee.name === this.defaultColorfulConsoleExportName
          ) {
            if (t.isIdentifier(subnode.id)) {
              this.functionsToBeStripped.push(subnode.id.name);
            }
            if (onlyOneDeclaration) {
              path.remove();
            } else {
              path.node.declarations = path.node.declarations.filter(item => item !== subnode);
            }
          }
        }
      }
    }
  };

  return plugin;
}
