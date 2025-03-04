const { User } = require('../models');
const {
    RequestError,
    createNameFromEmail,
    transporter,
    createVerificationEmail,
} = require('../helpers');
const gravatar = require('gravatar');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuid } = require('uuid');

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async ({ email, password }) => {
    const userExists = await User.findOne({ email });

    if (userExists) throw RequestError(409, 'Email in use');

    const avatarURL = gravatar.url(email, { protocol: 'https' });
    const user = new User({ email, avatarURL });
    const verificationToken = uuid();

    user.setPassword(password);
    user.setVerificationToken(verificationToken);
    const newUser = await user.save();

    const mail = createVerificationEmail({
        recipient: newUser.email,
        verificationToken,
    });
    await transporter.sendMail(mail);

    return {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
    };
};

const verify = async verificationToken => {
    const user = await User.findOne({ verificationToken });

    if (!user) throw RequestError(404, 'Not found');

    user.setVerify(true);
    user.setVerificationToken('');
    await user.save();

    return 'Verification successful';
};

const resendVerificationEmail = async email => {
    const user = await User.findOne({ email });

    if (!user) throw RequestError(404, 'Not found');
    if (user.verify)
        throw RequestError(400, 'Verification has already been passed');

    const mail = createVerificationEmail({
        recipient: email,
        verificationToken: user.verificationToken,
    });

    await transporter.sendMail(mail);

    return 'Verification email sent';
};

const logIn = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw RequestError(404, 'Not found');

    if (!user.validatePassword(password))
        throw RequestError(401, 'Email or password is wrong');

    if (!user.verify) throw RequestError(403, 'Email not verified');

    user.setToken({ id: user.id });

    const loggedInUser = await user.save();

    return {
        token: loggedInUser.token,
        user: {
            email: loggedInUser.email,
            subscription: loggedInUser.subscription,
        },
    };
};

const logOut = async id => {
    const user = await User.findById(id);
    if (!user) throw RequestError(401, 'Not authorized');

    user.deleteToken();
    await user.save();
};

const listCurrent = async id => {
    const user = await User.findById(id, 'email subscription');
    if (!user) throw RequestError(401, 'Not authorized');

    return user;
};

const updateSubscription = async (id, subscription) => {
    const user = await User.findByIdAndUpdate(id, subscription, {
        new: true,
    });
    if (!user) throw RequestError(401, 'Not authorized');

    return user;
};

const updateAvatar = async (tempUpload, originalname, id, email) => {
    const fileName = createNameFromEmail(email, originalname);
    const resultUpload = path.join(avatarsDir, fileName);
    try {
        const avatar = await Jimp.read(tempUpload);
        await avatar.resize(250, 250).write(resultUpload);
        await fs.unlink(tempUpload);

        const avatarURL = path.join('public', 'avatars', fileName);

        const user = await User.findByIdAndUpdate(
            id,
            { avatarURL },
            { new: true },
        );
        if (!user) throw RequestError(401, 'Not authorized');

        return { avatarURL: user.avatarURL };
    } catch (error) {
        await fs.unlink(tempUpload);
        throw error;
    }
};

module.exports = {
    register,
    verify,
    resendVerificationEmail,
    logIn,
    logOut,
    listCurrent,
    updateSubscription,
    updateAvatar,
};
