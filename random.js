const generateRandomString = function(number) {
  let result = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < number; i++) {
    let rnum = Math.floor(Math.random() * characters.length)
    result += characters[rnum];
  }
  return result;
}
