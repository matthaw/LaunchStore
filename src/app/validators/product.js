async function post(request, response, next) {
  const keys = Object.keys(request.body);

  for (key of keys) {
    if (request.body[key] === "") {
      return response.send("Por favor, volte é preencha todos os campos.");
    }
  }

  if (!request.files || request.files.length == 0) {
    return response.send('Por favor, envie pelo menos uma imagem.');
  }

  next();
}

async function put(request, response, next) {
  const keys = Object.keys(request.body);

  for (key of keys) {
    if (request.body[key] === "" && key != "removed_files") {
      return response.send("Please, fill all fields!");
    }
  }

  next();
}

module.exports = {
  post,
  put,
}