const jsonServer = require("json-server");

// const fs = require("fs");
const server = jsonServer.create();
const router = jsonServer.router("db.json"); // <== Will be created later
const middlewares = jsonServer.defaults();
// const port = process.env.PORT || 3000; // <== You can change the port

server.use(middlewares);
server.use(jsonServer.bodyParser);

// // Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.send("Server is running");
});

server.use(router);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("API running on http://localhost:", port);
});
