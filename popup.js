// popup.js
document.getElementById("validateButton").addEventListener("click", function () {
    const xpaths = document.getElementById("xpathInput").value.split("\n");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: validateXPaths,
            args: [xpaths],
        }, function (results) {
            const validationResultDiv = document.getElementById("validationResult");
            validationResultDiv.innerHTML = "";
            results.forEach((result) => {
                const resultDiv = document.createElement("div");
                resultDiv.textContent = `${result.xpath} is ${result.isValid ? "valid" : "invalid"
                    }`;
                validationResultDiv.appendChild(resultDiv);
            });
        });
    });
});
