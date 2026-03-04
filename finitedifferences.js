// finitedifferences.js

document.getElementById('generate-table-btn').addEventListener('click', () => {
    const xInput = document.getElementById('x-values').value;
    const yInput = document.getElementById('y-values').value;
    const targetXStr = document.getElementById('interpolate-x').value;

    const x = xInput.split(',').map(val => parseFloat(val.trim()));
    const y = yInput.split(',').map(val => parseFloat(val.trim()));
    
    const tableContainer = document.getElementById('table-container');
    const resultContainer = document.getElementById('interpolation-result');
    resultContainer.innerHTML = ""; 

    if (x.some(isNaN) || y.some(isNaN)) {
        tableContainer.innerHTML = `<p style="color:red;">Error: Invalid numbers.</p>`;
        return;
    }
    if (x.length !== y.length) {
        tableContainer.innerHTML = `<p style="color:red;">Error: X and Y counts must match.</p>`;
        return;
    }

    // --- 1. BUILD THE DIFFERENCE TABLE ---
    let n = y.length;
    let diffTable = Array.from({length: n}, () => Array(n).fill(null));

    for (let i = 0; i < n; i++) diffTable[i][0] = y[i];

    for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
            diffTable[i][j] = diffTable[i + 1][j - 1] - diffTable[i][j - 1];
        }
    }

    // Render Table HTML
    let html = `<div class="table-wrapper"><table style="text-align:center;"><thead><tr style="background-color:#e8f4f8;"><th>x</th><th>y</th>`;
    for (let j = 1; j < n; j++) html += `<th>Δ<sup>${j}</sup>y</th>`;
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < n; i++) {
        html += `<tr><td><strong>${x[i]}</strong></td>`; 
        for (let j = 0; j < n - i; j++) {
            let val = Number.isInteger(diffTable[i][j]) ? diffTable[i][j] : parseFloat(diffTable[i][j].toFixed(4));
            let style = (i === 0 && j > 0) ? `color: var(--primary-color); font-weight: bold; background-color: #e0e7ff; border-radius: 4px;` : ``;
            html += `<td style="${style}">${val}</td>`;
        }
        for (let j = n - i; j < n; j++) html += `<td></td>`;
        html += `</tr>`;
    }
    html += `</tbody></table></div>`;
    tableContainer.innerHTML = html;

    // --- 2. INTERPOLATION LOGIC ---
    if (targetXStr.trim() !== "") {
        const targetX = parseFloat(targetXStr);
        const selectedMethod = document.querySelector('input[name="interp-method"]:checked').value;
        
        let resultData;
        let methodName = "";
        let methodColor = "";

        // Determine which method to use based on Radio Buttons
        let methodToRun = selectedMethod;

        if (selectedMethod === "auto") {
            // Split the data range into thirds to auto-select
            const range = x[x.length - 1] - x[0];
            const lowerThird = x[0] + (range / 3);
            const upperThird = x[x.length - 1] - (range / 3);

            if (targetX <= lowerThird) methodToRun = "forward";
            else if (targetX >= upperThird) methodToRun = "backward";
            else methodToRun = "stirling";
        }

        // Execute the selected method
        if (methodToRun === "forward") {
            resultData = solveNewtonForward(x, y, diffTable, targetX);
            methodName = selectedMethod === "auto" ? "Newton's Forward (Auto-Selected)" : "Newton's Forward Method";
            methodColor = "var(--primary-color)"; // Blue
        }
        else if (methodToRun === "backward") {
            resultData = solveNewtonBackward(x, y, diffTable, targetX);
            methodName = selectedMethod === "auto" ? "Newton's Backward (Auto-Selected)" : "Newton's Backward Method";
            methodColor = "#f59e0b"; // Orange
        } 
        else if (methodToRun === "stirling") {
            resultData = solveStirling(x, y, diffTable, targetX);
            methodName = selectedMethod === "auto" ? "Stirling's Central (Auto-Selected)" : "Stirling's Central Method";
            methodColor = "#10b981"; // Green
        }
        else if (methodToRun === "bessel") {
            resultData = solveBessel(x, y, diffTable, targetX);
            methodName = "Bessel's Central Method";
            methodColor = "#8b5cf6"; // Purple
        }

        // Render Results
        if (resultData.error) {
            resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Warning: ${resultData.error}</p>`;
        } else {
            resultContainer.innerHTML = `
                <div style="background: white; border: 2px solid ${methodColor}; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h3 style="color: ${methodColor}; margin-top: 0;">Interpolation Result</h3>
                    <p style="font-size: 1.1em; margin-bottom: 5px;">Using <strong>${methodName}</strong> for target <strong>X = ${targetX}</strong>:</p>
                    <p style="font-size: 1.1em; margin: 0;">Step size (h) = ${resultData.h}</p>
                    <p style="font-size: 1.1em; margin: 0;">Ratio (p) = ${resultData.p.toFixed(4)}</p>
                    <div style="font-size: 1.8em; font-weight: bold; color: #0f172a; margin-top: 15px; text-align: center; background: #f8fafc; padding: 10px; border-radius: 6px;">
                        Y = ${resultData.result.toFixed(4)}
                    </div>
                </div>
            `;
        }
    }
});
