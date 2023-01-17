const ctrlWrapper = require('./ctrlWrapper');
const handleSchemaValidationError = require('./handleSchemaValidationError');
const RequestError = require('./RequestError');
const createNameFromEmail = require('./createNameFromEmail');
const transporter = require('./sendMail');
const createVerificationEmail = require('./createVerificationEmail');

module.exports = {
    ctrlWrapper,
    handleSchemaValidationError,
    RequestError,
    createNameFromEmail,
    transporter,
    createVerificationEmail,
};
