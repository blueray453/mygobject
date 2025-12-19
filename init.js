import { User } from "./src/models/User.js";
import { DOMAdapter } from "./src/dom/DOMAdapter.js";

const user = new User();

// DOM elements
const firstNameInput = document.getElementById('firstNameInput');
const lastNameInput = document.getElementById('lastNameInput');
const fullNameLabel = document.getElementById('fullName');


firstNameInput.addEventListener('input', () => {
    console.log('[STEP 1] input event, value =', firstNameInput.value);
});

// Bind inputs → object
DOMAdapter.bind(user, 'firstName', firstNameInput, 'value');
DOMAdapter.bind(user, 'lastName', lastNameInput, 'value');

// Bind computed → DOM
DOMAdapter.bind(user, 'fullName', fullNameLabel, 'textContent');

