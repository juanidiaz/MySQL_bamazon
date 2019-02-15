// ==============================================================================
// Defining dependencies and other variables
// ==============================================================================
var mysql = require("mysql");
var inquirer = require("inquirer");

// Include this npm npm package to load environment variables from an .env file
require("dotenv").config();

var dash = "\n**************************************\n"

// ==============================================================================
// SQL CONFIGURATION
// This sets up the basic properties for SQL server connection
// ==============================================================================

var connection = mysql.createConnection({
  // Address to SQL server
  host: process.env.SQL_HOST,

  // Port to SQL server
  port: process.env.SQL_PORT,

  // username
  user: process.env.SQL_USER,

  // password
  password: process.env.SQL_PASSWORD,

  // DB name
  database: "bamazon"
});
// ==============================================================================

// Create connection to DB
connection.connect(function (err) {
  if (err) throw err; // If there are any errors throw the error

  // If everything is ok then start the CLI application
  startManager();
});

// Start the manager application. Show the options
function startManager() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "Exit"
      ]
    })
    .then(function (answer) {
      switch (answer.action) { // Here the program will serve the user's request
        
        case "View Products for Sale":
          viewProducts();
          break;

        case "View Low Inventory":
          lowStock();
          break;

        case "Add to Inventory":
          addStock();
          break;

        case "Add New Product":
          addProduct();
          break;

        case "Exit":
          connection.end();
          break;
      };
    });
};

// Show the existing products
function viewProducts() {

  // Query the database for all items on sale
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    var productArray = []

    results.forEach(p => {
      productArray.push({
        ID: p.item_id,
        Name: p.product_name,
        Price: p.price,
        QTY: p.stock_quantity
      });
    });

    // Display all the product
    console.log('\n\t** ALL PRODUCTS TABLE **\n');
    console.table(productArray);

    // Ask user if want to return to main menu or quit
    var message = "Want to return to the main menu?"
    again(message);
  });
};

// Show products with low inventory
function lowStock() {

  // Query the database for all items on sale
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    // ANy product with stock below this index will be flagged
    var lowStockIndex = 200;

    var productArray = []

    console.log('\n\t** LOW STOCK TABLE **\n');
    console.log('  * Showing products with stock lower than ' + lowStockIndex + '\n');

    results.forEach(p => {

      if (p.stock_quantity <= lowStockIndex) {

        productArray.push({
          ID: p.item_id,
          "Low Stock item name": p.product_name,
          Price: p.price,
          QTY: p.stock_quantity
        });

      }

    });
    // Display all the product
    console.table(productArray);

    // Ask user if want to return to main menu or quit
    var message = "Want to return to the main menu?"
    again(message);
  });

};

// Add stock to inventory
function addStock() {

  // Query the database for all items on sale
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    inquirer
      .prompt([{
          name: "itemToIncrease",
          type: "list",
          message: "What item do you want to increase stock?",
          choices: function () {

            // Once you have the items display them for the user to choose
            var itemsArray = [];
            for (var i = 0; i < results.length; i++) {
              itemsArray.push(results[i].product_name);
            }
            //console.log(itemsArray);
            return itemsArray;
          }
        },
        {
          name: "qty",
          type: "input",
          message: "How many units you want to increase by?"
        },
      ])
      .then(function (answer) {

        // Get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if ((results[i].product_name) === answer.itemToIncrease) {
            chosenItem = results[i];
            //console.log(chosenItem);
          };
        };

        // If there is enough stock to clear the order then provide price and reduce stock
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [{
              stock_quantity: (chosenItem.stock_quantity + parseInt(answer.qty))
            },
            {
              item_id: chosenItem.item_id
            }
          ],
          function (error) {
            if (error) throw err;
            console.log(dash + "Item stock increased.\nThe new stock is " + (chosenItem.stock_quantity + parseInt(answer.qty)) + dash);

            // Ask user if want to return to main menu or quit
            var message = "Want to return to the main menu?"
            again(message);
          }
        );
      });
  });
};

// Add a new product
function addProduct() {

  // Query the database for all items on sale
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    inquirer
      .prompt([{
        name: "product_name",
        type: "input",
        message: "Product name",
      },
      {
        name: "department_name",
        type: "input",
        message: "Department name",
      },
      {
        name: "price",
        type: "input",
        message: "Sale price",
      },
      {
        name: "stock_quantity",
        type: "input",
        message: "Initial stock",
      },
    ])
      .then(function (answer) {

        var query = connection.query(
          "INSERT INTO products SET ?", {
            product_name: answer.product_name,
            department_name: answer.department_name,
            price: parseFloat(answer.price),
            stock_quantity: parseInt(answer.stock_quantity)
          },
          function (err, res) {
            console.log(res.affectedRows + " product inserted!\n");

            // Ask user if want to return to main menu or quit
            var message = "Want to return to the main menu?"
            again(message);

          }
        );

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
        startManager();
      } else {

        // close connection and quit
        connection.end();
      }
    });
};