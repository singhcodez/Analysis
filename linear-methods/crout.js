// crout.js

/**
 * Solves a system AX = B using Crout's LU Decomposition Method.
 */
function solveCrout(A, B) {
    let n = A.length;
    let L = Array.from({length: n}, () => Array(n).fill(0));
    let U = Array.from({length: n}, () => Array(n).fill(0));
    let steps = [];

    // 1. Set the main diagonal of U to 1
    for (let i = 0; i < n; i++) {
        U[i][i] = 1;
    }

    // 2. Crout's Decomposition (A = LU)
    for (let j = 0; j < n; j++) {
        // Calculate Lower Triangular Matrix (L) column
        for (let i = j; i < n; i++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[i][k] * U[k][j];
            }
            L[i][j] = A[i][j] - sum;
        }

        // Calculate Upper Triangular Matrix (U) row
        for (let i = j + 1; i < n; i++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[j][k] * U[k][i];
            }
            
            // Safety Check: Avoid division by zero
            if (Math.abs(L[j][j]) < 1e-12) {
                return { error: `Zero pivot encountered at L[${j+1}][${j+1}]. Crout's method requires row swapping here, which is beyond basic LU.` };
            }
            
            U[j][i] = (A[j][i] - sum) / L[j][j];
        }
    }

    steps.push({ description: "Matrix decomposed into L and U", L_matrix: L.map(r=>[...r]), U_matrix: U.map(r=>[...r]) });

    // 3. Forward Substitution (Solve L * Z = B)
    let z = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += L[i][j] * z[j];
        }
        z[i] = (B[i] - sum) / L[i][i];
    }

    // 4. Backward Substitution (Solve U * X = Z)
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += U[i][j] * x[j];
        }
        x[i] = z[i] - sum; // Note: We don't divide by U[i][i] because it is always 1!
    }

    return { success: true, roots: x, stepsData: steps };
}
