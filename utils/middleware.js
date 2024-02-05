const jwt = require("jsonwebtoken");
const logger = require("./logger");
const User = require("../models/user");

const requestLogger = (request, response, next) => {
    logger.info("Mehtod:", request.method);
    logger.info("Path:", request.path);
    logger.info("Body:", request.body);
    logger.info("---");
    next();
};

const tokenExtractor = (request, response, next) => {
    const auth = request.get("authorization");
    if (auth && auth.startsWith("Bearer")) {
        request.token = auth.replace("Bearer ", "");
    }

    next();
};

const userExtractor = async (request, response, next) => {
    if (request.token !== undefined) {
        const token = jwt.verify(request.token, process.env.SECRET);
        if (token.id) {
            request.user = await User.findById(token.id);
        }
    }

    next();
};

const unknownEndpoint = (request, response) => {
    response.status(404).send({
        error: "unknown endpoint"
    });
};

const errorHandler = (error, request, response, next) => {
    logger.error(error.message);

    switch (error.name) {
    case "CastError": return response.status(400).send({
        error: "malformatted id"
    });
    case "ValidationError": return response.status(400).send({
        error: error.message
    });
    case "JsonWebTokenError": return response.status(400).send({
        error: error.message
    });
    }

    next(error);
};

module.exports = {
    requestLogger,
    tokenExtractor,
    userExtractor,
    unknownEndpoint,
    errorHandler
};