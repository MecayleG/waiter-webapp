const express = require('express');
let app = express();

const exphbs = require('express-handlebars');

const bodyParser = require('body-parser');

const Waiters = require("./waiters");
// const routes = require("./routes/route")


const pg = require("pg");
const Pool = pg.Pool;
const connectionString = process.env.DATABASE_URL || 'postgresql://root:mecayle123@localhost:5432/waitersdatabase';

const pool = new Pool({
    connectionString
});

const waiters = Waiters(pool);
// const route = routes(waiters);

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

app.get("/", async function(req, res) {
    res.render("home", {

    })
});
app.get("/waiters", async function(req, res) {
    res.render("index", {

    })
});
app.post("/waiters/:username", async function(req, res) {
    let user = req.params.username
    let days = req.body.day
    await waiters.waiterEntry(user);
    await waiters.dayEntry(user, days)
    await waiters.colorsAssign()

    res.render("index", {
        name: [{
            'user': user
        }]
    })
});

app.get("/waiters/:username", async function(req, res) {
    let user = req.params.username
    await waiters.waiterEntry(user);


    res.render("index", {
        name: [{
            'user': user
        }]

    });
});
app.get("/days", async function(req, res) {
    let eachDay = await waiters.returnDays();
    let color = await waiters.colorsAssign();
    let names = await waiters.returnNames();
    res.render("days", {
        day: eachDay,
        day: color,
        name: names
    })

});
app.get("/reset", async function(req, res) {
    await waiters.resetSchedule()
    res.render("days")
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log('App starting on port', PORT);
});