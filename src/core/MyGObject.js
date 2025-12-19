import { DepGraph } from "./DepGraph.js";

export class MyGObject {
    constructor() {
        this._values = {};
        this._computed = {};
        this._bindings = [];
        this._graph = new DepGraph();
        this._frozen = 0;
        this._pending = new Set();

        this._proxy = this._createProxy();
        this._initProperties();

        return this._proxy;
    }


    _createProxy() {
        return new Proxy(this, {
            get: (t, p) => (p in t._values ? t._values[p] : t[p]),
            set: (t, p, v) => {
                console.log('[STEP 2] proxy set', p, '=>', v);
                if (!(p in t._values)) {
                    t[p] = v;
                    return true;
                }
                if (t._values[p] === v) return true;
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
        for (const c of this._graph.dependentsOf(prop)) this._recompute(c);
        for (const b of this._bindings) {
            if (b.source === prop) {
                b.targetObj[b.target] = b.transform
                    ? b.transform(this._values[prop])
                    : this._values[prop];
            }
        }
    }

    _recompute(name) {
        console.log('[STEP 3] recompute', name);
        const def = this._computed[name];
        const next = def.compute.call(this._proxy);
        if (this._values[name] === next) return;
        this._values[name] = next;
        for (const b of this._bindings) {
            if (b.source === name) {
                b.targetObj[b.target] = b.transform
                    ? b.transform(next)
                    : next;
            }
        }
    }

}