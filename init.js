class DepGraph {
    constructor() {
        this.forward = new Map(); // prop -> Set(computed)
        this.reverse = new Map(); // computed -> Set(props)
    }

    addDependency(prop, computed) {
        if (!this.forward.has(prop)) this.forward.set(prop, new Set());
        if (!this.reverse.has(computed)) this.reverse.set(computed, new Set());
        this.forward.get(prop).add(computed);
        this.reverse.get(computed).add(prop);
    }

    dependentsOf(prop) {
        return this.forward.get(prop) ?? new Set();
    }
}

export class MyGObject {
    constructor() {
        this._values = {};
        this._computed = {};
        this._bindings = [];
        this._graph = new DepGraph();
        this._frozen = 0;
        this._pending = new Set();
        this._disposed = false;

        this._proxy = this._createProxy();
        this._initProperties();

        return this._proxy;
    }

    // ----------------------------
    // Proxy Layer
    // ----------------------------

    _createProxy() {
        return new Proxy(this, {
            get: (t, p) => {
                if (p in t._values) return t._values[p];
                return t[p];
            },

            set: (t, p, v) => {
                if (!(p in t._values)) {
                    t[p] = v;
                    return true;
                }

                const old = t._values[p];
                if (old === v) return true;

                t._values[p] = v;

                if (t._frozen) {
                    t._pending.add(p);
                } else {
                    t._propagate(p);
                }

                return true;
            }
        });
    }

    // ----------------------------
    // Property Initialization
    // ----------------------------

    _initProperties() {
        const defs = this.constructor.properties ?? {};

        for (const [name, def] of Object.entries(defs)) {
            if (def.compute) {
                this._computed[name] = def;
                this._values[name] = undefined;
                for (const dep of def.deps) {
                    this._graph.addDependency(dep, name);
                }
            } else {
                this._values[name] = def.default;
            }
        }

        for (const name of Object.keys(this._computed)) {
            this._recompute(name);
        }
    }

    // ----------------------------
    // Reactive Propagation
    // ----------------------------

    _propagate(prop) {
        for (const c of this._graph.dependentsOf(prop)) {
            this._recompute(c);
        }

        for (const b of this._bindings) {
            if (b.source === prop) {
                b.targetObj[b.target] = b.transform
                    ? b.transform(this._values[prop])
                    : this._values[prop];
            }
        }
    }

    _recompute(name) {
        const def = this._computed[name];
        const old = this._values[name];
        const next = def.compute.call(this._proxy);

        if (old === next) return;

        this._values[name] = next;

        for (const b of this._bindings) {
            if (b.source === name) {
                b.targetObj[b.target] = b.transform
                    ? b.transform(next)
                    : next;
            }
        }
    }

    // ----------------------------
    // Freeze / Thaw
    // ----------------------------

    freeze() {
        this._frozen++;
    }

    thaw() {
        if (--this._frozen > 0) return;

        const changed = [...this._pending];
        this._pending.clear();

        for (const p of changed) {
            this._propagate(p);
        }
    }

    // ----------------------------
    // Bindings
    // ----------------------------

    bind(source, targetObj, target, opts = {}) {
        const binding = {
            source,
            targetObj,
            target,
            transform: opts.transform
        };

        this._bindings.push(binding);

        targetObj[target] = opts.transform
            ? opts.transform(this._values[source])
            : this._values[source];

        return () => {
            this._bindings = this._bindings.filter(b => b !== binding);
        };
    }

    bindBidirectional(propA, objB, propB, opts = {}) {
        let lock = false;

        const unbindA = this.bind(propA, objB, propB, {
            transform: v => {
                if (lock) return v;
                lock = true;
                const out = opts.forward ? opts.forward(v) : v;
                lock = false;
                return out;
            }
        });

        const unbindB = objB.bind(propB, this, propA, {
            transform: v => {
                if (lock) return v;
                lock = true;
                const out = opts.backward ? opts.backward(v) : v;
                lock = false;
                return out;
            }
        });

        return () => {
            unbindA();
            unbindB();
        };
    }

    // ----------------------------
    // Lifecycle
    // ----------------------------

    dispose() {
        this._bindings.length = 0;
        this._disposed = true;
    }
}

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

class TodoModel extends MyGObject {
    static properties = {
        todos: { default: [] },

        totalCount: {
            deps: ["todos"],
            compute() {
                return this.todos.length;
            }
        },

        completedCount: {
            deps: ["todos"],
            compute() {
                return this.todos.filter(t => t.done).length;
            }
        }
    };

    addTodo(text) {
        this.todos = [...this.todos, { text, done: false }];
    }

    toggleTodo(i) {
        this.todos = this.todos.map((t, idx) =>
            idx === i ? { ...t, done: !t.done } : t
        );
    }
}

const user = new User();
console.log(user.fullName);
user.firstName = "Grace";
console.log(user.fullName);

const label = { text: "" };
user.bind("fullName", label, "text");
user.lastName = "Hopper";
console.log(label.text);

const todos = new TodoModel();
console.log(todos.totalCount, todos.completedCount);
todos.addTodo("Learn");
todos.addTodo("Build");
console.log(todos.totalCount, todos.completedCount);
todos.toggleTodo(0);
console.log(todos.totalCount, todos.completedCount);
