document.getElementById("validateButton").addEventListener("click", function () {
    const xpaths = document.getElementById("xpathInput").value.split("\n").filter((xpath) => xpath.trim() !== "");

    // Check if there are XPaths to validate
    if (xpaths.length === 0) {
        const validationResultDiv = document.getElementById("validationResult");
        validationResultDiv.innerHTML = "";
        const noXPathsMessage = document.createElement("div");
        noXPathsMessage.textContent = "No XPaths found in the textarea.";
        validationResultDiv.appendChild(noXPathsMessage);
        return; // Exit the function if there are no XPaths to validate
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "validateXPaths", xpaths: xpaths }, function (results) {
            const validationResultDiv = document.getElementById("validationResult");
            validationResultDiv.innerHTML = "";
            results.forEach((result) => {
                const resultDiv = document.createElement("div");

                // Create Font Awesome icons for valid and invalid XPaths
                const icon = document.createElement("i");
                icon.classList.add("fa-solid", "mr-[0.5rem]", "rounded-full", "p-1", "text-white", "font-extrabold", result.isValid ? "fa-check" : "fa-xmark");
                icon.classList.add(result.isValid ? "bg-green-400" : "bg-red-500");
                if (!result.isValid) {
                    icon.classList.add("px-[0.4rem]");
                }

                // Create a text node for the result message
                const resultText = document.createTextNode(`${result.xpath}`);

                // Append the icon and result text to the resultDiv
                resultDiv.appendChild(icon);
                resultDiv.appendChild(resultText);

                // Append resultDiv to validationResultDiv
                validationResultDiv.appendChild(resultDiv);
            });
        });
    });
});
