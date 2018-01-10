import { PluginObj, types as Types } from 'babel-core';
import { NodePath } from 'babel-traverse';

const PACKAGE_NAME = 'nicer-log';

export interface Babel {
  types: typeof Types;
}

export interface PluginLocalState {
  defaultNicerLogExport: string;
  functionsToBeStripped: string[];
}

function isNicerLogImport(path: NodePath<Types.ImportDeclaration>, t: Babel['types']) {
  if (t.isImportDeclaration(path.node)) {
    return path.node.source.value === PACKAGE_NAME;
  }
  return false;
}

export default function(babel: Babel) {
  const { types: t } = babel;

  const plugin: PluginObj<PluginLocalState> = {
    pre() {
      this.defaultNicerLogExport = '';
      this.functionsToBeStripped = [];
    },
    visitor: {
      ImportDeclaration(path) {
        if (isNicerLogImport(path, t)) {
          for (const specifier of path.node.specifiers) {
            if (t.isImportDefaultSpecifier(specifier)) {
              this.defaultNicerLogExport = specifier.local.name;
            } else {
              this.functionsToBeStripped.push(specifier.local.name);
            }
          }
          path.remove();
        }
      },
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          if (this.functionsToBeStripped.indexOf(path.node.callee.name) > -1) {
            path.remove();
          }
        } else if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.object)) {
          if (this.functionsToBeStripped.indexOf(path.node.callee.object.name) > -1) {
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
            subnode.init.callee.name === this.defaultNicerLogExport
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
