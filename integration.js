// integration.js - Main Controller

// --- 1. EQUATION GENERATOR ---
document.getElementById('generate-xy-btn').addEventListener('click', () => {
    const funcStr = document.getElementById('eq-func').value;
    const a = parseFloat(document.getElementById('eq-a').value);
    const b = parseFloat(document.getElementById('eq-b').value);
    const n = parseInt(document.getElementById('eq-n').value);

    if (!funcStr || isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
        alert("Please fill all equation fields correctly. 'n' must be greater than 0.");
        return;
    }

    // Basic Math Parser
    let parsedFunc = funcStr
        .replace(/Math\./g, '') 
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**');

    // PROFESSIONAL OPTIMIZATION: Compile the function once, not inside the loop
    let mathFunc;
    try {
        mathFunc = new Function('x', `return ${parsedFunc};`);
    } catch (e) {
        alert("Invalid function syntax. Please use standard math like 1/(1+x^2) or sin(x).");
        return;
    }

    let h = (b - a) / n;
    let xArr = [];
    let yArr = [];

    for (let i = 0; i <= n; i++) {
        let currentX = a + i * h;
        xArr.push(parseFloat(currentX.toFixed(5)));
        
        try {
            // Execute the pre-compiled function
            let currentY = mathFunc(currentX);
            if (isNaN(currentY) || !isFinite(currentY)) throw new Error("Math Error");
            
            yArr.push(parseFloat(currentY.toFixed(5)));
        } catch (e) {
            alert(`Mathematical error evaluated at x = ${currentX}. Check your equation for invalid limits (like dividing by zero).`);
            return;
        }
    }

    // Fill inputs and clear results
    document.getElementById('x-values').value = xArr.join(', ');
    document.getElementById('y-values').value = yArr.join(', ');
    document.getElementById('integration-result').innerHTML = `<p style="text-align:center; color:var(--text-muted); padding-top:40px;">Data generated! Click "Calculate Area" below.</p>`;
});


// --- 2. AREA CALCULATOR ---
document.getElementById('calculate-area-btn').addEventListener('click', () => {
    const selectedMethod = document.querySelector('input[name="integ-method"]:checked').value;
    const resultContainer = document.getElementById('integration-result');

    let resultData;
    let methodName = "";
    let methodColor = "";
    let n_display = "N/A";
    let h_display = "N/A";

  // --- ADVANCED QUADRATURE BYPASS (Gauss & Chebyshev) ---
    if (selectedMethod === "advanced") {
        const advMethod = document.getElementById('advanced-method-select').value;
        const funcStr = document.getElementById('eq-func').value;
        const a = parseFloat(document.getElementById('eq-a').value);
        const b = parseFloat(document.getElementById('eq-b').value);

        if (!funcStr || isNaN(a) || isNaN(b)) {
            resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: Advanced Quadrature requires the f(x) Equation, Lower Limit (a), and Upper Limit (b) to be filled out.</p>`;
            return;
        }

        // Route to Gauss-Legendre
        if (advMethod.startsWith("gauss")) {
            let points = parseInt(advMethod.replace("gauss", ""));
            resultData = solveGaussLegendre(funcStr, a, b, points);
            methodName = `Gauss-Legendre Quadrature (${points}-Point)`;
            methodColor = "#be123c"; // Crimson
            n_display = `Evaluated at ${points} optimal roots`;
        } 
        // Route to Chebyshev
        else if (advMethod.startsWith("cheby")) {
            let points = parseInt(advMethod.replace("cheby", ""));
            resultData = solveChebyshev(funcStr, a, b, points);
            methodName = `Gauss-Chebyshev (${points}-Point Formula)`;
            methodColor = "#c2410c"; // Burnt Orange
            n_display = `Evaluated at ${points} `;
        }
    } 
    
    // DISCRETE DATA LOGIC
    else {
        const xInput = document.getElementById('x-values').value;
        const yInput = document.getElementById('y-values').value;

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

        let h = x[1] - x[0];
        for (let i = 1; i < x.length - 1; i++) {
            if (Math.abs((x[i+1] - x[i]) - h) > 1e-5) {
                resultContainer.innerHTML = `<p style="color:red; font-weight:bold; padding:15px; background:#fee2e2; border-radius:6px;">Warning: Numerical Integration requires strictly equally spaced X values.</p>`;
                return;
            }
        }

        let n = x.length - 1; 
        n_display = n.toString(); // Map to display variables
        h_display = h.toFixed(5);
        
        let methodToRun = selectedMethod;

        // Auto-Select Logic
        if (selectedMethod === "auto") {
            if (Number.isInteger(Math.log2(n))) methodToRun = "romberg";
            else if (n % 3 === 0) methodToRun = "simp38";
            else if (n % 2 === 0) methodToRun = "simp13";
            else methodToRun = "trap";
        }

        // Execution Routing
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
        } else if (methodToRun === "romberg") {
            resultData = solveRomberg(y, h);
            methodName = selectedMethod === "auto" ? "Romberg Integration (Auto)" : "Romberg Integration";
            methodColor = "#ef4444"; 
        }
    }

    // --- RENDER UNIFIED OUTPUT ---
    if (resultData.error) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold; padding:15px; background:#fee2e2; border-radius:6px;">${resultData.error}</p>`;
    } else {
        let html = `
            <div style="background: white; border: 2px solid ${methodColor}; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="color: ${methodColor}; margin-top: 0;">Area Result</h3>
                <p style="font-size: 1.1em; margin-bottom: 5px;">Using <strong>${methodName}</strong>:</p>
                <div style="display: flex; gap: 20px; color: var(--text-muted); margin-top: 10px;">
                    <span><strong>Intervals (n):</strong> ${n_display}</span>
                    <span><strong>Step Size (h):</strong> ${h_display}</span>
                </div>
                <div style="font-size: 2em; font-weight: bold; color: #0f172a; margin-top: 20px; text-align: center; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed ${methodColor};">
                    Area ≈ ${resultData.area.toFixed(6)}
                </div>
        `;

        // Render Romberg Table if applicable
        if (resultData.table) {
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
