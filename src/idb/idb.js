const dbName = "costsdb";
const storeName = "expenses";

// Open the database and attach custom methods to the db object
const openCostsDB = async () => {
  const db = await new Promise((resolve, reject) => {
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

  //adding cost to the indexdb as used in the addCost component
  db.addCost = async (cost) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.add(cost);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  //getting report piechart values as used in the report view component
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
            //checking to see if the monthYear value that got passed is in the db
            const existingCategory = results.find(
              (obj) => obj.category === record.category
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
  };

  //getting detail report used in the reportView component
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
  };

  return db;
};

export default { openCostsDB };
