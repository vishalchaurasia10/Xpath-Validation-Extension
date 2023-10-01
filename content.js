// content.js

console.log("content.js");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "validateXPaths") {
        const results = [];
        (request.xpaths).forEach((xpath) => {
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
    }
});

