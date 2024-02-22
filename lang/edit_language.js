function updateLanguage() {
    var languageName = document.getElementById("language-name").value;
    var languageDesc = document.getElementById("language-desc").value;
    var languageUses = document.getElementById("language-uses").value;
    var languageKey = getLanguageKeyFromURL(); // Function to get language key from URL

    if (!languageName || !languageDesc || !languageUses) {
        alert("Please fill in all the fields.");
        return;
    }

    var languageRef = firebase.database().ref("languages").child(languageKey);
    languageRef.update({
        name: languageName,
        description: languageDesc,
        uses: languageUses
    }).then(function() {
        alert("Language updated successfully!");
        // Redirect back to the language page
        window.location.href = "../lang/lang.html";
    }).catch(function(error) {
        console.error("Error updating language:", error);
        alert("An error occurred while updating the language. Please try again.");
    });
}

function getLanguageKeyFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key');
}
