// content.js
console.log("content.js");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "validateXPaths") {
        const results = [];
        request.xpaths.forEach((xpath) => {
            try {
                const element = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (element.snapshotLength > 0) {
                    results.push({ xpath, isValid: true });
                } else {
                    results.push({ xpath, isValid: false });
                }
            } catch (error) {
                console.log("error", error);
                results.push({ xpath, isValid: false });
            }
        });
        sendResponse(results);
    } else if (request.action === "getXPathDetails") {
        const xpath = request.xpath;
        try {
            const element = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            const elementDetails = extractDetailsFromElement(element);
            sendResponse(elementDetails); // Send only the extracted details
        } catch (error) {
            console.log("error", error);
        }
    } else if (request.action === "highlightXPath") {
        const xpath = request.xpath;
        try {
            const element = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (element.snapshotLength > 0) {
                // Get the first matching element
                const firstElement = element.snapshotItem(0);

                // Highlight the element (customize the highlighting style)
                firstElement.style.border = "2px solid red";
                firstElement.style.backgroundColor = "yellow";

                // Scroll to the element
                firstElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
            }
        } catch (error) {
            console.log("error", error);
        }
    }
});

// Function to extract details from the element object
function extractDetailsFromElement(element) {
    const details = {
        tagName: element.snapshotItem(0).tagName,
        textContent: element.snapshotItem(0).textContent,
        // Add other properties as needed
    };
    return details;
}