// const app = require("./app");
// const connectDatabase = require("./db/Database");
// // const cloudinary = require("cloudinary");

// // Handling uncaught exceptions
// process.on("uncaughtException", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server for handling uncaught exception`);
// });

// //config
// if (process.env.NODE_ENV !== "PRODUCTION") {
//   require("dotenv").config({
//     path: "./config/.env",
//   });
// }

// // connect db
// connectDatabase();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });


// //create server
// const server = app.listen(process.env.PORT || 8080, () => {
//   console.log(`server is running on http://localhost:${process.env.PORT}`);
// });

// //unhandled promise rejection
// process.on("unhandledRejection", (err) => {
//   console.log(`Shutting down the server for ${err.message}`);
//   console.log(`shutting down the server for unhandle promise rejection`);

//   server.close(() => {
//     process.exit(1);
//   });
// });



const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});


const PORT = process.env.PORT || 8000;


const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to unhandled promise rejection");

  server.close(() => {
    process.exit(1);
  });
});