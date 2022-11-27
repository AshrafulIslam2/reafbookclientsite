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
function varifiyJwt(req, res, next) {
  const authheader = req.headers.authorization;
  if (!authheader) {
    return res.status(401).send("unathurize access");
  }
  const token = authheader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const Bookcatgoris = client.db("Readbook").collection("Catagoris");
    const bookUser = client.db("Readbook").collection("readbookuser");
    const BookingInfo = client.db("Readbook").collection("bookinginformation");
    const collection = client.db("Readbook").collection("addcollection");

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

    //show products seller wise
    try {
      app.get("/sellerproducts/:email", async (req, res) => {
        const email = req.params.email;
        const query = {};
        const catagories = await Bookcatgoris.find(query).toArray();
        const sellp = catagories.map((catagory) => {
          const products = catagory.products;
          const remainig = products.filter(
            (product) => product.salleremail === email
          );
          const sellproducts = remainig;

          return sellproducts;
        });

        res.status(200).send(sellp);
      });
    } catch (error) {}

    //addproducts for addvertise
    app.post("/advertise", async (req, res) => {
      const add = req.body;
      adcollection = await collection.insertOne(add);
      res.status(200).send(adcollection);
    });
    app.get("/advertise", async (req, res) => {
      const query = {};
      adcollection = await collection.find(query).toArray();
      res.status(200).send(adcollection);
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

    //get all user
    app.get("/user", async (req, res) => {
      const query = {};
      const allUser = await bookUser.find(query).toArray();
      res.status(200).send(allUser);
    });

    app.put("/user/admin/verify/:id/seller/:semail", async (req, res) => {
      //check user addmin or not
      const id = req.params.id;
      const selleremail = req.params.semail;
      const verifyemail = req.query.email;
      const query2 = { email: verifyemail };
      const admin = await bookUser.findOne(query2);
      if (admin?.role === "admin") {
        const query = { _id: ObjectId(id) };
        const option = { upsert: true };
        const updatedDoc = {
          $set: {
            varify: true,
          },
        };
        const result = await bookUser.updateOne(query, updatedDoc, option);
        const collectionUpdate = await Bookcatgoris.updateMany(
          {
            "products.salleremail": selleremail,
          },
          {
            $set: {
              "products.$[].buletick": true,
            },
          }
        );
        return res.status(200).send(result);
      }
    });

    //get user are admin or not
    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const adminUser = await bookUser.findOne(query);
      const role = adminUser?.role;
      res
        .status(200)
        .send({ isAdmin: adminUser?.role === "admin", role: role });
    });

    //check buyer
    app.get("/user/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const buyerUser = await bookUser.findOne(query);
      res.status(200).send({ isABuyer: buyerUser?.role === "buyer" });
    });

    //check seller
    app.get("/user/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const sellerUser = await bookUser.findOne(query);
      res.status(200).send({ isSeller: sellerUser?.role === "seller" });
    });

    app.delete("/user/:id", varifiyJwt, async (req, res) => {
      const email = req.query.email;
      const id = req.params.id;
      const decodedemail = req.decoded.email;
      console.log(decodedemail);
      if (decodedemail !== email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const admin = bookUser.findOne({ email: email });
      if (admin.role === "admin") {
        const deleteuser = await bookUser.findOneAndDelete({
          _id: ObjectId(id),
        });
        res.status(200).send({ message: "user Deleted successfully" });
      }

      const query = {};
      const allUser = await bookUser.find(query).toArray();
      res.status(200).send(allUser);
    });

    //save booking infor
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

    //Show all Booking Products
    try {
      app.get("/bookininfo", varifiyJwt, async (req, res) => {
        const email = req.query.email;
        // console.log(email);
        const decodedemail = req.decoded.email;
        // console.log(decodedemail);
        if (decodedemail !== email) {
          return res.status(403).send({ message: "forbidden access" });
        }

        const allbookings = await BookingInfo.find({
          customeremail: email,
        }).toArray();
        res.status(200).send(allbookings);
      });
    } catch (error) {
      console.log(error);
    }
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
