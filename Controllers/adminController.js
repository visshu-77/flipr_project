const productModel = require("../models/product");

const updateProduct = async(req,res)=>{
    try{
        const {
            productId
        } = req.params;
        const {
            name,
            price,
            category,
            description
        } = req.body;
        if(!(name || price || category || description)){
            return res.status(400).json({mesg:"fields should not be empty"});
        }
        const update = await productModel.findByIdAndUpdate(
            productId,
            {name,price,category,description},
            {new:true, runValidators:true}
        );
        if(!update){
            return res.status(400).json({mesg:"product not updated"});
        }
        return res.status(400).json({mesg:"product updated successfully"});
    }catch(err){
        console.log(err)
        return res.status(500).json({mesg:"Interal server error "});
    }
};

const deletData = async(req,res)=>{
    try{
        const{
            productId
        } = req.params;

        const check = await productModel.findOne({productId});
        if(!check){
            return res.status(400).json({mesg:"product is not found"});
        }

        const deleteTheData = await productModel.deleteOne({ productId: productId });
        if(!deleteTheData){
            return res.status(400).json({mesg:"product not deleted...please try again after some time"});
        }
        return res.status(400).json({mesg:"product deleted successfully"});
    }catch(err){
        console.log(err)
        return res.status(500).json({mesg:"Interal server error"});
    }
};

module.exports = {
    updateProduct,
    deletData,
}