const express = require("express");
const app = express();

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set("view engine", "ejs");

const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['anything', 'you want']
}));

const {getUserByEmail, generateRandomString, urlsForUser, allShortURLs} = require("./helpers.js");

const PORT = 8080;

//Database//
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user1RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

// Global object user
const users = {
  "user1RandomID": {
    id: "user1RandomID",
    email: "user1@example.com",
    password: '$2b$10$fD2K38V6lDRwVg4mbmZXgug5VHsLr0jx9kPSS0Pv0dAb1CqaqTtU6' //Encrypt("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: '$2b$10$sQpjwE9i0GWTV9maz9HBU.BafLcgY5huEcY9lLIFyh0f0G/NP4P6q' //Encrypt("dishwasher-funk")
  }
};

//Display url_index page filtered for the logged in user//
app.get("/", (req, res) => {
  const templateVars = { user : users[req.session.user_id]};
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Display url_index page filtered for the logged in user//
app.get("/urls", (req, res) => {
  let urlDatabaseFiltered = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: urlDatabaseFiltered, user : users[req.session.user_id]};
  if (templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Display url_new page to create new URL for the logged in user//
app.get("/urls/new", (req, res) => {
  const templateVars = {user : users[req.session.user_id]};
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Display individual URL pages for logged in user//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user : users[req.session.user_id]};
  if (!allShortURLs(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send("The Tiny URL is not in the Database!!!");
  } else if (!templateVars.user) {
    res.redirect("/login");
  } else if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("You are not authorized to see/edit/delete this Tiny URL!!!");
  }
});

//Redirect to LongURL sites//
app.get("/u/:shortURL", (req, res) => {
  if (!allShortURLs(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send("The Tiny URL is not in the Database!!!");
  } else {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
  }
});

// Generate Tiny URL id for a long URL and add it to the urldatabase//
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let shortID = generateRandomString(6);
    urlDatabase[shortID] = {longURL: req.body['longURL'], userID: req.session.user_id };
    res.redirect(`/urls/${shortID}`);
  } else {
    res.status(404).send("User is not logged in!!!");
  }
});



//Update a URL in the database//
app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    urlDatabase[req.params.shortURL]['longURL'] = req.body['longURL'];
    res.redirect("/urls");
  } else {
    res.status(404).send("You are not authorized to see/edit/delete this Tiny URL!!!");
  }
});

//Delete a URL from the database//
app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(404).send("You are not authorized to see/edit/delete this Tiny URL!!!");
  }
});







// Display login page//
app.get("/login", (req, res) => {
  const templateVars = {user : users[req.session.user_id]};
  res.render("urls_login", templateVars);
});

//Log in a user//
app.post("/login", (req, res) => {
  let email = req.body['email'];
  let password = req.body['password'];
  let userid = getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send('Email or password entry cannot be blank. Please enter email and password!!!');
  } else if (!userid) {
    res.status(403).send('This email is not registered yet. Please register!!!');
  } else {
    bcrypt.compare(password, users[userid]['password'], (err, result) => {
      if (result) {
        req.session.user_id = users[userid]['id'];
        res.redirect("/urls");
      } else {
        res.status(403).send('Incorrect Password!!!');
      }
    });
  }
});

//Logout a user//
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Display registration page//
app.get("/register", (req, res) => {
  const templateVars = {user : users[req.session.user_id]};
  res.render("urls_register", templateVars);
});

//Adding user registration data to the user database//
app.post("/register", (req, res) => {
  let newId = generateRandomString(6);
  let email = req.body['email'];
  let password = req.body['password'];
  if (!email || !password) {
    res.status(400).send('Email or password entry cannot be blank. Please enter email and password!!!');
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('This email is already registered. Please go to login page!!!');
  } else {
    bcrypt.hash(password, 10, function(err, hash) {
      users[newId] = {id: newId, email: email, password: hash};
      req.session.user_id = users[newId]['id'];
      res.redirect("/urls");
    });
  }
});








//Listening to the port//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});