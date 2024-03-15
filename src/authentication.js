var express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const env = require("dotenv");

 
env.config();
const uri = process.env.connectionString;
const database = process.env.database;
const collection = process.env.collection;
var cookieParser = require("cookie-parser");

var app = express();
let publicPath = path.join(__dirname,'../public');
app.use(express.static(publicPath));
console.log(publicPath);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function( req, res){
    const client = new MongoClient(uri);  
    console.log(req.cookies.name);
    if(req.cookies.name !== undefined){
        async function run(){
            try {   
               
                const user_ID = req.cookies.name;     
                await client.connect();     
                const db = client.db(database);     
                const users = db.collection(collection);
                const query = { user_ID: user_ID};
                console.log(query);
                const user = await users.findOne(query);
                if (user !== null) {
                    res.send(`<head><title>Welcome Page</title><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh}.container{background-color:#fff;padding:20px;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,.1);width:300px;text-align:center}h2{margin-bottom:20px}p{font-size:18px;margin-bottom:10px}a{text-decoration:none;color:#007bff}</style></head><body><div class="container"><h2>Welcome!</h2><p>Hello, <span id="username"></span></p><a href="/">Logout</a><br><a href="/clearcookies">clearcookies</a></div><script>var username='${user_ID}';document.getElementById("username").innerText=username;</script></body>`);
                } else {
                    res.send("Invalid username or password.");
                }
            } catch (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
            } finally {
                await client.close();
            }
        }
        
       run().catch(console.error)
    }
    else {
        res.sendFile(`${publicPath}/login.html`);
       //res.send(`testing`);
    }
});

app.get('/register', function(req,res){
    res.sendFile(`${publicPath}/register.html`);
});

app.get('/showcookies', function(req,res){
    res.send(req.cookies.name + "<br><br><br><br> <a href='/'>login</a>");
});
app.get('/clearcookies', function(req, res) {
    const cookieName = 'name'; // Replace 'your_cookie_name' with the actual name of your cookie
    res.clearCookie(cookieName);
    res.send("Cookie deleted <a href='/'>login</a>");
});


app.post('/post/register', function (req, res) {
    const client = new MongoClient(uri);
    const user_ID= req.body.user_ID;
    const password = req.body.password;
        if(user_ID == undefined || password == undefined ){
            res.send("The inputs were invalid and can not be used to create a user: <a href='/register'>return</a>")
        }
    async function run(user_ID,password){
        try {
            await client.connect();
            const db = client.db('Bookstore');
            const users = db.collection('Users');
            const query = { user_ID: user_ID, password: password};
            console.log(query);
            await users.insertOne(query);
            res.send("user has been created go back and login please: <a href='/'>login</a>")
            console.log(user_ID);
            console.log(password);
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        } finally {
          
            await client.close();
        }
    } 
  
   run(user_ID,password).catch(console.error)

});

app.post("/post/home", function (req,res) {
    const client = new MongoClient(uri);
    const user_ID= req.body.user_ID;
    const password = req.body.password;
   
    async function run(user_ID,password){
        try {
            await client.connect();
            const db = client.db('Bookstore');
            const users = db.collection('Users');
            const query = { user_ID: user_ID, password: password};
            console.log(query);
            const user = await users.findOne(query);
            console.log(user_ID);
            console.log(password);
            console.log(user);
            if (user !== null) {
                res.cookie('name',user_ID, {maxAge: 20000});
                res.send(`<head><title>Welcome Page</title><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh}.container{background-color:#fff;padding:20px;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,.1);width:300px;text-align:center}h2{margin-bottom:20px}p{font-size:18px;margin-bottom:10px}a{text-decoration:none;color:#007bff}</style></head><body><div class="container"><h2>Welcome!</h2><p>Hello, <span id="username"></span></p><a href="/showcookies">showcookies</a><br><a href="/clearcookies">clearcookies</a></div><script>var username='${user_ID}';document.getElementById("username").innerText=username;</script></body>`);
            } else {
                res.send("Invalid username or password.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        } finally {
            await client.close();
        }
    } 
   run(user_ID,password).catch(console.error);

});




 app.listen(3000);
   




