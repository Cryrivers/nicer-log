function isNicerLogImport(path, t) {
  return (
    path.node.source.value === 'nicer-log' &&
    path.node.specifiers.length === 1 &&
    t.isImportDefaultSpecifier(path.node.specifiers[0])
  );
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
        if (isNicerLogImport(path, t)) {
          this.defaultColorfulConsoleExportName = path.node.specifiers[0].local.name;
          path.remove();
        }
      },
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          if (this.functionsToBeStripped.includes(path.node.callee.name)) {
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
