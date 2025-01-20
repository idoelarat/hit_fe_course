const dbName = "expensesDB";
const storeName = "expenses";

//initiat the indexdb as documented
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

//adding cost to the indexdb as used in the addCost component
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

//getting report piechart values as used in the report view component
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
            //checking to see if the monthYear value that got passed is in the db
            const existingCategory = results.find(
              (obj) => obj.category === record.category,
            );
            if (existingCategory) {
              //suming the categories if it find data in the month and the year
              existingCategory.sum += record.sum;
            } else {
              results.push({
                //pushing the category and the sum for the pie chart
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
//getting detail report used in the reportView component
const getDetailedReport = (monthYear) => {
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
            //checking the db per month and year that passed in
            results.push(record); // Push the full record (all keys/values)
          }
          cursor.continue();
        } else {
          resolve(results); // Return all records that match the monthYear
        }
      };

      request.onerror = () => reject(request.error);
    });
  });
};

export default { addCost, getReport, getDetailedReport };
