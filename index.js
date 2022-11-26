const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 4000;
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
    const bookUser = client.db("Readbook").collection("readbookuser");
    const BookingInfo = client.db("Readbook").collection("bookinginformation");
    //Catagories for home modal
    app.get("/catagoris", async (req, res) => {
      const query = {};
      const catagoris = await Bookcatgoris.find(query).toArray();
      catagoris.map((catagory) => {
        const products = catagory.products;
        const limitedproducts = products.slice(0, 4);
        catagory.products = limitedproducts;
      });
      res.send(catagoris);
    });
    //Products Catagoirs wise
    app.get("/catagoris/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singalCatagories = await Bookcatgoris.findOne(query);
      res.send(singalCatagories);
    });
    //genrate JWT
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await bookUser.findOne(query);
      if (user && user.email) {
        const token = jwt.sign({ email }, process.env.SECRET_KEY, {
          expiresIn: "48h",
        });
        res.status(200).send({ accessToken: token });
      } else {
        res.status(403).send({ accessToken: "unathurize" });
      }
    });
    //save user with role
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await bookUser.insertOne(user);
      res.status(200).send(result);
    });
    app.post("/bookininfo", async (req, res) => {
      const bookinginfo = req.body;
      const query = {
        customeremail: bookinginfo.customeremail,
        productid: bookinginfo.productid,
      };
      const user = await BookingInfo.findOne(query);
      console.log(user);
      if (user) {
        const message = "You already Booked This book";
        return res.send({ acknowledge: false, message });
      } else {
        const saveBooking = await BookingInfo.insertOne(bookinginfo);
        res.send(saveBooking);
      }
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
