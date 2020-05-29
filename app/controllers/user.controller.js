const User = require("../models/user.model.js");

function dynamicSort(property) {
  var sortOrder = 1;

  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }

  return function (a,b) {
      if(sortOrder == -1){
          return b[property].localeCompare(a[property]);
      }else{
          return a[property].localeCompare(b[property]);
      }        
  }
}
// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.send({
      success:false,
      message: "Content can not be empty!"
    });
  }
  
  // Create a User
  const newUser = new User({
    name: req.body.name,
    dob: req.body.dob,
    first_email: req.body.first_email,
    first_phone: req.body.first_phone
  });
  console.log('User: ', User);
  
  // Save User in the database
  User.create(newUser, (err, data) => {
    if (err)
      res.send({
        success:false,
        message:
          err.message || "Some error occurred while creating the User."
      });
    else res.send({success:true,data});
  });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  User.getAll((err, data) => {
    data.sort(dynamicSort("name"));
    if (err)
      res.status(500).send({
        success:false,
        message:
          err.message || "Some error occurred while retrieving users."
      });
    else res.send({success:true,data});
  });
};

// Filter user with some filter and key value
exports.find = (req, res) => {
  User.search(req.body.filterBy,req.body.key, (err, data) => {
    data.sort(dynamicSort("name"));
    if (err) {
      if (err.kind === "not_found") {
        res.send({
          success:false,
          message: `No record found with key value ${req.body.key} and filterBy :${req.body.filterBy}.`
        });
      } else {
        res.send({success:false,
          message: "Error retrieving record with key " + req.body.key
        });
      }
    } else res.send({success:true,data});
  });
};

// Update a User identified by the first_phone param in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.send({
      success:false,
      message: "Content can not be empty!"
    });
  }

  User.updateUser(req.body.first_phone,req.body.other_phones,req.body.other_emails, new User(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.send({
            success:false,
            message: `Not found user with first_phone ${req.body.first_phone}.`
          });
        } else {
          res.send({
            success:false,
            message: "Error updating user with first_phone " + req.body.first_phone
          });
        }
      } else res.send({success:true,data});
    }
  );
};

// Delete phone or email with the specified first_phone in the request
exports.deletePhoneOrEmail = (req, res) => {
  User.remove(req.body.first_phone,req.body.col,req.body.col_value, (err, data) => {

    if (err) {
      if (err.kind === "not_found") {
        res.send({success:false,
          message: `Not found record with first_phone ${req.body.first_phone}.`
        });
      } else {
        res.send({
          success:false,
          message: "Could not delete record with first_phone " + req.body.first_phone
        });
      }
    } else res.send({success:true, message: `record was deleted successfully!`,data });
  });
};


exports.deleteUser = (req, res) => {
  User.removeUser(req.body.first_phone, (err, data) => {
    
    if (err) {
      if (err.kind === "not_found") {
        res.send({
          success:false,message: `Not found record with first_phone ${req.body.first_phone}.`
        });
      } else {
        res.send({
          success:false,message: "Could not delete record with first_phone " + req.body.first_phone
        });
      }
    } else res.send({success:true,message: `record was deleted successfully!` ,data});
  });
};
// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.removeAll((err, data) => {
 
    if (err)
      res.send({
        success:false,
        message:
          err.message || "Some error occurred while removing all Users."
      });
    else res.send({ success:false,message: `All Users were deleted successfully!` });
  });
};

//Add other phone

exports.addOtherPhone =(req,res) => {
  User.addOtherPhone(req.body.first_phone,req.body.other_phone,(err,data)=>{
    if(err){
      res.send({success:false,message:"Something went wrong"})
    }
    res.send({success:true,data})
  })
}

//Add other email

exports.addOtherEmail =(req,res) => {console.log("controller Values:",req.body.other_email,req.body.first_phone)
  User.addOtherEmail(req.body.first_phone,req.body.other_email,(err,data)=>{
    if(err){
      res.send({success:false,message:"Something went wrong"})
    }
    res.send({success:true,data})
  })
}
