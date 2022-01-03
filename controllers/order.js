const { Order, ProductCart } = require("../models/order");


exports.getOrderById = (req ,res ,next ,id) => {
    Order.findById(id)
    .populate("products.product","name price")
    .exec((err ,order) => {
        if(err){
            return res.status(400).json({
                error:"No Order found in DB"
            });
        }
        req.order = order;
        next();
    });
}


// create order
exports.createOrder = (req ,res) => {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((err ,order) => {
        if(err){
            return res.status(400).json({
                error:"Failed to save order in DB"
            });
        }

        res.json(order);
    });
}

//read order

exports.getAllOrders = (req ,res) => {
    Order.find()
    .populate("user","_id name")
    .exec((err ,orders) => {
        if(err){
            return res.status(400).json({
                error:"No order found in DB"
            });
        }

        res.json(orders);
    })
}

//get status
exports.getOrderStatus = (req ,res) => {
    res.json(Order.schema.path("status").enumValues);
}

//update status
exports.updateStatus = (req ,res) => {
    Order.update(
        {_id: req.body.orderId},
        {$set:{status :req.body.status}},
        (err ,updatedOrder) => {
           if(err){
               return res.status(400).json({
                   error :`Failed to update status order`,
                   orderId : req.body.orderId
               });
           }
           res.json(updatedOrder);
        }
    );
}