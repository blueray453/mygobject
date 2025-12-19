import { User } from "./src/models/User.js";
import { DOMAdapter } from "./src/dom/DOMAdapter.js";

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Create user and make it globally accessible
    window.user = new User();

    // Bind to DOM elements
    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const fullNameLabel = document.getElementById('fullName');

    DOMAdapter.bind(window.user, 'firstName', firstNameInput, 'value');
    DOMAdapter.bind(window.user, 'lastName', lastNameInput, 'value');
    DOMAdapter.bind(window.user, 'fullName', fullNameLabel, 'textContent');

    console.log('✅ User loaded. Try commands in console:');
    console.log('   user.firstName = "John"');
    console.log('   user.undo()');
});
