const Product = require("../models/product")

const getAllProductsStatic = async (req, res) =>{
    const search = 'a'
    const products = await Product.find({price : {$lt:30}}).sort('price').select('name price').limit(4)
    res.status(200).json({products, nbHits : products.length})
}

const getAllProducts = async (req, res) =>{
    const {featured, company, name, sort, fields, numericFilters} = req.query
    const queryObject = {}

    //for querying 
    if(featured){
        queryObject.featured = featured === 'true' ? true : false
    }
    if(company){
        queryObject.company = company
    }
    //for searching
    if(name){
        queryObject.name = {$regex : name, $options : 'i'}
    }

    //numeric filters
    if(numericFilters){
        const operatorMap = {
            '>':'$gt',
            '>=':'$gte',
            '=':'$eq',
            '<':'$lt',
            '<=':'$lte',
        }

        const regEx = /\b(<|>|>=|=|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach(item => {
            const [field, operator, value]  = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]:Number(value)}
            }
        });
    }
    

    let result = Product.find(queryObject)
    //for sorting
    if(sort){
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    }else{
        result = result.sort('createdAt')
    }
   
    //for selecting specific fields
    if(fields){
        const fieldList = fields.split(',').join(' ')
        result = result.select(fieldList)
    }

    //pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    result = result.skip(skip).limit(limit)

    

    const products = await result
    res.status(200).json({products, nbHits : products.length})
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}