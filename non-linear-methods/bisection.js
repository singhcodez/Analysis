// bisection.js

/**
 * Solves a non-linear equation using the Bisection Method.
 * * @param {string} equationStr - The user's function as a string (e.g., "x^3 - x - 2")
 * @param {number} a - The start of the interval
 * @param {number} b - The end of the interval
 * @param {number} tolerance - The stopping error tolerance
 * @param {number} maxIter - Maximum number of iterations to prevent infinite loops
 * @returns {object} - An object containing the final root, iteration count, and step-by-step data.
 */
function solveBisection(equationStr, a, b, tolerance, maxIter) {
    // 1. Parse the math equation using math.js
    let compiledExpr;
    try {
        compiledExpr = math.compile(equationStr);
    } catch (error) {
        return { error: "Invalid math expression. Please check your function." };
    }

    // Helper function to evaluate f(x) easily
    const f = (xValue) => compiledExpr.evaluate({ x: xValue });

    // 2. Check the fundamental rule of Bisection: f(a) and f(b) must have opposite signs
    if (f(a) * f(b) >= 0) {
        return { 
            error: `Invalid interval. f(${a}) = ${f(a).toFixed(4)} and f(${b}) = ${f(b).toFixed(4)}. They must have opposite signs to bracket a root.` 
        };
    }

    let iter = 0;
    let error = Math.abs(b - a) / 2;
    let c = a; 
    let steps = []; // We will store data here for the UI table and graph

    // 3. The Algorithm Loop
    while (error > tolerance && iter < maxIter) {
        iter++;
        
        // Find the midpoint
        c = (a + b) / 2;
        let fc = f(c);

        // Record this step's data for the students to see
        steps.push({
            iteration: iter,
            a: a,
            b: b,
            midpoint_c: c,
            f_c: fc,
            currentError: error
        });

        // Check if we accidentally found the exact root
        if (fc === 0) {
            break; 
        }

        // Decide which half of the interval to keep
        if (f(a) * fc < 0) {
            b = c; // The root is between 'a' and 'c'
        } else {
            a = c; // The root is between 'c' and 'b'
        }

        // Calculate the error for the next iteration
        error = Math.abs(b - a) / 2;
    }

    // 4. Return the comprehensive results
    return {
        success: true,
        root: c,
        iterations: iter,
        finalError: error,
        stepsData: steps
    };
}
