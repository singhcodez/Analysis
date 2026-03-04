// muller.js

/**
 * Solves a non-linear equation using Muller's Method.
 * @param {string} equationStr - The user's function
 * @param {number} x0 - First point (we will use interval 'a')
 * @param {number} x1 - Second point (we will use the midpoint)
 * @param {number} x2 - Third point (we will use interval 'b')
 * @param {number} tolerance - The stopping error tolerance
 * @param {number} maxIter - Maximum number of iterations
 */
function solveMuller(equationStr, x0, x1, x2, tolerance, maxIter) {
    let compiledExpr;
    try {
        compiledExpr = math.compile(equationStr);
    } catch (error) {
        return { error: "Invalid math expression." };
    }

    const f = (x) => compiledExpr.evaluate({ x: x });

    let iter = 0;
    let error = Infinity;
    let steps = [];

    while (error > tolerance && iter < maxIter) {
        iter++;
        
        let f0 = f(x0), f1 = f(x1), f2 = f(x2);

        // Calculate differences
        let h0 = x1 - x0;
        let h1 = x2 - x1;

        if (h0 === 0 || h1 === 0) {
            return { error: "Initial points must be distinct." };
        }

        let d0 = (f1 - f0) / h0;
        let d1 = (f2 - f1) / h1;

        // Calculate parabola coefficients
        let a = (d1 - d0) / (h1 + h0);
        let b = a * h1 + d1;
        let c = f2;

        let discriminant = b * b - 4 * a * c;

        // For this real-root visualizer, we stop if roots become complex
        if (discriminant < 0) {
            return { error: `Discriminant became negative at iteration ${iter}. The root may be complex, which requires a 3D graph.` };
        }

        let sqrtDisc = Math.sqrt(discriminant);

        // Choose the sign to maximize the denominator
        let den1 = b + sqrtDisc;
        let den2 = b - sqrtDisc;
        let den = (Math.abs(den1) > Math.abs(den2)) ? den1 : den2;

        if (den === 0) {
            return { error: "Denominator became zero. Method failed." };
        }

        // Calculate the next root
        let dx = -2 * c / den;
        let x3 = x2 + dx;

        error = Math.abs(dx);

        steps.push({
            iteration: iter,
            x0: x0,
            x1: x1,
            x2: x2,
            x3: x3, /* The new guess */
            f_x3: f(x3),
            currentError: error
        });

        if (Math.abs(f(x3)) < 1e-12) break;

        // Shift points over for the next iteration
        x0 = x1;
        x1 = x2;
        x2 = x3;
    }

    return {
        success: true,
        root: x2,
        iterations: iter,
        finalError: error,
        stepsData: steps
    };
}
