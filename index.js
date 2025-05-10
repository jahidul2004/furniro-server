const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri =
    process.env.MONGODB_URI ||
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8eefy.mongodb.net/furniroDB?retryWrites=true&w=majority`;

// Connection caching for serverless
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });

    try {
        await client.connect();
        const db = client.db("furniroDB");

        cachedClient = client;
        cachedDb = db;

        return { client, db };
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});

//--------------- User Routes ---------------
app.post("/addUser", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const user = req.body;
        const result = await db.collection("users").insertOne(user);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/allUsers", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const users = await db.collection("users").find({}).toArray();
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/user/:email", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const email = req.params.email;
        const user = await db.collection("users").findOne({ email: email });
        res.send(user || { error: "User not found" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

//------------- Product Routes -------------
app.get("/allProducts", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const products = await db.collection("products").find({}).toArray();
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/product/:id", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const id = req.params.id;
        const product = await db.collection("products").findOne({
            _id: new ObjectId(id),
        });
        res.send(product || { error: "Product not found" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.post("/addProduct", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const product = req.body;
        const result = await db.collection("products").insertOne(product);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.delete("/deleteProduct/:id", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const id = req.params.id;
        const result = await db.collection("products").deleteOne({
            _id: new ObjectId(id),
        });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

//------------- Order Routes -------------
app.post("/addOrder", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const order = req.body;
        const result = await db.collection("orders").insertOne(order);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/orders/:email", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const email = req.params.email;
        const orders = await db
            .collection("orders")
            .find({ primaryEmail: email })
            .toArray();
        res.send(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/allOrders", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const orders = await db.collection("orders").find({}).toArray();
        res.send(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/pendingOrders", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const orders = await db
            .collection("orders")
            .find({ status: "pending" })
            .toArray();
        res.send(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/completedOrders", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const orders = await db
            .collection("orders")
            .find({ status: "completed" })
            .toArray();
        res.send(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/cancelledOrders", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const orders = await db
            .collection("orders")
            .find({ status: "cancelled" })
            .toArray();
        res.send(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.put("/updateOrder/:id", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const id = req.params.id;
        const status = req.body.status;
        const result = await db
            .collection("orders")
            .updateOne({ _id: new ObjectId(id) }, { $set: { status: status } });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/orderStats", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const stats = await db
            .collection("orders")
            .aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ])
            .toArray();
        res.send(stats);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/orderAmountStats", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const stats = await db
            .collection("orders")
            .aggregate([
                {
                    $group: {
                        _id: "$status",
                        totalAmount: { $sum: "$totalPrice" },
                    },
                },
            ])
            .toArray();
        res.send(stats);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

//------------- Blog Routes -------------
app.post("/addBlog", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const blog = req.body;
        const result = await db.collection("blogs").insertOne(blog);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/allBlogs", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const blogs = await db.collection("blogs").find({}).toArray();
        res.send(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/blog/:id", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const id = req.params.id;
        const blog = await db.collection("blogs").findOne({
            _id: new ObjectId(id),
        });
        res.send(blog || { error: "Blog not found" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.delete("/deleteBlog/:id", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const id = req.params.id;
        const result = await db.collection("blogs").deleteOne({
            _id: new ObjectId(id),
        });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/blogCategoryCount", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const blogs = await db
            .collection("blogs")
            .aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                    },
                },
            ])
            .toArray();
        res.send(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

//------------- Review Routes -------------
app.post("/addReview", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const review = req.body;
        const result = await db.collection("reviews").insertOne(review);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/reviews/:productId", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const productId = req.params.productId;
        const reviews = await db
            .collection("reviews")
            .find({ productId: productId })
            .toArray();
        res.send(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

app.get("/documentCount", async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const [productCount, orderCount, userCount, reviewCount, blogCount] =
            await Promise.all([
                db.collection("products").countDocuments(),
                db.collection("orders").countDocuments(),
                db.collection("users").countDocuments(),
                db.collection("reviews").countDocuments(),
                db.collection("blogs").countDocuments(),
            ]);

        res.send({
            productCount,
            orderCount,
            userCount,
            reviewCount,
            blogCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// Root route
app.get("/", (req, res) => {
    res.send("Furniro server is running");
});

// Start server (only if not in Vercel environment)
if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

// Export for Vercel
module.exports = app;
