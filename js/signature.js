var SignatureManager = (function () {
  var modal = null;
  var sigCanvas = null;
  var sigCtx = null;
  var sigHandler = null;
  var placer = null;
  var previewImg = null;
  var currentBlob = null;
  var currentBlobUrl = null;
  var isPlacing = false;
  var placerX = 100;
  var placerY = 100;
  var isDragging = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;
  var placedSignatures = [];
  var pageWrapper = null;
  var onPlacementDone = null;
  var sigLastPoint = null;
  var sigHasStrokes = false;

  function drawSigSegment(from, to) {
    sigCtx.save();
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';
    sigCtx.strokeStyle = '#000';
    sigCtx.lineWidth = 1 + (to.pressure || 0.5) * 4;
    sigCtx.beginPath();
    sigCtx.moveTo(from.x, from.y);

    var midX = (from.x + to.x) / 2;
    var midY = (from.y + to.y) / 2;
    sigCtx.quadraticCurveTo(from.x, from.y, midX, midY);
    sigCtx.stroke();
    sigCtx.restore();
  }

  function clearSigCanvas() {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    sigHasStrokes = false;
  }

  function setupPlacer() {
    placer = document.getElementById('signature-placer');
    previewImg = document.getElementById('signature-preview');

    previewImg.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      isDragging = true;
      var rect = previewImg.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      previewImg.style.cursor = 'grabbing';
    });

    document.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      placerX = e.clientX - dragOffsetX;
      placerY = e.clientY - dragOffsetY;
      placer.style.left = placerX + 'px';
      placer.style.top = placerY + 'px';
    });

    document.addEventListener('pointerup', function () {
      if (!isDragging) return;
      isDragging = false;
      previewImg.style.cursor = 'grab';
    });
  }

  function showPlacer(blobUrl) {
    isPlacing = true;
    previewImg.src = blobUrl;
    var wrapperRect = pageWrapper.getBoundingClientRect();
    placerX = wrapperRect.left + wrapperRect.width / 2 - 100;
    placerY = wrapperRect.top + wrapperRect.height / 2 - 40;
    placer.style.left = placerX + 'px';
    placer.style.top = placerY + 'px';
    placer.style.display = 'block';
    placer.style.pointerEvents = 'auto';
  }

  function hidePlacer() {
    isPlacing = false;
    placer.style.display = 'none';
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
      currentBlobUrl = null;
    }
  }

  function placeSignature(pageIndex) {
    var sigId = 'sig-' + Date.now();
    var wrapperRect = pageWrapper.getBoundingClientRect();
    var relX = placerX - wrapperRect.left;
    var relY = placerY - wrapperRect.top;

    StorageManager.saveSignature(sigId, currentBlob).then(function () {
      var placement = {
        id: sigId,
        pageIndex: pageIndex,
        x: relX,
        y: relY,
        width: previewImg.naturalWidth > 180 ? 180 : previewImg.naturalWidth,
        height: previewImg.naturalHeight
      };
      placedSignatures.push(placement);
      StorageManager.saveSignaturePlacements(placedSignatures);
      renderPlacedSignature(placement);
      hidePlacer();
      if (onPlacementDone) onPlacementDone();
    });
  }

  function renderPlacedSignature(placement) {
    var el = document.createElement('div');
    el.className = 'placed-signature';
    el.setAttribute('data-sig-id', placement.id);
    el.style.left = placement.x + 'px';
    el.style.top = placement.y + 'px';

    var img = document.createElement('img');
    img.style.width = placement.width + 'px';
    img.alt = '簽名';

    StorageManager.loadSignature(placement.id).then(function (blob) {
      if (blob) {
        img.src = URL.createObjectURL(blob);
      }
    });

    el.appendChild(img);

    // Long press to delete
    var pressTimer = null;
    var tooltip = document.createElement('div');
    tooltip.className = 'sig-delete-tooltip';
    tooltip.textContent = '放開以刪除';
    el.appendChild(tooltip);

    el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      pressTimer = setTimeout(function () {
        tooltip.classList.add('show');
      }, 500);
    });

    el.addEventListener('pointerup', function () {
      if (tooltip.classList.contains('show')) {
        removeSignature(placement.id, el);
      }
      clearTimeout(pressTimer);
      tooltip.classList.remove('show');
    });

    el.addEventListener('pointercancel', function () {
      clearTimeout(pressTimer);
      tooltip.classList.remove('show');
    });

    el.addEventListener('pointermove', function () {
      clearTimeout(pressTimer);
      tooltip.classList.remove('show');
    });

    pageWrapper.appendChild(el);
  }

  function removeSignature(sigId, el) {
    StorageManager.deleteSignature(sigId);
    placedSignatures = placedSignatures.filter(function (p) { return p.id !== sigId; });
    StorageManager.saveSignaturePlacements(placedSignatures);
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function clearRenderedSignatures() {
    var existing = pageWrapper.querySelectorAll('.placed-signature');
    for (var i = 0; i < existing.length; i++) {
      existing[i].parentNode.removeChild(existing[i]);
    }
  }

  return {
    init: function (wrapperEl, doneCallback) {
      pageWrapper = wrapperEl;
      onPlacementDone = doneCallback;
      modal = document.getElementById('signature-modal');
      sigCanvas = document.getElementById('signature-canvas');
      sigCtx = sigCanvas.getContext('2d');

      sigCanvas.width = 600;
      sigCanvas.height = 200;

      sigHandler = createPointerHandler(sigCanvas, {
        onDrawStart: function (pt) {
          sigLastPoint = pt;
          sigHasStrokes = true;
        },
        onDrawMove: function (points) {
          for (var i = 0; i < points.length; i++) {
            drawSigSegment(sigLastPoint, points[i]);
            sigLastPoint = points[i];
          }
        },
        onDrawEnd: function () {
          sigLastPoint = null;
        }
      });

      document.getElementById('sig-cancel').addEventListener('click', function () {
        clearSigCanvas();
        modal.classList.remove('open');
      });

      document.getElementById('sig-clear').addEventListener('click', function () {
        clearSigCanvas();
      });

      document.getElementById('sig-confirm').addEventListener('click', function () {
        if (!sigHasStrokes) return;
        sigCanvas.toBlob(function (blob) {
          currentBlob = blob;
          currentBlobUrl = URL.createObjectURL(blob);
          modal.classList.remove('open');
          showPlacer(currentBlobUrl);
        }, 'image/png');
      });

      setupPlacer();

      document.getElementById('placer-cancel').addEventListener('click', function () {
        hidePlacer();
        if (onPlacementDone) onPlacementDone();
      });

      document.getElementById('placer-confirm').addEventListener('click', function () {
        var page = EbookReader.getCurrentPage();
        placeSignature(page);
      });

      placedSignatures = StorageManager.loadSignaturePlacements();
    },

    openModal: function () {
      clearSigCanvas();
      modal.classList.add('open');
    },

    isPlacing: function () {
      return isPlacing;
    },

    showPageSignatures: function (pageIndex) {
      clearRenderedSignatures();
      for (var i = 0; i < placedSignatures.length; i++) {
        if (placedSignatures[i].pageIndex === pageIndex) {
          renderPlacedSignature(placedSignatures[i]);
        }
      }
    }
  };
})();
