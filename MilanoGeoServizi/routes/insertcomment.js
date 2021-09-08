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
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false});
/* GET users listing. */


router.post('/', urlencodedParser, function(req, res){

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
});


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
module.exports = router;
