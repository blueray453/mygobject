export class DepGraph {
    constructor() {
        this.forward = new Map();
    }

    addDependency(prop, computed) {
        if (!this.forward.has(prop)) {
            this.forward.set(prop, new Set());
        }
        this.forward.get(prop).add(computed);
    }

    dependentsOf(prop) {
        return this.forward.get(prop) ?? new Set();
    }
}