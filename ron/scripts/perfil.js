const user = JSON.parse(sessionStorage.getItem("userSession"))
if (!user) {
    window.location.href = 'index.html';
}

//Agregar información del usuario
setTimeout(_ => {
    const usernametxt = document.getElementById('usernametxt');
    usernametxt.textContent = user.username;
    const username = document.getElementById('username');
    username.value = user.username;

    const nametxt = document.getElementById('nametxt');
    nametxt.textContent = user.first_name;
    const name = document.getElementById('name');
    name.value = user.first_name;

    const lastnametxt = document.getElementById('lastnametxt');
    lastnametxt.textContent = user.last_name;
    const last_name = document.getElementById('lastname');
    last_name.value = user.last_name;

    const emailtxt = document.getElementById('emailtxt');
    emailtxt.textContent = user.email;
    const email = document.getElementById('email');
    email.value = user.email;

    const imagentxt = document.getElementById('imagentxt');
    imagentxt.textContent = user.profile_image;
    const imagen = document.getElementById('imagen');
    imagen.value = user.profile_image;

    const profileimage = document.getElementById('profileimage');
    profileimage.src = user.profile_image;

    const usernameheader = document.getElementById('usernameheader');
    usernameheader.textContent = user.username;
}, 50);

function principal() {
    window.location.href = 'principal.html';
}

function changePass() {
    const myModal = document.getElementById('myModal');
    myModal.style.display = 'block';
}

function hideModal() {
    const myModal = document.getElementById('myModal');
    myModal.style.display = 'none';
}

async function sendChangePass() {
    actualUser = JSON.parse(sessionStorage.getItem("userSession")).password;
    const actual = document.getElementById('actual').value;
    const nueva = document.getElementById('nueva').value;
    const confirmar = document.getElementById('confirmar').value;
    
    if(actual != actualUser){
        alert("Contraseña actual incorrecta");
        return;
    }

    if(nueva != confirmar){
        alert("La confirmación de la contraseña no coincide");
        return;
    }

    const res = await generarPeticion('/users/validate', { id_user: JSON.parse(sessionStorage.getItem("userSession")).id_user, password:nueva}, 'PUT');
    if(res.msj != '201'){
        sessionStorage.setItem("userSession", JSON.stringify(res.msj));
        window.location.reload();
    }else{
        alert("Error al actualizar contraseña");
    }
}

function showMdfInput(nombre) {
    const doc = document.getElementById(nombre);
    const txt = document.getElementById(nombre + 'title');
    if (doc.style.display === 'none') {
        doc.style.display = 'flex';
        txt.style.display = 'none';
    } else {
        doc.style.display = 'none';
        txt.style.display = 'flex';
    }
}

async function sendModifyPerfil() {
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const imagen = document.getElementById('imagen').value;

    if (!username || !name || !lastname || !email || !imagen) {
        alert("Faltan datos para modificar el perfil");
        return;
    }

    try {
        const res = await generarPeticion('/users', { id_user: JSON.parse(sessionStorage.getItem("userSession")).id_user, username: username, first_name: name, last_name: lastname, email: email , profile_image:imagen}, 'PUT');
        if(res.msj != '400'){
            const resSession = await sendLogin(res.msj.email, res.msj.password);
            window.location.reload();
        }

    } catch (e) {
        window.location.reload();
    }
}

async function generarPeticion(path, body, method) {
    try {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });

        const infoPeticion = {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        };
        const url = window.apiUrl + path;

        const response = await fetch(url, infoPeticion);

        if (!response.ok) {
            throw new Error("Error en la solicitud: " + response.status);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        throw err;
    }
}

async function sendLogin(email, password) {
    const datos = {
        "email": email,
        "password": password
    }

    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    const infoPeticion = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(datos)
    };
    const url = window.apiUrl + '/users/validate';

    const res = await fetch(url, infoPeticion)
        .then(res => {
            if (!res.ok || res.status != 200) {
                return new Error("Error en la solicitud: " + res.status);
            }
            return res.json();
        })
        .then(res => {
            if ('user' in res) {
                sessionStorage.setItem("userSession", JSON.stringify(res.user));
                window.location.href = "principal.html";
            } else {
                alert("No se encontró ningun usuario");
            }
        })
        .catch(err => console.error(err));
}