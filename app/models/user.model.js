const sql = require("./db.js");

/**
 * constructor function to create user objects
 * @param {Object} User | user object
 */
const User = function(User) {
  this.first_email = User.first_email;
  this.first_phone = User.first_phone;
  this.name = User.name;
  this.dob = User.dob;
};

/**
 * API to create new user 
 */
User.create = (newUser, result) => {
  sql.query("INSERT INTO user SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created User: ", { id: res.insertId, ...newUser });
    result(null, { id: res.insertId, ...newUser });
  });
};

/**
 * API to search by name or phone number or email
 */
User.search = (filterBy,key,result)=>{
  sql.query(`SELECT * FROM user WHERE first_phone LIKE '${key}%' OR first_email LIKE '${key}%' OR name LIKE '${key}%'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found User: ", res);
      result(null, res);
      return;
    }

    // not found User with the id
    result({ kind: "not_found" }, null);
  });
}


/**
 * API to fetch all users details
 */
User.getAll = result => {
  const query1 ="SELECT name,u.first_phone,u.first_email,dob,ucm.other_phones FROM `user` u LEFT join (SELECT first_phone,GROUP_CONCAT(DISTINCT other_phone SEPARATOR ',') as other_phones FROM user_contacts_mapping GROUP BY user_contacts_mapping.first_phone) ucm on u.first_phone = ucm.first_phone";
  const query2 = "SELECT name,u.first_phone,dob,uem.other_emails FROM user u LEFT join (SELECT first_phone,GROUP_CONCAT(DISTINCT other_email SEPARATOR ',') as other_emails FROM user_email_mapping GROUP BY user_email_mapping.first_phone) uem on u.first_phone = uem.first_phone";
  sql.query(`${query1};${query2}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Users: ", res);
    let response = res
    if(res.length > 1){
      response = res[1].map((obj,index)=>{
        return {...res[0][index],other_emails:obj.other_emails}
      })
    }
    result(null, response);
  });
};
/**
 * update the user table
 */
User.updateUser = (first_phone,other_phones,other_emails, User, result) => {
  other_emails = eval(other_emails)
  other_phones = eval(other_phones)
  console.log("After Evaluation:",other_emails,other_phones,other_phones.length,other_emails.length)
  // other_phones=other_phones.map((phone=>phone!=''))
  // other_emails=other_emails.map((email=>email!=''))
  let query1 = `UPDATE user SET name = '${User.name}', dob = '${User.dob}' WHERE first_phone = '${first_phone}'`;
  let query2 = `INSERT INTO user_contacts_mapping (first_phone, other_phone) VALUES `;
  let query3 = `INSERT INTO user_email_mapping (first_phone, other_email) VALUES `;

  let total_phones = other_phones.length, total_emails = other_emails.length
  console.log(other_phones,typeof other_phones)
  other_phones.map((phone,index)=> {
    if(index < total_phones-1)
    query2 += `('${first_phone}','${phone}'),`
    else
    query2 += `('${first_phone}','${phone}')`
  })
  query2 += ` ON DUPLICATE KEY UPDATE other_phone = VALUES(other_phone)`
  other_emails.map((email,index)=> {
    if(index < total_emails-1)
    query3 += `('${first_phone}','${email}'),`
    else
    query3 += `('${first_phone}','${email}')`
  })

  query3 += ` ON DUPLICATE KEY UPDATE other_email = VALUES(other_email)`
  let finalQuery=`${query1};`;
  if(other_phones.length>=1){
    finalQuery+=`${query2};`
  }
  if(other_emails.length>=1){
    finalQuery+=`${query3};`
  }
  sql.query(
    `${finalQuery}`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated User: ", { first_phone: first_phone, ...User });
      other_phones = other_phones.join(",")
      other_emails = other_emails.join(",")
      result(null, { first_phone: first_phone,other_phones,other_emails , ...User,res,finalQuery,other_emails,other_phones });
    }
  );
};

/**
 * Remove a secondary phone | secondary email of a user
 */
User.remove = (first_phone,col,col_value, result) => {
  let table = col == "other_email"? "user_email_mapping":"user_contacts_mapping"
  sql.query(`DELETE FROM ${table} WHERE first_phone = ${first_phone} and ${col}=${col_value}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Deleted record with first_phone: ", first_phone," from table ",table);
    result(null, res);
  });
};


/**
 * Remove a single user
 */

 User.removeUser = (first_phone,result)=>{
   const query1 = `DELETE FROM user_email_mapping WHERE first_phone = '${first_phone}'`;
   const query2 = `DELETE FROM user_contacts_mapping WHERE first_phone = '${first_phone}'`;
   const query3 = `DELETE FROM user WHERE first_phone = '${first_phone}'`;

   sql.query(`${query1};${query2};${query3}`,(err,res)=>{
     if(err){
       result(null,err)
     }
     result(null,res)
   })
 }

/**
 * Remove All Users from user table
 */
User.removeAll = result => {
  sql.query("DELETE FROM user", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} Users`);
    result(null, res);
  });
};


/**
 * API to add extra phone for a user
 */
User.addOtherPhone = (first_phone,other_phone,result)=>{
  sql.query(`Insert into user_contacts_mapping (first_phone,other_phone) VALUES ('${first_phone}','${other_phone}')`,(err,res)=>{
    if(err){
      console.log("Error:",err)
      result(null,err)
    }
    result(null,res)
  })
}

/**
 * API to add extra email for a user
 */
User.addOtherEmail = (first_phone,other_email,result)=>{
  console.log("controller Values:",other_email,first_phone)
  sql.query(`Insert into user_email_mapping (first_phone,other_email) VALUES ('${first_phone}','${other_email}')`,(err,res)=>{
    if(err){
      console.log("Error:",err)
      result(null,err)
    }
    if (res.affectedRows == 0) {
      // not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }
    result(null,res)
  })
}
module.exports = User;
