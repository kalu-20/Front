document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalAceptar = document.getElementById("modal-aceptar");
    const modalCancelar = document.getElementById("modal-cancelar");
    const enlaces = document.querySelectorAll(".item");
    const btnMas = document.querySelector(".btn-mas"); 
    const perfil = document.querySelector(".perfil-modal"); 

  
    function mostrarModal() {
        alert(1)
        modal.style.display = "block";
    }

    function ocultarModal() {
        modal.style.display = "none";
    }

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();
            mostrarModal();
        });
    });

   
    modalCancelar.addEventListener("click", function () {
        ocultarModal();
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            ocultarModal();
        }
    });

   
    modalAceptar.addEventListener("click", function () {
        const redireccionURL = enlaces[0].getAttribute("href");
        window.location.href = redireccionURL;
    });

   
    btnMas.addEventListener("click", function () {
        mostrarModal();
    });

    perfil.addEventListener("click", function () {
        mostrarModal();
    });
});
