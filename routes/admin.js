const express = require("express");
const z = require("zod");
const connectDB = require("../config/db.js");
require("dotenv").config();
const User = require('../model/user.js');
const Record = require("../model/records.js")
const bodyParser = require("body-parser");
const authmiddleware = require("../middleware/authentication.js")
const authorize = require("../middleware/authorize.js")
const router = express.Router()
const jwt = require("jsonwebtoken");
var jsonParser = bodyParser.json()
const ratelimiter = require("express-rate-limit")
const helmet = require("helmet")
const mongoose = require("mongoose");
const JWT_SECRET = process.env.JWT_SECRET
connectDB();

const limiter = ratelimiter.rateLimit({
    windowMs: 15 * 60 * 1000,
    max:100
})

router.use(limiter)
router.use(helmet())
router.use(express.json({limit:"10kb"}))

// CRUD Admin for users

const Use = z.object({
    id: z.string().refine(
    (val) => mongoose.Types.ObjectId.isValid(val),
    {message: "Invalid ObjectId"}
    )
})

router.put("/update/user/:id", jsonParser,authmiddleware,authorize("admin"),async(req,res)=>{

    const {success} = Use.safeParse(req.params);
    if (!success){
        res.json({
            message:"input is invalid"
        })
    }else{
    const filter = {_id:req.params.id};

    const arr = {
    $set:{
    role:req.body.role,
    }
    };

    const result = await User.updateOne(filter, arr);

    res.json({
        message:"role updated successfully!"
    })
}
})

router.delete("/delete/user/:id",jsonParser,authmiddleware,authorize("admin"),async(req,res) => {

    const paramValidation = Use.safeParse(req.params);

    if(!paramValidation.success){
        res.json({
            message:"Input is not valid"
        })
    }else{
    const id = req.params.id;
    const present = await User.findByIdAndDelete(id);

    res.json({
    message:"user deleted successfully"
    })
}
});

router.get("/read/user",jsonParser,authmiddleware,authorize("admin"),async(req,res) => {

    try{
    const gotit = await User.find();
    res.send(gotit);
    }catch(err){
        console.log(err);
        res.status(500).send("error retrieving data");
    }
})


const check = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    password: z.string(),
})


router.post("/create/user", jsonParser,authmiddleware,authorize("admin"),async(req,res)=>{

    const {success} = check.safeParse(req.body);
    if (!success){
        res.json({
            message:"input is invalid"
        })
    }
    
    const present = await User.findOne({email:req.body.email})

    if(present){
        res.json({
            message:"user already exists"
        })
    }

    const newUser = new User({
    firstname : req.body.firstname,
    lastname : req.body.lastname,                   
    email : req.body.email,
    password : req.body.password,
    role : req.body.role
    });

    const role = await newUser.save()
                                                                
    const userId = role._id;
    console.log(userId);
    const Token = jwt.sign({userId},JWT_SECRET);

    res.json({
        message:"user created successfully by admin",
        Token:Token
    })

})

// View → all roles
router.get("/records", jsonParser,authmiddleware, authorize("viewer", "analyst", "admin"), async(req,res)=>{

    try {
    const { Type, Category, startDate, endDate } = req.query;

    let filter = {};

    if (Type) filter.Type = Type;
    if (Category) filter.Category = Category;

    if (startDate && endDate) {
      filter.Date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Record.find(filter);

    res.json(records);

  } catch (err) {
    res.status(500).json({ message: "Error fetching records" });
  }

});


const che = z.object({
  amount: z.number().positive("Amount must be positive"),

  type: z.enum(["income", "expense"]),

  category: z.string().min(1, "Category is required"),

  date: z.coerce.date().optional(), // we’ll convert to Date later

  description: z.string().optional()
})
// Create → admin only
router.post("/create/records", jsonParser,authmiddleware, authorize("admin"), async(req,res)=>{
    
    const {success} = che.safeParse(req.body);
    if (!success){
        res.json({
            message:"input is invalid"
        })
    }

    const present = await Record.findOne({Amount:req.body.amount,Type:req.body.type,Category:req.body.category,Date:req.body.date,Description:req.body.description})

    if(present){
        res.json({
            message:"record already exists"
        })
    }else{

    const newRecord = new Record({
   Amount:req.body.amount,
   Type:req.body.type,
   Category:req.body.category,
   Description:req.body.description,
    });

    const role = await newRecord.save()
    
    res.json({
        message:"record created successfully",
    })
}
});

// Update → admin only
router.put("/update/records/:id", jsonParser,authmiddleware, authorize("admin"), async(req,res)=>{

    const paramValidation = Use.safeParse(req.params);
    const bodyValidation = che.safeParse(req.body);
    if (!paramValidation.success || !bodyValidation.success){
        res.json({
            message:"input is invalid"
        })
    }else{

    const filter = {_id:req.params.id};

    const arr = {
    $set:{
   Amount:req.body.amount,
   Type:req.body.type,
   Category:req.body.category,
   Date:req.body.date,
   Description:req.body.description,
    }
    };

    const result = await Record.updateOne(filter, arr);

    if (result){
    res.json({
        message:"record updated successfully!"
    })
}
    }
});

// Delete → admin only
router.delete("/delete/records/:id", jsonParser,authmiddleware, authorize("admin"), async(req,res)=>{

     const paramValidation = Use.safeParse(req.params);

    if(!paramValidation.success){
        res.json({
            message:"Input is not valid"
        })
    }else{
    const id = req.params.id;
    const present = await Record.findByIdAndDelete(id);

    res.json({
    message:"Record deleted successfully"
    })
}

});

// Dashboard Summary

router.get("/dashboard/summary", jsonParser,authmiddleware, authorize("analyst","admin"), async (req, res) => {
   try {
      // 1. TOTAL INCOME & EXPENSE (Aggregation)
      const totals = await Record.aggregate([
        {
          $group: {
            _id: "$Type",
            total: { $sum: "$Amount" }
          }
        }
      ]);

      let totalIncome = 0;
      let totalExpense = 0;

      totals.forEach(t => {
        if (t._id === "income") totalIncome = t.total;
        if (t._id === "expense") totalExpense = t.total;
      });

      const netBalance = totalIncome - totalExpense;

      // 2. CATEGORY-WISE TOTALS
      const categoryTotals = await Record.aggregate([
        {
          $group: {
            _id: "$Category",
            total: { $sum: "$Amount" }
          }
        }
      ]);

      // 3. RECENT ACTIVITY (last 5)
      const recentActivity = await Record.find()
        .sort({ Date: -1 })
        .limit(5);

      // 4. MONTHLY TRENDS
      const monthlyTrends = await Record.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$Date" },
              month: { $month: "$Date" }
            },
            total: { $sum: "$Amount" }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      // 5. WEEKLY TRENDS (BONUS 🔥)
      const weeklyTrends = await Record.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$Date" },
              week: { $week: "$Date" }
            },
            total: { $sum: "$Amount" }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.week": 1 }
        }
      ]);

      // FINAL RESPONSE
      return res.json({
        totalIncome,
        totalExpense,
        netBalance,
        categoryTotals,
        recentActivity,
        monthlyTrends,
        weeklyTrends
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Dashboard error"
      });
    }
});


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