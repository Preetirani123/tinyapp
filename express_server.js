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

//Filter the urldatabase for logged in user_id//
const urlsForUser = function(id){
  let urlDatabaseFiltered = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userID'] === id){
      urlDatabaseFiltered[url] = { longURL: urlDatabase[url]['longURL'], userID: urlDatabase[url]['userID'] }
    }
  }
  return urlDatabaseFiltered;
}


//Database//
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user1RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};
//End//

//list of all shortURLs//
const allShortURLs = function(){
  let shortUrlList = [];
  for (let url in urlDatabase) {
    shortUrlList.push(url)
  }
  return shortUrlList;
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
  let urlDatabaseFiltered = urlsForUser(req.cookies['user_id']);
  const templateVars = { urls: urlDatabaseFiltered, user : users[req.cookies['user_id']]};
  if(templateVars.user){
    res.render("urls_index", templateVars);
  }else{
    res.render("urls_login", templateVars);
  }
});
//End//

//Create url_new page to add new URL//
app.get("/urls/new", (req, res) => {
  const templateVars = {user : users[req.cookies['user_id']]};
  if(templateVars.user){
    res.render("urls_new", templateVars);
  }else{
    res.render("urls_login", templateVars);
  }
});
//End//

// Generate short id for the longURL and add it to the database along with its longURL//
app.post("/urls", (req, res) => {
  let userId = req.cookies['user_id']
  let shortID = generateRandomString(6);
  urlDatabase[shortID] = {longURL: req.body['longURL'], userID: userId };
  res.redirect(`/urls/${shortID}`);
});
//End//

//Display individual URL pages//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user : users[req.cookies['user_id']]};
  if (!allShortURLs().includes(req.params.shortURL)) {
    res.status(404).send("Page not Found");
  }
  else if (!templateVars.user) {
    res.render("urls_login", templateVars);
  }
  else if (req.cookies['user_id'] === urlDatabase[req.params.shortURL]['userID']){
    res.render("urls_show", templateVars);
  }
  else {
    res.status(404).send("Access denied");
  }
});
//End//

//Redirect to individual LongURL sites//
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  res.redirect(longURL);
});
//End//

//Delete a URL from the database//
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = {user : users[req.cookies['user_id']]};
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");;
  } else {
    res.status(404).send("Access denied");
  }
});
//End//

//Update a URL in the database//
app.post("/urls/:shortURL/update", (req, res) => {
  const templateVars = {user : users[req.cookies['user_id']]};
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL]['userID']) {
    let shortID = req.params.shortURL;
    urlDatabase[shortID]['longURL'] = req.body['longURL']
    res.redirect("/urls");
  }else{
    res.status(404).send("Access denied");
  }
  
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