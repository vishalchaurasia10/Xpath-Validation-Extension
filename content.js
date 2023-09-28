// content.js
function validateXPaths(xpaths) {
    const results = [];
    xpaths.forEach((xpath) => {
        try {
            const elements = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            );
            const element = elements.iterateNext();
            if (element) {
                results.push({ xpath, isValid: true });
            } else {
                results.push({ xpath, isValid: false });
            }
        } catch (error) {
            results.push({ xpath, isValid: false });
        }
    });
    return results;
}

const xpathsToValidate = ["//div[@id='example']", "//a[@class='link']"];
const validationResults = validateXPaths(xpathsToValidate);

// Send the validation results back to the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "validateXPaths") {
        sendResponse(validationResults);
    }
});
