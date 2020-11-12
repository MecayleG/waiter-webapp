const express = require('express');
let app = express();

const exphbs = require('express-handlebars');

const bodyParser = require('body-parser');

const Waiters = require("./waiters");
const routes = require("./routes/route")
const flash = require('express-flash');

const session = require('express-session');
app.use(session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());



const pg = require("pg");
const Pool = pg.Pool;
const connectionString = process.env.DATABASE_URL || 'postgresql://root:mecayle123@localhost:5432/waitersdatabase';

const pool = new Pool({
    connectionString
});

const waiters = Waiters(pool);
const route = routes(waiters);

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.engine('handlebars', exphbs({
    layoutsDir: './views/layouts'
}));

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.get("/", route.home);
app.get("/waiters", route.waitersInfo);
app.post("/waiters/:username", route.add);
app.get("/waiters/:username", route.get);
app.get("/days", route.admin);
app.get("/reset", route.reset);

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log('App starting on port', PORT);
});