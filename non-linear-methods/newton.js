// newton.js

/**
 * Solves a non-linear equation using the Newton-Raphson Method.
 * @param {string} equationStr - The user's function (e.g., "x^3 - x - 1")
 * @param {number} x0 - The initial guess
 * @param {number} tolerance - The stopping error tolerance
 * @param {number} maxIter - Maximum number of iterations
 * @returns {object} - Object containing the root, iteration count, and step-by-step data.
 */
function solveNewton(equationStr, x0, tolerance, maxIter) {
    let expr, deriv;
    
    // 1. Parse the math equation and automatically find the derivative!
    try {
        expr = math.compile(equationStr);
        deriv = math.derivative(equationStr, 'x'); // math.js magic
    } catch (error) {
        return { error: "Invalid math expression or unable to compute derivative." };
    }

    let x = x0;
    let iter = 0;
    let error = Infinity; // Start with a large error
    let steps = [];

    // 2. The Algorithm Loop
    while (error > tolerance && iter < maxIter) {
        iter++;
        
        // Evaluate f(x) and f'(x) at the current guess
        let fx = expr.evaluate({ x: x });
        let dfx = deriv.evaluate({ x: x });

        // Safety check: If the tangent line is perfectly flat (derivative is 0), the method fails.
        if (Math.abs(dfx) < 1e-12) {
            return { error: `Derivative became zero at iteration ${iter}. Newton's method fails here.` };
        }

        // Calculate the next guess
        let xNext = x - (fx / dfx);
        
        // Calculate the error
        error = Math.abs(xNext - x);

        // Record the step data for the UI
        steps.push({
            iteration: iter,
            x_n: x,
            f_x: fx,
            df_x: dfx,
            x_next: xNext,
            currentError: error
        });

        // Exact root found by chance
        if (fx === 0) break; 
        
        // Move to the next step
        x = xNext;
    }

    return {
        success: true,
        root: x,
        iterations: iter,
        finalError: error,
        stepsData: steps
    };
}
