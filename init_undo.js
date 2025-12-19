// test-undo.js
import { User } from './src/models/User.js';

console.log('=== Testing MyGObject Undo/Redo ===\n');

// Test 1: Create instance and check methods exist
const user = new User();
console.log('1. Instance created');
console.log('   History array exists?', Array.isArray(user._history));
console.log('   Redo stack exists?', Array.isArray(user._redoStack));
console.log('   undo method exists?', typeof user.undo === 'function');
console.log('   redo method exists?', typeof user.redo === 'function');
console.log('   Initial firstName:', user.firstName);
console.log('   Initial lastName:', user.lastName);

// Test 2: Basic undo/redo
console.log('\n2. Testing basic undo/redo:');
user.firstName = "John";
console.log('   Set firstName to "John"');
console.log('   Current firstName:', user.firstName);

user.lastName = "Doe";
console.log('   Set lastName to "Doe"');
console.log('   Current lastName:', user.lastName);
console.log('   Current fullName:', user.fullName);

// Check history
console.log('\n   History length:', user._history?.length);
if (user._history && user._history.length > 0) {
    user._history.forEach((action, i) => {
        console.log(`   ${i + 1}. ${action.prop}: ${action.oldValue} → ${action.newValue}`);
    });
}

// Test undo
console.log('\n   --- Undo lastName ---');
const undoResult = user.undo();
console.log('   Undo successful?', undoResult);
console.log('   After undo, lastName:', user.lastName);
console.log('   After undo, fullName:', user.fullName);
console.log('   Redo stack length:', user._redoStack?.length);

// Test redo
console.log('\n   --- Redo lastName ---');
const redoResult = user.redo();
console.log('   Redo successful?', redoResult);
console.log('   After redo, lastName:', user.lastName);
console.log('   After redo, fullName:', user.fullName);

// Test 3: Multiple undos
console.log('\n3. Testing multiple changes and undos:');
user.clearHistory?.(); // Use optional chaining in case you didn't add clearHistory
user.firstName = "A";
user.firstName = "B";
user.firstName = "C";
console.log('   Made 3 changes to firstName');
console.log('   Current firstName:', user.firstName);
console.log('   History length:', user._history?.length);

user.undo();
console.log('   After undo 1, firstName:', user.firstName);
user.undo();
console.log('   After undo 2, firstName:', user.firstName);
user.redo();
console.log('   After redo 1, firstName:', user.firstName);
user.redo();
console.log('   After redo 2, firstName:', user.firstName);

// Test 4: New action clears redo stack
console.log('\n4. Testing new action clears redo stack:');
user.clearHistory?.();
user.firstName = "X";
user.firstName = "Y";
user.undo(); // Back to X
console.log('   After setting X→Y and undo, redo stack length:', user._redoStack?.length);
user.firstName = "Z"; // New action
console.log('   After new action "Z", redo stack length:', user._redoStack?.length);
console.log('   Should be 0 (cleared)');

// Test 5: Direct method calls
console.log('\n5. Direct history inspection:');
console.log('   user._history:', user._history);
console.log('   user._redoStack:', user._redoStack);

console.log('\n=== Tests Complete ===');
