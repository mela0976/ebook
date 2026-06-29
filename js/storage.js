var StorageManager = (function () {
  var DB_NAME = 'ebook-viewer-db';
  var DB_VERSION = 1;
  var db = null;

  function openDB() {
    return new Promise(function (resolve, reject) {
      if (db) { resolve(db); return; }
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function (e) {
        var d = e.target.result;
        if (!d.objectStoreNames.contains('canvasSnapshots')) {
          d.createObjectStore('canvasSnapshots', { keyPath: 'pageIndex' });
        }
        if (!d.objectStoreNames.contains('signatures')) {
          d.createObjectStore('signatures', { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains('strokeHistory')) {
          d.createObjectStore('strokeHistory', { keyPath: 'pageIndex' });
        }
      };
      request.onsuccess = function (e) {
        db = e.target.result;
        resolve(db);
      };
      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function putRecord(storeName, record) {
    return openDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(record);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getRecord(storeName, key) {
    return openDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(storeName, 'readonly');
        var req = tx.objectStore(storeName).get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function deleteRecord(storeName, key) {
    return openDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getAllRecords(storeName) {
    return openDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(storeName, 'readonly');
        var req = tx.objectStore(storeName).getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  // Public API
  return {
    saveStrokes: function (pageIndex, strokes) {
      return putRecord('strokeHistory', { pageIndex: pageIndex, strokes: JSON.stringify(strokes) });
    },

    loadStrokes: function (pageIndex) {
      return getRecord('strokeHistory', pageIndex).then(function (record) {
        return record ? JSON.parse(record.strokes) : [];
      });
    },

    saveSignature: function (id, blob) {
      return putRecord('signatures', { id: id, blob: blob, timestamp: Date.now() });
    },

    loadSignature: function (id) {
      return getRecord('signatures', id).then(function (record) {
        return record ? record.blob : null;
      });
    },

    deleteSignature: function (id) {
      return deleteRecord('signatures', id);
    },

    getAllSignatures: function () {
      return getAllRecords('signatures');
    },

    saveCurrentPage: function (pageIndex) {
      try { localStorage.setItem('ebook-currentPage', String(pageIndex)); } catch (e) {}
    },

    loadCurrentPage: function () {
      try { return parseInt(localStorage.getItem('ebook-currentPage'), 10) || 0; } catch (e) { return 0; }
    },

    saveCheckboxStates: function (states) {
      try { localStorage.setItem('ebook-checkboxStates', JSON.stringify(states)); } catch (e) {}
    },

    loadCheckboxStates: function () {
      try {
        var raw = localStorage.getItem('ebook-checkboxStates');
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    },

    saveSignaturePlacements: function (placements) {
      try { localStorage.setItem('ebook-signaturePlacements', JSON.stringify(placements)); } catch (e) {}
    },

    loadSignaturePlacements: function () {
      try {
        var raw = localStorage.getItem('ebook-signaturePlacements');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    },

    saveToolSettings: function (settings) {
      try { localStorage.setItem('ebook-toolSettings', JSON.stringify(settings)); } catch (e) {}
    },

    loadToolSettings: function () {
      try {
        var raw = localStorage.getItem('ebook-toolSettings');
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }
  };
})();
