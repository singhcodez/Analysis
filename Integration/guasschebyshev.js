// gauss chebyshev.js

/**
 * Calculates area using Gauss-Chebyshev Quadrature (First Kind).
 * Supports 1-Point, 2-Point, and 3-Point formulas exactly as defined in textbooks.
 * NOTE: The user's function f(x) is assumed to be the NUMERATOR.
 */
function solveChebyshev(funcStr, a, b, points) {
    let parsedFunc = funcStr
        .replace(/Math\./g, '')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**');

    let mathFunc;
    try {
        mathFunc = new Function('x', `return ${parsedFunc};`);
    } catch (e) {
        return { error: "Invalid function syntax." };
    }

    // Generate the exact textbook roots dynamically based on the number of points!
    let nodes = [];
    for (let i = 1; i <= points; i++) {
        // Formula: x_i = cos( (2i - 1) * PI / (2n) )
        let nodeX = Math.cos(((2 * i - 1) * Math.PI) / (2 * points));
        nodes.push(nodeX);
    }

    let c1 = (b - a) / 2;
    let c2 = (b + a) / 2;
    let sum = 0;

    // Evaluate f(x) at each root
    for (let i = 0; i < points; i++) {
        let t = nodes[i];
        let actualX = c1 * t + c2;
        
        try {
            let y = mathFunc(actualX);
            if (isNaN(y) || !isFinite(y)) throw new Error("Math Error");
            sum += y;
        } catch(e) {
            return { error: "Function evaluation failed. Check your equation syntax." };
        }
    }

    // The Gauss-Chebyshev Weight: PI / n
    let weight = Math.PI / points;
    let area = c1 * weight * sum;

    return { success: true, area: area };
}
