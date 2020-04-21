/* Require external APIs and start our application instance */
var express = require('express');
var mysql = require('mysql');
var app = express();

/* Configure our server to read public folder and ejs files */
app.use(express.static('public'));
app.set('view engine', 'ejs');

/* Configure MySQL DBMS */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'carmelo',
    password: 'carmelo',
    database: 'quotes_db'
});
connection.connect();

/* The handler for the DEFAULT route */
app.get('/', function(req, res){
    var stmt = 'SELECT DISTINCT category FROM l9_quotes';
    connection.query(stmt, function(error, results){
        if(error) throw error;
        
        var category = results;
   // console.log(category);
    res.render('home', {category: category});
    });

});

/* The handler for the /author route */
app.get('/author', function(req, res){
   if(req.query.firstname.length && req.query.lastname.length){
        var stmt = 'select quote, firstName, lastName, l9_author.authorId as aid from l9_quotes, l9_author where firstName=\'' 
                + req.query.firstname + '\' and lastName=\'' 
                + req.query.lastname + '\';'
   }else if(req.query.keyword.length){
       var stmt = 'select quote, firstName, lastName, l9_author.authorId as aid ' +
                  'from l9_quotes, l9_author ' + 
                  'where quote like "%' + req.query.keyword + '%" ' + 
                  'and l9_quotes.authorId=l9_author.authorId;'
   }else if(req.query.gender.length && req.query.gender!="none"){
      var stmt = 'select quote, firstName, lastName, l9_author.authorId as aid ' +
                  'from l9_quotes, l9_author ' + 
                  'where sex="' + req.query.gender + '" ' + 
                  ' and l9_quotes.authorId=l9_author.authorId;'
   }else if(req.query.categorySelect.length){
       //console.log("true");
       var stmt = 'select quote, firstName, lastName, l9_author.authorId as aid ' +
                  'from l9_quotes, l9_author ' + 
                  'where category="' + req.query.categorySelect + '" ' + 
                  ' and l9_quotes.authorId=l9_author.authorId;'
   }
   
   
	connection.query(stmt, function(error, found){
	    var author = null;
	    if(error) throw error;
	    if(found.length){
	        author = found[0];
	        // Convert the Date type into the String type
	       // author.dob = author.dob.toString().split(' ').slice(0,4).join(' ');
	       // author.dod = author.dod.toString().split(' ').slice(0,4).join(' ');
	    }
	   // console.log(found);
	    res.render('quotes', {quotes: found});
	});
});

/* The handler for the /author/name/id route */
app.get('/author/:aid', function(req, res){
    var stmt = 'select * from l9_author where l9_author.authorId=\'' 
                + req.params.aid + '\';'
    connection.query(stmt, function(error, found){
        var author = null;
        if(error) throw error;
        if(found.length){
            author = found[0];
            // Convert the Date type into the String type
            author.dob = author.dob.toString().split(' ').slice(0,4).join(' ');
            author.dod = author.dod.toString().split(' ').slice(0,4).join(' ');
        }
        res.render('author', {author: author});
    });
});


/* The handler for undefined routes */
app.get('*', function(req, res){
   res.render('error'); 
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
});