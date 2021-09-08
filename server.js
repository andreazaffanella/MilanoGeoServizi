var mysql = require('./mysql');
var http = require('http');
//var express = require('express')
//var app = express()


var express = require('./express');
var app = express();
var bodyParser = require('./express/node_modules/body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false});
let comment = {   // POSSIBLY USELESS
  user: "",
  apname: "",
  text:"",
  rating:""
}

var conn = mysql.createConnection({
  host: "localhost",
  user: "exampleuser",
  password: "secret",
  database: "mydb"
});

conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//app.use(express.static('public'));
 app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });

// make the /piblic directory static
app.use(express.static(__dirname + '/public'));
app.use('/static', express.static( __dirname +'/public'));

app.get('/sito.html', function(req, res){
    res.sendFile(__dirname + "/public/html/" + "sito.html");
})


app.post('/insertcomment', urlencodedParser, function(req, res){

     response = { text    : req.body.comment,
                  rating  : req.body.rating,
                  user    : req.body.user,
                  apname  : req.body.apname};

    PopulateDb(response);
    console.log(response);
    conn.query('SELECT * FROM comments WHERE apname=? ORDER BY date DESC',[req.body.apname],function(err, results) {
      //console.log(results);
      res.send(results);
      console.log(results);
      if(err) console.log("Database error");
    });
    //res.end(JSON.stringify(response));
})

app.get('/getapdata', function(req, res){
      console.log("APNAME: "+(req.query.apname));

      conn.query('SELECT * FROM comments WHERE apname=? ORDER BY date DESC',[req.query.apname],function(err, results) {
        console.log(results);
        res.send(results);
        if(err) console.log("Database error");
      });
})
app.listen(3000, function() { console.log('listening')});


function PopulateDb (CommentForm){
  var sql = "INSERT INTO comments (user,apname,text,rating) VALUES ?";
  var values = [
    [CommentForm.user, CommentForm.apname, CommentForm.text, CommentForm.rating]
  ];
  conn.query(sql, [values], function (err, result) {
    if (err) console.log("Database error");
    console.log("Number of records inserted: " + result.affectedRows);
  });
}
