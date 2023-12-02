var inputMode = "xpath";
flag = 0;

document.getElementById('mode').addEventListener('click', () => {
    if (flag % 2 == 0) {
        if (inputMode == "xpath") {
            inputMode = "yaml";
        }
        else {
            inputMode = "xpath";
        }

    }
    flag = flag + 1;
})
document.getElementById("fileIp").addEventListener("change",()=>{
    readFile().then(content=>{
        console.log(content)
        validateXPaths(content)
    }).catch(error=>{
        alert(error)
    })
})

function readFile() {
    return new Promise((resolve, reject) => {
        var fileInput = document.getElementById('fileIp');
        var file = fileInput.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                var content = e.target.result;
                resolve(content);
            };

            reader.readAsText(file);
        } else {
            reject('Please choose a file.');
        }
    });
}


document.getElementById("validateButton").addEventListener("click",()=>validateXPaths(document.getElementById("xpathInput").value) );

const validateXPaths=function (xpathsTxtBox) {
    let xpaths = [];
    let newxpaths = [];
    
    if (inputMode == "yaml") {
        const regex = /'([^']+)'/g;
    let match;
    while ((match = regex.exec(xpathsTxtBox)) !== null) {
        xpaths.push(match[1]);
    }
    newxpaths = xpaths.map(xpath => {
        return xpath.replace(/"/g, "'");
    });    
    }
    else {
        xpaths = xpathsTxtBox.split("\n").filter((xpath) => xpath.trim() !== "");
        newxpaths = xpaths.map(xpath => {
            return xpath.replace(/"/g, "'");
        });        
    }
    if (newxpaths.length === 0) {
        // Handle the case where there are no XPaths to validate
        return;
    }
    console.log(newxpaths);




    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "validateXPaths", xpaths: newxpaths}, function (results) {
            sessionStorage.setItem("xpathResults", JSON.stringify(results));

            // Check if there are validation results in session storage
            if (results && results.length > 0) {
                window.location.href = "result.html";
            }
        });
    });
}

