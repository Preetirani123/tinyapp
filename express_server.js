const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const cookieParser = require('cookie-parser')
app.use(cookieParser());

const bodyParser = require("body-parser");
const { compile } = require("ejs");
app.use(bodyParser.urlencoded({extended: true}));

//random alphanumeric string genetator//
const generateRandomString = function(number) { 
  let result = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < number; i++) {
    let rnum = Math.floor(Math.random() * characters.length)
    result += characters[rnum];
  }
  return result;
}
//End//

//Check email in the user database//
const emailChecker = function(email) { 
  let userEmailList = [];
  for (let user in users) {
    userEmailList.push(users[user]['email'])
  }
  return userEmailList.includes(email)
}
//End//

//Check password from the user database for a given email//
const passwordChecker = function(email, password) {
  for (let user in users) {
    if (users[user]['email'] === email) {
        return users[user]['password'] === password
    }
  }
}
//End//

//Retrieve user_id user database for a given email//
const idRetriever = function(email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
        return users[user]['id']
    }
  }
}
//End//

//Database//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//End//

// Global object user
const users = { 
  "user1RandomID": {
    id: "user1RandomID", 
    email: "user1@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//End

//Display url_index page to display the current databse//
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user : users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});
//End//

//Create url_new page to add new URL//
app.get("/urls/new", (req, res) => {
  const templateVars = {user : users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});
//End//

// Generate short id for the longURL and add it to the database along with its longURL//
app.post("/urls", (req, res) => {
  let shortID = generateRandomString(6);
  urlDatabase[shortID] = req.body['longURL'];
  res.redirect(`/urls/${shortID}`);
});
//End//

//Display individual URL pages//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user : users[req.cookies['user_id']]};
  if (templateVars.longURL) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404);
    res.send("Page not found");
  }
});
//End//

//Redirect to individual LongURL sites//
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});
//End//

//Delete a URL from the database//
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//End//

//Update a URL in the database//
app.post("/urls/:shortURL/update", (req, res) => {
  let shortID = req.params.shortURL;
  urlDatabase[shortID] = req.body['longURL']
  res.redirect("/urls");
});
//End//

//Log in//
app.post("/login", (req, res) => {
  let email = req.body['email'];
  let password = req.body['password'];
  if (email === '' || password === '') {
    res.status(400).send('Please enter email and password');
  } else if (!emailChecker(email)) {
    res.status(403).send('Email is not register. Please register');
  } else if (!passwordChecker(email,password)) {
    res.status(403).send('Incorrect Password');
  } else {
    let userid = idRetriever(email)
    res.cookie("user_id", userid);
    res.redirect("/urls");
  }
});
//End//

// Login page//
app.get("/login", (req, res) => {
  const templateVars = {user : users[req.cookies['user_id']]};
  res.render("urls_login", templateVars);
});
//End

//Logout//
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});
//End//

// Registeration page//
app.get("/register", (req, res) => {
  const templateVars = {user : users[req.cookies['user_id']]};
  res.render("urls_register", templateVars);
});
//End

//Adding regritration data to the users object// 
app.post("/register", (req, res) => {
  let newId = generateRandomString(6);
  let email = req.body['email'];
  let password = req.body['password'];
  if (email === '' || password === '') {
    res.status(400).send('Please enter email and password');
  } else if (emailChecker(email)) {
    res.status(400).send('Email already registered');
  } else {
    users[newId] = {id: newId, email: email, password: password};
    res.cookie("user_id", newId);
    res.redirect("/urls");
  } 
});
//End










//Listening to the port//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//End//