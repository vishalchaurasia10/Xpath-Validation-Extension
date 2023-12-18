// console.log('xpathParts', xpathParts);
let correctedXPath = '';
let currentCorrectionType = null;
let validPossibleXpaths = [];
// let partialXPath = `/${xpathParts.slice(1, i).join('/')}`;

for (let i = 1; i <= xpathParts.length - 1; i++) {
correctedXPath += `/${xpathParts[i]}`;
// console.log('correctedXPath', correctedXPath);
let outerLoop = [correctedXPath];

if (isValidXPath(correctedXPath, document)) {
// If the corrected XPath is valid, continue to the next part
continue;
} else {
// Identify the type of correction needed (class or id)
const correctionType = identifyCorrectionType(correctedXPath);
// console.log('correctionType', correctionType);

// Apply Levenshtein Distance to correct the identified part
const { allPossibleXpaths, prefix } = suggestCorrection(correctedXPath, correctionType, document);
// console.log('correctedValue', correctedValue);

outerLoop.map((outerLoopValue) => {
validPossibleXpaths = allPossibleXpaths
.map((possibleXpath) => {
let tempCorrectedValue = outerLoopValue;
const { currentValue, distance } = possibleXpath;
currentCorrectionType = correctionType;
tempCorrectedValue = tempCorrectedValue.replace(`/${xpathParts[i]}`, '');

// Reconstruct the corrected XPath with the correct format
tempCorrectedValue = `${tempCorrectedValue}/${prefix}[@${currentCorrectionType}='${currentValue}']`;

if (isValidXPath(tempCorrectedValue, document)) {
return { tempCorrectedValue, distance };
}

return null; // return null for invalid XPaths
})
.filter(Boolean); // filter out null values
})

outerLoop.push(validPossibleXpaths);