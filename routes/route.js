module.exports = function TheRoutes(waiters) {

    async function home(req, res, next) {
        try {
            res.render("home", {})
        } catch (err) {
            next(err);
        }
    }

    async function waitersInfo(req, res, next) {
        try {
            let allDays = await waiters.returnDays();
            res.render("index", {
                allDays
            })

        } catch (err) {
            next(err);
        }
    }
    async function add(req, res, next) {
        try {
            let user = req.params.username
            let days = req.body.day
            let allDays = await waiters.returnDays();
            if (days === undefined) {
                req.flash('error', 'Please select days')
                res.render("index", {
                    allDays
                });
                return
            } else if (user && days !== "") {
                req.flash('msg', 'days successfully submitted')
            }
            await waiters.waiterEntry(user);
            await waiters.dayEntry(user, days)
            await waiters.allNames()
            res.render("index", {
                name: [{
                    'user': user
                }],
                allDays
            })
        } catch (err) {
            next(err);
        }
    }
    async function get(req, res, next) {
        try {
            let user = req.params.username
            let days = req.body.day

            await waiters.waiterEntry(user);
            await waiters.dayEntry(user, days)
            await waiters.allNames()
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

        } catch (err) {
            next(err);
        }
    }
    async function admin(req, res, next) {
        try {
            let selectedWeek = req.body.week

            let names = await waiters.returnNames();

            res.render("days", {
                shifts: names,
                week: selectedWeek
            })
        } catch (err) {
            next(err);
        }
    }
    async function reset(req, res, next) {
        try {
            await waiters.resetSchedule()
            req.flash('reset', 'Week succesfully reset')

            res.redirect("/days")
        } catch (err) {
            next(err);
        }
    }

    return {
        home,
        waitersInfo,
        add,
        get,
        admin,
        reset
    }
}