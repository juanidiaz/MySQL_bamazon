// Defining dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

var dash = "\n**************************************\n"

var connection = mysql.createConnection({
  // Address to SQL server
  host: "localhost",

  // Port to SQL server
  port: 3306,

  // username
  user: "root",

  // password
  password: "root",

  // DB name
  database: "bamazon"
});

// Create connection to DB
connection.connect(function (err) {
  if (err) throw err; // If there are any errors throw the error

  // If everything is ok then start the CLI application
  startCustomer();
});

function startCustomer() {
  // Query the database for all items on sale
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    // console.table(results)

    inquirer
      .prompt([{
          name: "itemToBuy",
          type: "rawlist",
          message: "What do you want to buy today?",
          choices: function () {

            // Once you have the items display them for the user to choose
            var itemsArray = [];
            for (var i = 0; i < results.length; i++) {
              itemsArray.push(results[i].product_name + "  CDN $" + results[i].price);
            }
            //console.log(itemsArray);
            return itemsArray;
          }
        },
        {
          name: "qty",
          type: "input",
          message: "How many units you want to buy?"
        },
      ])
      .then(function (answer) {

        // Get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if ((results[i].product_name + "  CDN $" + results[i].price) === answer.itemToBuy) {
            chosenItem = results[i];
            //console.log(chosenItem);
          };
        };

        // Check if there is enough stock
        if ((chosenItem.stock_quantity - parseInt(answer.qty)) > 0) {

          // If there is enough stock to clear the order then provide price and reduce stock
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                stock_quantity: (chosenItem.stock_quantity - parseInt(answer.qty))
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function (error) {
              if (error) throw err;
              console.log(dash + "Order placed successfully!\nYour total is CDN$" + (chosenItem.price * parseInt(answer.qty)) + dash);

              productSold(chosenItem, answer.qty);

              // Once order was placed give option to keep buying or quit
              var message = "Would you like to keep buying?"
              again(message);

            }
          );

        } else {
          // If there is not enough stock, allow user to reduce quantity or quit
          var message = "Not enough inventory to clear your order. Do you want to try again with a lower quantity?"
          again(message);
        }

      });
  });
};

// Use this function to ask to start again or quit
function again(msg) {
  inquirer
    .prompt({
      name: "again",
      type: "confirm",
      message: msg,
    })
    .then(function (answer) {
      if (answer.again) {

        // Start again the buying cycle
        startCustomer();
      } else {

        // close connection and quit
        connection.end();
      }
    });
};

function productSold(product, qty) {

  // Log the sale of the product
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [{
        product_sales: (product.product_sales + (product.price + parseInt(qty)))
      },
      {
        item_id: product.item_id
      }
    ],
    function (error) {
      if (error) throw err;

    }
  );




}