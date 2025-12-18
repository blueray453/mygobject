import { MyGObject } from "./MyGObject.js";

export class PersistenceGObject extends MyGObject {
    constructor(key, storage) {
        super();
        this._key = key;
        this._storage = storage;
        this._load();
    }

    _load() {
        const raw = this._storage.getItem(this._key);
        if (!raw) return;
        this.freeze();
        Object.entries(JSON.parse(raw)).forEach(([k, v]) => (this[k] = v));
        this.thaw();
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
        this._storage.setItem(this._key, JSON.stringify(data, null, 2));
    }
}