// // create token and saving that in cookies
// const sendShopToken =(seller, statusCode, res) =>{
//     const token= seller.getJwtToken();

//     //options for cookies
//     const options= {
//         expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//     };
//     res.status(statusCode).cookie("Shoptoken", token, options).json({
//         success: true,
//         seller, 
//         token,
//     });
// };

// module.exports= sendShopToken;


// create token and saving that in cookies
const sendShopToken = (seller, statusCode, res) => {
  const token = seller.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("seller_token", token, options) // ya Shoptoken agar wahi har jagah use ho raha hai
    .json({
      success: true,
      seller,
      token,
    });
};

module.exports = sendShopToken;