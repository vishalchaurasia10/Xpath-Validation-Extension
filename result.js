// result.js
let validResults = [];
let invalidResults = [];

document.getElementById("download_results").addEventListener("click", () => {
    // Generate the content with an extra line between valid and invalid results
    const content = validResults.join('\n') + '\n\n' + invalidResults.join('\n');

    // Create a link element to initiate the download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'results.txt');

    element.style.display = 'none';
    document.body.appendChild(element);

    // Initiate the download
    element.click();

    // Clean up: remove the element from the document body
    document.body.removeChild(element);
});

document.addEventListener("DOMContentLoaded", function () {
    const validationResultDiv = document.getElementById("validationResult");
    const storedResults = sessionStorage.getItem("xpathResults");
    (async()=>{
      storedResults.forEach((result) => {
        if (result.isValid) {
            validresults.push(result);
        } else {
            invalidresults.push(result);
        }
      })
    })();
    if (storedResults) {
        const results = JSON.parse(storedResults);
        validationResultDiv.innerHTML = "";
        console.log(results);
        results.forEach((result) => {
            const resultDiv = document.createElement("div");

            // Create an anchor tag with an href to recommendation.html
            const anchor = document.createElement("a");
            anchor.href = `recommendations.html?xpath=${encodeURIComponent(result.value)}`;
            anchor.classList.add("flex", "items-center")

            // Create Font Awesome icons for valid and invalid XPaths
            const icon = document.createElement("i");
            icon.classList.add("fa-solid", "mr-[0.5rem]", "rounded-full", "p-1", "text-white", "font-extrabold", result.isValid ? "fa-check" : "fa-xmark");
            icon.classList.add(result.isValid ? "bg-green-400" : "bg-red-500");
            if (!result.isValid) {
                icon.classList.add("px-[0.4rem]");
            }

            // Create a text node for the result message
            const resultText = document.createTextNode(`${result.key} : ${result.value}`);

            // Append the icon and result text to the anchor tag
            anchor.appendChild(icon);
            anchor.appendChild(resultText);

            // Append the anchor tag to the resultDiv
            resultDiv.appendChild(anchor);

            // Append resultDiv to validationResultDiv
            validationResultDiv.appendChild(resultDiv);
        });
    } else {
        validationResultDiv.textContent = "No validation results available.";
    }
});
