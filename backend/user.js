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
    const collection = await db.collection("users");

    switch (body.action) {
      case "register":
        return await register(collection, body.email, body.password);
      case "login":
        return await login(collection, body.email, body.password);
      case "logout":
        // code block
        break;
      case "authenticate":
        // code block
        break;
      default:
      // code block
    }
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to get from database" }) };
  }
  finally {
    await client.close();
  }
}

async function login(collection, email, password) {
  console.log("login with password: " + password)
  const user = await collection.findOne({ email: email });
  console.log(user.password)
  if (!user) return { statusCode: 404, body: JSON.stringify({ authorized: false, message: "Användare är ej registrerad" }) };
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) return { statusCode: 403, body: JSON.stringify({ authorized: false, message: "Fel email eller lösenord" }) };
  let token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '24h' });
  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": ['token=' + token + ';httpOnly;']
    },
    body: JSON.stringify({ authorized: true, message: "Autentisering lyckad" })
  };
}

async function register(collection, email, password) {
  const user = await collection.findOne({ email: email });
  if (user) return { statusCode: 409, body: JSON.stringify({ authorized: false, message: "Email är redan registrerad" }) };
  db.collection('users').insertOne({
    email: email,
    username: username,
    password: bcrypt.hashSync(password, 10),
    isAdmin: false
  }, function (error, response) {
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ authorized: false, message: "Databasfel, försök igen senare" }) };
    }
    else {
      let token = jwt.sign({ id: response.insertedId }, process.env.SECRET, { expiresIn: '1h' });
      return {
        statusCode: 200,
        headers: {
          "Set-Cookie": ['token=' + token + ';httpOnly;']
        },
        body: JSON.stringify({ authorized: true, message: "Autentisering lyckad" })
      };
    }
  });
};