const storeName = "expenses";

// Open the database and attach custom methods to the db object
const openCostsDB = async (dbName, version) => {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Add custom methods to the database object
  db.addCost = async (cost) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    if (!cost.date) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Add 1 because months are 0-indexed
      const year = now.getFullYear();
      const formattedDate = `${month}/${year}`;
      cost.date = formattedDate;
    }

    return new Promise((resolve, reject) => {
      const request = store.add(cost);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  db.getReport = async (monthYear) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();
    const results = [];

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          if (record.date === monthYear) {
            const existingCategory = results.find(
              (obj) => obj.category === record.category
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
  };

  db.getDetailedReport = async (monthYear) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();
    const results = [];

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          if (record.date === monthYear) {
            results.push(record);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  };

  return db;
};

// Attach the openCostsDB function to the global `idb` object
window.idb = {
  openCostsDB,
};
