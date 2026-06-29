var AnnotationLayer = (function () {
  var canvas = null;
  var ctx = null;
  var currentPage = 0;
  var currentTool = 'pen';
  var currentColor = '#e53935';
  var baseLineWidth = 3;
  var strokes = [];
  var currentStroke = null;
  var lastPoint = null;

  function resizeCanvas() {
    if (!canvas) return;
    var wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    redrawAll();
  }

  function redrawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < strokes.length; i++) {
      drawStroke(strokes[i]);
    }
  }

  function drawStroke(stroke) {
    if (!stroke.points || stroke.points.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (stroke.type === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = stroke.color;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
    }

    var pts = stroke.points;
    for (var i = 1; i < pts.length; i++) {
      var prev = pts[i - 1];
      var curr = pts[i];
      var pressure = curr.pressure || 0.5;
      var width = stroke.type === 'erase' ? 20 : stroke.lineWidth * (0.5 + pressure * 1.5);

      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);

      if (i < pts.length - 1) {
        var next = pts[i + 1];
        var midX = (curr.x + next.x) / 2;
        var midY = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      } else {
        ctx.lineTo(curr.x, curr.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSegment(from, to) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 20;
    } else if (currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = baseLineWidth * 3 * (0.5 + (to.pressure || 0.5) * 1.5);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = baseLineWidth * (0.5 + (to.pressure || 0.5) * 1.5);
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function saveCurrentPageStrokes() {
    StorageManager.saveStrokes(currentPage, strokes);
  }

  function loadPageStrokes(pageIndex) {
    return StorageManager.loadStrokes(pageIndex).then(function (loaded) {
      strokes = loaded || [];
      redrawAll();
    });
  }

  return {
    init: function (canvasEl) {
      canvas = canvasEl;
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    },

    setTool: function (tool) {
      currentTool = tool;
      if (tool === 'eraser') {
        canvas.classList.add('eraser-mode');
      } else {
        canvas.classList.remove('eraser-mode');
      }
    },

    setColor: function (color) {
      currentColor = color;
    },

    setActive: function (active) {
      if (active) {
        canvas.classList.add('active');
      } else {
        canvas.classList.remove('active');
      }
    },

    onDrawStart: function (pt) {
      currentStroke = {
        type: currentTool === 'eraser' ? 'erase' : currentTool,
        color: currentColor,
        lineWidth: currentTool === 'highlighter' ? baseLineWidth * 3 : baseLineWidth,
        points: [pt]
      };
      lastPoint = pt;
    },

    onDrawMove: function (points) {
      if (!currentStroke) return;
      for (var i = 0; i < points.length; i++) {
        currentStroke.points.push(points[i]);
        drawSegment(lastPoint, points[i]);
        lastPoint = points[i];
      }
    },

    onDrawEnd: function () {
      if (!currentStroke) return;
      if (currentStroke.points.length > 1) {
        strokes.push(currentStroke);
        saveCurrentPageStrokes();
      }
      currentStroke = null;
      lastPoint = null;
    },

    clearPage: function () {
      strokes = [];
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      saveCurrentPageStrokes();
    },

    switchPage: function (pageIndex) {
      currentPage = pageIndex;
      return loadPageStrokes(pageIndex);
    },

    getCanvas: function () {
      return canvas;
    },

    redraw: function () {
      resizeCanvas();
    }
  };
})();
