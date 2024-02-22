function signup() {
    var fname = document.getElementById('fname').value;
    var lname = document.getElementById('lname').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // Create user with email and password
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(userCredential) {
        // Save additional user data to Firestore
        var user = userCredential.user;
        firebase.firestore().collection('users').doc(user.uid).set({
            firstName: fname,
            lastName: lname,
            email: email
        })
        .then(function() {
            alert('Signup successful!');
            window.location.href = "../home/home.html"; // Redirect after successful signup
        })
        .catch(function(error) {
            console.error('Error adding document: ', error);
        });
    })
    .catch(function(error) {
        // Handle errors
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
    });
  }

    function login(){
        window.location.href = "../index.html";
    }