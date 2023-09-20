AFRAME.registerComponent("create-buttons", {
  init: function() {
    // 1. Crear el botón de calificación
    var button1 = document.createElement("button");
    button1.innerHTML = "EVALUAR PLATILLO";
    button1.setAttribute("id", "rating-button");
    button1.setAttribute("class", "btn btn-warning ml-3 mr-3");

    // 2. Crear el botón para ordenar
    var button2 = document.createElement("button");
    button2.innerHTML = "ORDENAR AHORA";
    button2.setAttribute("id", "order-button");
    button2.setAttribute("class", "btn btn-warning mr-3");

    // 3. Crear el botón de resumen y cuenta total
    var button3 = document.createElement("button");
    button3.innerHTML = "RESUMEN DEL PEDIDO";
    button3.setAttribute("id", "order-summary-button");
    button3.setAttribute("class", "btn btn-warning ml-3");

    // 2. Anexar en algún lugar
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.appendChild(button3);
    buttonDiv.appendChild(button1);
    buttonDiv.appendChild(button2);
  }
});
