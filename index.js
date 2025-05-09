const express = require("express");
require("dotenv").config();
const cors = require("cors");

//Create an express app
const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

//MongoDB connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8eefy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        //Database and collections
        const db = client.db("furniroDB");
        const productCollection = db.collection("products");
        const userCollection = db.collection("users");
        const orderCollection = db.collection("orders");
        const reviewCollection = db.collection("reviews");
        const blogCollection = db.collection("blogs");

        //Routes

        //---------------User related routes-------------------
        //Post a user
        app.post("/addUser", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        //Get all users
        app.get("/allUsers", async (req, res) => {
            const users = await userCollection.find({}).toArray();
            res.send(users);
        });

        //Get a single user by email
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            res.send(user);
        });

        //-------------Product related api--------------------
        //Get all products
        app.get("/allProducts", async (req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products);
        });

        //Get a single product by id
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const product = await productCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(product);
        });

        //Post a product
        app.post("/addProduct", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        //Delete a product by id
        app.delete("/deleteProduct/:id", async (req, res) => {
            const id = req.params.id;
            const result = await productCollection.deleteOne({
                _id: new ObjectId(id),
            });
            res.send(result);
        });

        //-----------------Order related routed -------------------
        //post an order
        app.post("/addOrder", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        //Get orders by primaryEmail
        app.get("/orders/:email", async (req, res) => {
            const email = req.params.email;
            const orders = await orderCollection
                .find({ primaryEmail: email })
                .toArray();
            res.send(orders);
        });

        //Get all orders
        app.get("/allOrders", async (req, res) => {
            const orders = await orderCollection.find({}).toArray();
            res.send(orders);
        });

        //----------------------Blog related routes-----------------
        //Post a blog
        app.post("/addBlog", async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            res.send(result);
        });

        //Get all blogs
        app.get("/allBlogs", async (req, res) => {
            const blogs = await blogCollection.find({}).toArray();
            res.send(blogs);
        });

        //Get blogs by id
        app.get("/blog/:id", async (req, res) => {
            const id = req.params.id;
            const blog = await blogCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(blog);
        });

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

//Routes
app.use("/", (req, res) => {
    res.send({ welcomeMessage: "Furniro server is running" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
