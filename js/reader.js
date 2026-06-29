var EbookReader = (function () {
  var pages = [];
  var currentPage = 0;
  var pageContentEl = null;
  var pageIndicatorEl = null;
  var onPageChange = null;

  // Sample ebook content with checklist items
  var SIG_FIELD = '<div class="signature-field" data-sig-field="0">' +
    '<div class="sig-field-label">簽名欄</div>' +
    '<div class="sig-field-area">' +
      '<span class="sig-field-hint">點擊此處簽名</span>' +
    '</div></div>';

  var SIG_FIELD_DATE = '<div class="signature-field-row">' +
    '<div class="signature-field" data-sig-field="0">' +
      '<div class="sig-field-label">簽名</div>' +
      '<div class="sig-field-area"><span class="sig-field-hint">點擊此處簽名</span></div>' +
    '</div>' +
    '<div class="signature-date-field">' +
      '<div class="sig-field-label">日期</div>' +
      '<div class="sig-date-value"></div>' +
    '</div></div>';

  var SAMPLE_PAGES = [
    {
      html: '<h1>第一章：專案概述</h1>' +
        '<p>歡迎使用電子書瀏覽器。本教材將帶您了解專案管理的基本概念與實務操作流程。</p>' +
        '<p>專案管理是一門將知識、技能、工具與技術應用於專案活動的學科，目的在於滿足專案的需求。有效的專案管理能幫助團隊在預定的時間與預算內完成目標。</p>' +
        '<h2>學習目標</h2>' +
        '<p>完成本章後，您應該能夠：</p>' +
        '<div class="checklist-item" data-index="0">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">理解專案管理的五大流程群組</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="1">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">區分專案與日常營運的差異</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="2">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">說明專案經理的角色與職責</span>' +
        '</div>' +
        '<h2>確認簽名</h2>' +
        '<div class="signature-field-row">' +
          '<div class="signature-field" data-sig-field="0">' +
            '<div class="sig-field-label">簽名</div>' +
            '<div class="sig-field-area"><span class="sig-field-hint">點擊此處簽名</span></div>' +
          '</div>' +
          '<div class="signature-date-field">' +
            '<div class="sig-field-label">日期</div>' +
            '<div class="sig-date-value"></div>' +
          '</div>' +
        '</div>'
    },
    {
      html: '<h1>第二章：專案啟動</h1>' +
        '<p>專案啟動是專案生命週期的第一個階段。在這個階段中，我們需要確認專案的目標、範圍、利害關係人以及初步的資源需求。</p>' +
        '<p>一份好的專案章程（Project Charter）是專案成功的基石。它正式授權專案的存在，並賦予專案經理使用組織資源的權力。</p>' +
        '<h2>啟動階段檢查表</h2>' +
        '<div class="checklist-item" data-index="0">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">撰寫專案章程</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="1">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">識別利害關係人</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="2">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">確定初步的範圍與目標</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="3">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">評估初步風險</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="4">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">取得專案發起人核准</span>' +
        '</div>' +
        '<h2>確認簽名</h2>' +
        '<div class="signature-field-row">' +
          '<div class="signature-field" data-sig-field="0">' +
            '<div class="sig-field-label">簽名</div>' +
            '<div class="sig-field-area"><span class="sig-field-hint">點擊此處簽名</span></div>' +
          '</div>' +
          '<div class="signature-date-field">' +
            '<div class="sig-field-label">日期</div>' +
            '<div class="sig-date-value"></div>' +
          '</div>' +
        '</div>'
    },
    {
      html: '<h1>第三章：專案規劃</h1>' +
        '<p>規劃是專案管理中最耗時但也最重要的階段。良好的規劃能大幅降低專案執行時的風險與不確定性。</p>' +
        '<p>在規劃階段，專案經理需要制定詳細的工作分解結構（WBS）、時程計畫、成本預算以及品質管理計畫。</p>' +
        '<h2>規劃文件清單</h2>' +
        '<div class="checklist-item" data-index="0">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">建立工作分解結構（WBS）</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="1">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">制定專案時程表</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="2">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">編列成本預算</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="3">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">規劃風險管理策略</span>' +
        '</div>' +
        '<h2>確認簽名</h2>' +
        '<div class="signature-field-row">' +
          '<div class="signature-field" data-sig-field="0">' +
            '<div class="sig-field-label">簽名</div>' +
            '<div class="sig-field-area"><span class="sig-field-hint">點擊此處簽名</span></div>' +
          '</div>' +
          '<div class="signature-date-field">' +
            '<div class="sig-field-label">日期</div>' +
            '<div class="sig-date-value"></div>' +
          '</div>' +
        '</div>'
    },
    {
      html: '<h1>第四章：專案執行與監控</h1>' +
        '<p>專案執行階段是將規劃轉化為實際成果的過程。專案經理需要協調團隊成員、管理利害關係人的期望，並確保工作按照計畫進行。</p>' +
        '<p>監控是與執行平行進行的活動。透過定期的績效報告和偏差分析，專案經理可以及時發現問題並採取矯正行動。</p>' +
        '<h2>每週檢查事項</h2>' +
        '<div class="checklist-item" data-index="0">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">更新專案進度報告</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="1">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">召開團隊站立會議</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="2">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">檢視風險登記表</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="3">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">與利害關係人溝通進度</span>' +
        '</div>' +
        '<h2>確認簽名</h2>' +
        '<div class="signature-field-row">' +
          '<div class="signature-field" data-sig-field="0">' +
            '<div class="sig-field-label">簽名</div>' +
            '<div class="sig-field-area"><span class="sig-field-hint">點擊此處簽名</span></div>' +
          '</div>' +
          '<div class="signature-date-field">' +
            '<div class="sig-field-label">日期</div>' +
            '<div class="sig-date-value"></div>' +
          '</div>' +
        '</div>'
    },
    {
      html: '<h1>第五章：專案結案</h1>' +
        '<p>專案結案是確認所有工作已完成、交付物已被接受的最終階段。這個階段經常被忽略，但對於組織學習和持續改善至關重要。</p>' +
        '<p>結案報告應該記錄專案的經驗教訓，包括成功的做法和需要改進的地方，為未來的專案提供參考。</p>' +
        '<h2>結案確認事項</h2>' +
        '<div class="checklist-item" data-index="0">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">確認所有交付物已完成</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="1">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">取得客戶正式驗收</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="2">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">撰寫經驗教訓報告</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="3">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">歸檔所有專案文件</span>' +
        '</div>' +
        '<div class="checklist-item" data-index="4">' +
          '<div class="checklist-box"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg></div>' +
          '<span class="checklist-label">釋放專案資源</span>' +
        '</div>' +
        '<h2>結案確認簽名</h2>' +
        '<div class="signature-field-row">' +
          '<div class="signature-field" data-sig-field="0">' +
            '<div class="sig-field-label">簽名</div>' +
            '<div class="sig-field-area"><span class="sig-field-hint">點擊此處簽名</span></div>' +
          '</div>' +
          '<div class="signature-date-field">' +
            '<div class="sig-field-label">日期</div>' +
            '<div class="sig-date-value"></div>' +
          '</div>' +
        '</div>'
    }
  ];

  function render() {
    if (!pageContentEl) return;
    var page = pages[currentPage];
    if (!page) return;

    pageContentEl.innerHTML = page.html;
    pageIndicatorEl.textContent = (currentPage + 1) + ' / ' + pages.length;

    // Restore checkbox states for this page
    var states = StorageManager.loadCheckboxStates();
    var pageStates = states[currentPage] || {};
    var items = pageContentEl.querySelectorAll('.checklist-item');
    for (var i = 0; i < items.length; i++) {
      var idx = items[i].getAttribute('data-index');
      if (pageStates[idx]) {
        items[i].classList.add('checked');
      }
    }

    // Bind checklist click events
    bindChecklistEvents();

    // Bind signature field events and restore saved signatures
    bindSignatureFields();
  }

  function bindSignatureFields() {
    var fields = pageContentEl.querySelectorAll('.signature-field');
    var savedSigs = StorageManager.loadSignaturePlacements();

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var fieldId = field.getAttribute('data-sig-field');
      var key = currentPage + '-' + fieldId;

      // Restore saved signature
      var saved = null;
      for (var j = 0; j < savedSigs.length; j++) {
        if (savedSigs[j].fieldKey === key) {
          saved = savedSigs[j];
          break;
        }
      }

      if (saved) {
        fillSignatureField(field, saved);
      }

      field.addEventListener('click', handleSignatureFieldClick);
    }
  }

  function fillSignatureField(field, saved) {
    var area = field.querySelector('.sig-field-area');
    area.innerHTML = '';
    var img = document.createElement('img');
    img.className = 'sig-field-img';
    img.alt = '簽名';
    StorageManager.loadSignature(saved.sigId).then(function (blob) {
      if (blob) img.src = URL.createObjectURL(blob);
    });
    area.appendChild(img);
    field.classList.add('signed');

    // Fill date in sibling date field
    var row = field.parentElement;
    if (row && saved.date) {
      var dateEl = row.querySelector('.sig-date-value');
      if (dateEl) dateEl.textContent = saved.date;
    }
  }

  function handleSignatureFieldClick(e) {
    var field = e.currentTarget;
    if (field.classList.contains('signed')) return;
    var fieldId = field.getAttribute('data-sig-field');
    var key = currentPage + '-' + fieldId;
    if (typeof SignatureManager !== 'undefined') {
      SignatureManager.openForField(key, field);
    }
  }

  function bindChecklistEvents() {
    var items = pageContentEl.querySelectorAll('.checklist-item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', handleChecklistClick);
    }
  }

  function handleChecklistClick(e) {
    var item = e.currentTarget;
    var idx = item.getAttribute('data-index');
    item.classList.toggle('checked');

    var states = StorageManager.loadCheckboxStates();
    if (!states[currentPage]) states[currentPage] = {};
    states[currentPage][idx] = item.classList.contains('checked');
    StorageManager.saveCheckboxStates(states);
  }

  return {
    init: function (contentEl, indicatorEl, changeCallback) {
      pageContentEl = contentEl;
      pageIndicatorEl = indicatorEl;
      onPageChange = changeCallback || null;
      pages = SAMPLE_PAGES;

      var saved = StorageManager.loadCurrentPage();
      if (saved >= 0 && saved < pages.length) {
        currentPage = saved;
      }

      render();
      if (onPageChange) onPageChange(currentPage);
    },

    nextPage: function () {
      if (currentPage < pages.length - 1) {
        if (onPageChange) onPageChange(currentPage, 'leave');
        currentPage++;
        StorageManager.saveCurrentPage(currentPage);
        render();
        if (onPageChange) onPageChange(currentPage, 'enter');
      }
    },

    prevPage: function () {
      if (currentPage > 0) {
        if (onPageChange) onPageChange(currentPage, 'leave');
        currentPage--;
        StorageManager.saveCurrentPage(currentPage);
        render();
        if (onPageChange) onPageChange(currentPage, 'enter');
      }
    },

    getCurrentPage: function () {
      return currentPage;
    },

    getPageCount: function () {
      return pages.length;
    }
  };
})();
