document.getElementById('solve-btn').addEventListener('click', () => {
    const equationStr = document.getElementById('equation').value;
    const a = parseFloat(document.getElementById('guess-a').value);
    const b = parseFloat(document.getElementById('guess-b').value);
    const x0 = parseFloat(document.getElementById('guess-x0').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIter = parseInt(document.getElementById('max-iter').value);

    const runBisection = document.getElementById('method-bisection').checked;
    const runFalsePosition = document.getElementById('method-false-position').checked;
    const runNewton = document.getElementById('method-newton').checked;
    const runSecant = document.getElementById('method-secant').checked;
    const runMuller = document.getElementById('method-muller').checked;
    
    const tableBody = document.getElementById('results-body');
    const graphContainer = document.getElementById('graph-container');
    
    tableBody.innerHTML = ""; 
    graphContainer.innerHTML = '<div id="plotly-chart"></div>'; // Create a div specifically for the graph
    
    let activeResults = {}; // We will store successful roots here to send to the graph

    // --- BISECTION ---
    if (runBisection && !isNaN(a) && !isNaN(b)) {
        const res = solveBisection(equationStr, a, b, tolerance, maxIter);
        if (!res.error) {
            activeResults['Bisection'] = { root: res.root, color: 'blue' };
            appendSummaryRow("Bisection", res);
            appendStepTable("Bisection", res, ['Iter', 'a', 'b', 'Mid (c)', 'f(c)', 'Error']);
        }
    }

    // --- FALSE POSITION ---
    if (runFalsePosition && !isNaN(a) && !isNaN(b)) {
        const res = solveFalsePosition(equationStr, a, b, tolerance, maxIter);
        if (!res.error) {
            activeResults['False Position'] = { root: res.root, color: 'orange' };
            appendSummaryRow("False Position", res);
            appendStepTable("False Position", res, ['Iter', 'a', 'b', 'c', 'f(c)', 'Error']);
        }
    }

    // --- NEWTON-RAPHSON ---
    if (runNewton && !isNaN(x0)) {
        const res = solveNewton(equationStr, x0, tolerance, maxIter);
        if (!res.error) {
            activeResults['Newton-Raphson'] = { root: res.root, color: 'green' };
            appendSummaryRow("Newton-Raphson", res);
            appendStepTable("Newton-Raphson", res, ['Iter', 'x_n', 'f(x_n)', "f'(x_n)", 'x_next', 'Error']);
        }
    }

    // --- SECANT ---
    if (runSecant && !isNaN(a) && !isNaN(b)) {
        const res = solveSecant(equationStr, a, b, tolerance, maxIter);
        if (!res.error) {
            activeResults['Secant'] = { root: res.root, color: 'purple' };
            appendSummaryRow("Secant", res);
            appendStepTable("Secant", res, ['Iter', 'x_{n-1}', 'x_n', 'f(x_n)', 'x_{n+1}', 'Error']);
        }
    }

    // --- MULLER'S ---
    if (runMuller && !isNaN(a) && !isNaN(b)) {
        const x1 = (a + b) / 2;
        const res = solveMuller(equationStr, a, x1, b, tolerance, maxIter);
        if (!res.error) {
            activeResults['Muller'] = { root: res.root, color: 'red' };
            appendSummaryRow("Muller's Method", res);
            appendStepTable("Muller's Method", res, ['Iter', 'x0', 'x1', 'x2', 'x3 (Next)', 'Error']);
        }
    }

    // 🌟 DRAW THE GRAPH 🌟
    // We pass the function, the user inputs to define the zoom level, and the roots to plot
    renderGraph(equationStr, a, b, x0, activeResults);
});

// --- UI HELPER FUNCTIONS ---

function appendSummaryRow(name, result) {
    const tbody = document.getElementById('results-body');
    tbody.innerHTML += `
        <tr>
            <td><strong>${name}</strong></td>
            <td>${result.root.toFixed(6)}</td>
            <td><strong>${result.iterations}</strong></td>
            <td>${result.finalError.toFixed(8)}</td>
        </tr>
    `;
}

function appendStepTable(name, result, headers) {
    const container = document.getElementById('graph-container');
    let html = `<h3 style="margin-top:30px; color:#2c3e50;">${name}: Step-by-Step</h3>
                <div class="table-wrapper"><table><thead><tr style="background-color:#e8f4f8;">`;
    headers.forEach(h => html += `<th>${h}</th>`);
    html += `</tr></thead><tbody>`;
    
    result.stepsData.forEach(s => {
        let rowData = Object.values(s);
        html += `<tr>`;
        rowData.forEach((val, idx) => {
            // Bold the column that holds the new guess
            if(idx === 3 || idx === 4) {
                html += `<td><strong>${val.toFixed(6)}</strong></td>`;
            } else {
                html += `<td>${typeof val === 'number' ? val.toFixed(5) : val}</td>`;
            }
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML += html;
}

// --- PLOTLY GRAPHING LOGIC ---

function renderGraph(equationStr, a, b, x0, activeResults) {
    let compiledExpr;
    try {
        compiledExpr = math.compile(equationStr);
    } catch(e) { return; } // Fails silently if math is bad

    // 1. Figure out the X-axis range to draw
    let inputs = [a, b, x0].filter(val => !isNaN(val));
    let minX = Math.min(...inputs) - 2; // Zoom out slightly from inputs
    let maxX = Math.max(...inputs) + 2;

    // 2. Generate points for the smooth curve
    let xValues = [];
    let yValues = [];
    let step = (maxX - minX) / 200; // 200 points makes a smooth line

    for (let x = minX; x <= maxX; x += step) {
        xValues.push(x);
        yValues.push(compiledExpr.evaluate({ x: x }));
    }

    // 3. Create the Main Curve Trace
    let traceCurve = {
        x: xValues,
        y: yValues,
        mode: 'lines',
        name: 'f(x) = ' + equationStr,
        line: { color: '#2563eb', width: 2 }
    };

    // 4. Create the X-Axis line (y=0)
    let traceZeroLine = {
        x: [minX, maxX],
        y: [0, 0],
        mode: 'lines',
        name: 'y = 0',
        line: { color: 'black', width: 1, dash: 'dash' },
        hoverinfo: 'none'
    };

    let plotData = [traceCurve, traceZeroLine];

    // 5. Add a bright dot for every algorithm that found a root
    for (const [methodName, data] of Object.entries(activeResults)) {
        plotData.push({
            x: [data.root],
            y: [compiledExpr.evaluate({ x: data.root })], // Should be very close to 0
            mode: 'markers',
            name: methodName + ' Root',
            marker: { size: 10, color: data.color },
            type: 'scatter'
        });
    }

    // 6. Draw it to the screen!
    let layout = {
        title: '',
        xaxis: { title: 'x' },
        yaxis: { title: 'f(x)' },
        margin: { t: 40, b: 40, l: 40, r: 40 },
        hovermode: 'closest'
    };

    Plotly.newPlot('plotly-chart', plotData, layout, {responsive: true});
}
