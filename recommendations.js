// recommendations.js
document.addEventListener("DOMContentLoaded", function () {
    const xpathDetailsDiv = document.getElementById("xpathDetails");
    const highlightButton = document.getElementById("highlightButton");

    // Extract XPath from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const xpath = urlParams.get("xpath");

    if (xpath) {
        // Send a message to content.js to fetch details for the XPath
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "getXPathDetails", xpath }, function (elementDetails) {
                if (elementDetails) {
                    // Display the details in the HTML
                    xpathDetailsDiv.innerHTML = formatElementDetails(elementDetails);
                } else {
                    xpathDetailsDiv.textContent = "No details available for this XPath.";
                }
            });
        });
    } else {
        xpathDetailsDiv.textContent = "No XPath specified in the URL.";
    }

    if (xpathDetailsDiv.textContent !== "No details available for this XPath.") {
        // Add a click event listener to the highlight button
        highlightButton.addEventListener("click", function () {
            // Send a message to content.js to highlight the element
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, { action: "highlightXPath", xpath });
            });
        });
    }
});

// Function to format element details for display
function formatElementDetails(details) {
    let formattedDetails = '<h3>Element Details:</h3>';
    formattedDetails += '<ul>';
    for (const key in details) {
        formattedDetails += `<li><strong>${key}:</strong> ${details[key]}</li>`;
    }
    formattedDetails += '</ul>';
    return formattedDetails;
}
