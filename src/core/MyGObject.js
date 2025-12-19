import { DepGraph } from "./DepGraph.js";

export class MyGObject {
    constructor() {
        // Regular properties (will be proxied)
        this._values = {};
        this._computed = {};
        this._bindings = [];
        this._graph = new DepGraph();
        this._frozen = 0;
        this._pending = new Set();

        // NON-REACTIVE properties (won't be proxied)
        // Define them with Object.defineProperty to avoid proxy
        const internalProps = {
            _history: { value: [], writable: true },
            _redoStack: { value: [], writable: true }
        };

        Object.defineProperties(this, internalProps);

        this._proxy = this._createProxy();
        this._initProperties();

        return this._proxy;
    }

    _createProxy() {
        return new Proxy(this, {
            get: (t, p) => (p in t._values ? t._values[p] : t[p]),
            set: (t, p, v) => {
                if (p === '_history' || p === '_redoStack') {
                    t[p] = v;
                    return true;
                }
                console.log('[STEP 2] proxy set', p, '=>', v);
                if (!(p in t._values)) {
                    t[p] = v;
                    return true;
                }

                // Get the current value before changing it
                const currentValue = t._values[p];  // THIS IS THE FIX

                if (currentValue === v) return true;

                // Save to history before changing
                if (!t._frozen) {
                    t._history.push({
                        prop: p,
                        oldValue: currentValue,
                        newValue: v
                    });
                    t._redoStack = []; // Clear redo stack on new action
                }

                t._values[p] = v;
                t._frozen ? t._pending.add(p) : t._propagate(p);
                return true;
            }
        });
    }

    _initProperties() {
        const defs = this.constructor.properties ?? {};
        for (const [k, d] of Object.entries(defs)) {
            if (d.compute) {
                this._computed[k] = d;
                this._values[k] = undefined;
                d.deps.forEach(dep => this._graph.addDependency(dep, k));
            } else {
                this._values[k] = d.default;
            }
        }
        Object.keys(this._computed).forEach(k => this._recompute(k));
    }

    _propagate(prop) {
        console.log('[STEP 4] _propagate', prop);

        // Recompute dependent computed properties
        for (const c of this._graph.dependentsOf(prop)) {
            this._recompute(c);
        }

        // Update bindings
        for (const b of this._bindings) {
            if (b.source === prop) {
                const value = this._values[prop];
                b.targetObj[b.target] = b.transform ? b.transform(value) : value;
            }
        }
    }

    _recompute(name) {
        console.log('[STEP 3] recompute', name);
        const def = this._computed[name];
        const next = def.compute.call(this._proxy);
        if (this._values[name] === next) return;

        const oldValue = this._values[name];
        this._values[name] = next;

        console.log('[STEP 3.5] computed value changed:', name, oldValue, '=>', next);

        // Update bindings for this computed property
        for (const b of this._bindings) {
            if (b.source === name) {
                console.log('[STEP 3.6] updating binding for', name, 'to', b.target);
                b.targetObj[b.target] = b.transform ? b.transform(next) : next;
            }
        }

        // Propagate to dependents of this computed property
        this._propagate(name);
    }

    // Add the bind method
    bind(sourceProp, targetObj, targetProp, options = {}) {
        console.log('[BIND] Creating binding:', sourceProp, '→', targetProp);

        const binding = {
            source: sourceProp,
            targetObj: targetObj,
            target: targetProp,
            transform: options.transform || null
        };

        this._bindings.push(binding);

        // Initial sync
        const value = this._values[sourceProp];
        targetObj[targetProp] = binding.transform ? binding.transform(value) : value;

        console.log('[BIND] Initial sync:', sourceProp, '=', value, '→', targetProp);

        return binding;
    }

    // Add freeze method
    freeze() {
        console.log('[FREEZE] called');
        this._frozen++;
    }

    // Add thaw method
    thaw() {
        console.log('[THAW] called');
        this._frozen = Math.max(0, this._frozen - 1);
        if (this._frozen === 0 && this._pending.size > 0) {
            const pending = Array.from(this._pending);
            this._pending.clear();
            pending.forEach(p => this._propagate(p));
        }
    }

    undo() {
        if (this._history.length === 0) return false;

        const lastAction = this._history.pop();
        this._redoStack.push(lastAction);

        // Restore old value
        this._values[lastAction.prop] = lastAction.oldValue;  // Use bracket notation
        this._propagate(lastAction.prop);

        return true;
    }

    redo() {
        if (this._redoStack.length === 0) return false;

        const nextAction = this._redoStack.pop();
        this._history.push(nextAction);

        // Apply the value again
        this._values[nextAction.prop] = nextAction.newValue;  // Use bracket notation
        this._propagate(nextAction.prop);

        return true;
    }

    // Debug method to see current state
    printState() {
        console.log('Current state:', JSON.stringify(this._values, null, 2));
    }

    // Debug method to see history
    printHistory() {
        console.log('=== Action History ===');
        this._history.forEach((action, index) => {
            console.log(`${index + 1}. ${action.prop}: ${action.oldValue} → ${action.newValue}`);
        });
        console.log('=====================');
    }

    // Debug method to see redo stack
    printRedoStack() {
        console.log('=== Redo Stack ===');
        this._redoStack.forEach((action, index) => {
            console.log(`${index + 1}. ${action.prop}: ${action.oldValue} → ${action.newValue}`);
        });
        console.log('==================');
    }

    // Clear all history (for testing)
    clearHistory() {
        this._history = [];
        this._redoStack = [];
    }
}