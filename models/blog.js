const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: String,
    url: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});
schema.set("toJSON", {
    transform: (document, result) => {
        result.id = result._id.toString();
        delete result._id;
        delete result.__v;
    }
});

module.exports = mongoose.model("Blog", schema);