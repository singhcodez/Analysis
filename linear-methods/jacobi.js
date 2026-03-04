// jacobi.js

/**
 * Solves a system of linear equations AX = B using the Jacobi iterative method.
 * @param {Array<Array<number>>} A - Coefficient matrix
 * @param {Array<number>} B - Constant vector
 * @param {number} tolerance - Error tolerance
 * @param {number} maxIter - Maximum iterations
 */
function solveJacobi(A, B, tolerance = 0.0001, maxIter = 50) {
    let n = B.length;
    let x = new Array(n).fill(0); // Initial guess is all zeros
    let xNew = new Array(n).fill(0); // Array to hold the new snapshot
    let steps = [];
    let iter = 0;
    let error = Infinity;

    // Check for zeros on the diagonal
    for (let i = 0; i < n; i++) {
        if (Math.abs(A[i][i]) < 1e-12) {
            return { error: `Zero found on main diagonal at row ${i+1}. Jacobi requires non-zero diagonal elements.` };
        }
    }

    while (error > tolerance && iter < maxIter) {
        iter++;
        let xOld = [...x]; // Take the snapshot!
        error = 0;

        // Loop through each equation
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    sum += A[i][j] * xOld[j]; // CRITICAL: Uses only the snapshot (xOld), unlike Gauss-Seidel
                }
            }
            
            // Calculate new x[i] and store it safely in xNew
            xNew[i] = (B[i] - sum) / A[i][i];
            
            // Track the maximum error in this iteration
            let currentError = Math.abs(xNew[i] - xOld[i]);
            if (currentError > error) {
                error = currentError;
            }
        }

        // Now that all calculations are done, update the main x array
        x = [...xNew];

        steps.push({
            iteration: iter,
            xValues: [...x],
            currentError: error
        });
    }

    if (iter >= maxIter && error > tolerance) {
        return { error: "Failed to converge. The matrix might not be diagonally dominant." };
    }

    return { success: true, roots: x, iterations: iter, finalError: error, stepsData: steps };
}
