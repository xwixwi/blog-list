const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3
    },
    name: String,
    passwordHash: String,
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }]
});
schema.plugin(uniqueValidator);
schema.set("toJSON", {
    transform: (document, result) => {
        result.id = result._id.toString();
        delete result._id;
        delete result.__v;

        delete result.passwordHash;
    }
});

module.exports = mongoose.model("User", schema);