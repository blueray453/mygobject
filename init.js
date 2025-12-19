import { User } from "./src/models/User.js";
// import { TodoModel } from "./src/models/TodoModel.js";
import { DOMAdapter } from "./src/dom/DOMAdapter.js";

const user = new User();

console.log(user);

// DOM elements
const firstNameInput = document.getElementById('firstNameInput');
const fullNameLabel = document.getElementById('fullNameLabel');

// Bind user
DOMAdapter.bind(user, 'firstName', firstNameInput, 'value');
DOMAdapter.bind(user, 'fullName', fullNameLabel, 'textContent');

// const todos = new TodoModel();

// const newTodoInput = document.getElementById('newTodoInput');
// const addTodoBtn = document.getElementById('addTodoBtn');
// const todoList = document.getElementById('todoList');
// const totalLabel = document.getElementById('totalLabel');
// const completedLabel = document.getElementById('completedLabel');

// // Bind todos
// DOMAdapter.bind(todos, 'totalCount', totalLabel, 'textContent');
// DOMAdapter.bind(todos, 'completedCount', completedLabel, 'textContent');

// // Bind array to <ul> automatically
// DOMAdapter.bindArray(todos, 'todos', todoList, (item, i) => {
//     const li = document.createElement('li');
//     li.textContent = item.text + (item.done ? ' ✅' : '');
//     li.addEventListener('click', () => {
//         todos.toggleTodo(i);
//     });
//     return li;
// });

// // Add new todos
// addTodoBtn.addEventListener('click', () => {
//     const text = newTodoInput.value.trim();
//     if (text) {
//         todos.addTodo(text);
//         newTodoInput.value = '';
//     }
// });
