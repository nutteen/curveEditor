/**
 * Created by Nut on 04/05/2014.
 */
// Cubic curves:
    // Hermite curve
    // Catmull-Rom curve

function Curve(mathJs)
{
    this.mathJs = mathJs;

    this.hermite = function(p1, p2, tgt1, tgt2, t)
    {
        var t1 = this.mathJs.multiply((1.0 - 3.0 * Math.pow(t, 2.0) + 2.0 * Math.pow(t, 3.0) ), p1);
        var t2 = this.mathJs.multiply(Math.pow(t, 2.0) * (3.0 - 2.0*t), p2);
        var t3 = this.mathJs.multiply(t * Math.pow((t-1.0), 2.0), tgt1);
        var t4 = this.mathJs.multiply(Math.pow(t, 2.0) * (t-1.0), tgt2);

        var res = this.mathJs.add(t1, t2);
        res = this.mathJs.add(res, t3);
        res = this.mathJs.add(res, t4);

        return res;
    }// end of hermite()

    this.catmull = function(p0, p1, p2 ,p3, t)
    {
        var tTerm = this.mathJs.matrix([
            [1.0, t, Math.pow(t, 2),
                Math.pow(t, 3), Math.pow(t,4)]
        ]);

        tTerm = this.mathJs.multiply(0.5, tTerm);

        var consTerm = this.mathJs.matrix
        ([
            [0, 2, 0, 0],
            [-1, 0, 1, 0],
            [2, -5, 4, -1],
            [-1, 3, -3, 1]
        ]);

        var pTerms = this.mathJs.matrix
        ([
           [p0], [p1], [p2], [p3]
        ]);

        var res = this.mathJs.multiply(tTerm, consTerm);
        res = this.mathJs.multiply(res, pTerms);

        return res;
    }
}// end of Curve