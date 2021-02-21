//random alphanumeric string genetator. This will be used to create the Tiny URL for long URLs and user id for new users//
const generateRandomString = function(number) { 
  let result = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < number; i++) {
    let rnum = Math.floor(Math.random() * characters.length)
    result += characters[rnum];
  }
  return result;
}

//Retrieve user_id user database for a given email//
const getUserByEmail = function(email,userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user]['email'] === email) {
        return userDatabase[user]['id']
    }
  }
}

//Filter the urldatabase for logged in user_id//
const urlsForUser = function(id, urlDatabase) {
  let databaseFiltered = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]['userID'] === id) {
      databaseFiltered[url] = { longURL: urlDatabase[url]['longURL'], userID: urlDatabase[url]['userID'] };
    }
  }
  return databaseFiltered;
}

//list of all shortURLs//
const allShortURLs = function(urlDatabase){
  let shortUrlList = [];
  for (let url in urlDatabase) {
    shortUrlList.push(url);
  }
  return shortUrlList;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser, allShortURLs};