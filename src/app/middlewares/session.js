function onlyUsers(request, response, next) {
  if (!request.session.userId) {
    return response.redirect('/users/login');
  }
  next();
}

function isLoggedRedirectToUser(request, response, next) {
  if (request.session.userId) {
    return response.redirect('/users')
  }
  next();
}

module.exports = {
  onlyUsers,
  isLoggedRedirectToUser
}