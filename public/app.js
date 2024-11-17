// Firebase Configuration and Initialization (handled by firebase init)
const auth = firebase.auth();
const db = firebase.firestore();

// Log current authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is logged in:", user.email);
        document.getElementById('auth-container').style.display = "none";
        document.getElementById('todo-container').style.display = "block";

        // Fetch tasks for the logged-in user
        fetchTasks();
    } else {
        console.log("No user is logged in");
        document.getElementById('auth-container').style.display = "block";
        document.getElementById('todo-container').style.display = "none";
    }
});

// Fetch tasks for the logged-in user
function fetchTasks() {
    const userId = auth.currentUser.uid; // Get current user's UID

    db.collection('todos')
        .where("userId", "==", userId) // Filter tasks based on user ID
        .onSnapshot((snapshot) => {
            const todoList = document.getElementById('todo-list');
            todoList.innerHTML = '';  // Clear the list before rendering

            snapshot.forEach((doc) => {
                const todoItem = document.createElement('li');
                todoItem.textContent = doc.data().task;
                todoList.appendChild(todoItem);

                // Add delete button to each task
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Delete";
                modifyButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => {
                    db.collection('todos').doc(doc.id).delete()
                        .then(() => console.log("Task deleted successfully"))
                        .catch((error) => console.error("Error deleting task:", error.message));
                });
                todoItem.appendChild(deleteButton);

                // Create Modify button
                const modifyButton = document.createElement('button');
                modifyButton.textContent = "Modify";
                modifyButton.classList.add('modify-btn');
                modifyButton.addEventListener('click', () => {
                    const newTask = prompt("Enter the updated task:", doc.data().task);
                    if (newTask && newTask.trim() !== "") {
                        db.collection('todos').doc(doc.id).update({
                            task: newTask.trim()
                        })
                            .then(() => console.log("Task updated successfully"))
                            .catch((error) => console.error("Error updating task:", error.message));
                    } else {
                        alert("Task cannot be empty.");
                    }
                });
                todoItem.appendChild(modifyButton);
            });
        });
}

// Sign-Up Logic with better logging
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("User signed up successfully:", userCredential.user);
            alert("Sign-up successful!");
        })
        .catch((error) => {
            console.error("Error during sign-up:", error.message);
            alert(`Sign-up error: ${error.message}`);
        });
});

// Login Logic with better logging and UI update
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("User logged in successfully:", userCredential.user);
            alert("Login successful!");
        })
        .catch((error) => {
            console.error("Error during login:", error.message);
            alert(`Login error: ${error.message}`);
        });
});

// Logout functionality
document.getElementById('logout-button').addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log("User logged out successfully");
            alert("Logout successful!");
        })
        .catch((error) => {
            console.error("Error during logout:", error.message);
        });
});

// Adding new tasks to Firestore with error handling
const todoForm = document.getElementById('todo-form');
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = document.getElementById('todo-input').value;

    if (task.trim() === "") {
        alert("Task cannot be empty");
        return;
    }

    if (!auth.currentUser) {
        alert("User must be logged in to add a task.");
        return;
    }

    db.collection('todos').add({
        task: task,
        completed: false,
        userId: auth.currentUser.uid  // Save task with the user's UID
    })
        .then(() => {
            console.log("Task added successfully");
            todoForm.reset();
            fetchTasks();  // Fetch updated tasks after adding a new one
        })
        .catch((error) => {
            console.error("Error adding task:", error.message);
            alert(`Error adding task: ${error.message}`);
        });
});
