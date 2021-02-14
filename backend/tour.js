const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  let uri = process.env.DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db("gg-tour");
    const collection = await db.collection("tours");
    const data = await collection.find({}).toArray();
    return { statusCode: 200, body: JSON.stringify({ data }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to get from database" }) };
  }
  finally {
    await client.close();
  }
}