const Product = require('../models/product');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');





exports.getProductById = (req ,res ,next ,id) => {
    Product.findById(id).exec((err ,product) => {
        if(err){
            return res.status(400).json({
                error :'Product Not Found of given Id'
            });
        }

        req.product = product;
        // console.log(req.product);
        next();
    })
}

exports.createProduct = (req ,res) => {
  
    const form = formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req ,(err, fields, file) => {
          if(err){
              return res.status(400).json({
                  error :"Problem with Image"
              });
          }

          const { name ,description ,price ,category ,stock } = fields;

          if(!name ||  !description || !price || !category || !stock ){
                return res.status(400).json({
                    error:"Please include All Fields"
                });
             }

         
          let product = new Product(fields);

          //Handle file here
          if(file.photo){
              if(file.photo.size > 3000000){
                  return res.status(400).json({
                      error :"File size too big"
                  });
              } 
               
              product.photo.data = fs.readFileSync(file.photo.path);
              product.photo.contentType = file.photo.type; 
            //   console.log(product); 
          }

          //saving product in DB
          product.save((err ,product) => {    
            if(err){
                return res.status(400).json({
                    error :"Saving tshirt in DB FAILED"
                });
            }

            res.json(product);
          });

          
    });
}

//read controller
exports.getProduct = (req ,res) => {
    // console.log(req.product);
    req.product.photo = undefined;
    return res.json(req.product);
}


//listing of all products
exports.getAllProducts = (req ,res) => {
    let limit = req.query.limit ? parseInt(req.query.limit): 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : _id;

    Product.find()
    .populate()
    .select('-photo')
    .sort([["sortBy",asc]])
    .limit(limit)
    .exec((err ,products) => {
        if(err){
            return res.status(400).json({
                error:"No Product found"
            });
        }
        res.json(products);
    })
}

exports.getAllUnqueCategories = (req ,res) => {
    Product.distinct("category" ,{} ,(err ,category) => {
        if(err){
            return res.status(400).json({
                error:"No category found"
            });
        }
        res.json(category);
    });
}


// update controller
exports.updateProduct = (req ,res) => {
    const form = formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req ,(err, fields, file) => {
          if(err){
              return res.status(400).json({
                  error :"Problem with Image"
              });
          }
         
          let product = req.product;
          product = _.extend(product ,fields);

          //Handle file here
          if(file.photo){
              if(file.photo.size > 3000000){
                  return res.status(400).json({
                      error :"File size too big"
                  });
              } 
               
              product.photo.data = fs.readFileSync(file.photo.path);
              product.photo.contentType = file.photo.type; 
            //   console.log(product); 
          }

          //saving product in DB
          product.save((err ,product) => {    
            if(err){
                return res.status(400).json({
                    error :"Updation of product FAILED"
                });
            }

            res.json(product);
          });

          
    });
}



//delete controller
exports.deleteProduct = (req ,res) => {
    let product = req.product;
    product.remove((err ,deletedProduct) => {
        if(err){
            return res.status(400).json({
                error :`failed to delete product ${req.product.name}`
            });
        }
        res.json({
            msg :"Deletion was success",
            deleteProduct : deletedProduct
        });
    });
}



//middleware
exports.photo = (req ,res ,next) => {
    if(req.product.photo.data){
        res.set("Content-Type",req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}


exports.updateStock = (req ,res ,next) => {
     let myOperations = req.body.order.products.map(prod => {
         return {
             updateOne : {
                 filter : {_id:prod._id},
                 update : {$inc :{stock: -prod.count ,sold: +prod.count}}
             }
         }
     });
     
     Product.bulkWrite(myOperations ,{} ,(err ,products) => {
         if(err){
             return res.status(400).json({
                 error :"bulk operation failed"
             });
         }
         next();
     });
}

