const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const cookieParser = require('cookie-parser')
app.use(cookieParser());

const bodyParser = require("body-parser");
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

//Database//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//End//

//Display url_index page to displahy the current databse//
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username : req.cookies['username']};
  res.render("urls_index", templateVars);
});
//End//

//Create url_new page to create new URL//
app.get("/urls/new", (req, res) => {
  const templateVars = {username : req.cookies['username']};
  res.render("urls_new", templateVars);
});
//End//

//Display individual URL pages//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username : req.cookies['username']};
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

// Generate short id and add it to the database along with its longURL//
app.post("/urls", (req, res) => {
  let shortID = generateRandomString(6);
  urlDatabase[shortID] = req.body['longURL'];
  res.redirect(`/urls/${shortID}`);
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

//Login//
app.post("/login", (req, res) => {
  let userName = req.body['username'];
  res.cookie('username', userName)
  res.redirect("/urls");
});
//End//

//Logout//
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});
//End//

//Listening to the port//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//End//