//Variables globales
var canalActual = -1;
var serverActual = -1;
var idMsg = -1;
//Cargar servidores
const user = JSON.parse(sessionStorage.getItem("userSession"))
if (!user) {
    window.location.href = 'index.html';
}

const id_user = user.id_user;

const btnProfile = document.getElementById('btn-profile');
btnProfile.textContent = user.username;

function loadServersList(){
    fetch(`http://127.0.0.1:5000/app/servers/${id_user}`)
    .then(res => {
        if (!res.ok) {
            return new Error("Error al cargar la lista de servidores");
        }
        return res.json();
    })
    .then(res => {
        if (res.message.length > 0) {
            const lista = res.message;

            const opciones = document.getElementById("opciones-items");

            const fragment = document.createDocumentFragment();

            for (let i = 0; i < lista.length; i++) {
                const serverDiv = document.createElement("div");
                serverDiv.className = "server-btn";

                const serverButton = document.createElement("button");
                serverButton.id = lista[i].id_server;
                serverButton.className = "btn-server";
                serverButton.onclick = function () {
                    showInfoServer(lista[i].id_server);
                };


                const serverImage = document.createElement("img");
                serverImage.className = "img-btn-server";
                serverImage.src = "imagenes/server_icon.svg";
                serverImage.alt = "Icono del servidor";

                const serverName = document.createElement("h6");
                serverName.textContent = lista[i].name;

                serverButton.appendChild(serverImage);
                serverDiv.appendChild(serverButton);
                serverDiv.appendChild(serverName);

                fragment.appendChild(serverDiv);
            }
            opciones.innerHTML = '';
            opciones.appendChild(fragment);
        } else {
            alert("No hay servidores disponibles")
        }
    })
    .catch()
}

loadServersList();

function showInfoServer(id) {
    serverActual = id;

    const searchServer = document.getElementById("searchServer");
    searchServer.style.display = 'none';

    const buscarServer = document.getElementById("buscarServer");
    buscarServer.style.display = 'none';

    const main = document.getElementById("main");
    main.style.gridTemplateColumns = '2fr 2fr 8fr';

    const infoMessages = document.getElementById("container-messages");
    if(infoMessages){
        infoMessages.style.display = 'none';
    }

    const channelContainer = document.getElementById("channel-container");
    if(channelContainer){
        channelContainer.style.display = 'grid';
    }

    fetch(`http://127.0.0.1:5000/app/channel/channelByServer/${id}`)
        .then(res => {
            if (!res.ok) {
                return new Error("Error al cargar la lista de servidores");
            }
            return res.json();
        })
        .then(res => {
            if (res.message.length > 0) {
                const lista = res.message;

                const opciones = document.getElementById("channels-list");

                const fragment = document.createDocumentFragment();
                for (let i = 0; i < lista.length; i++) {
                    const channelDiv = document.createElement("div");

                    const channelBtn = document.createElement("button");
                    channelBtn.className = "channelBtn";
                    channelBtn.id = lista[i].id_server;
                    channelBtn.textContent = lista[i].name;
                    channelBtn.onclick = function () {
                        loadChannelMessages(lista[i].id_channel);
                    };

                    channelDiv.appendChild(channelBtn);

                    fragment.appendChild(channelDiv);
                }

                opciones.innerHTML = '';

                opciones.appendChild(fragment);
            } else {

                const opciones = document.getElementById("channels-list");
                if (opciones) {
                    while (opciones.firstChild) {
                        opciones.removeChild(opciones.firstChild);
                    }
                }
            }
        })
        .catch();
}

function loadChannelMessages(id_channel) {
    const infoMessages = document.getElementById("container-messages");
    infoMessages.style.display = 'grid';
    fetch(`http://127.0.0.1:5000/app/messages/${id_channel}`)
        .then(res => {
            if (!res.ok) {
                return new Error("Error al cargar la lista de servidores");
            }
            return res.json();
        })
        .then(res => {
            const lista = res.message;
            canalActual = id_channel;

            console.log(lista);

            const inputText = document.getElementById("inputText");
            inputText.style.display = 'block';

            if (res.message.length > 0) {
                const fragment = document.createDocumentFragment();

                for (let i = 0; i < lista.length; i++) {
                    const message = document.createElement("div");
                    message.className = "message";

                    const img = document.createElement("img");
                    img.src = lista[i].profile_image;

                    const divcon = document.createElement("div");
                    const divtitle = document.createElement("div");
                    divtitle.className = "message-title";

                    const name = document.createElement("h4");
                    name.textContent = lista[i].username;

                    const date = document.createElement("h4");
                    date.textContent = lista[i].creation;

                    const deleteMsj = document.createElement("button");
                    deleteMsj.textContent = 'Eliminar';
                    deleteMsj.className = 'msg-btn';

                    deleteMsj.onclick = function () {
                        deleteMessage(lista[i].id_message);
                    };


                    const modifyMsj = document.createElement("button");
                    modifyMsj.textContent = 'Modificar';
                    modifyMsj.className = 'msg-btn';

                    modifyMsj.onclick = function () {
                        modifyMessage(lista[i].id_message);
                    };

                    const content = document.createElement("p");
                    content.textContent = lista[i].content;

                    message.appendChild(img);
                    message.appendChild(divcon);

                    divcon.appendChild(divtitle);
                    divcon.appendChild(content);

                    divtitle.append(name);
                    divtitle.append(date);
                    divtitle.append(modifyMsj);
                    divtitle.append(deleteMsj);

                    fragment.appendChild(message);
                }

                const messages = document.getElementById("messages");
                messages.innerHTML = '';
                messages.appendChild(fragment);
                messages.scrollTop = messages.scrollHeight;

            } else {
                removeChilds('messages');
            }
        })
        .catch();
}

async function modifyMessage(id_message){
    idMsg = id_message;
    const modal = document.getElementById("modalMsg");
    modal.style.display = 'block';
}

async function modificarMensaje(){
    const modifyMsg = document.getElementById("modifyMsg").value;

    if(!modifyMsg){
        alert("Debe escribir un mensaje para modificar");
    }

    const body = {
        id_user: JSON.parse(sessionStorage.getItem("userSession")).id_user,
        id_message: idMsg,
        content: modifyMsg
    };

    try{
        const res = await generarPeticionPut('/messages', body);
        if(res.message == '403'){
            alert("No puede modificar un mensaje de alguien más");
            loadChannelMessages(canalActual);
            ocultarMsgModal();
        }else{
            loadChannelMessages(canalActual);
            ocultarMsgModal();
        }
    }catch(err){
        alert("No puede modificar un mensaje de alguien más");
        loadChannelMessages(canalActual);
        ocultarMsgModal();
    }
}

function ocultarMsgModal(){
    const modal = document.getElementById("modalMsg");
    modal.style.display = 'none';
}

async function deleteMessage(id_message){
    try{
        const res = await generarPeticionDelete(`/messages/${id_message}/${JSON.parse(sessionStorage.getItem("userSession")).id_user}`);
        if(res.message == "403"){
            alert("No puede eliminar un mensaje de otra persona");
            return;
        }
        loadChannelMessages(canalActual);
    }catch(e){
        alert(e);
    }
    

}

async function sendMessage() {
    const input = document.getElementById("inputText");
    const id_user = JSON.parse(sessionStorage.getItem("userSession")).id_user;

    if (!input.value) {
        return;
    }

    if (!id_user || !canalActual) {
        alert("Error al enviar mensaje")
        return;
    }

    const body = {
        "id_user": id_user,
        "id_channel": canalActual,
        "content": input.value
    }

    const res = await generarPeticionPost('/messages', body);
    if (res.message == 200) {
        input.value = "";
        loadChannelMessages(canalActual);
    }

}

function removeChilds(name) {
    const objname = document.getElementById(name);
    if (objname) {
        while (objname.firstChild) {
            objname.removeChild(objname.firstChild);
        }
    }
}

function enterMensaje(event, inputElement) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

async function crearCanal(){
    const newchannel = document.getElementById("newchannel");
    if (!newchannel.value) {
        alert("Ingrese el nombre del canal")
        return;
    }
    const body = {
        "name": newchannel.value,
        "id_server": serverActual
    }

    const res = await generarPeticionPost('/channels', body);
    if (res.message) {
        showInfoServer(res.message);
        ocultarChannelModal();
    }else{
        alert("No se pudo crear el nuevo canal")
    }
}

function mostrarModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = 'block';
}

function mostrarChannelModal() {
    const modal = document.getElementById("modalChannel");
    modal.style.display = 'block';
}

function ocultarModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = 'none';
}

function ocultarChannelModal() {
    const modal = document.getElementById("modalChannel");
    modal.style.display = 'none';
}

async function crearServidor() {
    const serv = document.getElementById("serv");

    if(!serv.value){
        alert("Debe ingresar un nombre");
        return;
    }

    const body = {
        "server_name": serv.value,
        "id_user": JSON.parse(sessionStorage.getItem("userSession")).id_user
    }

    const res = await generarPeticionPost('/servers', body);
    if (res.message) {
        loadServersList();
        ocultarModal();
    }
}

async function suscribirServidor() {
    const searchServer = document.getElementById("searchServer");
    searchServer.style.display = 'grid';

    const buscarServer = document.getElementById("buscarServer");
    buscarServer.style.display = 'block';

    const containerMessages = document.getElementById("container-messages");
    containerMessages.style.display = 'none';

    const channelContainer = document.getElementById("channel-container");
    channelContainer.style.display = 'none';

    const main = document.getElementById("main");
    main.style.gridTemplateColumns = '2fr 10fr';

    fetch('http://127.0.0.1:5000/app/servers')
        .then(res => {
            if (!res.ok) {
                return new Error("Error en la solicitud: " + res.status);
            }
            return res.json();
        })
        .then(res => {
            if (res.message.length > 0) {
                const lista = res.message;

                const opciones = document.getElementById("searchServer");

                const fragment = document.createDocumentFragment();

                for (let i = 0; i < lista.length; i++) {
                    const serverDiv = document.createElement("div");
                    serverDiv.className = "server-btn";

                    const serverButton = document.createElement("button");
                    serverButton.id = lista[i].id_server;
                    serverButton.className = "btn-server";
                    serverButton.onclick = function () {
                        enviarSuscripcion(lista[i].id_server);
                    };


                    const serverImage = document.createElement("img");
                    serverImage.className = "img-btn-server";
                    serverImage.src = "imagenes/server_icon.svg";
                    serverImage.alt = "Icono del servidor";

                    const serverName = document.createElement("h6");
                    serverName.textContent = lista[i].name;

                    serverButton.appendChild(serverImage);
                    serverDiv.appendChild(serverButton);
                    serverDiv.appendChild(serverName);

                    fragment.appendChild(serverDiv);
                }

                opciones.innerHTML = '';

                opciones.appendChild(fragment);
            }
        })
        .catch();
}

async function enviarSuscripcion(id_server) {
    const body = {
        "id_user": JSON.parse(sessionStorage.getItem("userSession")).id_user,
        "id_server": id_server
    }

    const res = await generarPeticionPost('/servers/subscribir/', body);
    if (res.message != "Error") {
        const searchServer = document.getElementById("searchServer");
        searchServer.style.display = 'none';

        const buscarServer = document.getElementById("buscarServer");
        buscarServer.style.display = 'none';
    
        const main = document.getElementById("main");
        main.style.gridTemplateColumns = '2fr 2fr 8fr';

        loadServersList();
    }else{
        alert("Ya se encuentra vinculado al servidor");
    }
}

function findServer(event, inputElement){
    if (event.key === "Enter") {
        const buscarServer = document.getElementById("buscarServer").value;

        if(!buscarServer){
            alert("Debe ingresar un servidor para buscar");
        } 

        const headers = new Headers({
            'Content-Type': 'application/json'
        });

        const infoPeticion = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({name: buscarServer})
        };
    
        fetch('http://127.0.0.1:5000/app/servers/findServer', infoPeticion)
            .then(res => {
                if (!res.ok) {
                    return new Error("Error en la solicitud: " + res.status);
                }
                return res.json();
            })
            .then(res => {
                if (res.message.length > 0) {
                    const lista = res.message;
    
                    const opciones = document.getElementById("searchServer");
    
                    const fragment = document.createDocumentFragment();
    
                    for (let i = 0; i < lista.length; i++) {
                        const serverDiv = document.createElement("div");
                        serverDiv.className = "server-btn";
    
                        const serverButton = document.createElement("button");
                        serverButton.id = lista[i].id_server;
                        serverButton.className = "btn-server";
                        serverButton.onclick = function () {
                            enviarSuscripcion(lista[i].id_server);
                        };
    
    
                        const serverImage = document.createElement("img");
                        serverImage.className = "img-btn-server";
                        serverImage.src = "imagenes/server_icon.svg";
                        serverImage.alt = "Icono del servidor";
    
                        const serverName = document.createElement("h6");
                        serverName.textContent = lista[i].name;
    
                        serverButton.appendChild(serverImage);
                        serverDiv.appendChild(serverButton);
                        serverDiv.appendChild(serverName);
    
                        fragment.appendChild(serverDiv);
                    }
    
                    opciones.innerHTML = '';
    
                    opciones.appendChild(fragment);
                }
            })
            .catch();
    }
}

function redirectPerfil() {
    window.location.href = 'perfil.html';
}

async function generarPeticionPost(path, body) {
    try {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });

        const infoPeticion = {
            method: 'POST',
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

async function generarPeticionDelete(path) {
    try {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });

        const infoPeticion = {
            method: 'DELETE',
            headers: headers
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

async function generarPeticionPut(path, body) {
    try {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });

        const infoPeticion = {
            method: 'PUT',
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