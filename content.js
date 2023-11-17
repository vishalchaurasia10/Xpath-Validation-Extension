// content.js
console.log("Xpath Validator is active...");

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
    } else if (request.action === "recommendationBasedOnIdClass") {
        const xpath = request.xpath;
        const suggestedXPath = suggestXPathCorrection(xpath, document);
        sendResponse(suggestedXPath);
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

function suggestXPathCorrection(invalidXPath, document) {
    const xpathParts = invalidXPath.split('/');
    let correctedXPath = '';
    let currentCorrectionType = null;

    for (let i = 1; i <= xpathParts.length; i++) {
        const partialXPath = `/${xpathParts.slice(1, i).join('/')}`;
        if (isValidXPath(partialXPath, document)) {
            correctedXPath = partialXPath;
        } else {
            // Identify the type of correction needed (class or id)
            const correctionType = identifyCorrectionType(partialXPath, document);
            console.log('correctionType', correctionType);

            // Apply Levenshtein Distance to correct the identified part
            const correctedValue = suggestCorrection(partialXPath, correctionType, document);
            console.log('correctedValue', correctedValue);

            if (correctedValue) {
                currentCorrectionType = correctionType;

                // Reconstruct the corrected XPath with the correct format
                if (currentCorrectionType === 'id') {
                    correctedXPath = `${correctedXPath}/div[@id='${correctedValue}']`;
                } else if (currentCorrectionType === 'class') {
                    correctedXPath = `${correctedXPath}/div[contains(@class, '${correctedValue}')]`;
                }
            } else {
                // If no correction is found, break the loop
                break;
            }
        }
    }

    return correctedXPath;
}

function isValidXPath(xpath, document) {
    try {
        const element = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (element.snapshotLength > 0) {
            return true;
        }
    } catch (error) {
        console.log("error", error);
    }
    return false;
}

function identifyCorrectionType(partialXPath, document) {

    const maxIdIdx = partialXPath.lastIndexOf('@id=');
    const maxClassIdx = partialXPath.lastIndexOf('@class=');

    if (maxIdIdx > maxClassIdx) {
        return 'id';
    }

    return 'class';
}

function suggestCorrection(partialXPath, correctionType, document) {
    const lastElement = getLastElementFromXPath(partialXPath);
    const extractedId = extractIdFromXPath(lastElement);

    // Find elements with similar IDs
    const similarElements = document.querySelectorAll(`[id*='${extractedId}']`);

    // Initialize variables to track the most similar ID and its Levenshtein Distance
    let mostSimilarId = null;
    let minDistance = Number.MAX_VALUE;

    // Iterate through similar elements and find the most similar ID
    similarElements.forEach((element) => {
        const currentId = element.id;
        const distance = levenshteinDistance(extractedId, currentId);

        if (distance < minDistance) {
            minDistance = distance;
            mostSimilarId = currentId;
        }
    });

    return mostSimilarId;
}

// Function to extract the last element from the right in a partial XPath
function getLastElementFromXPath(partialXPath) {
    const parts = partialXPath.split('/');
    return parts[parts.length - 1];
}

// Function to extract the ID from an XPath element (e.g., "@id='example'")
function extractIdFromXPath(element) {
    const matches = element.match(/@id='([^']+)'/);
    return matches ? matches[1] : null;
}

// Function to calculate Levenshtein Distance between two strings
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Calculate Levenshtein Distance
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[b.length][a.length];
}