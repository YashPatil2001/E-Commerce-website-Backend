const User = require("../models/user");
const Order = require("../models/order");

exports.getUserById= (req,res,next,id)=>{
    User.findById(id).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                 error:"No user was found in DB"
            });
        }

        req.profile = user;
        next();
    });
}


exports.getUser = (req,res) => {
    //TODO:get back here for password.
   return res.json({
       _id :req.profile._id,
      name :req.profile.name,
      email:req.profile.email
   });
}

exports.updateUser = (req,res) =>{
    User.findByIdAndUpdate(
        {_id : req.profile._id},
        {$set: req.body},
        {new : true, userFindandModify:false},
        (err,user)=>{
            if(err){
                res.status(400).json({
                    error :"You are NOT authorise user."
            });
            }
            user.encry_password = undefined;
            user.salt = undefined;
            res.json(user);
        });
}


exports.userPurchaseList = (req,res) => {
       Order.find({user :req.profile._id})
       .populate('user','_id name')
       .exec((err ,order) => {
            if(err){
                return res.json({
                    error:"No Order is this Account"
                })
            }
            return res.json(order);
       });
}

exports.pushOrderInPurchaseList = (req ,res ,next) => {

    let purchases = [];
    req.body.order.products.forEach(product => {
         purchases.push({
             _id: product._id,
            name: product.name,
     description: product.description,
        category: product.category,
        quantity: product.quantity,
          amount: req.body.order.amount,
  transaction_id: req.body.order.transaction_id
         })


    //store this in DB
    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$push: {purchases :purchases}},
        {new: true},
        (err,purchase) => {
            if(err){
                return res.status(400).json({
                    error:"enable to save purchase list"
                })
            }
            next();
        }
    )

    });


//


    
}