const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// `/api/products` endpoint

// get all products
router.get("/", (req, res) => {
    // FIND ALL PRODUCTS
    // BE SURE TO INCLUDE ITS ASSOCIATED CATEGORY AND TAG DATA
    Product.findAll({
        attributes: ["id", "product_name", "price", "stock"],
        include: [
            {
                model: Category,
                attributes: ["category_name"],
            },
            {
                model: Tag,
                attributes: ["tag_name"],
            },
        ],
    })
        .then((productData) => res.json(productData))
        .catch((error) => {
            res.status(500).json(error);
        });
});

// GET ON PRODUCT
router.get("/:id", (req, res) => {
    // FIND A SINGLE PRODUCT BY ITS `ID`
    // INCLUDE ITS ASSOCIATED CATEGORY AND TAG DATA
    Product.findOne({
        where: {
            id: req.params.id,      
        },
        attributes: ["id", "product_name", "price", "stock"],
        include: [
            {
                model: Category,
                attributes: ["category_name"],         
            },
            {
                model: Tag,
                attributes: ["tag_name"],
            },
        ],
    })
        .then((productData) => {
            if (!productData) {
                res.status(404).json({ message: `No Product found with this ID` });
                return;
            }
            res.json(productData);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json(error);
        });
});

// CREATE NEW PRODUCT
router.post("/", (req, res) => {
    /* req.body should look like this...
     {
         product_name: "Basketball",
         price: 200.00,
         stock: 3,
         tagIds: [1, 2, 3, 4]
     }
     */
    Product.create({
        product_name: req.body.product_name,
        price: req.body.price,
        stock: req.body.stock,
        category_id: req.body.category_id,
        tagIds: req.body.tagIds,
    })
        .then((product) => {
            if(req.body.tagIds.length) {
                const productTagIdArr = req.body.tagIds.map((tag_id) => {
                    return {
                        product_id: product.id,
                        tag_id,
                    };
                });
                return ProductTag.bulkCreate(productTagIdArr);
            }
            res.status(200).json(product);
        })
        .then((productTagIds) => res.status(200).json(productTagIds))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

//UPDATE PRODUCT
router.put("/:id", (req, res) => {
    //UPDATE DATA
    Product.update(req.body, {
        where: {
            id: req.params.id,
        },
    })
    .then ((product) => {
        // FIND ASSOCIATED TAGS FROM PRODUCT TAGS
        return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
        //GET LIST OF CURRENT TAGS
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        // CREATE FILTERED LIST OF NEW TAG_IDS
        const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
                return {
                    product_id: req.params.id,
                    tag_id,
                };
            });
            // FIGURE OUT WHICH ONES TO REMOVE
            const productTagsToRemove = productTags
                .filter(({ tag_id }) => !req.body.tagIds.include(tag_id))
                .map(({ id }) => id);

            //RUN BOTH ACTIONS
            return Promise.all([
                ProductTag.destroy({ where: { id: productTagsToRemove } }),
                ProductTag.bulkCreate(newProductTags),
            ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
        res.status(400).json(err);
    });
});

router.delete("/:id", (req, res) => {
    // delete 1 product buy `id` value
    Product.destroy({
        where: {
            id: req.params.id,
        },
    })
    .then((productData) => {
        if (!productData) {
            res.status(404).json({ message: `No Product found with this ID` })
            return;
        }
        res.json(productData);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).json(error);
    });
});

module.exports = router;