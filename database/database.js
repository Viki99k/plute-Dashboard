

    var logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default behavior of the link
            logout(); // Call the logout function
        });
    }


function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful, clear session data
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html'; // Redirect to the login page
    }).catch(function(error) {
        // An error happened.
        console.error(error);
    });
}

function saveDatabase() {
    var databaseName = document.getElementById("Database-name").value;
    var databaseDesc = document.getElementById("Database-desc").value;
    var databaseLanguages = document.getElementById("Database-languages").value;
    var databaseDatabases = document.getElementById("Database-Databases").value;
    var files = document.getElementById("Database-images").files;

    if (!databaseName || !databaseDesc || !databaseLanguages || !databaseDatabases || files.length === 0) {
        alert("Please fill in all the fields and select at least one image.");
        return;
    }

    const storageRef = firebase.storage().ref();
    const databasesRef = firebase.database().ref("databases");
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const name = +new Date() + "-" + file.name;
        const metadata = {
            contentType: file.type
        };

        const task = storageRef.child(name).put(file, metadata);
        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then(url => {
                // Save Database data with image URL to Realtime Database
                var databaseData = {
                    name: databaseName,
                    description: databaseDesc,
                    languagesUsed: databaseLanguages,
                    databasesUsed: databaseDatabases,
                    imageURL: url
                };

                // Generate a new unique key for the Database entry
                var newDatabaseRef = databasesRef.push();

                // Set the Database data with the new key
                newDatabaseRef.set(databaseData);
            })
            .catch(error => {
                console.error("Error uploading file or saving Database details:", error);
                alert("An error occurred. Please try again.");
            });
    }

    alert("Databases saved successfully!");
}

function previewImages(event) {
    const input = event.target;

    if (input.files && input.files.length > 0) {
        const imagesPreview = document.getElementById('images-preview');
        imagesPreview.innerHTML = ''; // Clear previous previews

        for (let i = 0; i < input.files.length; i++) {
            const reader = new FileReader();
            const img = document.createElement('img');
            img.classList.add('image-preview');
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(input.files[i]);
            imagesPreview.appendChild(img);
        }
    }
}

// Function to retrieve and display Database data from Firebase Realtime Database
function displayDatabaseData() {
    var databasesRef = firebase.database().ref("databases");

    databasesRef.on('child_added', function(childSnapshot) {
        var databaseKey = childSnapshot.key;
        var databaseData = childSnapshot.val();

        var databaseList = document.querySelector('.database-list');
        var databaseItem = document.createElement('div');
        databaseItem.classList.add('database-item'); // Add a class for styling
        databaseItem.innerHTML = `
            <h3>${databaseData.name}</h3>
            <p>Description: ${databaseData.description}</p>
            <p>Languages Used: ${databaseData.languagesUsed}</p>
            <p>Databases Used: ${databaseData.databasesUsed}</p>
            <img src="${databaseData.imageURL}" alt="Database Image" class="database-image">
            <button class="edit-button" data-key="${databaseKey}">Edit</button>
            <button class="delete-button" data-key="${databaseKey}">Delete</button>
        `;
        databaseList.appendChild(databaseItem);

        // Add event listener to delete button
        var deleteButton = databaseItem.querySelector('.delete-button');
        deleteButton.addEventListener('click', function() {
            var key = this.getAttribute('data-key');
            deleteDatabase(key);
        });

        // Add event listener to edit button
        var editButton = databaseItem.querySelector('.edit-button');
        editButton.addEventListener('click', function() {
            var key = this.getAttribute('data-key');
            editDatabase(key);
        });
    });
}

function editDatabase(key) {
    // Redirect to the edit Database page with the key as a query parameter
    window.location.href = "edit_database.html?key=" + key;
}

function deleteDatabase(key) {
    var databasesRef = firebase.database().ref("databases").child(key);
    databasesRef.remove()
        .then(function() {
            alert("Database deleted successfully!");
            window.location.reload();
        })
        .catch(function(error) {
            console.error("Error deleting Database:", error);
            alert("An error occurred while deleting Database. Please try again.");
        });
}


