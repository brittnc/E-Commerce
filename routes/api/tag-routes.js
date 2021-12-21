const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", (req, res) => {
  // FIND ALL TAGS
  
  Tag.findAll({
    include: {
      model: Product,
      attributes: ["product_name", "price", "stock", "category_id"],
    },
  })
    .then((tagData) => res.json(tagData))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

router.get("/:id", (req, res) => {
 
  Tag.findOne({
    where: {
      id: req.params.id,
    },
    include: {
      model: Product,
      attributes: ["product_name", "price", "stock", "category_id"],
    },
  })
    .then((tagData) => {
      if (!tagData) {
        res.status(404).json({ message: `No Tag found with this ID` });
        return;
      }
      res.json(tagData);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

router.post("/", (req, res) => {
  // CREAT A NEW TAG
  Tag.create({
    tag_name: req.body.tag_name,
  })
    .then((tagData) => {
      if (tagData) {
        res.status(200).json({ message: `Successfully Created Tag Name!!!` });
        return;
      }
      res.json(tagData);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

router.put("/:id", (req, res) => {
  // UPDATED TAGS `ID`
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tagData) => {
      if (!tagData) {
        res.status(404).json({ message: `No Tag found with this ID` });
        return;
      }
      res.json(tagData);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

router.delete("/:id", (req, res) => {
  // DELETE ON TAG
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((tagData) => {
      if (!tagData) {
        res.status(404).json({ message: `No Tag found with this ID` });
        return;
      }
      res.json(tagData);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

module.exports = router;