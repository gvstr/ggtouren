let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  let uri = process.env.DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const body = JSON.parse(event.body);
    await client.connect();
    const db = client.db("gg-tour");
    const collection = await db.collection("tours");
    switch (body.action) {
      case "getAll":
        return await getAll(collection);
      case "addNewTour":
        return await addNewTour(collection, body.name, body.active);
      default:
        return { statusCode: 500, body: JSON.stringify({ message: "Okänt fel", status: 500 }) };
    }
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to get from database" }) };
  }
  finally {
    console.log("closing connection")
    await client.close();
  }
}

async function getAll(collection) {
  const data = await collection.find({}).toArray();
  return { statusCode: 200, body: JSON.stringify({ data }) };
}

async function addNewTour(collection, name, active) {
  const tour = await collection.findOne({ name: name });
  if (tour) return { statusCode: 401, body: JSON.stringify({ message: "Tour with name already exists" }) };
  await collection.insertOne(
    {
      name: name,
      isActive: active,
      competitions: []
    },
    async function (error, response) {
      if (error) {
        console.log(error)
        return { statusCode: 500, body: JSON.stringify({ message: "Failed to get from database" }) };
      }
      else {
        return { statusCode: 200, body: JSON.stringify({ message: "Tour created" }) };
      }
    });
}