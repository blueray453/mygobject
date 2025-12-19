console.log("🔥 DOMAdapter VERSION 3 LOADED");

// src/dom/DOMAdapter.js

/**
 * DOMAdapter: Bind MyGObject/PersistenceGObject properties to DOM elements
 */
export class DOMAdapter {
    static bind(sourceObj, prop, element, attr, transform) {
        console.log(
            '[DOMAdapter] attaching listener to element ===',
            element,
            ' current value =',
            element.value
        );
        const proxy = sourceObj._proxy ?? sourceObj;

        // initial sync
        element[attr] = transform ? transform(proxy[prop]) : proxy[prop];

        // object → DOM
        proxy.bind(prop, element, attr, { transform });

        // DOM → object
        if (attr === 'value' || attr === 'checked') {
            const eventName = attr === 'value' ? 'input' : 'change';
            element.addEventListener(eventName, () => {
                proxy[prop] = element[attr];   // ✅ ALWAYS proxy
            });
        }
    }
}