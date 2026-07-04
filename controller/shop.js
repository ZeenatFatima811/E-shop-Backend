const express = require("express");
const path = require("path");
const router = express.Router();
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isSeller } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop = require("../model/shop");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendShopToken = require("../utils/ShopToken");
const cloudinary = require("cloudinary");

// create shop
// router.post("/create-shop", upload.single("file"), async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const sellerEmail = await Shop.findOne({ email });
//     if (sellerEmail) {
//       const filename = req.file.filename;
//       const filePath = `uploads/${filename}`;
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.log(err);
//           res.status(500).json({ message: "Error deleting file" });
//         }
//       });
//       return next(new ErrorHandler("User already exists", 400));
//     }

//     const filename = req.file.filename;
//     const fileUrl = path.join(filename);
//     const seller = {
//       name: req.body.name,
//       email: email,
//       password: req.body.password,
//       avatar: {
//         public_id: req.file.filename,
//         url: fileUrl,
//       },
//       address: req.body.address,
//       phoneNumber: req.body.phoneNumber,
//       zipCode: req.body.zipCode,
//     };

//     const activationToken = createActivationToken(seller);
//     const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

//     try {
//       await sendMail({
//         email: seller.email,
//         subject: "Activate your Shop",
//         message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
//       });
//       res.status(201).json({
//         success: true,
//         message: `Please check your email:- ${seller.email} to activate your shop!`,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });

router.post(
  "/create-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
      });

      const seller = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };

      const activationToken = createActivationToken(seller);

      const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

      try {
        await sendMail({
          email: seller.email,
          subject: "Activate your Shop",
          message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${seller.email} to activate your shop!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate seller
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET,
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;
      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new ErrorHandler("Activation link expired", 400));
      }
      console.log(error.name);
      console.log(error.message);

      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

// login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }
      const seller = await Shop.findOne({ email }).select("+password");
      if (!seller) {
        return next(new ErrorHandler("seller doesn't exist", 400));
      }

      const isPasswordValid = await seller.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400),
        );
      }

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }),
);

//load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new ErrorHandler("Seller doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// log out shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("Shoptoken", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });

      res.status(201).json({
        success: true,
        message: "Log out Successfull",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// update shop profile picture
// router.put(
//   "/update-shop-avatar",
//   isSeller,
//   upload.single("image"),
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const existUser = await Shop.findById(req.seller._id);

//       if (existUser.avatar?.url) {
//         const existAvatarPath = `uploads/${existUser.avatar.url}`;
//         if (fs.existsSync(existAvatarPath)) {
//           fs.unlinkSync(existAvatarPath);
//         }
//       }

//       const fileUrl = req.file.filename;

//       const user = await Shop.findByIdAndUpdate(
//         req.seller._id,
//         {
//           avatar: {
//             public_id: fileUrl,
//             url: fileUrl,
//           },
//         },
//         { new: true },
//       );

//       res.status(200).json({
//         success: true,
//         user,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }),
// );

router.put(
  "/update-shop-avatar",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsSeller = await Shop.findById(req.seller._id);

      const imageId = existsSeller.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
      });

      existsSeller.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      await existsSeller.save();

      res.status(200).json({
        success: true,
        seller: existsSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const shop = await Shop.findById(req.seller._id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    shop.name = req.body.name;
    shop.description = req.body.description;
    shop.address = req.body.address;
    shop.phoneNumber = req.body.phoneNumber;
    shop.zipCode = req.body.zipCode;

    await shop.save();

    res.status(200).json({
      success: true,
      shop,
    });
  }),
);

module.exports = router;
