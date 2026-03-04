// gauss.js

/**
 * Solves a system of linear equations AX = B using Gauss Elimination.
 * @param {Array<Array<number>>} A - The coefficient matrix
 * @param {Array<number>} B - The constant vector
 * @returns {object} - Object containing the roots and step-by-step matrix states
 */
function solveGaussElimination(A, B) {
    let n = B.length;
    let steps = [];

    // Clone matrices so we don't modify the originals
    let a = A.map(row => [...row]);
    let b = [...B];

    // Record initial state
    steps.push({ description: "Initial Matrix", matrix: a.map(r => [...r]), vector: [...b] });

    // 1. Forward Elimination (Making the triangle)
    for (let k = 0; k < n - 1; k++) {
        // Partial Pivoting (Find the largest value in the column to avoid division by zero)
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(a[i][k]) > Math.abs(a[maxRow][k])) {
                maxRow = i;
            }
        }

        // Swap rows if necessary
        if (maxRow !== k) {
            let tempA = a[k]; a[k] = a[maxRow]; a[maxRow] = tempA;
            let tempB = b[k]; b[k] = b[maxRow]; b[maxRow] = tempB;
            steps.push({ description: `Swapped Row ${k+1} and Row ${maxRow+1}`, matrix: a.map(r => [...r]), vector: [...b] });
        }

        if (Math.abs(a[k][k]) < 1e-12) return { error: "Matrix is singular or near-singular. Cannot solve." };

        // Eliminate entries below the pivot
        for (let i = k + 1; i < n; i++) {
            let factor = a[i][k] / a[k][k];
            for (let j = k; j < n; j++) {
                a[i][j] = a[i][j] - factor * a[k][j];
            }
            b[i] = b[i] - factor * b[k];
        }
        steps.push({ description: `Eliminated below pivot in column ${k+1}`, matrix: a.map(r => [...r]), vector: [...b] });
    }

    // 2. Back Substitution (Solving from bottom to top)
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += a[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / a[i][i];
    }

    return { success: true, roots: x, stepsData: steps };
}
