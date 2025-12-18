import { User } from "./src/models/User.js";
import { TodoModel } from "./src/models/TodoModel.js";

const user = new User();
console.log(user.fullName);
user.firstName = "Grace";
console.log(user.fullName);

const todos = new TodoModel();
console.log(todos.totalCount, todos.completedCount);
todos.addTodo("Learn");
todos.addTodo("Build");
console.log(todos.totalCount, todos.completedCount);
todos.toggleTodo(0);
console.log(todos.totalCount, todos.completedCount);