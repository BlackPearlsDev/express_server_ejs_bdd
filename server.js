import express from 'express';
const app = express();
// importation de la librairie qui permets d'accéder aux variables d'environnement de notre application
import "dotenv/config";
// importation de mon LOCAL_PORT qui est une variable d'environnement
import {PORT} from "./lib/index.js";
// importation de notre db
import POOL from "./database/db.js";

// Configuration du moteur de rendu EJS
// On spécifie le lieu des pages à afficher
app.set("views", "./views");
// On spécifie l'extension des fichiers utilisés pour le moteur de rendu pour éviter de les ré-écrire
app.set("view engine", "ejs");

/*******************************************/
// __dirname et __filename disponible uniquement en commonJS et PAS en type module
// on doit, de fait, les créers !! 
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname + '/public')));
/*******************************************/

// ROUTES
// On chaine les méthodes (verbe GET ici) sur l'instance de 'app' pour retourner une response de "rendu" qui contiendra la page à afficher,
// à réception de la request envoyée par le header
app.get("/", async (req, res, next) =>{ // req = request, res = response
    // En arrivant sur la page Home (le "/") on effectue une requete vers la BDD
    // En utilisant cette librairie, le résultat est envoyé dans un talbleau multiple,
    // On le destructure pour avoir les données qui nous intéressent.
    const [result] = await POOL.execute("SELECT * FROM productLines");
    // Et on transmets via un objet dans notre home ce résultat.
    res.render("layout", {template: "home", datas: result});
})

app.get("/orders", async (req, res, next) =>{
    const [result] = await POOL.execute("SELECT orderNumber, shippedDate, orderDate, status, orders.customerNumber FROM orders JOIN customers ON customers.customerNumber = orders.customerNumber");
    res.render("layout", {template: "orders", datas: result});
})

app.get("/orderDetails/:id/:customerId", async (req, res, next) =>{
    const [order] = await POOL.execute("SELECT customerName, contactLastName, contactFirstName, addressLine1, city FROM orders JOIN customers ON orders.customerNumber = customers.customerNumber WHERE orderNumber = ?", [req.params.id]);
    const [orderDetails] = await POOL.execute(`SELECT orders.orderNumber, productName, quantityOrdered, priceEach, (quantityOrdered * priceEach) AS totalPrice, orderdetails.productCode FROM orderdetails INNER JOIN orders ON orderdetails.orderNumber = orders.orderNumber INNER JOIN products ON orderdetails.productCode = products.productCode WHERE orders.orderNumber = ? ORDER BY products.productName`, [req.params.id]);
    // request to get TVA
    const [totalHt] = await POOL.execute(`SELECT SUM(quantityOrdered * priceEach) AS totalPrice FROM orderdetails WHERE orderNumber = ?`, [req.params.id]);
    res.render("layout", {template: `orderDetails`, orders: order, orderId: req.params.id, orderDetails: orderDetails, totalHts: totalHt});
})

app.get("/blog", (req, res, next) =>{
    res.render("layout", {template: "blog"});
})

app.get("/contact", (req, res, next) =>{
    res.render("layout", {template: "contact", formInfo: "Remplissez le formulaire"});
})

// On utilise la méthode listen() sur l'instance de 'app' pour écouter et lancer notre serveur sur le port 9000
app.listen(PORT, () => { // 9000 c'est le port :9000
    console.log(`Listening at http://localhost:${PORT}`);
})