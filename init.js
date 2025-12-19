import { User } from "./src/models/User.js";
import { DOMAdapter } from "./src/dom/DOMAdapter.js";

document.addEventListener('DOMContentLoaded', () => {
    const user = new User();

    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const fullNameLabel = document.getElementById('fullName');

    console.log('[INIT] elements', {
        firstNameInput,
        lastNameInput,
        fullNameLabel
    });

    DOMAdapter.bind(user, 'firstName', firstNameInput, 'value');
    DOMAdapter.bind(user, 'lastName', lastNameInput, 'value');
    DOMAdapter.bind(user, 'fullName', fullNameLabel, 'textContent');
});
