DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) default 0,
  stock_quantity INTEGER(10) default 0,
  product_sales DECIMAL(10,2) default 0,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Fire 7 Tablet, 7in Display, 8 GB, Black", "Electronics", 59.99, 310), ("All-new Echo Dot (3rd gen)", "Electronics", 69.99, 324), ("Apple Watch Series 3", "Electronics", 499.99, 120);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Fisher-Price On-The-Go Baby Dome", "Baby", 97.01, 140), ("ECO by Naty Baby Travel Wipes", "Baby", 39.8, 387), ("Boba Baby Wrap, Gray", "Baby", 55, 420);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Toastess TSG710 Sandwich Grill", "Appliances", 39.96, 5), ("Oster Belgian Waffle Maker", "Appliances", 31.54, 78), ("Cuisinart CPK-17C Programmable Kettle", "Appliances", 99.99, 104);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Levoit Air Purifier", "Home", 19.92, 167), ("ACTCUT Super Soft Indoor Modern Shag", "Home", 39.99, 245), ("Zinus Memory Foam 12 Inch Green Tea Mattress", "Home", 259, 5);

CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(100) NOT NULL,
  over_head_costs INTEGER(10) default 0,
  PRIMARY KEY (department_id)
);

SELECT * FROM products;
