const express = require('express');
let app = express();

const exphbs = require('express-handlebars');

const bodyParser = require('body-parser');

const Waiters = require("./waiters");
// const routes = require("./routes/route")
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
    let allDays = await waiters.returnDays();

    res.render("index", {
        allDays
    })
});
app.post("/waiters/:username", async function(req, res) {
    let user = req.params.username
    let days = req.body.day
    console.log(days.length)
    if (user && days !== "") {
        req.flash('msg', 'days successfully submitted')
    }
    //  else if (user !== "" && days.length === 0) {
    //     req.flash('msg', 'Please select days')
    // }
    let allDays = await waiters.returnDays();
    await waiters.waiterEntry(user);
    await waiters.dayEntry(user, days)

    await waiters.allNames()


    res.render("index", {
        name: [{
            'user': user
        }],
        allDays
    })
});

app.get("/waiters/:username", async function(req, res) {
    let user = req.params.username
    await waiters.waiterEntry(user);
    await waiters.returnNames()
    let allDays = await waiters.returnDays();
    let theNameId = await waiters.getId(user)
    let schedule = await waiters.selectedShifts(theNameId)
    allDays.forEach(day => {
        schedule.forEach(shift => {
            if (shift.days_id === day.id) {
                day.state = "checked"
            }
        });
    });
    res.render("index", {
        name: [{
            'user': user
        }],
        allDays

    });
});
app.get("/days", async function(req, res) {
    let names = await waiters.returnNames();
    res.render("days", {
        shifts: names
    })

});
app.get("/shift_delete/:id", async function(req, res) {
    let individualId = req.params.id
    await waiters.deleteId(individualId)
    res.redirect("/waiters")
})
app.get("/reset", async function(req, res) {
    await waiters.resetSchedule()
    req.flash('reset', 'Week succesfully reset')

    res.redirect("/days")
});

const PORT = process.env.PORT || 3040;

app.listen(PORT, function() {
    console.log('App starting on port', PORT);
});