// Import Immutable
import { Map } from 'immutable';

// --- Store Implementation ---
function createStore(reducer, initialState) {
    let currentState = initialState;
    let listeners = [];
    let undoStack = [];
    let redoStack = [];

    function getState() {
        return currentState;
    }

    function dispatch(action) {
        const nextState = reducer(currentState, action);

        if (!nextState.equals(currentState)) {
            undoStack.push(currentState);
            redoStack = [];
            currentState = nextState;
            listeners.forEach(fn => fn(currentState));
        }
    }

    function subscribe(fn) {
        listeners.push(fn);
        return () => {
            listeners = listeners.filter(l => l !== fn);
        };
    }

    function undo() {
        if (undoStack.length > 0) {
            redoStack.push(currentState);
            currentState = undoStack.pop();
            listeners.forEach(fn => fn(currentState));
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(currentState);
            currentState = redoStack.pop();
            listeners.forEach(fn => fn(currentState));
        }
    }

    return { getState, dispatch, subscribe, undo, redo };
}

// --- Reducer Function ---
function counterReducer(state, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state.update('count', c => c + 1);
        case 'DECREMENT':
            return state.update('count', c => c - 1);
        default:
            return state;
    }
}

// --- Setup Store ---
const initialState = Map({ count: 0 });
const store = createStore(counterReducer, initialState);

// --- Subscribe to state changes ---
store.subscribe(state => {
    console.log("▶ State:", state.toJS());
});

// --- Sample Usage ---
store.dispatch({ type: 'INCREMENT' }); // { count: 1 }
store.dispatch({ type: 'INCREMENT' }); // { count: 2 }
store.dispatch({ type: 'INCREMENT' }); // { count: 3 }
store.dispatch({ type: 'INCREMENT' }); // { count: 4 }
// store.dispatch({ type: 'DECREMENT' }); // { count: 3 }

store.undo(); // { count: 3 }
store.undo(); // { count: 2 }
store.undo(); // { count: 1 }
store.undo(); // { count: 0 }

store.redo(); // { count: 1 }
store.redo(); // { count: 2 }
store.redo(); // { count: 3 }
store.redo(); // { count: 4 }

store.dispatch({ type: 'DECREMENT' }); // { count: 3 }
store.dispatch({ type: 'INCREMENT' }); // { count: 4 }

store.undo(); // { count: 3 }
store.undo(); // { count: 4 }
store.undo(); // { count: 3 }
store.undo(); // { count: 2 }
store.undo(); // { count: 1 }
