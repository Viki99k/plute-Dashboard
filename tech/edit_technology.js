document.addEventListener('DOMContentLoaded', function () {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyB4Po_GC3uih62QXM6KuTUqVOm1UH-SuWA",
        authDomain: "web-new-401cb.firebaseapp.com",
        projectId: "web-new-401cb",
        storageBucket: "web-new-401cb.appspot.com",
        messagingSenderId: "326958372871",
        appId: "1:326958372871:web:d6135d15cde471ec7eb2a2"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Populate form fields with existing technology data
    populateFormFields();

    // Add submit event listener to the edit technology form
    document.getElementById('editTechnologyForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        // Update technology data
        updateTechnology();
    });
});

// Function to populate form fields with existing technology data
function populateFormFields() {
    // Get technology key from URL
    var technologyKey = getTechnologyKeyFromURL();

    // Get reference to the technology in Firebase database
    var technologyRef = firebase.database().ref("technologies").child(technologyKey);

    // Retrieve technology data
    technologyRef.once('value', function (snapshot) {
        var technologyData = snapshot.val();

        // Populate form fields with existing data
        document.getElementById('edit-technology-name').value = technologyData.name;
        document.getElementById('edit-technology-desc').value = technologyData.description;
        document.getElementById('edit-technology-languages').value = technologyData.languagesUsed;
        document.getElementById('edit-technology-frameworks').value = technologyData.frameworksUsed;

        // Display images for the technology
        displayImages(technologyData.images);
    });
}

// Function to display images for the technology
function displayImages(images) {
    var imageContainer = document.getElementById('image-container');

    images.forEach(function (image, index) {
        var imgElement = document.createElement('img');
        imgElement.src = image.url;
        imgElement.alt = `Image ${index + 1}`;
        imgElement.classList.add('technology-image');

        // Create input and update button for each image
        var input = document.createElement('input');
        input.type = 'file';
        input.id = `edit-image-${index}`;
        var updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.dataset.index = index;
        updateButton.classList.add('update-button');

        // Add event listener to the update button
       // Update the event listener for the update button
updateButton.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    var file = document.getElementById(`edit-image-${index}`).files[0];
    if (file) {
        updateImage(file, index);
    } else {
        alert("Please select an image to update.");
    }
});

        // Append elements to the container
        imageContainer.appendChild(imgElement);
        imageContainer.appendChild(input);
        imageContainer.appendChild(updateButton);
    });
}

// Function to update the image in Firebase Storage and update the URL in Firebase Realtime Database
function updateImage(file, index) {
    var technologyKey = getTechnologyKeyFromURL();
    var storageRef = firebase.storage().ref();
    var imageURLRef = firebase.database().ref("technologies").child(technologyKey).child("images");

    var name = +new Date() + "-" + file.name;
    var metadata = { contentType: file.type };

    var task = storageRef.child(name).put(file, metadata);
    task.then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
            // Update the image URL in the database
            imageURLRef.child(index).update({ url: url });
            alert("Image updated successfully!");
        })
        .catch(error => {
            console.error("Error updating image:", error);
            alert("An error occurred while updating image. Please try again.");
        });
}

// Function to extract technology key from URL query parameter
function getTechnologyKeyFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
}
// Function to update technology data in Firebase
function updateTechnology() {
    var technologyName = document.getElementById("edit-technology-name").value;
    var technologyDesc = document.getElementById("edit-technology-desc").value;
    var technologyLanguages = document.getElementById("edit-technology-languages").value;
    var technologyFrameworks = document.getElementById("edit-technology-frameworks").value;
    var technologyKey = getTechnologyKeyFromURL(); // Function to get technology key from URL

    if (!technologyName || !technologyDesc || !technologyLanguages || !technologyFrameworks) {
        alert("Please fill in all the fields.");
        return;
    }

    var technologyRef = firebase.database().ref("technologies").child(technologyKey);
    technologyRef.update({
        name: technologyName,
        description: technologyDesc,
        languagesUsed: technologyLanguages,
        frameworksUsed: technologyFrameworks
    }).then(function () {
        alert("Technology updated successfully!");
        // Redirect back to the technology page
        window.location.href = "../tech/tech.html";
    }).catch(function (error) {
        console.error("Error updating technology:", error);
        alert("An error occurred while updating the technology. Please try again.");
    });
}

// Function to extract technology key from URL query parameter
function getTechnologyKeyFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
}
