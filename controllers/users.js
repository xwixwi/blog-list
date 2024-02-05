const bcrypt = require("bcrypt");
const router = require("express").Router();
const User = require("../models/user");

router.get("/", async (request, response) => {
    response.json(await User.find({}).populate("blogs", {title: 1, author: 1, url: 1, likes: 1}));
});

router.post("/", async (request, response) => {
    const {username, name, password} = request.body;

    if (password === undefined || password.length < 3) {
        response.status(400).send({
            error: "password must contain at least 3 characters"
        });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        username: username,
        name: name,
        passwordHash : passwordHash,
        blogs: []
    });

    response.status(201).json(await user.save());
});

module.exports = router;