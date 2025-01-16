const dbName = "expensesDB";
const storeName = "expenses";

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const addCost = (cost) => {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(cost);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
};

const getReport = (monthYear) => {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          if (record.date === monthYear) {
            const existingCategory = results.find(
              (obj) => obj.category === record.category,
            );
            if (existingCategory) {
              existingCategory.sum += record.sum;
            } else {
              results.push({
                category: record.category,
                sum: record.sum,
              });
            }
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  });
};

export default { addCost, getReport };
