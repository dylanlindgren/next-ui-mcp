import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

// Namespaced event names avoid colliding with other components' events on the same page.
const VALUE_SELECTED = 'MY_SELECTABLE_LIST#VALUE_SELECTED';

const isReadOnly = (state) => Boolean(state.properties.readOnly);

const view = (state, { dispatch }) => {
    const options = state.properties.options || [];
    const readOnly = isReadOnly(state);

    return (
        <div className={`my-selectable-list${readOnly ? ' is-read-only' : ''}`}>
            <div
                className="my-selectable-list__items"
                role="radiogroup"
                aria-label={state.label || 'Select an option'}
                aria-readonly={readOnly}
            >
                {options.map((option) => {
                    const isDisabled = state.disabled || option.disabled;
                    const isNonInteractive = readOnly || isDisabled || option.readonly;
                    const selectOption = () => {
                        if (isNonInteractive) return;

                        // Dispatching is the ONLY way a component talks to the outside world.
                        // The event name below must have a matching entry in this component's
                        // "actions" array in now-ui.json, or consumers can't discover it exists.
                        dispatch(VALUE_SELECTED, {
                            value: option.id,
                            option
                        });
                    };

                    return (
                        <div
                            key={String(option.id)}
                            className={`my-selectable-list__row ${option.checked ? 'is-selected' : ''} ${isNonInteractive ? 'is-disabled' : ''}`}
                            on-click={selectOption}
                        >
                            <input
                                type="radio"
                                name={state.name || 'my-selectable-list'}
                                checked={option.checked}
                                disabled={isDisabled || readOnly}
                                aria-label={option.label}
                                on-change={selectOption}
                            />
                            <span className="my-selectable-list__label">{option.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// The SECOND argument's `properties` object is this component's public API surface.
// Every key here needs a matching entry in now-ui.json's components["selectable-list"].properties.
createCustomElement('selectable-list', {
    renderer: { type: snabbdom },
    view,
    properties: {
        options: { type: 'array' },
        readOnly: { type: 'boolean', default: false }
    },
    styles
});
