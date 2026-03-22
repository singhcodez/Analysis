// ode.js

document.getElementById('solve-ode-btn').addEventListener('click', () => {
    const funcStr = document.getElementById('ode-func').value;
    const x0 = parseFloat(document.getElementById('ode-x0').value);
    const y0 = parseFloat(document.getElementById('ode-y0').value);
    const targetX = parseFloat(document.getElementById('ode-target').value);
    const h = parseFloat(document.getElementById('ode-h').value);
    const method = document.querySelector('input[name="ode-method"]:checked').value;
    const resultContainer = document.getElementById('ode-result');

    // Validation
    if (!funcStr || isNaN(x0) || isNaN(y0) || isNaN(targetX) || isNaN(h) || h <= 0) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: Please fill out all fields correctly. 'h' must be positive.</p>`;
        return;
    }
    if (targetX <= x0) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: Target X must be greater than Initial X₀.</p>`;
        return;
    }

    // Advanced Math Parser (Now accepts 'x' AND 'y')
    let parsedFunc = funcStr
        .replace(/Math\./g, '') 
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log10/g, 'Math.log10') 
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**');

    let f;
    try {
        // Compile the function expecting TWO parameters: x and y
        f = new Function('x', 'y', `return ${parsedFunc};`);
        // Quick test to ensure it compiles
        f(x0, y0); 
    } catch (e) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold;">Error: Invalid function syntax. Make sure to use 'x' and 'y' (e.g., x + y).</p>`;
        return;
    }

    // Execute Math
    let resultData;
    let methodName = "";
    let methodColor = "";

    if (method === "euler") {
        resultData = solveEuler(f, x0, y0, targetX, h);
        methodName = "Euler's Method";
        methodColor = "#3b82f6"; // Blue
    } else if (method === "rk4") {
        resultData = solveRK4(f, x0, y0, targetX, h);
        methodName = "Runge-Kutta 4th Order (RK4)";
        methodColor = "#8b5cf6"; // Purple
    }
    else if (method === "taylor") {
        resultData = solveTaylor(f, x0, y0, targetX, h);
        methodName = "Taylor Series Method (3rd Order)";
        methodColor = "#10b981"; // Green
    } 

    else if (method === "picard") {
        resultData = solvePicard(f, x0, y0, targetX);
        methodName = "Picard's Successive Approximations";
        methodColor = "#f59e0b"; // Amber
    }
    else if (method === "milne") {
        resultData = solveMilne(f, x0, y0, targetX, h);
        methodName = "Milne's Predictor-Corrector";
        methodColor = "#ec4899"; // Pink
    }

    // Render Output
    if (resultData.error) {
        resultContainer.innerHTML = `<p style="color:red; font-weight:bold; padding:15px; background:#fee2e2; border-radius:6px;">${resultData.error}</p>`;
    } else {
        let html = `
            <div style="background: white; border: 2px solid ${methodColor}; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="color: ${methodColor}; margin-top: 0;">ODE Solution</h3>
                <p style="font-size: 1.1em; margin-bottom: 5px;">Using <strong>${methodName}</strong>:</p>
                
                <div style="font-size: 2em; font-weight: bold; color: #0f172a; margin-top: 20px; text-align: center; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed ${methodColor};">
                    y(${targetX}) ≈ ${resultData.finalY.toFixed(6)}
                </div>
                
                <h4 style="margin-top: 25px; color: var(--text-main);">Step-by-Step Table:</h4>
                <div style="overflow-x: auto;">
                    <table class="step-table">
                        <thead>
        `;

        // Create table headers based on the method
        if (method === "euler") {
            html += `<tr><th>Step</th><th>x</th><th>y</th><th>Slope f(x,y)</th><th>Δy (h*slope)</th></tr></thead><tbody>`;
            resultData.steps.forEach(s => {
                html += `<tr><td>${s.step}</td><td>${s.x}</td><td><strong>${s.y}</strong></td><td>${s.slope}</td><td>${s.dy}</td></tr>`;
            });
        }
        else if (method === "rk4") {
            html += `<tr><th>Step</th><th>x</th><th>y</th><th>k₁</th><th>k₂</th><th>k₃</th><th>k₄</th></tr></thead><tbody>`;
            resultData.steps.forEach(s => {
                html += `<tr><td>${s.step}</td><td>${s.x}</td><td><strong>${s.y}</strong></td><td>${s.k1}</td><td>${s.k2}</td><td>${s.k3}</td><td>${s.k4}</td></tr>`;
            });
        }
        else if (method === "taylor") {
            html += `<tr><th>Step</th><th>x</th><th>y</th><th>y' (1st Deriv)</th><th>y'' (2nd Deriv)</th><th>y''' (3rd Deriv)</th></tr></thead><tbody>`;
            resultData.steps.forEach(s => {
                html += `<tr><td>${s.step}</td><td>${s.x}</td><td><strong>${s.y}</strong></td><td>${s.y1}</td><td>${s.y2}</td><td>${s.y3}</td></tr>`;
            });
        }  
         
            else if (method === "picard") {
            html += `<tr><th>Iteration (n)</th>
            <th> x </th>
            <th>Approximation y(Target X)</th>
            </tr></thead><tbody>`;
            // Add the initial starting point (Iteration 0)
            html += `<tr><td>0</td>
                <td>${x0}</td>
            <td>${y0} (Initial y₀)</td>
                
            </tr>`;
            resultData.steps.forEach(s => {
                html += `<tr><td>${s.iteration}</td>
                  <td><strong>${targetX}</strong></td>  
                <td><strong>${s.y_approx}</strong></td></tr>`;
            });
        }
            else if (method === "milne") {
            html += `<tr><th>Step</th><th>Phase</th><th>x</th><th>Predicted y (p)</th><th>Corrected y (c)</th><th>Final y</th></tr></thead><tbody>`;
            resultData.steps.forEach(s => {
                let rowStyle = s.phase === "RK4 Bootstrap" ? "background-color: #f8fafc; color: #64748b;" : "";
                html += `<tr style="${rowStyle}">
                            <td>${s.step}</td>
                            <td><em>${s.phase}</em></td>
                            <td>${s.x}</td>
                            <td>${s.yp}</td>
                            <td>${s.yc}</td>
                            <td><strong>${s.y}</strong></td>
                         </tr>`;
            });
        }
         
        html += `</tbody></table></div></div>`;
        resultContainer.innerHTML = html;
    }
});
