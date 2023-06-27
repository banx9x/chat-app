const path = require("path");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const uploadAvatar = asyncHandler(async (req, res, next) => {
    if (req.user.avatar) {
        const ext = path.extname(req.user.avatar);
        const filename = path.basename(req.user.avatar, ext);
        await cloudinary.api.delete_resources([`avatars/${filename}`]);
    }

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    const result = await streamUpload(req);

    req.body.avatar = result.url;

    next();
});

module.exports = uploadAvatar;
