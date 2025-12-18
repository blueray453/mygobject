import { MyGObject } from "../core/MyGObject.js";


export class User extends MyGObject {
    static properties = {
        firstName: { default: "Ada" },
        lastName: { default: "Lovelace" },
        fullName: {
            deps: ["firstName", "lastName"],
            compute() { return this.firstName + " " + this.lastName; }
        }
    };
}