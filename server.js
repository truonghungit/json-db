const jsonServer = require("json-server");
const fs = require("fs");
const server = jsonServer.create();
const router = jsonServer.router("db.json"); // <== Will be created later
const middlewares = jsonServer.defaults();
const port = 3200; // <== You can change the port

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  let rawdata = fs.readFileSync("./db.json");
  let student = JSON.parse(rawdata);
  res.jsonp(student);
});

server.use(router);

server.listen(port);
