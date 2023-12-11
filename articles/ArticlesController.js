const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles});
    }); 
});

router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories});
    });
});

router.post("/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.create({
        title,
        slug: slugify(title).toLowerCase(),
        body,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });
});

router.post("/articles/delete", adminAuth, (req, res) => {
    var id = req.body.id;
    if (id != null) {
        if (!isNaN(id)) {
            Article.destroy({
                where: {
                    id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            })
        } else {
            res.redirect("/admin/articles");
        }
    } else {
        res.redirect("/admin/articles");
    }
});

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    Article.findByPk(id).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {article, categories});
            });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
});

router.post("/articles/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body
    var category = req.body.category;

    Article.update({title, body, categoryId: category, slug: slugify(title).toLowerCase()}, {
        where: {
            id
        }
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(err => {
        res.redirect("/");
    });
});

router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var offset = 0;
    var quant = 4;
 
    if (!isNaN(page)&&(parseInt(page)>1)) {
        offset = (parseInt(page) - 1) * quant;
    }

    Article.findAndCountAll({
        limit: quant,
        offset: offset,
        order: [
            ['id', 'DESC']
        ]
    }).then(articles => {
        var next;
        if (offset + quant >= articles.count) {
            next = false;
        } else {
            next = true;
        }
        var result = {
            page: parseInt(page),
            next,
            articles
        }
        Category.findAll().then(categories => {
            res.render("admin/articles/page", {result, categories});
        });
    });
});

module.exports = router;