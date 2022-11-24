const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 4000;
//midale ware
app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://sayem:ashsay2525@nurit.m2znvdw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const database = client.db("Readbook").collection("Catagoris");
    // query for movies that have a runtime less than 15 minutes
    const query = {};
  } finally {
  }
}
run().catch(console.dir);
app.get("/read", (req, res) => {
  res.send("Wellcome my read book world");
});

//connection

app.listen(port, () => {
  console.log("Server Runnig successfully on port 4000 👌👌👌👌");
});
