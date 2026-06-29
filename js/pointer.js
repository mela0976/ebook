var PointerHandler = (function () {
  var canvas = null;
  var callbacks = {
    onDrawStart: null,
    onDrawMove: null,
    onDrawEnd: null,
    onTap: null
  };
  var isDrawing = false;
  var startX = 0;
  var startY = 0;
  var TAP_THRESHOLD = 5;

  function getCanvasPoint(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
      pressure: e.pressure || 0.5
    };
  }

  function handleDown(e) {
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;

    var pt = getCanvasPoint(e);
    startX = pt.x;
    startY = pt.y;

    if (callbacks.onDrawStart) {
      callbacks.onDrawStart(pt);
    }
  }

  function handleMove(e) {
    if (!isDrawing) return;
    if (e.pointerType === 'touch') return;
    e.preventDefault();

    var events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    var points = [];
    for (var i = 0; i < events.length; i++) {
      points.push(getCanvasPoint(events[i]));
    }

    if (callbacks.onDrawMove) {
      callbacks.onDrawMove(points);
    }
  }

  function handleUp(e) {
    if (!isDrawing) return;
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    isDrawing = false;

    var pt = getCanvasPoint(e);
    var dx = pt.x - startX;
    var dy = pt.y - startY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < TAP_THRESHOLD && callbacks.onTap) {
      callbacks.onTap(pt);
    }

    if (callbacks.onDrawEnd) {
      callbacks.onDrawEnd(pt);
    }
  }

  function handleCancel(e) {
    if (!isDrawing) return;
    isDrawing = false;
    if (callbacks.onDrawEnd) {
      callbacks.onDrawEnd(null);
    }
  }

  return {
    init: function (canvasEl, cbs) {
      canvas = canvasEl;
      callbacks = {
        onDrawStart: cbs.onDrawStart || null,
        onDrawMove: cbs.onDrawMove || null,
        onDrawEnd: cbs.onDrawEnd || null,
        onTap: cbs.onTap || null
      };

      canvas.addEventListener('pointerdown', handleDown);
      canvas.addEventListener('pointermove', handleMove);
      canvas.addEventListener('pointerup', handleUp);
      canvas.addEventListener('pointercancel', handleCancel);
    },

    destroy: function () {
      if (!canvas) return;
      canvas.removeEventListener('pointerdown', handleDown);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
      canvas.removeEventListener('pointercancel', handleCancel);
      canvas = null;
      isDrawing = false;
    },

    isActive: function () {
      return isDrawing;
    }
  };
})();

// Standalone pointer handler factory for signature canvas
function createPointerHandler(canvasEl, cbs) {
  var isDrawing = false;
  var startX = 0;
  var startY = 0;

  function getCanvasPoint(e) {
    var rect = canvasEl.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasEl.width / rect.width),
      y: (e.clientY - rect.top) * (canvasEl.height / rect.height),
      pressure: e.pressure || 0.5
    };
  }

  function onDown(e) {
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    canvasEl.setPointerCapture(e.pointerId);
    isDrawing = true;
    var pt = getCanvasPoint(e);
    startX = pt.x;
    startY = pt.y;
    if (cbs.onDrawStart) cbs.onDrawStart(pt);
  }

  function onMove(e) {
    if (!isDrawing) return;
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    var events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    var points = [];
    for (var i = 0; i < events.length; i++) {
      points.push(getCanvasPoint(events[i]));
    }
    if (cbs.onDrawMove) cbs.onDrawMove(points);
  }

  function onUp(e) {
    if (!isDrawing) return;
    if (e.pointerType === 'touch') return;
    e.preventDefault();
    isDrawing = false;
    if (cbs.onDrawEnd) cbs.onDrawEnd(getCanvasPoint(e));
  }

  function onCancel() {
    if (!isDrawing) return;
    isDrawing = false;
    if (cbs.onDrawEnd) cbs.onDrawEnd(null);
  }

  canvasEl.addEventListener('pointerdown', onDown);
  canvasEl.addEventListener('pointermove', onMove);
  canvasEl.addEventListener('pointerup', onUp);
  canvasEl.addEventListener('pointercancel', onCancel);

  return {
    destroy: function () {
      canvasEl.removeEventListener('pointerdown', onDown);
      canvasEl.removeEventListener('pointermove', onMove);
      canvasEl.removeEventListener('pointerup', onUp);
      canvasEl.removeEventListener('pointercancel', onCancel);
    }
  };
}
