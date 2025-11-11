const dotenv = require("dotenv")
dotenv.config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")
const connectToMongo = require("./db/db");
const adminRoutes = require("./routes/admin.routes");
const storeRoutes = require("./routes/store.routes");
const tableRoutes = require("./routes/table.routes");
const itemRoutes = require("./routes/item.routes");
const orderRoutes = require("./routes/order.route");
const cloudinaryRoutes = require("./routes/cloudinary.routes");




connectToMongo();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

app.get("/" , (req,res) =>{
    res.send("hello world");
})

app.use("/admin" , adminRoutes);
app.use("/stores" , storeRoutes);
app.use("/cloudinary",cloudinaryRoutes);
app.use("/tables", tableRoutes);
app.use("/items", itemRoutes);
app.use("/orders", orderRoutes);





// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Internal Server Error" });
// });







module.exports = app;