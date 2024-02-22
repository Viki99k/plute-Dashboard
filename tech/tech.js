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

function saveTechnology() {
    var technologyName = document.getElementById("technology-name").value;
    var technologyDesc = document.getElementById("technology-desc").value;
    var technologyLanguages = document.getElementById("technology-languages").value;
    var technologyFrameworks = document.getElementById("technology-frameworks").value;
    var files = document.getElementById("technology-images").files;

    if (!technologyName || !technologyDesc || !technologyLanguages || !technologyFrameworks || files.length === 0) {
        alert("Please fill in all the fields and select at least one image.");
        return;
    }

    const storageRef = firebase.storage().ref();
    const technologiesRef = firebase.database().ref("technologies");

    // Array to store image URLs
    var imageURLs = [];

    // Counter to keep track of image order
    var imageIndex = 0;

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
                // Push the URL to the array
                imageURLs.push({ index: imageIndex++, url: url });

                // Check if all images have been processed
                if (imageURLs.length === files.length) {
                    // Save technology data with image URLs to Realtime Database
                    var technologyData = {
                        name: technologyName,
                        description: technologyDesc,
                        languagesUsed: technologyLanguages,
                        frameworksUsed: technologyFrameworks,
                        images: imageURLs
                    };

                    // Generate a new unique key for the technology entry
                    var newTechnologyRef = technologiesRef.push();

                    // Set the technology data with the new key
                    newTechnologyRef.set(technologyData);

                    // Reset the input fields
                    document.getElementById("technology-name").value = '';
                    document.getElementById("technology-desc").value = '';
                    document.getElementById("technology-languages").value = '';
                    document.getElementById("technology-frameworks").value = '';
                    document.getElementById("technology-images").value = '';

                    alert("Technologies saved successfully!");
                }
            })
            .catch(error => {
                console.error("Error uploading file or saving technology details:", error);
                alert("An error occurred. Please try again.");
            });
    }
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

// Function to retrieve and display technology data from Firebase Realtime Database
// Function to retrieve and display technology data from Firebase Realtime Database
function displayTechnologyData() {
    var technologiesRef = firebase.database().ref("technologies");

    technologiesRef.on('child_added', function(childSnapshot) {
        var technologyKey = childSnapshot.key;
        var technologyData = childSnapshot.val();

        var technologyList = document.getElementById('technology-list');
        var technologyItem = document.createElement('div');
        technologyItem.classList.add('technology-item'); // Add a class for styling
        technologyItem.innerHTML = `
            <h3>${technologyData.name}</h3>
            <p>Description: ${technologyData.description}</p>
            <p>Languages Used: ${technologyData.languagesUsed}</p>
            <p>Frameworks Used: ${technologyData.frameworksUsed}</p>
            <div id="image-container-${technologyKey}" class="image-container"></div>
            <button class="edit-button" data-key="${technologyKey}">Edit</button>
            <button class="delete-button" data-key="${technologyKey}">Delete</button>
        `;
        technologyList.appendChild(technologyItem);

        // Display images
        var imageContainer = document.getElementById(`image-container-${technologyKey}`);
        technologyData.images.forEach(function(image, index) {
            var imgElement = document.createElement('img');
            imgElement.src = image.url;
            imgElement.alt = `Image ${index + 1}`;
            imgElement.classList.add('technology-image');
            imageContainer.appendChild(imgElement);
        });

        // Add event listener to delete button
        var deleteButton = technologyItem.querySelector('.delete-button');
        deleteButton.addEventListener('click', function() {
            var key = this.getAttribute('data-key');
            deleteTechnology(key);
        });

        // Add event listener to edit button
        var editButton = technologyItem.querySelector('.edit-button');
        editButton.addEventListener('click', function() {
            var key = this.getAttribute('data-key');
            editTechnology(key);
        });
    });
}


function editTechnology(key) {
    // Redirect to the edit technology page with the key as a query parameter
    window.location.href = "edit_technology.html?key=" + key;
}

function deleteTechnology(key) {
    var technologiesRef = firebase.database().ref("technologies").child(key);
    technologiesRef.remove()
        .then(function() {
            alert("Technology deleted successfully!");
            window.location.reload();
        })
        .catch(function(error) {
            console.error("Error deleting technology:", error);
            alert("An error occurred while deleting technology. Please try again.");
        });
}


