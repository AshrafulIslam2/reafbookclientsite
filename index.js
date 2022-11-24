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
    const Bookcatgoris = client.db("Readbook").collection("Catagoris");
    app.get("/catagoris", async (req, res) => {
      const query = {};
      const catagoris = await Bookcatgoris.find(query).toArray();
      catagoris.map((catagory) => {
        const products = catagory.products;
        const limitedproducts = products.slice(0, 4);
        console.log(limitedproducts);
        catagory.products = limitedproducts;
      });
      res.send(catagoris);
    });
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
