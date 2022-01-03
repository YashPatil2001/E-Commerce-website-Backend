const mongoose=require('mongoose');
const crypto=require('crypto');
const uuidv1=require('uuid/v1');
const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required:true,
        maxlength:32,
        trim:true
    },
    lastname: {
        type: String,
        maxlength:32,
        trim:true,
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
    },

    usrinfo:{
        type:String,
        trim:true
    },
    //TODO:comeback here
    encry_password:{
        type:String,
        required:true,
    },
    salt:{
        type:String,
    },
    role:{
        type:Number,
        default:0,
    },
    purchases:{
        type:Array,
        default:[]
    }

},{timestamps:true});


userSchema.virtual("password")
    .set(function(password){
        this._password=password;
        this.salt=uuidv1();
        this.encry_password=this.securePassword(password);
    })
    .get(function(){
        return this._password;
    });

userSchema.methods={


    authenticate:function(plainpassword){
            return this.securePassword(plainpassword)===this.encry_password;
    },
    securePassword:function(plainpassword){
        if(!plainpassword) return "";
        try{
            return crypto
            .createHmac("sha256",this.salt)
            .update(plainpassword)
            .digest("hex");
        }catch(err){
            return "";
        }
    }
}

module.exports=mongoose.model('User',userSchema);

//   const userSchema = new Schema({
//     title:  String, // String is shorthand for {type: String}
//     author: String,
//     body:   String,
//     comments: [{ body: String, date: Date }],
//     date: { type: Date, default: Date.now },
//     hidden: Boolean,
//     meta: {
//       votes: Number,
//       favs:  Number
//     }
//   });