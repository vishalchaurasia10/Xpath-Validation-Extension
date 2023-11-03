// recommendations.js
const xpathDetailsDiv = document.getElementById("xpathDetails");
const highlightButton = document.getElementById("highlightButton");

document.addEventListener("DOMContentLoaded", function () {
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
                    // Add a click event listener to the highlight button
                    highlightButton.addEventListener("click", function () {
                        // Send a message to content.js to highlight the element
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            const activeTab = tabs[0];
                            chrome.tabs.sendMessage(activeTab.id, { action: "highlightXPath", xpath });
                        });
                    });
                } else {
                    xpathDetailsDiv.innerHTML = formatRecommendationDetails(xpath);
                }
            });
        });
    } else {
        xpathDetailsDiv.textContent = "No XPath specified in the URL.";
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

function formatRecommendationDetails(xpath) {
    let formattedDetails = '<h2><strong>Recommendations:</strong></h2>';
    formattedDetails += '<ul>';
    generateXPathRecommendations(xpath).forEach((xpath) => {
        formattedDetails += `<li><a href="recommendations.html?xpath=${xpath}">${xpath}</a></li>`;
    });
    formattedDetails += '</ul>';
    return formattedDetails;
}

function findCorrectXpath(xpath) {
    if (xpath) {
        // Send a message to content.js to fetch details for the XPath
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "getXPathDetails", xpath }, function (elementDetails) {
                if (elementDetails) {
                    // Display the details in the HTML
                    xpathDetailsDiv.innerHTML = xpath;
                    highlightButton.addEventListener("click", function () {
                        // Send a message to content.js to highlight the element
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            const activeTab = tabs[0];
                            chrome.tabs.sendMessage(activeTab.id, { action: "highlightXPath", xpath });
                        });
                    });
                } else {
                    const newXpath = popLastElement(xpath);
                    findCorrectXpath(newXpath);
                }
            });
        });
    } else {
        xpathDetailsDiv.textContent = "No XPath specified in the URL.";
    }

}

function popLastElement(xpath) {
    let xpathElementArray = xpath.split('/');
    xpathElementArray.pop();
    return xpathElementArray.join('/');
}

function generateXPathRecommendations(xpath) {
    const recommendations = [];

    // Split the XPath into segments
    const segments = xpath.split('/');

    for (let i = 1; i < segments.length; i++) {
        // Generate a recommendation by removing the i-th segment
        const recommendation = segments.slice(0, i).join('/');

        recommendations.push(recommendation);
    }

    return recommendations;
}