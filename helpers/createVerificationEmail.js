const { META_USER, BASE_URL } = process.env;

const createVerificationEmail = ({ recipient, verificationToken }) => {
    return {
        from: META_USER,
        to: recipient,
        subject: 'Email verification',
        html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify</a>`,
    };
};

module.exports = createVerificationEmail;
