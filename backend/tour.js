let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
  let uri = process.env.DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const body = JSON.parse(event.body);
    await client.connect();
    switch (body.action) {
      case "getAll":
        return await getAll(client);
      case "addNewTour":
        return await addNewTour(client, event);
      case "deleteTour":
        return await deleteTour(client, event);
      case "updateTour":
        return await updateTour(client, event);
      case "setActiveTour":
        return await setActiveTour(client, event);
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

async function getAll(client) {
  try {
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .find({}).toArray();
    return { statusCode: 200, body: JSON.stringify({ result }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function addNewTour(client, event) {
  try {
    const body = JSON.parse(event.body);
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .insertOne({
        name: body.name,
        isActive: body.active,
        competitions: []
      });
    return { statusCode: 200, body: JSON.stringify({ message: result }) };
  }
  catch (e) {
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function deleteTour(client, event) {
  try {
    const body = JSON.parse(event.body);
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .deleteOne({ _id: ObjectId(body.id) })
    return { statusCode: 200, body: JSON.stringify({ message: result }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function updateTour(client, event) {
  try {
    const body = JSON.parse(event.body);
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .replaceOne({ _id: ObjectId(body.id) }, { "name": body.document.name, "isActive": body.document.isActive, "competitions": body.document.competitions })
    return { statusCode: 200, body: JSON.stringify({ message: result }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function setActiveTour(client, event) {
  try {
    const body = JSON.parse(event.body);
    const result_set_false = await client
      .db("gg-tour")
      .collection("tours")
      .updateMany({}, { $set: { isActive: false } });
    const result_set_true = await client
      .db("gg-tour")
      .collection("tours")
      .updateOne({ _id: ObjectId(body.id) }, { $set: { isActive: true } });
    return { statusCode: 200, body: JSON.stringify({ message: result_set_true }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}