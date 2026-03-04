// cholesky.js

/**
 * Solves a system AX = B using Cholesky Decomposition.
 * Only works for Symmetric, Positive-Definite matrices.
 */
function solveCholesky(A, B) {
    let n = A.length;
    let L = Array.from({length: n}, () => Array(n).fill(0));
    let steps = [];

    // 1. Safety Check: Is it Symmetric?
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (Math.abs(A[i][j] - A[j][i]) > 1e-10) {
                return { error: "Matrix is NOT symmetric. Cholesky Method fails here." };
            }
        }
    }

    // 2. Decompose A into L * L^T
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[i][k] * L[j][k];
            }

            if (i === j) {
                let val = A[i][i] - sum;
                // Safety Check: Is it Positive-Definite?
                if (val <= 0) {
                    return { error: `Matrix is NOT positive-definite (failed at row ${i+1}). Cholesky Method fails here.` };
                }
                L[i][j] = Math.sqrt(val);
            } else {
                L[i][j] = (A[i][j] - sum) / L[j][j];
            }
        }
    }
    
    steps.push({ description: "Calculated Lower Triangular Matrix L", matrix: L.map(r => [...r]) });

    // 3. Forward Substitution (Solve L * y = B)
    let y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += L[i][j] * y[j];
        }
        y[i] = (B[i] - sum) / L[i][i];
    }
    steps.push({ description: "Forward Substitution (y values)", vector: [...y] });

    // 4. Backward Substitution (Solve L^T * x = y)
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += L[j][i] * x[j]; // Notice we use L[j][i] instead of L[i][j] to simulate the transpose!
        }
        x[i] = (y[i] - sum) / L[i][i];
    }
    steps.push({ description: "Backward Substitution (Final x roots)", vector: [...x] });

    return { success: true, roots: x, stepsData: steps };
}
