// linear.js

// 1. Run this function right away to build a default 3x3 grid on load
generateMatrixGrid(3);

// 2. Listen for the "Create Grid" button click
document.getElementById('generate-btn').addEventListener('click', () => {
    const n = parseInt(document.getElementById('matrix-size').value);
    if (n >= 2 && n <= 6) {
        generateMatrixGrid(n);
    } else {
        alert("Please enter a size between 2 and 6.");
    }
});

/**
 * Dynamically builds the HTML for the Matrix inputs
 * @param {number} n - The size of the matrix (number of variables)
 */
function generateMatrixGrid(n) {
    const container = document.getElementById('matrix-container');
    container.innerHTML = ""; // Clear old grid

    // Create 'n' rows
    for (let i = 0; i < n; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';

        // Create 'n' columns for the A matrix (coefficients)
        for (let j = 0; j < n; j++) {
            rowDiv.innerHTML += `
                <input type="number" class="matrix-input" id="a_${i}_${j}" placeholder="0" value="0">
                <span class="matrix-label">x<sub>${j+1}</sub></span>
            `;
            
            // Add a "+" sign between terms, but not after the last one
            if (j < n - 1) {
                rowDiv.innerHTML += `<span>+</span>`;
            }
        }

        // Add the equals sign and the B matrix input (constants)
        rowDiv.innerHTML += `
            <span class="equals-sign">=</span>
            <input type="number" class="matrix-input" id="b_${i}" placeholder="0" value="0" style="border-color: #10b981;">
        `;

        container.appendChild(rowDiv);
    }
}



document.getElementById('solve-linear-btn').addEventListener('click', () => {
    const n = parseInt(document.getElementById('matrix-size').value);
    let A = [];
    let B = [];

    // 1. Read the grid inputs into arrays
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            let val = parseFloat(document.getElementById(`a_${i}_${j}`).value);
            if (isNaN(val)) { alert("Please fill all matrix boxes with numbers."); return; }
            row.push(val);
        }
        A.push(row);
        
        let bVal = parseFloat(document.getElementById(`b_${i}`).value);
        if (isNaN(bVal)) { alert("Please fill all B vector boxes with numbers."); return; }
        B.push(bVal);
    }

    // 2. Check which method is selected
    const method = document.querySelector('input[name="linear-method"]:checked').value;
    const resultsPanel = document.getElementById('linear-results');
    resultsPanel.innerHTML = ""; // Clear old results

    // 3. Execute and Print
    if (method === 'gauss') {
        const result = solveGaussElimination(A, B);
        if (result.error) {
            resultsPanel.innerHTML = `<p style="color:red;">${result.error}</p>`;
        } else {
            printRoots(result.roots, "Gauss Elimination Result");
            // Optional: You can loop through result.stepsData to show the matrix transforming!
        }
    }
  
  else if (method === 'gaussjordan') {
        const result = solveGaussJordan(A, B);
        if (result.error) {
            resultsPanel.innerHTML = `<p style="color:red; font-weight:bold;">${result.error}</p>`;
        } else {
            printRoots(result.roots, "Gauss-Jordan Result");
            
            // Show the final Identity Matrix
            let finalMatrix = result.stepsData[result.stepsData.length - 1].matrix;
            let html = `<h4>Final Transformed Matrix (Identity):</h4><div class="table-wrapper"><table><tbody>`;
            finalMatrix.forEach((row, idx) => {
                html += `<tr>`;
                row.forEach((val, colIdx) => {
                    // Highlight the 1s on the diagonal
                    let style = (idx === colIdx) ? `style="color:var(--primary-color); font-weight:bold;"` : `style="color:var(--text-muted);"`;
                    // Use Math.abs to fix floating point "-0.0000" display issues
                    let displayVal = Math.abs(val) < 1e-10 ? "0.0000" : val.toFixed(4);
                    html += `<td ${style}>${displayVal}</td>`;
                });
                html += `</tr>`;
            });
            html += `</tbody></table></div>`;
            resultsPanel.innerHTML += html;
        }
    } 
    
    else if (method === 'cholesky') {
        const result = solveCholesky(A, B);
        if (result.error) {
            resultsPanel.innerHTML = `<p style="color:red; font-weight:bold;">${result.error}</p>`;
        } else {
            printRoots(result.roots, "Cholesky Decomposition Result");
            
            // Optional: Print the L matrix to show the student the decomposition
            let html = `<h4>Lower Triangular Matrix (L):</h4><div class="table-wrapper"><table><tbody>`;
            result.stepsData[0].matrix.forEach(row => {
                html += `<tr>`;
                row.forEach(val => html += `<td>${val.toFixed(4)}</td>`);
                html += `</tr>`;
            });
            html += `</tbody></table></div>`;
            resultsPanel.innerHTML += html;
        }
    }
    else if (method === 'crout') {
        const result = solveCrout(A, B);
        if (result.error) {
            resultsPanel.innerHTML = `<p style="color:red; font-weight:bold;">${result.error}</p>`;
        } else {
            printRoots(result.roots, "Crout's Reduction Result");
            
            // Render the L and U matrices side-by-side for the students
            let html = `<div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:20px;">`;
            
            // Lower Matrix
            html += `<div><h4>Lower Matrix (L):</h4><div class="table-wrapper"><table><tbody>`;
            result.stepsData[0].L_matrix.forEach(row => {
                html += `<tr>`;
                row.forEach(val => html += `<td>${val.toFixed(4)}</td>`);
                html += `</tr>`;
            });
            html += `</tbody></table></div></div>`;
            
            // Upper Matrix
            html += `<div><h4>Upper Matrix (U):</h4><div class="table-wrapper"><table><tbody>`;
            result.stepsData[0].U_matrix.forEach(row => {
                html += `<tr>`;
                row.forEach((val, idx) => {
                    // Highlight the 1s on the diagonal
                    let isDiagonal = (row.indexOf(val) === idx && val === 1) ? `style="color:var(--primary-color); font-weight:bold;"` : ``;
                    html += `<td ${isDiagonal}>${val.toFixed(4)}</td>`;
                });
                html += `</tr>`;
            });
            html += `</tbody></table></div></div></div>`;
            
            resultsPanel.innerHTML += html;
        }
    }

    else if (method === 'seidel') {
        const result = solveGaussSeidel(A, B);
        if (result.error) {
            resultsPanel.innerHTML = `<p style="color:red;">${result.error}</p>`;
        } else {
            printRoots(result.roots, `Gauss-Seidel Result (Took ${result.iterations} iterations)`);
            printSeidelSteps(result.stepsData, n); // We can reuse this function to print the table!
        }
        
    // --- ADD THIS NEW BLOCK ---
    } 
    else if (method === 'jacobi') {
        const result = solveJacobi(A, B);
        if (result.error) {
            resultsPanel.innerHTML = `<p style="color:red;">${result.error}</p>`;
        } else {
            printRoots(result.roots, `Jacobi Method Result (Took ${result.iterations} iterations)`);
            printSeidelSteps(result.stepsData, n); // Reusing the step table printer
        }
    }
});

function printRoots(roots, title) {
    const resultsPanel = document.getElementById('linear-results');
    let html = `<h3 style="color: var(--primary-color);">${title}</h3>`;
    html += `<div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">`;
    roots.forEach((root, idx) => {
        html += `<div style="font-size: 1.2em; margin-bottom: 5px;"><strong>x<sub>${idx+1}</sub></strong> = ${root.toFixed(6)}</div>`;
    });
    html += `</div>`;
    resultsPanel.innerHTML += html;
}

function printSeidelSteps(steps, n) {
    const resultsPanel = document.getElementById('linear-results');
    let html = `<h4>Iteration Steps:</h4><div class="table-wrapper"><table><thead><tr><th>Iter</th>`;
    for(let i=1; i<=n; i++) html += `<th>x<sub>${i}</sub></th>`;
    html += `<th>Error</th></tr></thead><tbody>`;
    
    steps.forEach(s => {
        html += `<tr><td>${s.iteration}</td>`;
        s.xValues.forEach(val => html += `<td>${val.toFixed(5)}</td>`);
        html += `<td>${s.currentError.toFixed(6)}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    resultsPanel.innerHTML += html;
}
