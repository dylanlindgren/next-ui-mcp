import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNowUiJson } from './validateNowUiJson.js';

test('validateNowUiJson accepts a schema-valid manifest', () => {
  const result = validateNowUiJson({
    scopeName: 'my-scope',
    components: {
      'my-scope-demo-card': {
        uiBuilder: {
          label: 'Demo card',
          description: 'Example component',
          tileIcon: './tile-icon/generic-tile-icon.svg'
        },
        properties: [
          {
            name: 'title',
            label: 'Title',
            fieldType: 'string',
            defaultValue: 'Demo',
            typeMetadata: {
              schema: {
                type: 'string'
              }
            }
          }
        ],
        actions: []
      }
    }
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateNowUiJson rejects a missing or blank uiBuilder tileIcon', () => {
  for (const component of [
    { uiBuilder: { tileIcon: undefined } },
    { uiBuilder: { tileIcon: '  ' } },
    {}
  ]) {
    const result = validateNowUiJson({
      components: {
        'my-scope-demo-card': component
      }
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((issue) => issue.path === 'components.my-scope-demo-card.uiBuilder.tileIcon'));
  }
});

test('validateNowUiJson rejects an invalid manifest shape', () => {
  const result = validateNowUiJson({
    scopeName: 'my-scope',
    components: 'not-an-object'
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});
