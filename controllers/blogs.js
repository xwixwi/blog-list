const router = require("express").Router();
const Blog = require("../models/blog");

router.get("/", async (request, response) => {
    response.json(await Blog.find({}).populate("user", {username: 1, name: 1}));
});

router.post("/", async (request, response) => {
    const user = request.user;
    if (user === undefined) {
        response.status(401).json({
            error: "invalid token"
        });
        return;
    }

    const body = request.body;

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    });
    const savedBlog = await blog.save();
    await savedBlog.populate("user", {username: 1, name: 1});

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
});

router.delete("/:id", async (request, response) => {
    const user = request.user;
    if (user === null) {
        response.status(401).json({
            error: "invalid token"
        });
        return;
    }

    const blog = await Blog.findById(request.params.id);
    if (user.id !== blog.user.toString()) {
        response.status(401).json({
            error: "invalid token"
        });
        return;
    }

    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
});

router.put("/:id", async (request, response) => {
    const user = request.user;
    if (user === null) {
        response.status(401).json({
            error: "invalid token"
        });
        return;
    }

    const blog = await Blog.findById(request.params.id);
    if (user.id !== blog.user.toString()) {
        response.status(401).json({
            error: "invalid token"
        });
        return;
    }

    const body = request.body;
    const edit = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    };
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, edit, {new: true, runValidators: true, context: "query"}).populate("user", {username: 1, name: 1});

    user.blogs = user.blogs.filter(id => id.toString() !== blog.id);
    await user.save();

    response.json(updatedBlog);
});

module.exports = router;