const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const { ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const dbName = "bytescare-crawlers"; // Replace with your database name
const collectionName = "scans"; // Replace with your collection name

(async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch documents where keywords have duplicate IDs
        const documents = await collection.aggregate([
            { $unwind: "$keywords" },
            {
                $group: {
                    _id: {
                        documentId: "$_id",
                        keywordId: "$keywords.id"
                    },
                    count: { $sum: 1 },
                    keywords: { $push: "$keywords" },
                    fullDocument: { $first: "$$ROOT" }
                }
            },
            { $match: { count: { $gt: 1 } } },
            {
                $group: {
                    _id: "$_id.documentId",
                    fullDocument: { $first: "$fullDocument" },
                    duplicateKeywords: { $push: "$keywords" }
                }
            }
        ]).toArray();

        // Save duplicate documents to a JSON file
        fs.writeFileSync('duplicate_documents.json', JSON.stringify(documents, null, 2));
        console.log("Duplicate documents saved to duplicate_documents.json");

        for (const doc of documents) {const { ObjectId } = require('mongodb');
            console.log(`Processing document with ID: ${doc.fullDocument._id}`);
            const keywordGroups = doc.duplicateKeywords;

            for (const group of keywordGroups) {
                const keywordCounts = group.map(keyword => {
                    const totalEvents = keyword.platforms.reduce((total, platform) => total + platform.events.length, 0);
                    console.log(`Keyword ID: ${keyword.id}, Total Events: ${totalEvents}, Element _id: ${keyword._id}`);
                    return { id: keyword.id, totalEvents, keyword, elementId: keyword._id };
                });

                // Find the keyword with the maximum event count
                let maxEventKeyword = keywordCounts.reduce((max, current) => 
                    current.totalEvents > max.totalEvents ? current : max, keywordCounts[0]
                );

                console.log(`Keeping keyword with ID: ${maxEventKeyword.id}, Total Events: ${maxEventKeyword.totalEvents}, Element _id: ${maxEventKeyword.elementId}`);

                // Remove all keywords except the one with the highest event count
                for (const keyword of keywordCounts) {
                    if (String(keyword.elementId) !== String(maxEventKeyword.elementId)) {
                        const filter = { 
                            _id: doc.fullDocument._id 
                        };
                        const update = { 
                            $pull: { 
                                keywords: { _id: new ObjectId(keyword.elementId) } // Cast _id to ObjectId
                            } 
                        };

                        const result = await collection.updateOne(filter, update);

                        if (result.modifiedCount > 0) {
                            console.log(`Removed keyword with Element _id: ${keyword.elementId}, Total Events: ${keyword.totalEvents}`);
                        } else {
                            console.log(`Failed to remove keyword with Element _id: ${keyword.elementId}`);
                        }
                    }
                }
            }
        }

        console.log("Processing complete.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB");
    }
})();