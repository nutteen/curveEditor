/**
 * Created by Nut on 27/04/2014.
 */

window.onload = function()
{
    load();
}

function load()
{
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");

        var _vpWidth = canvas.width;
        var _vpHeight = canvas.height;

        var _mathJs = mathjs();
        var _mathEx = new mathEx(_mathJs);
        var _renderer = new Renderer(ctx);

        var _projectingTf = new Transformation();
        _projectingTf.localMatrix = _mathJs.matrix
        ([
            [_vpWidth, 0, 0],
            [0, _vpHeight, 0],
            [0, 0, 1]
        ]);

        // normalised variable
        var _topLeftX = 0.1;
        var _topLeftY = 0.1;
        var _graphWidth = 0.5;
        var _graphHeight = 0.7;

        var _graphPanel = new GraphPanel("Graph", _topLeftX, _topLeftY,
            _graphWidth, _graphHeight);

        _projectingTf.addChild(_graphPanel.getTransformation());
        _graphPanel.updateWorldMatrix();
        _graphPanel.drawLegendAndInfo(ctx);

        // Start drawing
        var _curve = new Curve(_mathJs);

// hermite
        var _p1 = _mathEx.vec3(0, 0, 1);
        var _p2 = _mathEx.vec3(1, 1, 1);
        var tgt1 = _mathEx.vec3(1, 1, 1);
        var tgt2 = _mathEx.vec3(1, -1, 1);
        var samplingSize = 50;

        drawHermiteCurve(_renderer, _curve,
            _p1, _p2, tgt1, tgt2,
            samplingSize);

        var fps = 30;
        var _gameLoopId = setInterval(gameLoop, 1000 / fps);
        var _isNeededRedrawn = true;
        var _isMouseDown = false;

        function gameLoop()
        {
            update();
            if(_isNeededRedrawn)
                draw();
        }

        function update()
        {
            // check mouse input
        }

        function draw()
        {
            /*
            // clear
            _renderer.clearRect(0, 0, _vpWidth, _vpHeight);
            _graphPanel.drawLegendAndInfo(ctx);
            // redrawing
            drawHermiteCurve(_renderer, _curve,
                _p1, _p2, tgt1, tgt2,
                samplingSize);
            */
            _isNeededRedrawn = false;
        }

        window.onmousemove = handleMouseMove;
        window.onmousedown = handleMouseDown;
        window.onmouseup = handleMouseUp;

        function handleMouseMove(e)
        {
            if(!_isMouseDown)
                return;

            // transform coordinate of this point
            var ptLocal = _graphPanel.invTransformPoint(e.clientX, e.clientY)
            ctx.fillRect(e.clientX, e.clientY, 1, 1);
            /*
            console.log("Pixel x: " + e.clientX + " y: " + e.clientY
                + " Local x: " + ptLocal.get([0, 0])
                + " y: " + ptLocal.get([1, 0]));
            */
            var selectedPtIndex = getSelectedPointIndex(ptLocal);

            if(selectedPtIndex === 0)
            {
                _p1 = ptLocal;
            }
            else if(selectedPtIndex === 1)
            {
                _p2 = ptLocal;
            }

            _isNeededRedrawn = true;

            function getSelectedPointIndex(targetPt)
            {
                var p1Dist =
                Math.sqrt(
                    Math.pow(
                        targetPt.get([0, 0]) - _p1.get([0, 0]), 2)
                        +
                    Math.pow(
                            targetPt.get([1, 0]) - _p1.get([1, 0]), 2)
                );

                var p2Dist =
                    Math.sqrt(
                            Math.pow(
                                    targetPt.get([0, 0]) - _p2.get([0, 0]), 2)
                            +
                            Math.pow(
                                    targetPt.get([1, 0]) - _p2.get([1, 0]), 2)
                );

                if(p1Dist > p2Dist)
                    return 1;
                return 0;
            }
        }

        function handleMouseDown(e)
        {
            _isMouseDown = true;
        }

        function handleMouseUp(e)
        {
            _isMouseDown = false;
        }

        function testDrawing()
        {
            for(var i = 0 ; i < 10 ; i++)
            {
                _renderer.moveTo(_graphPanel.transformPoint(i/10.0, 0.0));
                _renderer.lineTo(_graphPanel.transformPoint(i/10.0, (10.0 - i)/10.0));
                _renderer.stroke();
            }
        }

        function drawHermiteCurve(renderer, curve, p1, p2, tgt1, tgt2, samplingSize)
        {
            renderer.fillRect(_graphPanel.transformPointV(p1), 6);
            renderer.fillRect(_graphPanel.transformPointV(p2), 6);

            for(var i = 0 ; i < samplingSize; i++)
            {
                var curT = i / samplingSize;
                var curPos = curve.hermite(p1, p2, tgt1, tgt2, curT);

                curPos.set([2, 0], 1);
                //console.log("x: " + curPos.get([0, 0]) + " y: " + curPos.get([1, 0]));
                renderer.fillRect(_graphPanel.transformPointV(curPos), 2);
            }
        }

    } // end of if(canvas.getContext)

    function Renderer(ctx)
    {
        this.ctx = ctx;

        this.moveTo = function(vec3)
        {
            this.ctx.moveTo(vec3.get([0, 0]), vec3.get([1, 0]));
        }

        this.lineTo = function(vec3)
        {
            this.ctx.lineTo(vec3.get([0, 0]), vec3.get([1, 0]));
        }

        this.stroke = function()
        {
            this.ctx.stroke();
        }

        this.fillRect = function(vec3, ptSize)
        {
            this.ctx.fillRect(vec3.get([0, 0]) - ptSize*0.5, vec3.get([1, 0]) - ptSize*0.5,
                ptSize, ptSize);
        }

        this.clearRect = function(x, y, width, height)
        {
            this.ctx.clearRect(x, y, width, height);
        }
    }

    function GraphPanel(name, topleftX, topLeftY, width, height)
    {
        this.panel = new Panel(name);
        this.panel.setTopLeftPos(topleftX, topLeftY);
        this.panel.setScale(width, height);
        this.panel.widthNorm = _graphWidth;
        this.panel.heightNorm = _graphHeight;
        this.drawingTf = new Transformation();

        // translate and invert Y
        this.drawingTf.localMatrix = _mathJs.matrix
        ([
            [1.0, 0, 0],
            [0, -1.0, 1.0],
            [0, 0, 1.0]
        ]);

        // attach drawing transformation to graph panel
        this.panel.transformation.addChild(this.drawingTf);

        this.getTransformation = function()
        {
            return this.panel.transformation;
        }

        this.updateWorldMatrix = function()
        {
            this.drawingTf.updateWorldMatrix();
        }

        this.transformPoint = function(x, y)
        {
            return this.drawingTf.transformPoint(x, y);
        }

        this.transformPointV = function(vec3)
        {
            return this.drawingTf.transformPointV(vec3);
        }

        this.invTransformPoint = function(x, y)
        {
            return this.drawingTf.invTransformPoint(x, y);
        }

        this.invTransformPointV = function(vec3)
        {
            return this.drawingTf.invTransformPoint(vec3);
        }

        this.drawLegendAndInfo = function(ctx)
        {
            var topLeftPix = this.panel.transformPoint(0.0, 0.0);
            var originPix = this.panel.transformPoint(0.0, 1.0);
            var bottomRight = this.panel.transformPoint(1.0, 1.0);
            var widthPix = bottomRight.get([0, 0]) - topLeftPix.get([0, 0]);
            var heightPix = bottomRight.get([1, 0]) - topLeftPix.get([1, 0])
            // Draw Y Legend
            ctx.moveTo(topLeftPix.get([0, 0]),
                topLeftPix.get([1, 0]));

            ctx.lineTo(originPix.get([0, 0]),
                originPix.get([1, 0]));
            ctx.stroke();

            // Draw X Legend
            ctx.lineTo(bottomRight.get([0, 0]),
                bottomRight.get([1, 0]));
            ctx.stroke();


            // draw legend scale info of X
            for(var i = 0 ; i <= 10 ; i++)
            {
                var xPos = originPix.get([0, 0]) + widthPix * i / 10.0;
                ctx.moveTo(xPos,
                    originPix.get([1, 0]));
                ctx.lineTo(xPos,
                        originPix.get([1, 0]) - (0.015 * widthPix ));
                ctx.stroke();

                // draw scale number
                ctx.fillText(Math.round(i *10 ) / 100,
                        xPos - (0.01 * widthPix),
                        originPix.get([1, 0]) + (0.03 * heightPix) );
            }

            // draw legend scale info of Y
            for(var i = 0 ; i <= 10 ; i++)
            {
                var yPos = originPix.get([1, 0]) - heightPix * i / 10.0;
                ctx.moveTo(originPix.get([0, 0]),
                    yPos);
                ctx.lineTo(originPix.get([0, 0]) + (0.015 * widthPix),
                    yPos);
                ctx.stroke();

                // draw scale number
                ctx.fillText(Math.round(i *10 ) / 100,
                        originPix.get([0, 0]) - (0.05 * widthPix),
                        yPos + (0.01 * heightPix) );
            }
        }// end of drawLegendAndInfo()

    }// end of GraphPanel

    function Transformation()
    {
        this.localMatrix = _mathJs.eye(3);
        this.worldMatrix = _mathJs.eye(3);
        this.invWorldMatrix = _mathJs.eye(3);

        this.children = new Array();
        this.parent = null;

        this.addChild = function(child)
        {
            this.children.push(child);
            child.parent = this;
        }

        this.updateWorldMatrix = function()
        {
            if(this.parent != null)
            {
                this.parent.updateWorldMatrix();
                this.worldMatrix = _mathJs.multiply(this.parent.worldMatrix,
                    this.localMatrix);
            }
            else
            {
                this.worldMatrix = this.localMatrix;
            }

            this.invWorldMatrix = _mathJs.inv(this.worldMatrix);
        }

        this.transformPoint = function(x, y)
        {
            var vector = _mathJs.matrix([
                [x], [y], [1]
            ]);

            return _mathJs.multiply(this.worldMatrix,
                vector);
        }

        this.transformPointV = function(vec3)
        {
            return _mathJs.multiply(this.worldMatrix,
                vec3);
        }

        this.invTransformPoint = function(x, y)
        {
            var vector = _mathJs.matrix([
                [x], [y], [1]
            ]);

            return _mathJs.multiply(this.invWorldMatrix,
                vector);
        }

        this.invTransformPointV = function(vec3)
        {
            return _mathJs.multiply(this.invWorldMatrix,
                vec3);
        }
    }// end of Transformation

    function Panel(name)
    {
        this.name = name;
        this.topLeftPos = _mathJs.zeros(3, 1);
        this.scale = _mathJs.ones(3, 1);

        this.width = 0;
        this.height = 0;
        this.transformation = new Transformation();

        this.setTopLeftPos = function(x, y)
        {
            this.topLeftPos = _mathJs.matrix( [[x], [y], [1]]);
            this.updateLocalMatrix();
        }

        this.setScale = function(scaleX, scaleY)
        {
            this.scale = _mathJs.matrix( [[scaleX], [scaleY], [1]]);
            this.updateLocalMatrix();
        }

        this.updateLocalMatrix = function()
        {
            this.transformation.localMatrix = _mathJs.matrix
            ([
                [this.scale.get([0, 0]), 0, this.topLeftPos.get([0, 0])],
                [0, this.scale.get([1, 0]), this.topLeftPos.get([1, 0])],
                [0, 0, 1]
            ]);
        }

        this.updateWorldMatrix = function()
        {
            this.transformation.updateWorldMatrix();
        }

        this.transformPoint = function(x, y)
        {
            return this.transformation.transformPoint(x, y);
        }
    }// end of Panel

    function mathEx(mathJs)
    {
        this.mathJs = mathJs;

        this.vec3 = function(x, y, w)
        {
            return this.mathJs.matrix([
                [x],
                [y],
                [w]
            ]);
        }
    }// end of mathEx
}