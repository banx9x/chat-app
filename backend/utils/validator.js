const validator = require("express-joi-validation").createValidator({
    passError: true,
    statusCode: 400,
});

module.exports = validator;
