import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app=express();
app.use(express.json({extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const MONGO_URI='mongodb://localhost:27017/clinic';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
    .then(()=>app.listen(PORT, ()=>console.log(`server running on port: ${PORT}`)))
    .catch((error)=>console.log(error.message))
