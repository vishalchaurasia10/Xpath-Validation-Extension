// content.js
console.log("Xpath Validator is active...");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "validateXPaths") {
        const results = [];
        request.xpaths.forEach((xpath) => {
            const { key, value } = xpath;
            try {
                const element = document.evaluate(value, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (element.snapshotLength > 0) {
                    results.push({ key, value, isValid: true });
                } else {
                    results.push({ key, value, isValid: false });
                }
            } catch (error) {
                console.log("error", error);
                results.push({ key, value, isValid: false });
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
        console.log("xpath", xpath);
        try {
            const element = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            console.log("element", element);
            if (element.snapshotLength > 0) {
                // Get the first matching element
                const firstElement = element.snapshotItem(0);
                console.log("firstElement", firstElement);

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

function arrayToXPathSet(xpathArray) {
    // Create a Set from the array to eliminate duplicates
    var xpathSet = new Set(xpathArray);

    return xpathSet;
}

function suggestXPathCorrection(invalidXPath, document) {
    const xpathParts = invalidXPath.split('/');
    let outerLoop = [];
    let childArray = [];
    let globalChildArray = [];


    outerLoop.push(`/${xpathParts[1]}`);

    for (let i = 2; i <= xpathParts.length; i++) {
        let tempCorrectedValue;  // Declare tempCorrectedValue with let
        outerLoop.forEach((partialXPath, index) => {
            if (isValidXPath(partialXPath, document)) {
                console.log('valid xpath found', partialXPath);
            } else {
                console.log('invalid xpath found', partialXPath);
                const correctionType = identifyCorrectionType(partialXPath);
                console.log('correctionType', correctionType);
                const { allPossibleXpaths, prefix } = suggestCorrection(partialXPath, correctionType, document);
                console.log('allPossibleXpaths', allPossibleXpaths);
                childArray = allPossibleXpaths.map((possibleXpath) => {
                    const currentValue = possibleXpath;
                    let currentCorrectionType = correctionType;  // Declare currentCorrectionType with let
                    tempCorrectedValue = partialXPath.replace(`/${xpathParts[i - 1]}`, '');

                    // Reconstruct the corrected XPath with the correct format
                    tempCorrectedValue = `${tempCorrectedValue}/${prefix}[@${currentCorrectionType}='${currentValue}']`;

                    console.log('tempCorrectedValue', tempCorrectedValue);

                    if (isValidXPath(tempCorrectedValue, document)) {
                        console.log('valid xpath found', tempCorrectedValue);
                        return tempCorrectedValue;
                    }
                    return null; // return null for invalid XPaths
                })
                    .filter(Boolean); // filter out null values
                outerLoop.splice(index, 1);

                globalChildArray.push(...childArray);

                console.log('globalChildArray', globalChildArray);
                console.log('childArray', childArray);
                console.log('outerLoop', outerLoop);
            }
        });

        if (globalChildArray.length > 0) {
            console.log('globalChildArray', globalChildArray);
            outerLoop.push(...globalChildArray);
            globalChildArray = [];
        }
        if (i < xpathParts.length) {
            outerLoop = outerLoop.map((tempCorrectedValue) => {
                return tempCorrectedValue + `/${xpathParts[i]}`;
            });
        }
    }

    console.log('outerLoop', outerLoop);

    console.log('invalidXPath', invalidXPath);
    outerLoop = outerLoop.filter((xpath) => {
        return xpath !== invalidXPath && isValidXPath(xpath, document);
    });

    const xpathSet = arrayToXPathSet(outerLoop);
    outerLoop = [...xpathSet];
    return outerLoop;
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

function identifyCorrectionType(partialXPath) {

    const idx1 = partialXPath.lastIndexOf('@');
    const idx2 = partialXPath.lastIndexOf('=');
    return partialXPath.substring(idx1 + 1, idx2).trim();
}

function suggestCorrection(partialXPath, correctionType, document) {
    const lastElement = getLastElementFromXPath(partialXPath);
    console.log('partialXPath', partialXPath)
    console.log('lastElement', lastElement);
    const extractedValue = extractValueFromXPath(lastElement, correctionType);
    console.log('extractedValue', extractedValue);
    const prefix = lastElement.substring(0, lastElement.indexOf(`[`))

    if (correctionType === 'class') {
        const classValues = extractedValue.split(' ');
        const allPossibleClassLists = [];
        classValues.forEach((classValue) => {
            const partialXPath = `//${prefix}[contains(@${correctionType}, '${classValue}')]`;
            const similarElements = document.evaluate(partialXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            const nodeList = Array.from({ length: similarElements.snapshotLength }, (_, index) => similarElements.snapshotItem(index));
            nodeList.forEach((element) => {
                const currentValue = element.getAttribute(correctionType);
                allPossibleClassLists.push(currentValue);
            });
        });
        return { allPossibleXpaths: allPossibleClassLists, prefix };
    } else {
        // Find elements with similar IDs
        const xpath = `//${prefix}[contains(@${correctionType}, '${extractedValue}')]`;
        // console.log('xpath', xpath)
        const similarElements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        // console.log('similar elements', similarElements)
        const nodeList = Array.from({ length: similarElements.snapshotLength }, (_, index) => similarElements.snapshotItem(index));

        // Now, 'nodeList' is an array of elements matching the XPath expression
        // console.log(nodeList);
        // Initialize variables to track the most similar ID and its Levenshtein Distance
        let minDistance = Number.MAX_VALUE;

        const allPossibleXpaths = []
        // Iterate through similar elements and find the most similar ID
        nodeList.forEach((element) => {
            const currentValue = element.getAttribute(correctionType);
            // const distance = levenshteinDistance(extractedValue, currentValue);

            // if (distance < minDistance) {
            //     minDistance = distance;
            //     mostSimilarValue = currentValue;
            // }
            allPossibleXpaths.push(currentValue)
        });

        // console.log('prefix', prefix);
        return { allPossibleXpaths, prefix };
    }
}

// Function to extract the last element from the right in a partial XPath
function getLastElementFromXPath(partialXPath) {
    const parts = partialXPath.split('/');
    return parts[parts.length - 1];
}

// Function to extract the ID from an XPath element (e.g., "@id='example'")
function extractValueFromXPath(element, correctionType) {
    const matches = element.match(new RegExp(`@${correctionType}='([^']+)'`));
    console.log('matches', matches);
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