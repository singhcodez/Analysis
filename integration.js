// integration.js - Main Controller

// --- NEW: EQUATION GENERATOR LOGIC ---
document.getElementById('generate-xy-btn').addEventListener('click', () => {
    const funcStr = document.getElementById('eq-func').value;
    const a = parseFloat(document.getElementById('eq-a').value);
    const b = parseFloat(document.getElementById('eq-b').value);
    const n = parseInt(document.getElementById('eq-n').value);

    if (!funcStr || isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
        alert("Please fill all equation fields correctly. 'n' must be greater than 0.");
        return;
    }

    let h = (b - a) / n;
    let xArr = [];
    let yArr = [];

    // Basic Math Parser to make standard math syntax readable by Javascript
    let parsedFunc = funcStr
        .replace(/Math\./g, '') // Clean up just in case
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**'); // Convert 1+x^2 to Javascript's 1+x**2

    for (let i = 0; i <= n; i++) {
        let currentX = a + i * h;
        // Fix floating point weirdness on the X values
        xArr.push(parseFloat(currentX.toFixed(5)));
        
        try {
            // Evaluate the function! The variable 'x' is used inside the eval() string.
            let x = currentX; 
            let currentY = eval(parsedFunc);
            
            // Push to array, rounded to 5 decimal places for clean UI
            yArr.push(parseFloat(currentY.toFixed(5)));
        } catch (e) {
            alert("Invalid function syntax. Please use standard math like 1/(1+x^2) or sin(x).");
            return;
        }
    }

    // Automatically fill the manual input boxes with our generated arrays!
    document.getElementById('x-values').value = xArr.join(', ');
    document.getElementById('y-values').value = yArr.join(', ');
    
    // Clear any old results
    document.getElementById('integration-result').innerHTML = `<p style="text-align:center; color:var(--text-muted); padding-top:40px;">Data generated! Click "Calculate Area" below.</p>`;
});



document.getElementById('calculate-area-btn').addEventListener('click', () => {
    const xInput = document.getElementById('x-values').value;
    const yInput = document.getElementById('y-values').value;
    const selectedMethod = document.querySelector('input[name="integ-method"]:checked').value;
    const resultContainer = document.getElementById('integration-result');

    const x = xInput.split(',').map(val => parseFloat(val.trim()));
    const y = yInput.split(',').map(val => parseFloat(val.trim()));

    // Validation
    if (x.some(isNaN) || y.some(isNaN)) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: Invalid numbers.</p>`;
        return;
    }
    if (x.length !== y.length) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: X and Y counts must match.</p>`;
        return;
    }
    if (x.length < 2) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: Need at least 2 points to find an area.</p>`;
        return;
    }

    // Check equally spaced X values using the epsilon trick
    let h = x[1] - x[0];
    for (let i = 1; i < x.length - 1; i++) {
        if (Math.abs((x[i+1] - x[i]) - h) > 1e-5) {
            resultContainer.innerHTML = `<p style="color:red; font-weight:bold; padding:15px; background:#fee2e2; border-radius:6px;">Warning: Numerical Integration requires strictly equally spaced X values.</p>`;
            return;
        }
    }

    let n = x.length - 1; // Number of intervals
    let resultData;
    let methodName = "";
    let methodColor = "";

    let methodToRun = selectedMethod;

    // Hyper-Intelligent Auto-Select Logic
    if (selectedMethod === "auto") {
        // Romberg is the most accurate, check if n is a power of 2 first
        if (Number.isInteger(Math.log2(n))) methodToRun = "romberg";
        else if (n % 3 === 0) methodToRun = "simp38";
        else if (n % 2 === 0) methodToRun = "simp13";
        else methodToRun = "trap";
    }

    // Execute the appropriate module
    if (methodToRun === "trap") {
        resultData = solveTrapezoidal(y, h);
        methodName = selectedMethod === "auto" ? "Trapezoidal Rule (Auto)" : "Trapezoidal Rule";
        methodColor = "#3b82f6"; 
    } else if (methodToRun === "simp13") {
        resultData = solveSimpson13(y, h);
        methodName = selectedMethod === "auto" ? "Simpson's 1/3 Rule (Auto)" : "Simpson's 1/3 Rule";
        methodColor = "#10b981"; 
    } else if (methodToRun === "simp38") {
        resultData = solveSimpson38(y, h);
        methodName = selectedMethod === "auto" ? "Simpson's 3/8 Rule (Auto)" : "Simpson's 3/8 Rule";
        methodColor = "#8b5cf6"; 
    // --- ADD ROMBERG BLOCK ---
    } else if (methodToRun === "romberg") {
        resultData = solveRomberg(y, h);
        methodName = selectedMethod === "auto" ? "Romberg Integration (Auto - Power of 2 Detected)" : "Romberg Integration";
        methodColor = "#ef4444"; // Red for high-precision
    }

    // Render Output
    if (resultData.error) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold; padding:15px; background:#fee2e2; border-radius:6px;">${resultData.error}</p>`;
    } else {
        let html = `
            <div style="background: white; border: 2px solid ${methodColor}; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="color: ${methodColor}; margin-top: 0;">Area Result</h3>
                <p style="font-size: 1.1em; margin-bottom: 5px;">Using <strong>${methodName}</strong>:</p>
                <div style="display: flex; gap: 20px; color: var(--text-muted); margin-top: 10px;">
                    <span><strong>Intervals (n):</strong> ${n}</span>
                    <span><strong>Step Size (h):</strong> ${h.toFixed(4)}</span>
                </div>
                <div style="font-size: 2em; font-weight: bold; color: #0f172a; margin-top: 20px; text-align: center; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed ${methodColor};">
                    Area ≈ ${resultData.area.toFixed(6)}
                </div>
        `;

        // Optional: If Romberg was used, print the extrapolation table for the students!
        if (methodToRun === "romberg" && resultData.table) {
            html += `<h4 style="margin-top: 20px; color: var(--text-main);">Romberg Extrapolation Table:</h4>
                     <div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 0.9em;"><tbody>`;
            resultData.table.forEach(row => {
                html += `<tr>`;
                row.forEach(val => {
                    if (val !== 0) html += `<td style="border: 1px solid var(--border-color); padding: 5px;">${val.toFixed(6)}</td>`;
                    else html += `<td style="border: 1px solid var(--border-color); padding: 5px; background: #f8fafc;"></td>`;
                });
                html += `</tr>`;
            });
            html += `</tbody></table></div>`;
        }

        html += `</div>`;
        resultContainer.innerHTML = html;
    }
});
