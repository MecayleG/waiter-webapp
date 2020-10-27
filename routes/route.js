module.exports = function TheRoutes(waiters) {

    async function home(req, res, next) {
        res.render("index");
    }

    async function waitersInfo(req, res, next) {



    }


    return {
        home,
        waitersInfo
    }
}