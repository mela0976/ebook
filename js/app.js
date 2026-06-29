document.addEventListener('DOMContentLoaded', function () {
  var activeTool = null;
  var activeColor = '#e53935';

  // DOM references
  var annotationCanvas = document.getElementById('annotation-canvas');
  var pageContent = document.getElementById('page-content');
  var pageIndicator = document.getElementById('page-indicator');
  var pageWrapper = document.getElementById('page-wrapper');
  var colorPanel = document.getElementById('color-panel');
  var currentSwatch = document.getElementById('current-swatch');

  // Tool buttons
  var btnPen = document.getElementById('btn-pen');
  var btnHighlighter = document.getElementById('btn-highlighter');
  var btnEraser = document.getElementById('btn-eraser');
  var btnSignature = document.getElementById('btn-signature');
  var btnClearPage = document.getElementById('btn-clear-page');
  var btnColor = document.getElementById('btn-color');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');

  // Load saved tool settings
  var savedSettings = StorageManager.loadToolSettings();
  if (savedSettings) {
    activeColor = savedSettings.color || activeColor;
  }
  currentSwatch.style.background = activeColor;

  // Initialize annotation layer
  AnnotationLayer.init(annotationCanvas);
  AnnotationLayer.setColor(activeColor);

  // Initialize pointer handler for annotation canvas
  PointerHandler.init(annotationCanvas, {
    onDrawStart: function (pt) {
      AnnotationLayer.onDrawStart(pt);
    },
    onDrawMove: function (points) {
      AnnotationLayer.onDrawMove(points);
    },
    onDrawEnd: function () {
      AnnotationLayer.onDrawEnd();
    },
    onTap: null
  });

  // Initialize signature manager BEFORE reader (reader's init callback calls SignatureManager)
  SignatureManager.init(pageWrapper, function () {
    if (activeTool) {
      AnnotationLayer.setActive(true);
    }
  });

  // Initialize reader
  EbookReader.init(pageContent, pageIndicator, function (pageIndex, action) {
    if (action === 'leave') {
      // Save current page annotations before leaving
    }
    if (action === 'enter' || !action) {
      AnnotationLayer.switchPage(pageIndex);
      SignatureManager.showPageSignatures(pageIndex);
    }
  });

  // Tool selection
  function setActiveTool(tool) {
    // Deactivate all tool buttons
    btnPen.classList.remove('active');
    btnHighlighter.classList.remove('active');
    btnEraser.classList.remove('active');

    if (activeTool === tool) {
      // Toggle off
      activeTool = null;
      AnnotationLayer.setActive(false);
      return;
    }

    activeTool = tool;
    AnnotationLayer.setTool(tool);
    AnnotationLayer.setActive(true);

    if (tool === 'pen') btnPen.classList.add('active');
    else if (tool === 'highlighter') btnHighlighter.classList.add('active');
    else if (tool === 'eraser') btnEraser.classList.add('active');
  }

  btnPen.addEventListener('click', function () { setActiveTool('pen'); });
  btnHighlighter.addEventListener('click', function () { setActiveTool('highlighter'); });
  btnEraser.addEventListener('click', function () { setActiveTool('eraser'); });

  // Color picker
  btnColor.addEventListener('click', function (e) {
    e.stopPropagation();
    colorPanel.classList.toggle('open');
  });

  var colorOpts = document.querySelectorAll('.color-opt');
  for (var i = 0; i < colorOpts.length; i++) {
    colorOpts[i].addEventListener('click', function (e) {
      e.stopPropagation();
      activeColor = this.getAttribute('data-color');
      currentSwatch.style.background = activeColor;
      AnnotationLayer.setColor(activeColor);
      colorPanel.classList.remove('open');
      StorageManager.saveToolSettings({ color: activeColor });

      // Update selected state
      for (var j = 0; j < colorOpts.length; j++) {
        colorOpts[j].classList.remove('selected');
      }
      this.classList.add('selected');
    });
  }

  // Close color panel on outside click
  document.addEventListener('click', function () {
    colorPanel.classList.remove('open');
  });

  // Signature
  btnSignature.addEventListener('click', function () {
    AnnotationLayer.setActive(false);
    SignatureManager.openModal();
  });

  // Clear page annotations
  btnClearPage.addEventListener('click', function () {
    AnnotationLayer.clearPage();
  });

  // Navigation
  btnPrev.addEventListener('click', function () {
    EbookReader.prevPage();
  });

  btnNext.addEventListener('click', function () {
    EbookReader.nextPage();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') EbookReader.prevPage();
    else if (e.key === 'ArrowRight') EbookReader.nextPage();
  });

  // Handle window resize
  window.addEventListener('resize', function () {
    AnnotationLayer.redraw();
  });
});
