// secant.js

/**
 * Solves a non-linear equation using the Secant Method.
 * @param {string} equationStr - The user's function
 * @param {number} x0 - The first initial guess (we will pass 'a' from the UI here)
 * @param {number} x1 - The second initial guess (we will pass 'b' from the UI here)
 * @param {number} tolerance - The stopping error tolerance
 * @param {number} maxIter - Maximum number of iterations
 */
function solveSecant(equationStr, x0, x1, tolerance, maxIter) {
    let compiledExpr;
    try {
        compiledExpr = math.compile(equationStr);
    } catch (error) {
        return { error: "Invalid math expression." };
    }

    const f = (xValue) => compiledExpr.evaluate({ x: xValue });

    let iter = 0;
    let error = Infinity;
    let xPrev = x0;
    let xCurr = x1;
    let steps = [];

    while (error > tolerance && iter < maxIter) {
        iter++;
        
        let fPrev = f(xPrev);
        let fCurr = f(xCurr);

        // Safety check to prevent dividing by zero if the line becomes perfectly flat
        if (Math.abs(fCurr - fPrev) < 1e-12) {
            return { error: `Division by zero at iteration ${iter}. Secant line is horizontal.` };
        }

        // The Secant formula
        let xNext = xCurr - fCurr * (xCurr - xPrev) / (fCurr - fPrev);
        
        // Calculate error
        error = Math.abs(xNext - xCurr);

        steps.push({
            iteration: iter,
            x_prev: xPrev,
            x_curr: xCurr,
            f_curr: fCurr,
            x_next: xNext,
            currentError: error
        });

        // Exact root found by chance
        if (Math.abs(f(xNext)) < 1e-12) break;

        // Shift variables for the next iteration
        xPrev = xCurr;
        xCurr = xNext;
    }

    return {
        success: true,
        root: xCurr,
        iterations: iter,
        finalError: error,
        stepsData: steps
    };
}
