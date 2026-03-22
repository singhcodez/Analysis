// romberg.js

/**
 * Calculates area using Romberg Integration applied to discrete data.
 * STRICT REQUIREMENT: Number of intervals (n) MUST be a power of 2 (2, 4, 8, 16...)
 */
function solveRomberg(y, h_base) {
    let n = y.length - 1;
    
    // 1. Safety Check: Is 'n' a power of 2?
    let k = Math.log2(n);
    if (!Number.isInteger(k)) {
        return { error: "Romberg's Method requires the number of intervals (n) to be a perfect power of 2 (e.g., 2, 4, 8, 16)." };
    }

    // Initialize the Romberg 2D Table
    let R = Array.from({length: k + 1}, () => Array(k + 1).fill(0));

    // 2. Build Column 0: Trapezoidal Rules at different step sizes
    for (let i = 0; i <= k; i++) {
        let intervals = Math.pow(2, i);
        let stepIndexJump = n / intervals; // How many indexes we skip in the Y array
        let currentH = h_base * stepIndexJump;

        let sum = y[0] + y[n];
        for (let j = 1; j < intervals; j++) {
            sum += 2 * y[j * stepIndexJump];
        }
        R[i][0] = (currentH / 2) * sum;
    }

    // 3. Build the rest of the table using Richardson Extrapolation
    for (let j = 1; j <= k; j++) {
        for (let i = j; i <= k; i++) {
            let factor = Math.pow(4, j);
            R[i][j] = R[i][j-1] + (R[i][j-1] - R[i-1][j-1]) / (factor - 1);
        }
    }

    // The most accurate answer is the bottom-right corner of the table
    return { success: true, area: R[k][k], table: R };
}
