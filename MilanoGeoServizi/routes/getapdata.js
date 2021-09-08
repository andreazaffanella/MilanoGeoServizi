var express = require('express');
var router = express.Router();
var mysql = require('mysql');

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

/* GET data. */
router.get('/', function(req, res){
      console.log("APNAME: "+(req.query.apname));

      conn.query('SELECT * FROM comments WHERE apname=? ORDER BY date DESC',[req.query.apname],function(err, results) {
        console.log(results);
        res.send(results);
        if(err) console.log("Database error");
      });
});

module.exports = router;
