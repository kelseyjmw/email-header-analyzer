/**
 * Email Header Analyzer
 * 
 * This extension will parse the given email source and check
 * for valid SPF, DKIM, and DMARC Fields. After validation is complete,
 * the extension will highlight failed or missing authentication.
 * 
 * This tool's goal is to detect potential spoofing.
 */

const textArea = document.getElementById("email-header");
const resultsContainer = document.getElementById('result-container');
const resultMessage = document.getElementById('result-message');
const resultContent = document.getElementById('results');
const actionMessage = document.getElementById('action');

/**
 * Event listener for form submission.
 */
document.getElementById("email-header-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const headerText = textArea.value;
    try {
        const results = analyzeEmailHeaders(headerText);
        updateResults(results);
    } catch (err) {
        resultsContainer.style.display = 'block';
        resultsContainer.className = 'fail';
        resultMessage.textContent = 'Result: ERROR';
        resultContent.innerHTML = '';
        actionMessage.textContent = 'Error processing request. Please ensure all fields are filled out.';
    }
});

/**
 * Parse header check for validation
 * @param {*} headerText raw email header
 */
function analyzeEmailHeaders(headerText) {

    const results = {
        spf: "missing",
        dkim: "missing",
        dmarc: "missing",
    };

    const lines = headerText.split(/\r?\n/);
    const authBlocks = [];
    const regex = /^\s/;

    for (let i = 0; i < lines.length; i++ ) {
        // find the line with the results
        if (lines[i].toLowerCase().startsWith("authentication-results")) {
            let block = lines[i];
            // find following lines that start with a whitespace
            while ((i + 1 < lines.length) && regex.test(lines[i + 1])) {
                block += " " + lines[i + 1].trim();
                i++;
            }
            authBlocks.push(block.toLowerCase());
            break;
        }
    }

    const lineToCheck = (authBlocks[0] ? authBlocks[0] : null);
    ["spf", "dkim", "dmarc"].forEach(field => {
        const match = lineToCheck.match(new RegExp(`${field}=\\s*(pass|fail|softfail|neutral|none|temperror|permerror)`));
        if (match) {
            const parts = match[0].split('=');
            results[field] = parts[1];
        }
    });
    return results;
}

/**
 * Update UI to show the result to user
 * @param {*} results js object where the keys are each field: spf, dkim, dmarc,and keys are the validation result.
 */
function updateResults(results) {
    resultsContainer.className = '';
    resultMessage.textContent = '';
    actionMessage.textContent = '';
    resultContent.innerHTML = '';

    resultsContainer.style.display = 'block';

    let pass = 0;
    let warning = 0;
    let fail = 0;

    for (const [key, value] of Object.entries(results)) {
        switch (value) {
            case "pass":
                pass++;
                break;
            case "fail":
                fail++;
                break;
            case "missing":
                warning++;
                break;
            default:
                warning++;
        }
    }

    const spfResult = document.createElement("p");
    spfResult.textContent = `SPF: ${results['spf']}`;

    const dkimResult = document.createElement("p");
    dkimResult.textContent = `DKIM: ${results['dkim']}`;

    const dmarcResult = document.createElement("p");
    dmarcResult.textContent = `DMARC: ${results['dmarc']}`;

    resultContent.appendChild(spfResult);
    resultContent.appendChild(dkimResult);
    resultContent.appendChild(dmarcResult);

    // Pass only if all fields pass
    if (pass == 3) {
        resultsContainer.className = 'pass';
        resultMessage.textContent = "Result: PASSED!";
        actionMessage.textContent = "All fields have passed verification."

        // Fail if at least one field failed
    } else if (fail > 0) {
        resultsContainer.className = 'fail';
        resultMessage.textContent = "Result: FAIL!";
        actionMessage.textContent = "One or more fields have failed verification. Possible spoofing detected."

        // Warning if not all fields passed
    } else if (warning > 0) {
        resultsContainer.className = 'warning';
        resultMessage.textContent = "Result: WARNING!";
        actionMessage.textContent = "Not all fields have passed verification. Proceed with caution."
    }
}

/**
 * Clear all results data and textarea input.
 */
document.getElementById('clear-btn').addEventListener('click', () => {
    textArea.value = '';
    resultsContainer.style.display = 'none';
    resultsContainer.className = '';
    resultMessage.textContent = '';
    actionMessage.textContent = '';
    resultContent.innerHTML = '';
});