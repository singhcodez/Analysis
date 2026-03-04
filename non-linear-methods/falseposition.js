// falseposition.js

/**
 * Solves a non-linear equation using the False Position (Regula Falsi) Method.
 * @param {string} equationStr - The user's function
 * @param {number} a - The start of the interval
 * @param {number} b - The end of the interval
 * @param {number} tolerance - The stopping error tolerance
 * @param {number} maxIter - Maximum number of iterations
 */
function solveFalsePosition(equationStr, a, b, tolerance, maxIter) {
    let compiledExpr;
    try {
        compiledExpr = math.compile(equationStr);
    } catch (error) {
        return { error: "Invalid math expression." };
    }

    const f = (xValue) => compiledExpr.evaluate({ x: xValue });

    // Check if the bracket is valid
    if (f(a) * f(b) >= 0) {
        return { error: `Invalid interval. f(${a}) and f(${b}) must have opposite signs.` };
    }

    let iter = 0;
    let error = Infinity;
    let c = a; 
    let cOld = c;
    let steps = [];

    while (error > tolerance && iter < maxIter) {
        iter++;
        let fa = f(a);
        let fb = f(b);

        // The Regula Falsi formula for the new point
        c = (a * fb - b * fa) / (fb - fa);
        let fc = f(c);

        // Error is the distance between the new guess and the previous guess
        if (iter > 1) {
            error = Math.abs(c - cOld);
        } else {
            error = Math.abs(b - a); // Rough error for the very first step
        }
        
        cOld = c; // Save current c for the next loop's error calculation

        steps.push({
            iteration: iter,
            a: a,
            b: b,
            c: c,
            f_c: fc,
            currentError: error
        });

        // If we hit the exact root (or incredibly close due to floating point math)
        if (Math.abs(fc) < 1e-12) break;

        // Decide which bound to replace
        if (fa * fc < 0) {
            b = c; // Root is between a and c
        } else {
            a = c; // Root is between c and b
        }
    }

    return {
        success: true,
        root: c,
        iterations: iter,
        finalError: error,
        stepsData: steps
    };
}
