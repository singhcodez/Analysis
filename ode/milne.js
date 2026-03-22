// milne.js

/**
 * Solves an ODE using Milne's Predictor-Corrector Method.
 * Uses RK4 to automatically bootstrap the first 3 required points.
 */
function solveMilne(f, x0, y0, targetX, h) {
    let steps = [];
    
    // Arrays to hold our historical data (Milne needs to look back in time!)
    let xVals = [x0];
    let yVals = [y0];
    let fVals = [f(x0, y0)];
    
    steps.push({ step: 0, phase: "Initial", x: x0, y: y0, yp: "-", yc: "-" });

    // ==========================================
    // PHASE 1: Bootstrap the first 3 points using RK4
    // ==========================================
    for (let i = 0; i < 3; i++) {
        // If the target is reached during bootstrapping, stop early
        if (xVals[i] >= targetX - 1e-5) break; 

        let x = xVals[i];
        let y = yVals[i];
        
        let k1 = h * f(x, y);
        let k2 = h * f(x + h/2, y + k1/2);
        let k3 = h * f(x + h/2, y + k2/2);
        let k4 = h * f(x + h, y + k3);
        
        let yNext = y + (1/6) * (k1 + 2*k2 + 2*k3 + k4);
        let xNext = x + h;
        let fNext = f(xNext, yNext);
        
        xVals.push(xNext);
        yVals.push(yNext);
        fVals.push(fNext);
        
        steps.push({ 
            step: i + 1, 
            phase: "RK4 Bootstrap", 
            x: parseFloat(xNext.toFixed(5)), 
            y: parseFloat(yNext.toFixed(6)), 
            yp: "-", 
            yc: "-" 
        });
    }

    // ==========================================
    // PHASE 2: Milne's Predictor-Corrector Method
    // ==========================================
    let n = 3; // We start at index 3 (the 4th point)
    
    while (xVals[n] < targetX - 1e-5) {
        try {
            // 1. PREDICTOR FORMULA
            // y_{n+1}^{(p)} = y_{n-3} + (4h/3) * (2f_{n-2} - f_{n-1} + 2f_n)
            let y_pred = yVals[n-3] + (4 * h / 3) * (2 * fVals[n-2] - fVals[n-1] + 2 * fVals[n]);
            let x_next = xVals[n] + h;
            
            // Evaluate slope at the predicted point
            let f_pred = f(x_next, y_pred);
            
            // 2. CORRECTOR FORMULA
            // y_{n+1}^{(c)} = y_{n-1} + (h/3) * (f_{n-1} + 4f_n + f_{n+1}^{(p)})
            let y_corr = yVals[n-1] + (h / 3) * (fVals[n-1] + 4 * fVals[n] + f_pred);
            
            // Final slope for the next loop
            let f_corr = f(x_next, y_corr); 
            
            xVals.push(x_next);
            yVals.push(y_corr); // The corrected value becomes the official Y
            fVals.push(f_corr);
            
            n++;
            
            steps.push({
                step: n,
                phase: "Milne P-C",
                x: parseFloat(x_next.toFixed(5)),
                y: parseFloat(y_corr.toFixed(6)), // Final Displayed Y
                yp: parseFloat(y_pred.toFixed(6)), // Show Predictor logic
                yc: parseFloat(y_corr.toFixed(6))  // Show Corrector logic
            });
            
            if (n > 10000) return { error: "Too many iterations." };
            
        } catch (e) {
            return { error: `Math error at x = ${xVals[n].toFixed(4)}.` };
        }
    }

    return { success: true, finalY: yVals[yVals.length - 1], steps: steps };
}
