const express = require("express");
const z = require("zod");
const User = require('../model/user.js');
const connectDB = require("../config/db.js");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const router = express.Router()
const ratelimiter = require("express-rate-limit")
const helmet = require("helmet")
var jsonParser = bodyParser.json()
connectDB();

const limiter = ratelimiter.rateLimit({
    windowMs: 15 * 60 * 1000,
    max:100
})

router.use(limiter)
router.use(helmet())
router.use(express.json({limit:"10kb"}))

const Use = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    password: z.string(),
})


router.post("/signup", jsonParser,async(req,res)=>{

 
  
    const {success} = Use.safeParse(req.body);
    if (!success){
        res.json({
            message:"input is invalid"
        })
    }
    
    const present = await User.findOne({email:req.body.email})

    if(present){
        res.json({
            message:"email already exists"
        })
    }

    const newUser = new User({
    firstname : req.body.firstname,
    lastname : req.body.lastname,                   
    email : req.body.email,
    password : req.body.password,
    role : "viewer"
    });

    const role = await newUser.save()
                                                                
    const userId = role._id;
    console.log(userId);
    const Token = jwt.sign({userId},JWT_SECRET);

    res.json({
        message:"user created successfully",
        Token:Token
    })

    
})


const case2 = z.object({
    email:z.string().email(),
    password:z.string(),
})

router.post("/signin",jsonParser,async(req,res)=>{
   
    const {success} = case2.safeParse(req.body);
    if(!success){
         return res.json({
            message:"input is invalid"
        })
    }

    const validity = await User.findOne({email:req.body.email,password:req.body.password})

    if(validity){
        
        const token = jwt.sign(
            {userId:validity._id},
            JWT_SECRET);

        res.json({
            token:token
        })
        
    }else{

    res.status(411).json({
        message:"Error while logging in"
    })
   }
})

router.use((err, req, res, next) => {
    console.error("Error:", err.message)

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: "Invalid JSON format"
        })
    }

    res.status(500).json({
        message: "Internal server error"
    })
})

module.exports = router;