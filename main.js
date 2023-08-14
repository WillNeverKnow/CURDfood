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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// DOM elements
const userForm = document.getElementById('userForm');
const userData = document.getElementById('userData');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const usernameInput = document.getElementById('username');
const addressInput = document.getElementById('address');
const directionInput = document.getElementById('direction');
const photoFileInput = document.getElementById('photoUrl');
const foodInput = document.getElementById('food');

// Function to update form data for editing
function updateFormData(doc) {
    const data = doc.data();
    usernameInput.value = data.username;
    addressInput.value = data.address;
    directionInput.value = data.direction;
    photoFileInput.value = data.photoUrl;
    foodInput.value = data.food;

    // Remove the previous submit event listener and add a new one for updating data
    userForm.removeEventListener('submit', handleSubmit);
    userForm.addEventListener('submit', handleUpdate);
}

// Function to handle form submission for new data
function handleUpdate(event) {
    event.preventDefault();
    // Update the Firestore document with the edited data
    const editedUsername = usernameInput.value;
    const editedAddress = addressInput.value;
    const editedDirection = directionInput.value;
    const editedPhotoUrl = photoFileInput.value;
    const editedFood = foodInput.value;

    db.collection('foods')
        .doc(currentDocId)
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
            userForm.removeEventListener('submit', handleUpdate);
            userForm.addEventListener('submit', handleSubmit);
        })
        .catch((error) => {
            console.error('Error updating document: ', error);
            alert('An error occurred while updating data. Please try again later.');
        });
}

// Function to handle form submission for new data
function handleSubmit(event) {
    event.preventDefault();
    const username = usernameInput.value;
    const address = addressInput.value;
    const direction = directionInput.value;
    const food = foodInput.value;
    const photoFile = photoFileInput.files[0];

    // Validate that a photo was selected
    if (!photoFile) {
        alert('Please select an image.');
        return;
    }

    // Upload the image to Firebase Storage
    const storageRef = firebase.storage().ref().child('food_images/' + photoFile.name);
    const uploadTask = storageRef.put(photoFile);

    // Monitor the image upload progress
    uploadTask.on(
        'state_changed',
        (snapshot) => {
            // Progress monitoring (optional)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress: ' + progress + '%');
        },
        (error) => {
            // Handle upload error
            console.error('Error uploading image: ', error);
            alert('An error occurred while uploading the image. Please try again later.');
        },
        () => {
            // Upload completed, get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then((photoUrl) => {
                // Continue with the submission, including the photoUrl
                db.collection('foods')
                    .add({
                        username: username,
                        address: address,
                        direction: direction,
                        food: food,
                        photoUrl: photoUrl,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                        alert('Data submitted (with image)!');
                        userForm.reset();
                    })
                    .catch((error) => {
                        console.error('Error adding document: ', error);
                        alert('An error occurred. Please try again later.');
                    });
            });
        }
    );
}

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
        const fieldValue = doc.data()[field];
        td.textContent = fieldValue || "N/A"; // Set to "N/A" if the field is missing in the document
        tr.appendChild(td);
    });

    // Add action buttons
    const editButton = createButton('Edit', 'btn-secondary', () => {
        updateFormData(doc);
    });

    const deleteButton = createButton('Delete', 'btn-danger', () => {
        handleDelete(doc);
    });

    const tdAction = document.createElement('td');
    tdAction.appendChild(editButton);
    tdAction.appendChild(deleteButton);
    tr.appendChild(tdAction);

    userData.appendChild(tr);
}

// Function to create a button
function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'btn ' + className;
    button.addEventListener('click', onClick);
    return button;
}

// Function to handle the delete operation
function handleDelete(doc) {
    const photoUrl = doc.data().photoUrl;
    if (photoUrl) {
        const storageRef = firebase.storage().refFromURL(photoUrl);
        storageRef.delete()
            .then(() => {
                console.log('Photo successfully deleted from storage.');
            })
            .catch((error) => {
                console.error('Error deleting photo from storage: ', error);
            });
    }
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
}

// Fetch data from Firestore collection 'foods' and display it in the table
db.collection('foods')
    .get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            displayUserData(doc);
        });
    });

// Function to handle the search operation
function handleSearch() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const tableRows = userData.getElementsByTagName('tr');

    for (let i = 1; i < tableRows.length; i++) { // Start from index 1 to skip the table header row
        const row = tableRows[i];
        const rowData = row.textContent.toLowerCase();

        if (rowData.includes(searchValue)) {
            row.style.display = ''; // Show the row if it matches the search input
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match the search input
        }
    }
}

// Attach an event listener to the search button
searchButton.addEventListener('click', handleSearch);
