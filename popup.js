// popup.js

document.getElementById("validateButton").addEventListener("click", function () {
    const xpaths = document.getElementById("xpathInput").value.split("\n");
    console.log("Popup.js");
    console.log(xpaths);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "validateXPaths", xpaths: xpaths }, function (results) {
            const validationResultDiv = document.getElementById("validationResult");
            validationResultDiv.innerHTML = "";
            results.forEach((result) => {
                const resultDiv = document.createElement("div");
                resultDiv.textContent = `${result.xpath} is ${result.isValid ? "valid" : "invalid"}`;
                validationResultDiv.appendChild(resultDiv);
            });
        });
    });
});
