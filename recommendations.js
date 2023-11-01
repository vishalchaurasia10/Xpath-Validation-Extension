// recommendations.js
const xpathDetailsDiv = document.getElementById("xpathDetails");
const highlightButton = document.getElementById("highlightButton");

document.addEventListener("DOMContentLoaded", function () {
    // Extract XPath from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const xpath = urlParams.get("xpath");
    console.log(xpath)

    if (xpath) {
        // Send a message to content.js to fetch details for the XPath
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "getXPathDetails", xpath }, function (elementDetails) {
                if (elementDetails) {
                    console.log(1,elementDetails)
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
                    console.log("inside if")
                } else {
                    console.log(xpath)
                    console.log("inside else")
                    // xpathDetailsDiv.innerHTML = formatRecommendationDetails(xpath);
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
    formattedDetails += `<li>${findCorrectXpath(popLastElement(xpath))}</li>`;
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