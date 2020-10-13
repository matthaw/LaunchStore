const Mask = {
  apply(input, func) {
    setTimeout(() => {
      input.value = Mask[func](input.value)
    }, 100)
  },

  formatBRL(value) {
    value = value.replace(/\D/g, '');

    return value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  },

  cpfCnpj(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 14) {
      value = value.slice(0, -1);
    }
    // Check if is cpf or cnpj

    if (value.length > 11) {
      value = value.replace(/(\d{2})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1-$2');
    }

    return value;
  },

  cep(value) {

    value = value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.slice(0, -1);
    }

    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    return value;
  }
}

const PhotosUpload = {
  input: '',
  preview:  document.querySelector('#photos-preview'),
  uploadLimit: 6,
  files: [],

  handleFileInput(event) {
    const {files: fileList} = event.target
    this.input = event.target;

    if (this.hasLimit(event)) return;

    Array.from(fileList).forEach(file => {
      this.files.push(file);

      const reader = new FileReader()

      reader.onload = () => {
        const image = new Image()
        image.src = String(reader.result)

        const div = this.getContainer(image)
        this.preview.appendChild(div);
      }

      reader.readAsDataURL(file)
    })

    this.input.files = this.getAllFiles();
  },

  hasLimit(event) {
    const { uploadLimit, input, preview } = PhotosUpload
    const {files: fileList} = input;
    
    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`);
      event.preventDefault();
      return true;
    }

    const photosDiv = []
    preview.childNodes.forEach(item => {
      if (item.classList && item.classList.value == 'photo') {
        photosDiv.push(item)
      }
    })

    const totalPhotos = fileList.length + photosDiv.length
    if (totalPhotos > uploadLimit) {
      alert('Você atingiou o limite máximo de fotos');
      event.preventDefault();
      return true;
    }

    return false;
  },
  
  getContainer(image) {

    const div = document.createElement('div')
    div.classList.add('photo')

    div.onclick = this.removePhoto

    div.appendChild(image);
    div.appendChild(this.getRemoveButton())

    return div
  },

  getAllFiles() {
    const dataTranfer = new ClipboardEvent("").clipboardData || new DataTransfer();
    this.files.forEach(file => {
      dataTranfer.items.add(file);
    })

    return dataTranfer.files;
  },

  getRemoveButton() {
    const button = document.createElement('i');
    button.classList.add('material-icons');
    button.innerHTML = 'delete'
    
    return button;
  },

  removePhoto(event) {
    const photoDiv = event.target.parentNode; // <div class="photo"/>
    const photosArray = Array.from(PhotosUpload.preview.children);
    const index = photosArray.indexOf(photoDiv);

    PhotosUpload.files.splice(index, 1);
    PhotosUpload.input.files = PhotosUpload.getAllFiles();

    photoDiv.remove();
  },

  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode

    if (photoDiv.id) {
      const removedFiles = document.querySelector('input[name="removed_files"]')
      if (removedFiles) {
        removedFiles.value += `${photoDiv.id},`
      }
    }

    photoDiv.remove();
  }
}

const ImageGallery = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview > img'),

  setImage(e) {
    const {target} = e;

    ImageGallery.previews.forEach(preview => preview.classList.remove('active'));
    target.classList.add('active');

    ImageGallery.highlight.src = target.src;
    LightBox.image.src = target.src;
  }
}

const LightBox = {
  target: document.querySelector('.lightbox-target'),
  image: document.querySelector('.lightbox-target img'),
  closeButton: document.querySelector('.lightbox-target a.lightbox-close'),

  open() {
    LightBox.target.style.opacity = 1;
    LightBox.target.style.top = 0;
    LightBox.target.style.bottom = 0;
    LightBox.closeButton.style.top = 0;
  },

  close() {
    LightBox.target.style.opacity = 0;
    LightBox.target.style.top = "-100%";
    LightBox.target.style.bottom = "initial";
    LightBox.closeButton.style.top = "-80px";
  }
}

const Validate = {
  apply(input, func) {
      Validate.clearErrors(input);

      let results = Validate[func](input.value);
      input.value = results.value;

      if (results.error) {
        Validate.displayError(input, results.error);
      } else {
        Validate.displaySucess(input, results.menssage)
      }
  },

  displayError(input, error) {
    const div = document.createElement('div')
    div.classList.add('error');
    div.innerHTML = error;
    input.parentNode.appendChild(div);
    input.focus();
  },

  displaySucess(input, menssage) {
    const div = document.createElement('div')
    div.classList.add('sucess');
    div.innerHTML = menssage;
    input.parentNode.appendChild(div);

  },

  clearErrors(input) {
    const errorDiv = input.parentNode.querySelector('.error');
    if (errorDiv) {
      errorDiv.remove();
    }

    const sucessDiv = input.parentNode.querySelector('.sucess');
    if (sucessDiv) {
      sucessDiv.remove();
    }
  },

  isEmail(value) {
    let error = null;
    let menssage = "";

    const mailFormat = /^\w+([\.-]?\w+)*@\w([\.-]?\w+)*(\.\w{2,3})+$/

    if (!value.match(mailFormat)) {
      error = "Email Invalido!";
    } else {
      menssage = 'Email Valido!';
    }

    return {
      error,
      value,
      menssage
    }
  },

  isCpfCnpj(value) {
    let error = null;
    let menssage = "";

    const cleanValues = value.replace(/\D/g, '');

    if (cleanValues.length > 11 && cleanValues.length !== 14) {
      error = "CNPJ Incorreto.";
    } else if (cleanValues.length < 12 && cleanValues.length !== 11) {
      error = "CPF Incorreto.";
    } else if (cleanValues.length === 14) {
      menssage = "CNPJ Valido!";
    } else if (cleanValues.length === 11) {
      menssage = "CPF Valido!";
    }

    return {
      error,
      value,
      menssage
    }
  },

  isCep(value) {
    let error = null;
    let menssage = "";

    const cleanValues = value.replace(/\D/, '');

    if (cleanValues.length !== 8) {
      error = "CEP Incorreto.";
    } else {
      menssage = "CEP Valido!";
    }

    return {
      error,
      value,
      menssage
    }
  }
}