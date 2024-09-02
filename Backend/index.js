const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { error } = require("console");

dotenv.config();

app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

app.use('/images', express.static('upload/images'));

// Product Schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

// User Schema
const Users = mongoose.model('Users', {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    cartData: { type: Object },
    date: { type: Date, default: Date.now },
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    console.log(token)
    if (!token) {
        return res.status(401).json({ errors: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'default_secret')
        console.log(data)
        req.user = data.user;
        next(); 
    } catch (error) {
        return res.status(401).json({ errors: "Please authenticate using a valid token" });
    }
};

// API Endpoints
app.post("/upload", upload.single('image'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const product = new Product({
            id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ success: true, id: req.body.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// User registration
app.post('/signup', async (req, res) => {
    

    let check = await Users.findOne({email:req.body.email})
    if(check){
        return res.status(400).json({success:false,errors:"existing user found"})

    }
    let cart ={}
    for(let i=0;i<300;i++){
        cart[i]=0
    }

    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
        await user.save();

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'default_secret');

        res.json({ success: true, token });
    })



// User login
app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });
        if (user && req.body.password === user.password) {
            const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'default_secret');
            return res.json({ success: true, token });
        } else {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add item to cart
app.post('/addtocart', fetchUser, async (req, res) => {
   let userData = await Users.findOne({_id:req.user.id})
   userData.cartData[req.body.itemId]+=1
   await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
   res.json({ success: true, message: "Item added to cart" })
});

// Remove item from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({_id:req.user.id})
   userData.cartData[req.body.itemId]-=1
   await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
   res.json({ success: true, message: "Item removed from cart" })
});

//creating endpoint to get cartdata
app.post('/getcart',fetchUser,async (req,res) =>{
    console.log("GetCart")
    let userData = await Users.findOne({_id:req.user.id})
    res.json(userData.cartData)
})

//creating endpoint for newcollection data
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({})
    let newcollection = products.slice(1).slice(-8)
    console.log("NewCollection fetched")
    res.send(newcollection)
})

//creating popular in women endpoint
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4)
    console.log("Popular in women fetched")
    res.send(popular_in_women)
})

app.listen(port, () => console.log(`Server is running on port ${port}`));
