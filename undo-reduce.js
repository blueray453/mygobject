// Actions
const inc = x => x + 1;
const dbl = x => x * 2;
const dec = x => x - 3;

let actionStack = [];
let undoneStack = [];

function computeState(actions, initial = 0) {
    return actions.reduce((state, fn) => fn(state), initial);
}

function apply(action) {
    actionStack.push(action);
    undoneStack = [];
    console.log("Apply: ", computeState(actionStack));
}

function undo() {
    if (actionStack.length === 0) return;
    const last = actionStack.pop();
    undoneStack.push(last);
    console.log("Undo: ", computeState(actionStack));
}

function redo() {
    if (undoneStack.length === 0) return;
    const next = undoneStack.pop();
    actionStack.push(next);
    console.log("Redo: ", computeState(actionStack));
}

// Simulate interactions
apply(inc);   // 0 + 1 = 1
apply(dbl);   // 1 * 2 = 2
apply(dec);   // 2 - 3 = -1

undo();       // undo dec → back to 2
undo();       // undo dbl → back to 1
redo();       // redo dbl → 1 * 2 = 2
redo();       // redo dec → 2 - 3 = -1
