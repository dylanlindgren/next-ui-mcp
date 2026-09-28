import { parse } from '@babel/parser';
import * as _traverseModule from '@babel/traverse';

// @babel/traverse ships as CJS with a `default` export that is ITSELF wrapped
// (m.default is an object, m.default.default is the real callable) when loaded
// from Node ESM. Unwrap however many layers of `.default` it takes to reach a
// function. Typed loosely on purpose: @types/babel__traverse's namespace shape
// doesn't line up cleanly with the runtime interop under NodeNext resolution.
function unwrapDefault(mod: any): any {
  let candidate = mod;
  for (let i = 0; i < 3 && typeof candidate !== 'function'; i++) {
    candidate = candidate?.default;
  }
  return candidate;
}

const traverse = unwrapDefault(_traverseModule) as (
  ast: any,
  visitor: Record<string, (path: any) => void>
) => void;

export interface ComponentApi {
  /** Property names declared in the `properties` object passed to createCustomElement. */
  properties: string[];
  /** Action names this component *handles* (keys of `actionHandlers`), where statically resolvable. */
  actionHandlers: string[];
  /** Action/event names this component *dispatches* via dispatch(name, payload). */
  dispatchedActions: string[];
}

function keyName(key: any): string | undefined {
  if (!key) return undefined;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'StringLiteral') return key.value;
  // Computed keys like [actionTypes.COMPONENT_CONNECTED]: handler — best-effort label
  // using the property name, since we can't resolve the imported constant's value statically.
  if (key.type === 'MemberExpression' && key.property?.type === 'Identifier') {
    return key.property.name;
  }
  return undefined;
}

/**
 * Statically extracts the public API surface (properties, handled actions, dispatched
 * actions/events) from a Now/Next Experience UI Framework component's index.js source,
 * without executing it.
 *
 * Known v1 limitations (best-effort, not exhaustive):
 * - actionHandlers keyed by an imported constant used as a bare identifier (not
 *   `actionTypes.X` member access) can't be resolved to its real string value.
 * - dispatch() calls whose event name is computed at runtime (not a string literal or a
 *   simple top-level `const X = 'literal'`) are not detected.
 */
export function parseComponentSource(source: string): ComponentApi {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties', 'objectRestSpread']
  });

  const properties = new Set<string>();
  const actionHandlers = new Set<string>();
  const dispatchedActions = new Set<string>();
  const stringConstants = new Map<string, string>();

  // First pass: collect top-level `const X = 'literal'` so dispatch(X, ...) can be resolved.
  traverse(ast, {
    VariableDeclarator(path) {
      const id = path.node.id;
      const init = path.node.init;
      if (id.type === 'Identifier' && init && init.type === 'StringLiteral') {
        stringConstants.set(id.name, init.value);
      }
    }
  });

  function literalOrConst(node: any): string | undefined {
    if (!node) return undefined;
    if (node.type === 'StringLiteral') return node.value;
    if (node.type === 'Identifier') return stringConstants.get(node.name);
    return undefined;
  }

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;

      if (callee.type === 'Identifier' && callee.name === 'createCustomElement') {
        const configArg = path.node.arguments[1] as any;
        if (configArg?.type === 'ObjectExpression') {
          for (const prop of configArg.properties) {
            if (prop.type !== 'ObjectProperty') continue;
            const groupKey = keyName(prop.key);

            if (groupKey === 'properties' && prop.value.type === 'ObjectExpression') {
              for (const p of prop.value.properties) {
                if (p.type === 'ObjectProperty' || p.type === 'ObjectMethod') {
                  const name = keyName(p.key);
                  if (name) properties.add(name);
                }
              }
            }

            if (groupKey === 'actionHandlers' && prop.value.type === 'ObjectExpression') {
              for (const p of prop.value.properties) {
                if (p.type === 'ObjectProperty' || p.type === 'ObjectMethod') {
                  const name = keyName(p.key);
                  if (name) actionHandlers.add(name);
                }
              }
            }
          }
        }
      }

      if (callee.type === 'Identifier' && callee.name === 'dispatch') {
        const value = literalOrConst(path.node.arguments[0] as any);
        if (value) dispatchedActions.add(value);
      }
    }
  });

  return {
    properties: [...properties],
    actionHandlers: [...actionHandlers],
    dispatchedActions: [...dispatchedActions]
  };
}
