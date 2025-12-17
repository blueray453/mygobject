// ================================
// Minimal Reference Implementation
// MyGObject (v0.1 – Proof of Model)
// ================================

/*
GOALS (what this minimal version proves):
- Declarative properties
- Reactive propagation (no signals for property change)
- Computed properties with explicit dependencies
- One-way bindings
- Lifecycle-scoped cleanup

NON-GOALS (intentionally omitted):
- Persistence
- DOM adapter
- Bidirectional bindings
- Nested reactivity
*/

// -------------------------------
// Utility: simple dependency graph
// -------------------------------
class DepGraph {
    constructor() {
        this.deps = new Map(); // prop -> Set(of computed props)
    }

    addDependency(source, target) {
        if (!this.deps.has(source)) {
            this.deps.set(source, new Set());
        }
        this.deps.get(source).add(target);
    }

    getDependents(prop) {
        return this.deps.get(prop) ?? new Set();
    }
}

// -------------------------------
// Core: MyGObject
// -------------------------------
export class MyGObject {
    static properties = {};

    constructor() {
        this._values = {};
        this._computed = {};
        this._bindings = [];
        this._disposed = false;
        this._graph = new DepGraph();

        this._proxy = this._createProxy();

        // IMPORTANT: initialize properties AFTER proxy exists
        this._initProperties();

        return this._proxy; // IMPORTANT: user interacts with proxy
    }

    // -----------------------------
    // Property initialization
    // -----------------------------
    _initProperties() {
        const schema = this.constructor.properties;

        for (const [name, def] of Object.entries(schema)) {
            if (def.compute) {
                this._computed[name] = def;
                this._values[name] = undefined;

                // register dependencies
                for (const dep of def.deps ?? []) {
                    this._graph.addDependency(dep, name);
                }

                // initial compute
                this._recompute(name);
            } else {
                this._values[name] = def.default;
            }
        }
    }

    // -----------------------------
    // Proxy for reactive access
    // -----------------------------
    _createProxy() {
        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target._values) {
                    return target._values[prop];
                }
                return target[prop];
            },

            set: (target, prop, value) => {
                if (target._disposed) {
                    throw new Error("Cannot mutate disposed object");
                }

                if (!(prop in target._values)) {
                    target[prop] = value;
                    return true;
                }

                const old = target._values[prop];
                if (old === value) return true;

                target._values[prop] = value;

                // propagate to computed properties
                for (const dep of target._graph.getDependents(prop)) {
                    target._recompute(dep);
                }

                // propagate bindings
                for (const b of target._bindings) {
                    if (b.source === prop) {
                        b.targetObj[b.target] = b.transform
                            ? b.transform(value)
                            : value;
                    }
                }

                return true;
            }
        });
    }

    // -----------------------------
    // Computed recomputation
    // -----------------------------
    _recompute(name) {
        const def = this._computed[name];
        const old = this._values[name];
        const newVal = def.compute.call(this._proxy);

        if (old === newVal) return;

        this._values[name] = newVal;

        // propagate bindings that depend on this computed property
        for (const b of this._bindings) {
            if (b.source === name) {
                b.targetObj[b.target] = b.transform
                    ? b.transform(newVal)
                    : newVal;
            }
        }
    }

    // -----------------------------
    // Binding API (one-way)
    // -----------------------------
    bind(sourceProp, targetObj, targetProp, transform) {
        this._bindings.push({
            source: sourceProp,
            targetObj,
            target: targetProp,
            transform
        });

        // initial sync
        targetObj[targetProp] = transform
            ? transform(this[sourceProp])
            : this[sourceProp];
    }

    // -----------------------------
    // Lifecycle
    // -----------------------------
    dispose() {
        this._bindings.length = 0;
        this._disposed = true;
    }
}

// ================================
// Example Usage
// ================================

class User extends MyGObject {
    static properties = {
        firstName: { default: "Ada" },
        lastName: { default: "Lovelace" },

        fullName: {
            deps: ["firstName", "lastName"],
            compute() {
                return this.firstName + " " + this.lastName;
            }
        }
    };
}

// -------------------------------
// Todo + Counter Example
// -------------------------------

class TodoModel extends MyGObject {
    static properties = {
        todos: { default: [] },

        completedCount: {
            deps: ["todos"],
            compute() {
                return this.todos.filter(t => t.done).length;
            }
        },

        totalCount: {
            deps: ["todos"],
            compute() {
                return this.todos.length;
            }
        }
    };

    addTodo(text) {
        // IMPORTANT: replace array to trigger reactivity
        this.todos = [...this.todos, { text, done: false }];
    }

    toggleTodo(index) {
        const copy = this.todos.map((t, i) =>
            i === index ? { ...t, done: !t.done } : t
        );
        this.todos = copy;
    }
}

// -------------------------------
// Sample Input / Output
// -------------------------------

console.log("--- User example ---");
const user = new User();
console.log(user.fullName);
// Ada Lovelace

user.firstName = "Grace";
console.log(user.fullName);
// Grace Lovelace

const label = { text: "" };
user.bind("fullName", label, "text");
console.log(label.text);
// Grace Lovelace

user.lastName = "Hopper";
console.log(label.text);
// Grace Hopper

console.log("--- Todo example---");
const todos = new TodoModel();

console.log(todos.totalCount, todos.completedCount);
// 0 0

todos.addTodo("Learn MyGObject");
todos.addTodo("Build Electron app");

console.log(todos.totalCount, todos.completedCount);
// 2 0

todos.toggleTodo(0);
console.log(todos.totalCount, todos.completedCount);
// 2 1
