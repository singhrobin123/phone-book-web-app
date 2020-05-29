const router = require('express').Router()
const Users = require("../controllers/user.controller.js");

// Filter users by filter and filter-value
router.post("/get-user", Users.find);

//Adding other phone
router.post("/add-phone",Users.addOtherPhone)

//Adding other email
router.post("/add-email",Users.addOtherEmail)

// Remove phone or email
router.post("/remove-phone-or-email",Users.deletePhoneOrEmail)
// Update a User with UserId
router.post("/update-user", Users.update);


// Create a new User
router.post("/create-user", Users.create);

// Delete a User with first_phone
router.post("/delete-user", Users.deleteUser);

// Delete all users
router.delete("/delete-all-users", Users.deleteAll);

// Retrieve all Users
router.get("/all", Users.findAll);

module.exports = router

