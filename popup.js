var inputMode="xpath";

document.getElementById('mode').addEventListener('click',()=>{
    if(inputMode=="xpath"){
        inputMode="yaml";
    }
    else{
        inputMode="xpath";
    }
})
document.getElementById("validateButton").addEventListener("click", function () {
    const xpathsTxtBox = document.getElementById("xpathInput").value
    var xpaths =[];
    if(inputMode=="yaml"){
    const regex = /"([^"]+)"/g;
    let match;
    while ((match = regex.exec(xpathsTxtBox)) !== null) {
    xpaths.push(match[1]);
    } 
}   
    else{
        xpaths=xpathsTxtBox.split("\n").filter((xpath) => xpath.trim() !== "");
    }
    if (xpaths.length === 0) {
        // Handle the case where there are no XPaths to validate
        return;
    }
    console.log(xpaths);




    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "validateXPaths", xpaths: xpaths }, function (results) {
            sessionStorage.setItem("xpathResults", JSON.stringify(results));

            // Check if there are validation results in session storage
            if (results && results.length > 0) {
                window.location.href = "result.html";
            }
        });
    });
});

