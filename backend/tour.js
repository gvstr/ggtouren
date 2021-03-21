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
      case "updateCompetition":
        return await updateCompetition(client, event);
      case "addNewCompetition":
        return await addNewCompetition(client, event);
      case "deleteCompetition":
        return await deleteCompetition(client, event);
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
      .replaceOne(
        { _id: ObjectId(body.id) }, {
        "name": body.document.name,
        "isActive": body.document.isActive,
        "competitions": body.document.competitions
      })
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
    let collection = await client.db("gg-tour").collection("tours");
    await collection.updateMany({}, { $set: { isActive: false } })
    await collection.updateOne({ _id: ObjectId(body.tourId) }, { $set: { isActive: true } });
    return { statusCode: 200, body: JSON.stringify({ message: "something" }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function updateCompetition(client, event) {
  try {
    const body = JSON.parse(event.body);
    console.log(body)
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .updateOne(
        { _id: ObjectId(body.tourId) },
        {
          $set: {
            "competitions.$[i].location": body.location,
            "competitions.$[i].date": body.date,
            "competitions.$[i].starttime": body.starttime,
            "competitions.$[i].status": body.status,
            "competitions.$[i].players": body.players
          },
        },
        {
          arrayFilters: [
            {
              "i._id": ObjectId(body.competitionId)
            }
          ]
        });
    console.log(`matched: ${result.result.n} modified: ${result.result.nModified} ok: ${result.result.ok}`)
    return { statusCode: 200, body: JSON.stringify({ message: result }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function addNewCompetition(client, event) {
  try {
    const body = JSON.parse(event.body);
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .updateOne(
        { _id: ObjectId(body.tourId) },
        {
          $push: {
            competitions: {
              _id: ObjectId(),
              location: body.location,
              date: body.date,
              starttime: body.starttime,
              status: body.status,
              players: body.players
            }
          }
        }
      );
    return { statusCode: 200, body: JSON.stringify({ message: result }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}

async function deleteCompetition(client, event) {
  try {
    const body = JSON.parse(event.body);
    const result = await client
      .db("gg-tour")
      .collection("tours")
      .updateOne(
        { _id: ObjectId(body.tourId) },
        { $pull: { competitions: { _id: ObjectId(body.competitionId) } } }
      );
    return { statusCode: 200, body: JSON.stringify({ message: result }) };
  }
  catch (e) {
    console.log(e)
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
}