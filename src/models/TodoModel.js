import { PersistenceGObject } from "../core/PersistenceGObject.js";
import { JsonFileAdapter } from "../storage/JsonFileAdapter.js";

const storage = new JsonFileAdapter(".storage");

export class TodoModel extends PersistenceGObject {
    static properties = {
        todos: { default: [] },
        totalCount: {
            deps: ["todos"],
            compute() { return this.todos.length; }
        },
        completedCount: {
            deps: ["todos"],
            compute() { return this.todos.filter(t => t.done).length; }
        }
    };

    constructor() {
        super("todos", storage);
    }

    addTodo(text) {
        this.todos = [...this.todos, { text, done: false }];
    }

    toggleTodo(i) {
        this.todos = this.todos.map((t, idx) =>
            idx === i ? { ...t, done: !t.done } : t
        );
    }
}