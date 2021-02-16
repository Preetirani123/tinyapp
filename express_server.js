const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

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
//--------------------------------------------------------//
// ------ Database ---------------------------------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//------------ Home page/root-----------------------------
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// ------------made short id = long id ---------------------
app.post("/urls", (req, res) => {
  let shortID = generateRandomString(6);
  urlDatabase[shortID] = req.body['longURL'];
  res.redirect(`/urls/${shortID}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  
  if (templateVars.longURL) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404);
    res.send("Page not found");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// app.post("/urls/:shortURL/edit", (req, res) => {
//   let shortID = req.params.shortURL;
//   res.redirect(`/urls/${shortID}`);
// });

app.post("/urls/:shortURL/update", (req, res) => {
  console.log(req);
  let shortID = req.params.shortURL;
  urlDatabase[shortID] = req.body['longURL']
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


