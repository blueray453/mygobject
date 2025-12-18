import { MyGObject } from "./MyGObject.js";

export class PersistenceGObject extends MyGObject {
    constructor(key, storage) {
        super();
        this._key = key;
        this._storage = storage;


        // Ensure we call methods on the proxy, not on `this`
        const proxy = this._proxy || this;
        if (typeof proxy.freeze === 'function') proxy.freeze();


        this._load(proxy);


        if (typeof proxy.thaw === 'function') proxy.thaw();
        return proxy;
    }


    _load(proxy) {
        const raw = this._storage.getItem(this._key);
        if (!raw) return;


        try {
            const data = JSON.parse(raw);
            Object.entries(data).forEach(([k, v]) => {
                if (k in proxy._values) proxy[k] = v;
            });
        } catch (e) {
            console.warn("Failed to load persisted state", e);
        }
    }


    _propagate(prop) {
        super._propagate(prop);
        this._save();
    }


    _save() {
        if (this._frozen) return;


        const data = {};
        const defs = this.constructor.properties ?? {};
        for (const [k, d] of Object.entries(defs)) {
            if (!d.compute && d.persist !== false) data[k] = this._values[k];
        }


        try {
            this._storage.setItem(this._key, JSON.stringify(data, null, 2));
        } catch (e) {
            console.warn("Failed to persist state", e);
        }
    }
}