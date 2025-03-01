const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection details
const sourceDbUrl = 'mongodb://<source-db-username>:<source-db-password>@<source-db-host>:<port>';
const targetDbUrl = 'mongodb://<target-db-username>:<target-db-password>@<target-db-host>:<port>';
const sourceDbName = '<source-db-name>';
const targetDbName = '<target-db-name>';
const sourceCollectionName = '<source-collection>';
const targetCollectionName = '<target-collection>';

const progressFile = 'migrationProgress.json'; // File to track progress

// Load progress (last migrated _id) from the progress file
function loadProgress() {
  try {
    const data = fs.readFileSync(progressFile);
    return JSON.parse(data);
  } catch (error) {
    return null; // No progress file or empty file, start from the beginning
  }
}

// Save progress (last migrated _id) to the progress file
function saveProgress(lastMigratedId) {
  const progress = { lastMigratedId };
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
  console.log(`Progress saved: Last Migrated ID = ${lastMigratedId}`);
}

async function migrateData() {
  const sourceClient = new MongoClient(sourceDbUrl, { useUnifiedTopology: true });
  const targetClient = new MongoClient(targetDbUrl, { useUnifiedTopology: true });

  let lastMigratedId = null;
  const progress = loadProgress();

  // If progress exists, resume from the last migrated _id
  if (progress && progress.lastMigratedId) {
    lastMigratedId = progress.lastMigratedId;
    console.log(`Resuming migration from last migrated _id: ${lastMigratedId}`);
  }

  try {
    await sourceClient.connect();
    await targetClient.connect();
    console.log('Connected to MongoDB');

    const sourceDb = sourceClient.db(sourceDbName);
    const sourceCollection = sourceDb.collection(sourceCollectionName);
    const targetDb = targetClient.db(targetDbName);
    const targetCollection = targetDb.collection(targetCollectionName);

    let query = {}; // Default query to fetch all documents
    if (lastMigratedId) {
      // If there’s a progress checkpoint, resume from the next document after the last migrated _id
      query = { _id: { $gt: lastMigratedId } };
    }

    // Fetch documents from source collection
    const cursor = sourceCollection.find(query).batchSize(1000); // Fetch in batches

    // Start migration in batches
    while (await cursor.hasNext()) {
      const batch = [];
      let batchCount = 0;

      while (batchCount < 1000 && await cursor.hasNext()) {
        const doc = await cursor.next();
        batch.push(doc);
        batchCount++;
      }

      // Insert batch into the target collection
      const insertResult = await targetCollection.insertMany(batch);
      console.log(`Inserted ${insertResult.insertedCount} documents`);

      // Save progress (last _id of the last inserted document)
      const lastDocument = batch[batch.length - 1];
      lastMigratedId = lastDocument._id;
      saveProgress(lastMigratedId); // Save last migrated _id to file
    }

    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Cleanup
    await sourceClient.close();
    await targetClient.close();
    console.log('Connections closed');
  }
}

// Start migration
migrateData();
