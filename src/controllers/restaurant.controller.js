const Restaurant = require("../models/restaurant.model");
const APIError = require("../utils/APIError");
const APIResponse = require("../utils/APIResponse");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { uploadToCloudinary } = require("../utils/cloudinary");
const User = require("../models/user.model");

// ----------------------- emails section starts here ----------------------------------

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mubashir2u@gmail.com",
        pass: process.env.EMAIL_PASSWORD,
    },
});


const sendWelcomeEmail = async (data) => {
    const { restaurantName, email } = data;
    const htmlFilePath = path.join(
        __dirname,
        "../emailTemplates",
        "welcomeRestaurant.html"
    );

    const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

    const modifiedHtmlContent = htmlContent.replace("{{restaurantName}}", restaurantName);

    const mailOptions = {
        from: "mubashir2u@gmail.com",
        to: email,
        subject: "Welcome to Food Town",
        html: modifiedHtmlContent,
        // attachments: [
        //     {
        //         filename: 'logo.png',
        //         path: path.join(__dirname, 'logo.png'),
        //         cid: 'logo' // same cid value as in the HTML img src
        //     }
        // ]
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("Error while sending email", error);
        }
    });
};

// ----------------------- emails section ends here ------------------------------------

const validateRestaurantDetails = async (restaurantName) => {
    try {
        if (!restaurantName) {
            return {
                isValidRestaurant: false,
                errorStatusCode: 400,
                errorMessage: "Restaurant name is not specified",
            };
        }

        const restaurant = await Restaurant.findOne({ name: restaurantName });

        if (restaurant) {
            return {
                isValidRestaurant: false,
                errorStatusCode: 409,
                errorMessage: "Restaurant already exists",
            };
        }

        return {
            isValidRestaurant: true,
            errorStatusCode: 200,
            errorMessage: "sucess",
        };
    } catch (error) {
        return {
            isValidUser: false,
            errorStatusCode: 500,
            errorMessage: "Internal server error",
        };
    }
};

const verifyHotelExists = async (req, res) => {
    try {
        const { restaurantName } = req.params;

        const { isValidRestaurant, errorStatusCode, errorMessage } =
            await validateRestaurantDetails(restaurantName);

        if (!isValidRestaurant) {
            return res
                .status(errorStatusCode)
                .json(new APIError(errorStatusCode, errorMessage));
        }

        return res
            .status(errorStatusCode)
            .json(new APIResponse(errorStatusCode, {}, errorMessage));
    } catch (error) {
        console.log("Restaurant Controller :: Verify hotel exist :: Error ", error);
    }
};

const registerRestaurant = async (req, res) => {
    try {
        const {
            name,
            password,
            email,
            mobile,
            restaurantName,
            cuisines,
            address,
            fromTime,
            toTime,
            logoUrl,
            logoPublicId,
        } = req.body;
        const emailData = { restaurantName, email }

        const existingUser = await User.findOne({
            $or: [{ name }, { email: email.toLowerCase() }, { mobile }],
        });
        if (existingUser) {
            return res
                .status(400)
                .json(
                    new APIError(
                        400,
                        "User with the same name, email, or mobile already exists."
                    )
                );
        }

        const user = await User.create({
            name,
            password,
            email: email.toLowerCase(),
            mobile,
        });

        if (!user) {
            return res
                .status(500)
                .json(new APIError(500, "Something went wrong while creating user."));
        }

        const restaurant = await Restaurant.create({
            name: restaurantName,
            address,
            mobile,
            fromTime,
            toTime,
            logo: {
                url: logoUrl,
                publicID: logoPublicId,
            },
            cuisines,
            owner: user._id,
        });

        sendWelcomeEmail(emailData)

        return res
            .status(200)
            .json(new APIResponse(200, { user, restaurant }, "User & Restaurant created successfully."));

        // TODO: send email on registration
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json(new APIError(400, "Duplicate key error: User or Restaurant with the same key already exists."));
        }
        console.log(
            "Restaurant Controller :: Register New Restaurant :: Error ",
            error
        );
    }
};

const uploadRestaurantImage = async (req, res) => {
    const { restaurantName } = req.body;

    try {
        const { isValidRestaurant, errorStatusCode, errorMessage } =
            await validateRestaurantDetails(restaurantName);

        if (!isValidRestaurant) {
            return res
                .status(errorStatusCode)
                .json(new APIError(errorStatusCode, errorMessage));
        }

        const restaurantLocalImg = req.file;

        if (!restaurantLocalImg) {
            return res
                .status(400)
                .json(new APIError(400, "Restaurant image is required"));
        }

        const cloudinaryImgData = await uploadToCloudinary({
            ...restaurantLocalImg,
            restaurantName,
        });

        // console.log(cloudinaryImgData, "cloudinary img data");

        return res.status(200).json(
            new APIResponse(
                200,
                {
                    public_id: cloudinaryImgData.public_id,
                    url: cloudinaryImgData.url,
                },
                "Restaurant image uploaded successfully"
            )
        );
    } catch (error) {
        console.log(
            "Restaurant Controller :: Upload Restaurant Image :: Error ",
            error
        );
    }
};

module.exports = {
    verifyHotelExists,
    registerRestaurant,
    uploadRestaurantImage,
};
