// bessel.js

/**
 * Calculates the expanding p term for Bessel's Formula.
 */
function calculatePBessel(p, k) {
    // Standard formulation exception for the first term
    if (k === 1) return p; 
    
    let term = 1;
    // The shifts added to p: 0, -1, 1, -2, 2, -3...
    let shifts = [0, -1, 1, -2, 2, -3, 3, -4, 4]; 
    
    if (k % 2 === 0) {
        // Even terms: p(p-1)(p+1)(p-2)...
        for (let i = 0; i < k; i++) {
            term *= (p + shifts[i]);
        }
    } else {
        // Odd terms: Even term * (p - 0.5)
        for (let i = 0; i < k - 1; i++) {
            term *= (p + shifts[i]);
        }
        term *= (p - 0.5);
    }
    return term;
}

/**
 * Solves Bessel's Central Interpolation
 */
function solveBessel(x, y, diffTable, targetX) {
    let n = y.length;
    let h = x[1] - x[0];
    
    // Safety Check: Verify X values are equally spaced
    for(let i = 1; i < x.length - 1; i++) {
        if(Math.abs((x[i+1] - x[i]) - h) > 1e-5) {
            return { error: "Bessel's Method requires X values to be equally spaced." };
        }
    }

    // Find the central index
    let mid = Math.floor((n - 1) / 2);
    
    // Calculate p from the center
    let p = (targetX - x[mid]) / h;
    
    // Start with the central Y value
    let finalY = diffTable[mid][0]; 

    // Traverse the center of the difference table
    for (let k = 1; k < n; k++) {
        let deltaTerm = 0;
        
        if (k % 2 !== 0) {
            // Odd columns (e.g., Δy, Δ³y): Take the single central value
            let row = mid - Math.floor(k / 2);
            if (row < 0 || row >= n - k) break;
            
            deltaTerm = diffTable[row][k];
        } else {
            // Even columns (e.g., Δ²y, Δ⁴y): Average the two middle values
            let row1 = mid - (k / 2);
            let row2 = mid - (k / 2) + 1;
            
            // Stop if we run out of table space
            if (row1 < 0 || row2 < 0 || row1 >= n - k || row2 >= n - k) break;
            
            deltaTerm = (diffTable[row1][k] + diffTable[row2][k]) / 2;
        }

        finalY += (calculatePBessel(p, k) * deltaTerm) / factorial(k);
    }

    return { 
        success: true, 
        h: h, 
        p: p, 
        result: finalY 
    };
}
