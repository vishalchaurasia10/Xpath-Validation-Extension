document.getElementById("validateButton").addEventListener("click", function () {
    const xpaths = document.getElementById("xpathInput").value.split("\n").filter((xpath) => xpath.trim() !== "");

    // Check if there are XPaths to validate
    if (xpaths.length === 0) {
        // Handle the case where there are no XPaths to validate
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "validateXPaths", xpaths: xpaths }, function (results) {
            sessionStorage.setItem("xpathResults", JSON.stringify(results));

            // Check if there are validation results in session storage
            if (results && results.length > 0) {
                window.location.href = "result.html";
            }
        });
    });
});

