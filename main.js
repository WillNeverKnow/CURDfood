// Initialize Firebase with your project's configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAAlQUSqHUBr_cTRNFKtVzV9vkKJQt6wQ",
    authDomain: "khati-app.firebaseapp.com",
    databaseURL: "https://khati-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "khati-app",
    storageBucket: "khati-app.appspot.com",
    messagingSenderId: "675664862411",
    appId: "1:675664862411:web:d32ce4914638ac95014f4e",
    measurementId: "G-JW5PHGM5RC"
};
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
// Initialize Firebase with your project's configuration (you should have already done this before)
// ...

const userForm = document.getElementById('userForm');
const userData = document.getElementById('userData');
const photoUrl = document.getElementById('photoUrl');

// Function to update form data for editing
function updateFormData(doc) {
    document.getElementById('username').value = doc.data().username;
    document.getElementById('address').value = doc.data().address;
    document.getElementById('direction').value = doc.data().direction;
    document.getElementById('photoUrl').value = doc.data().photoUrl;
    document.getElementById('food').value = doc.data().food;

    // Remove the previous submit event listener and add a new one for updating data
    userForm.removeEventListener('submit', handleSubmit);
    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const editedUsername = document.getElementById('username').value;
        const editedAddress = document.getElementById('address').value;
        const editedDirection = document.getElementById('direction').value;
        const editedPhotoUrl = document.getElementById('photoUrl').value;
        const editedFood = document.getElementById('food').value;

        // Update the Firestore document with the edited data
        db.collection('foods')
            .doc(doc.id)
            .update({
                username: editedUsername,
                address: editedAddress,
                direction: editedDirection,
                photoUrl: editedPhotoUrl,
                food: editedFood,
            })
            .then(() => {
                alert('Data successfully updated!');
                userForm.reset();
                userForm.removeEventListener('submit', handleSubmit);
                userForm.addEventListener('submit', handleSubmit);
            })
            .catch((error) => {
                console.error('Error updating document: ', error);
                alert('An error occurred while updating data. Please try again later.');
            });
    });
}

// Function to handle form submission for new data
function handleSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const address = document.getElementById('address').value;
    const direction = document.getElementById('direction').value;
    const food = document.getElementById('food').value;

    // No image selected, submit data without an image
    db.collection('foods')
        .add({
            username: username,
            address: address,
            direction: direction,
            food: food,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
            alert('Data submitted (without image)!');
            userForm.reset();
        })
        .catch((error) => {
            console.error('Error adding document: ', error);
            alert('An error occurred. Please try again later.');
        });
}

// ... (rest of the code remains the same)

// Attach an event listener to the form for handling data submission
userForm.addEventListener('submit', handleSubmit);
// Function to display user data in the table
function displayUserData(doc) {
    console.log("Displaying data for doc:", doc.id);
    const tr = document.createElement('tr');

    // Add a new column for the document UID
    const uidTd = document.createElement('td');
    uidTd.textContent = doc.id; // Set the text content of the cell to the document UID
    tr.appendChild(uidTd);

    // Display other fields in the table
    const fields = [
        'username',
        'address',
        'direction',
        'food',
        'photoUrl',
    ];

    fields.forEach(field => {
        const td = document.createElement('td');
        if (doc.data()[field]) {
            td.textContent = doc.data()[field];
        } else {
            td.textContent = "N/A"; // Set to "N/A" if the field is missing in the document
        }
        tr.appendChild(td);
    });

    // Add action buttons
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.setAttribute('class', 'btn btn-secondary');
    editButton.addEventListener('click', () => {
        updateFormData(doc);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('class', 'btn btn-danger');
    deleteButton.addEventListener('click', () => {
        // Delete the Firestore document
        db.collection('foods')
            .doc(doc.id)
            .delete()
            .then(() => {
                alert('Data successfully deleted!');
            })
            .catch((error) => {
                console.error('Error deleting document: ', error);
                alert('An error occurred while deleting data. Please try again later.');
            });
    });

    const tdAction = document.createElement('td');
    tdAction.appendChild(editButton);
    tdAction.appendChild(deleteButton);
    tr.appendChild(tdAction);

    userData.appendChild(tr);
}
// Fetch data from Firestore collection 'users' and display it in the table
db.collection('foods')
    .get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            displayUserData(doc);
        });
    });
// Function to handle the search operation
function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const tableRows = userData.getElementsByTagName('tr');

    for (let i = 1; i < tableRows.length; i++) { // Start from index 1 to skip the table header row
        const row = tableRows[i];
        const rowData = row.textContent.toLowerCase();

        if (rowData.includes(searchInput)) {
            row.style.display = ''; // Show the row if it matches the search input
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match the search input
        }
    }
}

// Attach an event listener to the search button
document.getElementById('searchButton').addEventListener('click', handleSearch);
