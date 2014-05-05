/**
 * Created by Nut on 03/05/2014.
 */
require.config({
    paths: {
        mathjs: './math.js'
    }
});

require(['mathjs'], function(mathjs)
{
    var math = mathjs();
    math.sqrt(-4);
});