// stirling.js

/**
 * Calculates the expanding p term for Stirling's Formula.
 */
function calculatePStirling(p, k) {
    let term = 1;
    // Odd terms start with p, even terms start with p^2
    if (k % 2 !== 0) {
        term = p;
    } else {
        term = p * p;
    }
    
    // Multiply by (p^2 - 1^2), (p^2 - 2^2), etc.
    for (let i = 1; i < Math.floor((k + 1) / 2); i++) {
        term *= (p * p - i * i);
    }
    return term;
}

/**
 * Solves Stirling's Central Interpolation
 */
function solveStirling(x, y, diffTable, targetX) {
    let n = y.length;
    let h = x[1] - x[0];
    
    // Safety Check: Verify X values are equally spaced
    for(let i = 1; i < x.length - 1; i++) {
        if(Math.abs((x[i+1] - x[i]) - h) > 1e-5) {
            return { error: "Stirling's Method requires X values to be equally spaced." };
        }
    }

    // Find the central index (midpoint)
    let mid = Math.floor((n - 1) / 2);
    
    // Calculate p from the center
    let p = (targetX - x[mid]) / h;
    
    // Start with the central Y value
    let finalY = diffTable[mid][0]; 

    // Traverse the center of the difference table
    for (let k = 1; k < n; k++) {
        let deltaTerm = 0;
        
        if (k % 2 !== 0) {
            // Odd columns (e.g., Δy, Δ³y): Average the two middle values
            let row1 = mid - Math.floor((k - 1) / 2) - 1;
            let row2 = mid - Math.floor((k - 1) / 2);
            
            // Stop if we run out of table space
            if (row1 < 0 || row2 < 0 || row1 >= n - k || row2 >= n - k) break;
            
            deltaTerm = (diffTable[row1][k] + diffTable[row2][k]) / 2;
        } else {
            // Even columns (e.g., Δ²y, Δ⁴y): Take the single central value
            let row = mid - (k / 2);
            if (row < 0 || row >= n - k) break;
            
            deltaTerm = diffTable[row][k];
        }

        finalY += (calculatePStirling(p, k) * deltaTerm) / factorial(k);
    }

    return { 
        success: true, 
        h: h, 
        p: p, 
        result: finalY 
    };
}
