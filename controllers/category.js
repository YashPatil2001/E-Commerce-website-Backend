const Category = require('../models/category');

exports.getCategoryById = (req ,res ,next ,id) => {
          Category.findById(id).exec((err ,cate) => {
                if(err){
                    res.status(400).json({
                        error :"Category NOT FOUND IN DB"
                    })
                }

                req.category = cate;
                next();
          });
}

exports.createCategory = (req, res) => {
    const category = new Category(req.body);
    category.save((err ,category) => {
        if(err || !category){
            return res.status(400).json({
                error : "Not able to save category in DB"
            })
        }
        return res.json({category});
    })
}

exports.getCategory = (req ,res) => {
    return res.json(req.category);
}

exports.getAllCategory = (req ,res) => {
    Category.find().exec((err,categories) => {
          if(err){
              return res.status(403).json({
                  error : "No Categories Not Found"
              });
          }

          res.json(categories);
    })
}

exports.updateCategory = (req,res) => {
    const category = req.category;
    category.name = req.body.name; 
    category.save((err ,updatedCategory) => {
         if(err){
             return res.json({
                 error:"Failed to  Update Category"
             });
         }

         return res.json(updatedCategory);
    });
}

exports.removeCategory = (req,res) => {
    const category = req.category;

    category.remove((err, removedCategory) => {
         if(err){
             return res.status(400).json({
                 error : `Failed to delete category : ${removedCategory}`
             });
         }
         res.json({
             message : `category Successfully Deleted`,
             
         });
    });
}