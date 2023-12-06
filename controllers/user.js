const logger = require("../logger");
const User = require("../models/user");

exports.getUserProfile = async(req, res) => {
    let userId = req.params.userId

    if(!userId) {
        logger.error("User not found");
        return res.status(404).json({
            error: "User not found"
        });
    }

    try{
        var user = await User.findById(userId)
        .select("-encry_password -salt")
        if(!user) {
            logger.error("User not found");
            return res.status(404).json({
                error: "User not found"
            });
        }
        logger.info("User found");
        return res.json({
            status: true,
            user
        });
    }catch(err) {
        logger.error("Something went wrong");
        return res.status(500).json({
            status: false,
            error: "Something went wrong"
        });
    }
}

exports.getSelfProfile = async(req, res) => {
    try {
        const userData = await User.findById(req.auth._id)
        .select("-encry_password -salt")
        logger.info("User found");
        return res.json({
            status: true,
            user: userData
        })
    } catch (error) {
        logger.error(error);
        return res.status(500).json({
            status: false,
            error: "Something went wrong"
        })
    }

}

exports.getAllUsers = async(req, res) => {
    try{
        var users = await User.find()
        .select("-encry_password -salt")
    }catch(err) {
        logger.error("Users not found");
        return res.status(400).json({
            error: "Users not found"
        });
    }
    logger.info("Users found");
    return res.json({
        status: true,
        users
    });
}
