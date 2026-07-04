const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const shop = require("../model/shop");

exports.isAuthenticated = catchAsyncErrors(async(req, res, next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user= await User.findById(decoded.id);
    next();
});

// exports.isSeller = catchAsyncErrors(async(req, res, next)=>{
//     const {Shoptoken} = req.cookies;
//     if(!Shoptoken){
//         return next(new ErrorHandler("Please login to continue", 401));
//     }

//     const decoded = jwt.verify(Shoptoken, process.env.JWT_SECRET_KEY);
//     req.seller= await shop.findById(decoded.id);
//     next();
// });

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  console.log("Cookies =>", req.cookies);
  const { seller_token } = req.cookies;
    console.log("seller_token =>", seller_token);

  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(
    seller_token,
    process.env.JWT_SECRET_KEY
  );

   console.log("decoded =>", decoded);

  req.seller = await shop.findById(decoded.id);
    console.log("seller =>", req.seller);


  next();
});


