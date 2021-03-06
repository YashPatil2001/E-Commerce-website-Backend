
const User=require('../models/user');
const { check , validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');


exports.signup=(req,res)=>{

    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            error:errors.array()[0].msg,
            paramter:errors.array()[0].param
        });
    }


   const user=new User(req.body);
   user.save((err,usr)=>{
       if(err){
           return res.status(400).json({
               err:"Not able to save user in DB"
           })
       }
       res.json({
           name:usr.name,
           lastname:usr.lastName,
           email:usr.email,
           _id:usr.id
       });
   });
};


exports.signin=(req,res)=>{
    const {email,password} = req.body;

    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            error:errors.array()[0].msg,
            paramter:errors.array()[0].param
        });
    }

    User.findOne({email},(err,user)=>{
          if(err || !user){
              return res.status(402).json({
                  error:"User email does not exist"
              });
          }
          if(!user.authenticate(password)){
              return res.status(401).json({
                  error:"email and password do not match"
              });
          }
        
        // create token
        const token=jwt.sign({_id: user._id},process.env.SECRET)
        //put token in cookie
        res.cookie("token", token , {expire : new Date()+ 9999});

        //send reponse to frontend
        const {_id ,name ,email ,role} = user;
        return res.json({token, user:{_id,name,email,role}});
    });

};


exports.signout=(req,res)=>{

    res.clearCookie("token");
    res.json({
        msg:"User Signout Successfully"
    });
};

//protected routes
exports.isSignedIn=expressJwt({
    secret : process.env.SECRET,
    userProperty : "auth",
});

//custom middlewares
exports.isAuthenticated=(req,res,next) => {
    let checker=req.profile && req.auth && req.profile._id == req.auth._id;
    // console.log("req.profile :" , req.profile );
    if(!checker){
       return  res.status(403).json({
            error:"Access Denied"
        })
    }
    next();
}

exports.isAdmin=(req,res,next) => {
    if(req.profile.role === 0){
        return res.status(403).json({
            error : "Access Denied,You are not Admin"
        })
    }
    next();
}






