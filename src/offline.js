// =============================================
// TaniCerdas AI — Offline-First PWA Engine
// =============================================

const DB_NAME = 'tanicerdas-offline';
const DB_VERSION = 1;
const STORE_QUEUE = 'pending-reports';
const STORE_CACHE = 'data-cache';

/**
 * Open IndexedDB connection
 */
function openDB() {
  return new Promise(function(resolve, reject) {
    var request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
      }
    };
    request.onsuccess = function(e) { resolve(e.target.result); };
    request.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Queue a price report for later sync
 */
export async function queueReport(reportData) {
  var db = await openDB();
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(STORE_QUEUE, 'readwrite');
    var store = tx.objectStore(STORE_QUEUE);
    store.add(Object.assign({}, reportData, { queuedAt: new Date().toISOString() }));
    tx.oncomplete = function() { resolve(); };
    tx.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Get all pending reports from queue
 */
export async function getPendingReports() {
  var db = await openDB();
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(STORE_QUEUE, 'readonly');
    var store = tx.objectStore(STORE_QUEUE);
    var request = store.getAll();
    request.onsuccess = function() { resolve(request.result || []); };
    request.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Remove a report from queue after successful sync
 */
export async function removeFromQueue(id) {
  var db = await openDB();
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(STORE_QUEUE, 'readwrite');
    var store = tx.objectStore(STORE_QUEUE);
    store.delete(id);
    tx.oncomplete = function() { resolve(); };
    tx.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Cache dashboard data for offline viewing
 */
export async function cacheData(key, value) {
  var db = await openDB();
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(STORE_CACHE, 'readwrite');
    var store = tx.objectStore(STORE_CACHE);
    store.put({ key: key, value: value, cachedAt: new Date().toISOString() });
    tx.oncomplete = function() { resolve(); };
    tx.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Get cached data
 */
export async function getCachedData(key) {
  var db = await openDB();
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(STORE_CACHE, 'readonly');
    var store = tx.objectStore(STORE_CACHE);
    var request = store.get(key);
    request.onsuccess = function() { resolve(request.result ? request.result.value : null); };
    request.onerror = function(e) { reject(e.target.error); };
  });
}

/**
 * Check network status
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Listen for connectivity changes
 */
export function onConnectivityChange(callback) {
  window.addEventListener('online', function() { callback(true); });
  window.addEventListener('offline', function() { callback(false); });
}
