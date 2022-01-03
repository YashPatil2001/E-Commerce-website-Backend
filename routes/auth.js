var express = require('express')
var router = express.Router();
const {signout,signup,signin, isSignedIn} =require('../controllers/auth');
const { check , validationResult } = require('express-validator');


router.post('/signup',[
    check('name','name should be at least 3 characters').isLength({ min :3 }),
    check('email','email is required').isEmail(),
    check('password','password should at least 4 characters').isLength({min:4}),

],signup);

router.post('/signin',[
    check('email','email is required').isEmail(),
    check('password','password field is required').isLength({min:4}),

],signin);


router.get('/signout',signout);
router.get('/testRoute',isSignedIn,(req,res)=>{
    res.json(req.auth);
});

module.exports=router;