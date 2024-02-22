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

function saveFramework() {
    var FrameworkName = document.getElementById("Framework-name").value;
    var FrameworkDesc = document.getElementById("Framework-desc").value;
    // var FrameworkLanguages = document.getElementById("Framework-languages").value;
    var FrameworkFrameworks = document.getElementById("Framework-Frameworks").value;
    var files = document.getElementById("Framework-images").files;

    if (!FrameworkName || !FrameworkDesc ||  !FrameworkFrameworks || files.length === 0) {
        alert("Please fill in all the fields and select at least one image.");
        return;
    }

    const storageRef = firebase.storage().ref();
    const frameworksRef = firebase.database().ref("frameworks");
    
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
                // Save Framework data with image URL to Realtime Database
                var FrameworkData = {
                    name: FrameworkName, // Set the Framework name explicitly
                    description: FrameworkDesc,
                    // languagesUsed: FrameworkLanguages,
                    FrameworksUse: FrameworkFrameworks,
                    imageURL: url
                };

                // Generate a new unique key for the Framework entry
                var newFrameworkRef = frameworksRef.push();

                // Set the Framework data with the new key
                newFrameworkRef.set(FrameworkData);
            })
            .catch(error => {
                console.error("Error uploading file or saving Framework details:", error);
                alert("An error occurred. Please try again.");
            });
    }

    alert("frameworks saved successfully!");
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

// Function to retrieve and display Framework data from Firebase Realtime Database
// Function to retrieve and display Framework data from Firebase Realtime Database
function displayFrameworkData() {
    var frameworksRef = firebase.database().ref("frameworks");

    frameworksRef.on('child_added', function(childSnapshot) {
        var FrameworkKey = childSnapshot.key;
        var FrameworkData = childSnapshot.val();

        var FrameworkList = document.getElementById('Framework-list');
        var FrameworkItem = document.createElement('div');
        FrameworkItem.classList.add('Framework-item'); // Add a class for styling
        FrameworkItem.innerHTML = `
            <h3>${FrameworkData.name}</h3>
            <p>Description: ${FrameworkData.description}</p>
            
            <p>Frameworks Used: ${FrameworkData.FrameworksUse}</p>
            <img src="${FrameworkData.imageURL}" alt="Framework Image" class="Framework-image">
            <button class="edit-button" data-key="${FrameworkKey}">Edit</button>
            <button class="delete-button" data-key="${FrameworkKey}">Delete</button>
        `;
        FrameworkList.appendChild(FrameworkItem);

        // Add event listener to delete button
        var deleteButton = FrameworkItem.querySelector('.delete-button');
        deleteButton.addEventListener('click', function() {
            var key = this.getAttribute('data-key');
            deleteFramework(key);
        });

        // Add event listener to edit button
        var editButton = FrameworkItem.querySelector('.edit-button');
        editButton.addEventListener('click', function() {
            var key = this.getAttribute('data-key');
            editFramework(key);
        });
    });
}

function editFramework(key) {
    // Redirect to the edit Framework page with the key as a query parameter
    window.location.href = "edit_Framework.html?key=" + key;
}

function deleteFramework(key) {
    var frameworksRef = firebase.database().ref("frameworks").child(key);
    frameworksRef.remove()
        .then(function() {
            alert("Framework deleted successfully!");
            window.location.reload();
        })
        .catch(function(error) {
            console.error("Error deleting Framework:", error);
            alert("An error occurred while deleting Framework. Please try again.");
        });
}


