var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    //Obtener la colección de platos
    var dishes = await this.getDishes();

    //Evento makerFound
    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });
    //Evento markerLost
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askTableNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "¡¡Bienvenido a 'El antojo'!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Escribe tu número de mesa",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      tableNumber = inputValue;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    // Obtener el día de hoy
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Domingo - Sábado : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    // Obtener el plato según el ID
    var dish = dishes.filter(dish => dish.id === markerId)[0];

    // Comprobar si el plato está disponible
    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.nombre.toUpperCase(),
        text: "Este platillo no está disponible hoy!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      //Cambiar la escala del modelo a la escala inicial
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      //Actualizar la VISIBILIDAD de la interfaz de usuario de la escena AR (MODELO, INGREDIENTES y PRECIO)

      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${dish.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${dish.id}`);
      priceplane.setAttribute("visible", true)

      // Cambiar la visibilidad del botón div
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");
      var payButton = document.getElementById("pay-button")

      ratingButton.addEventListener("click", function () {
        swal({
          icon: "warning",
          title: "Evaluar el platillo",
          text: "Trabajo en proceso"
        });
      });

      orderButtton.addEventListener("click", () => {
        var tNumber;
        tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
        this.handleOrder(tNumber, dish);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "¡Gracias por el pedido!",
          text: "¡Su pedido se servirá pronto en su mesa!",
          timer: 2000,
          buttons: false
        });
      });

      orderSummaryButtton.addEventListener("click", () =>
        this.handleOrderSummary()
      );

      payButton.addEventListener("click", () =>
        this.handlePayment()
      );
    }
  },

  handleOrder: function (tNumber, dish) {
    //Leer los detalles del pedido de la mesa actual
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          //Aumentar la cantidad actual
          details["current_orders"][dish.id]["quantity"] += 1;

          //Calculando el subtotal del artículo
          var currentQuantity = details["current_orders"][dish.id]["quantity"];

          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.nombre,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1
          };
        }

        details.total_bill += dish.price;

        // Actualizando la db
        firebase
          .firestore()
          .collection("tables")
          .doc(doc.id)
          .update(details);
      });
  },
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  getOrderSummary: async function (tNumber) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {

    //Obtener el número de mesa
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    //Obtener el resumen del pedido de la base de datos
    var orderSummary = await this.getOrderSummary(tNumber);

    //Cambiar la visibilidad del div modal
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    //Obtener el elemento de la mesa
    var tableBodyTag = document.getElementById("bill-table-body");

    //Eliminar datos antiguos de tr(fila de la tabla)
    tableBodyTag.innerHTML = "";

    //Obtener la clave de current_orders
    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {

      //Crear la fila de la mesa
      var tr = document.createElement("tr");

      //Crear celdas/columnas para NOMBRE DEL ARTÍCULO, PRECIO, CANTIDAD y PRECIO TOTAL
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      //Añadir contenido HTML 
      item.innerHTML = orderSummary.current_orders[i].item;

      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      //Añadir celdas a la fila
      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      //Añadir la fila a la tabla
      tableBodyTag.appendChild(tr);
    });

    var total_file = document.createElement("tr")
    var clmn1 = document.createElement("td");
    clmn1.setAttribute("class", "no-line")
    var clmn2 = document.createElement("td");
    clmn2.setAttribute("class", "no-line")
    var total = document.createElement("td");
    total.setAttribute("class", "no-line text-center")
    var totalB = document.createElement("strong")
    totalB.innerHTML = "totales"
    total.appendChild(totalB)
    var clmn4 = document.createElement("td");
    clmn4.setAttribute("class", "no-line text-right")
    clmn4.innerHTML = "$" + orderSummary.total_bill
    total_file.appendChild(clmn1)
    total_file.appendChild(clmn2)
    total_file.appendChild(total)
    total_file.appendChild(clmn4)
    tableBodyTag.appendChild(total_file)
  },
  handlePayment: function () {

    document.getElementById("modal-div").style.display="none"
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
    firebase
    .firestore()
    .collection("tables")
    .doc(tNumber)
    .update({
      current_orders:{},
      total_bill:0
    })
    .then(()=>{
      swal({
        icon: "success",
        title: "¡Gracias por tu compra!",
        text: "¡Vuelva pronto!",
        timer: 2500,
        buttons: false
      });
    })
  },
  handleMarkerLost: function () {
    // Cambiar la visibilidad del botón div
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
