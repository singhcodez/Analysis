// gaussjordan.js

/**
 * Solves a system AX = B using Gauss-Jordan Elimination.
 * Transforms matrix A into an Identity Matrix.
 */
function solveGaussJordan(A, B) {
    let n = B.length;
    let steps = [];

    // Clone matrices
    let a = A.map(row => [...row]);
    let b = [...B];

    steps.push({ description: "Initial Matrix", matrix: a.map(r => [...r]), vector: [...b] });

    for (let k = 0; k < n; k++) {
        // 1. Partial Pivoting (Find largest absolute value in the column)
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(a[i][k]) > Math.abs(a[maxRow][k])) {
                maxRow = i;
            }
        }

        // Swap rows if needed
        if (maxRow !== k) {
            let tempA = a[k]; a[k] = a[maxRow]; a[maxRow] = tempA;
            let tempB = b[k]; b[k] = b[maxRow]; b[maxRow] = tempB;
            steps.push({ description: `Swapped Row ${k+1} and Row ${maxRow+1}`, matrix: a.map(r => [...r]), vector: [...b] });
        }

        let pivot = a[k][k];
        if (Math.abs(pivot) < 1e-12) return { error: "Matrix is singular or near-singular. Cannot solve." };

        // 2. Normalize the pivot row (Divide entire row by the pivot to make the diagonal exactly 1)
        for (let j = 0; j < n; j++) {
            a[k][j] /= pivot;
        }
        b[k] /= pivot;
        steps.push({ description: `Normalized Row ${k+1} (Pivot = 1)`, matrix: a.map(r => [...r]), vector: [...b] });

        // 3. Eliminate all other entries in the current column (ABOVE and BELOW the pivot)
        for (let i = 0; i < n; i++) {
            if (i === k || a[i][k] === 0) continue; // Skip the pivot row itself and already-zero entries
            
            let factor = a[i][k];
            for (let j = k; j < n; j++) {
                a[i][j] -= factor * a[k][j];
            }
            b[i] -= factor * b[k];
        }
        steps.push({ description: `Eliminated other entries in column ${k+1}`, matrix: a.map(r => [...r]), vector: [...b] });
    }

    // Because A is now an Identity Matrix, the B vector contains our final answers exactly!
    return { success: true, roots: b, stepsData: steps };
}
