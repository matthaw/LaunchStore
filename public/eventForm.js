const formDelete = document.querySelector('#form-delete');
formDelete.addEventListener("submit", (event) => {
  const confirmation = confirm("Deseja continuar com a exclusão?");
  if (!confirmation) {
    event.preventDefault()
  }
})