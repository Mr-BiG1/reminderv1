const express =  require('express');
const expressLayout = require('express-ejs-layouts');
const connectDB = require('./server/config/database')

const PORT  =  8080;

//add db connection 
connectDB();



const app = express();
app.use(expressLayout);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');
app.use(express.static('public'));




// calling the database connection.


//setting out teh routes.
app.use('',require('./server/routes/route'));



app.listen(PORT,()=>{
    console.log(`server is running on http://127.0.0.1:${PORT}`);
})


