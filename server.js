const fs = require("fs");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const SECRET_KEY = "123456789";
const expiresIn = "3600";
const tokenType = "Bearer";

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err
  );
}

const auth = function (req, res, next) {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error in authorization format";
    res.status(status).json({ status, message });
    return;
  }
  try {
    verifyToken(req.headers.authorization.split(" ")[1]);
    next();
  } catch (err) {
    const status = 401;
    const message = "Error accessToken is revoked";
    res.status(status).json({ status, message });
  }
};

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use("/api", auth, router);

server.get("/status", (req, res) => {
  res.send("API is running");
});

server.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const rawData = fs.readFileSync("./accounts.json", "utf8");
  const accounts = JSON.parse(rawData) || [];
  const user = accounts.find((item) => item.email === email);

  if (!user) {
    const status = 401;
    const message = "Incorrect email or password";
    res.status(status).json({ status, message });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (validPassword) {
    const accessToken = createToken({ email, password });
    res.status(200).json({ accessToken, expiresIn, tokenType });
  } else {
    res.status(400).json({ error: "Incorrect email or password" });
  }
});

server.post("/register", async (req, res) => {
  console.log("body ", req.body);
  const user = req.body;

  if (!(user.email && user.password)) {
    return res.status(400).send({ error: "Data not formatted properly" });
  }

  const rawData = fs.readFileSync("./accounts.json", "utf8");
  try {
    const accounts = JSON.parse(rawData) || [];
    const isExisting = accounts.some((item) => item.email === user.email);

    if (isExisting) {
      return res
        .status(400)
        .send({ error: `User with email ${user.email} is existing` });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    accounts.push(user);
    fs.writeFileSync("./accounts.json", JSON.stringify(accounts, null, 2));

    res.status(200).json({ message: "Register account successfully" });
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("API running on http://localhost:", port);
});
