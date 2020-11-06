const assert = require('assert');

const Waiters = require("../waiters");

describe("The Waiter Availability", function() {
    const pg = require("pg");
    const Pool = pg.Pool;
    const connectionString = process.env.DATABASE_URL || 'postgresql://root:mecayle123@localhost:5432/testDB';
    const pool = new Pool({
        connectionString
    });
    beforeEach(async function() {
        await pool.query("drop table all_info");
        await pool.query("drop table waiters_info");
        await pool.query("create table waiters_info (id serial not null primary key,names text not null)");
        await pool.query("create table all_info(id serial not null primary key,names_id int,days_id int,foreign key (names_id) references waiters_info(id),foreign key (days_id) references weekdays(id))");

    });
    describe("The waiterEntry function", function() {
        it("should add Kelly to the database", async function() {
            let waiters = Waiters(pool)

            await waiters.waiterEntry("Kelly")
            assert.deepEqual([{ names: "Kelly" }], await waiters.allNames());

        });
        it("should add Nora to the database", async function() {
            let waiters = Waiters(pool)

            await waiters.waiterEntry("Nora")

            assert.deepEqual([{ names: "Nora" }], await waiters.allNames());

        });

        it("should add tinka to the database", async function() {
            let waiters = Waiters(pool)

            await waiters.waiterEntry("tinka")
            assert.deepEqual([{ names: "tinka" }], await waiters.allNames())
        });
    });
    describe("The dayEntry function", function() {
        it("should add the name Kelly and Monday,Tuesday into the database as Id's", async function() {
            let waiters = Waiters(pool)
            await waiters.waiterEntry("Kelly")

            await waiters.dayEntry("Kelly", ["Monday", "Tuesday"]);
            assert.deepEqual([{ "days_id": 2, "id": 1, "names_id": 1 }, { "days_id": 3, "id": 2, "names_id": 1 }], await waiters.allInfoTable());
        });
        it("should add the name Nora and Sunday,Monday,Wednesday into the database as Id's", async function() {
            let waiters = Waiters(pool)

            await waiters.waiterEntry("Nora")
            await waiters.dayEntry("Nora", ["Sunday", "Monday", "Wednesday"]);
            assert.deepEqual([{ "days_id": 1, "id": 1, "names_id": 1 }, { "days_id": 2, "id": 2, "names_id": 1 }, { "days_id": 4, "id": 3, "names_id": 1 }], await waiters.allInfoTable());
        });
        it("should add the name Tinka and Thursday,Friday,Saturday into the database as Id's", async function() {
            let waiters = Waiters(pool)
            await waiters.waiterEntry("tinka")
            await waiters.dayEntry("tinka", ["Thursday", "Friday", "Saturday"]);
            assert.deepEqual([{ "days_id": 5, "id": 1, "names_id": 1 }, { "days_id": 6, "id": 2, "names_id": 1 }, { "days_id": 7, "id": 3, "names_id": 1 }], await waiters.allInfoTable());
        });
    });
    describe("The returnNames function", function() {
        it("should change the color to green for 3 waiters on selected days", async function() {
            let waiters = Waiters(pool)
            await waiters.waiterEntry("lola")
            await waiters.dayEntry("lola", ["Monday", "Friday", "Saturday"]);
            await waiters.waiterEntry("sia")
            await waiters.dayEntry("sia", ["Tuesday", "Wednesday", "Saturday"]);
            await waiters.waiterEntry("zola")
            await waiters.dayEntry("zola", ["Thursday", "Friday", "Saturday"]);


            assert.deepEqual([{ "days": "Sunday", "id": 1, "waiters": [] }, { "color": "gold", "days": "Monday", "id": 2, "waiters": [{ "id": 1, "names": "lola" }] }, { "color": "gold", "days": "Tuesday", "id": 3, "waiters": [{ "id": 4, "names": "sia" }] }, { "color": "gold", "days": "Wednesday", "id": 4, "waiters": [{ "id": 5, "names": "sia" }] }, { "color": "gold", "days": "Thursday", "id": 5, "waiters": [{ "id": 7, "names": "zola" }] }, { "color": "gold", "days": "Friday", "id": 6, "waiters": [{ "id": 2, "names": "lola" }, { "id": 8, "names": "zola" }] }, { "color": "green", "days": "Saturday", "id": 7, "waiters": [{ "id": 3, "names": "lola" }, { "id": 6, "names": "sia" }, { "id": 9, "names": "zola" }] }], await waiters.returnNames());
        });
        it("should change the color to gold for less than 3 waiters on selected days", async function() {
            let waiters = Waiters(pool)
            await waiters.waiterEntry("kiya")
            await waiters.dayEntry("kiya", ["Monday", "Friday", "Saturday"]);
            await waiters.waiterEntry("launa")
            await waiters.dayEntry("launa", ["Tuesday", "Wednesday", "Thursday"]);


            assert.deepEqual([{ "days": "Sunday", "id": 1, "waiters": [] }, { "color": "gold", "days": "Monday", "id": 2, "waiters": [{ "id": 1, "names": "kiya" }] }, { "color": "gold", "days": "Tuesday", "id": 3, "waiters": [{ "id": 4, "names": "launa" }] }, { "color": "gold", "days": "Wednesday", "id": 4, "waiters": [{ "id": 5, "names": "launa" }] }, { "color": "gold", "days": "Thursday", "id": 5, "waiters": [{ "id": 6, "names": "launa" }] }, { "color": "gold", "days": "Friday", "id": 6, "waiters": [{ "id": 2, "names": "kiya" }] }, { "color": "gold", "days": "Saturday", "id": 7, "waiters": [{ "id": 3, "names": "kiya" }] }], await waiters.returnNames());
        });
        it("should change the color to red for more than 3 waiters on selected days", async function() {
            let waiters = Waiters(pool)
            await waiters.waiterEntry("kiya")
            await waiters.dayEntry("kiya", ["Sunday", "Friday", "Saturday"]);
            await waiters.waiterEntry("launa")
            await waiters.dayEntry("launa", ["Sunday", "Tuesday", "Thursday"]);
            await waiters.waiterEntry("Ami")
            await waiters.dayEntry("Ami", ["Sunday", "Wednesday", "Friday"]);
            await waiters.waiterEntry("joe")
            await waiters.dayEntry("joe", ["Sunday", "Wednesday", "Thursday"]);



            assert.deepEqual([{ "color": "red", "days": "Sunday", "id": 1, "waiters": [{ "id": 1, "names": "kiya" }, { "id": 4, "names": "launa" }, { "id": 7, "names": "Ami" }, { "id": 10, "names": "joe" }] }, { "days": "Monday", "id": 2, "waiters": [] }, { "color": "gold", "days": "Tuesday", "id": 3, "waiters": [{ "id": 5, "names": "launa" }] }, { "color": "gold", "days": "Wednesday", "id": 4, "waiters": [{ "id": 8, "names": "Ami" }, { "id": 11, "names": "joe" }] }, { "color": "gold", "days": "Thursday", "id": 5, "waiters": [{ "id": 6, "names": "launa" }, { "id": 12, "names": "joe" }] }, { "color": "gold", "days": "Friday", "id": 6, "waiters": [{ "id": 2, "names": "kiya" }, { "id": 9, "names": "Ami" }] }, { "color": "gold", "days": "Saturday", "id": 7, "waiters": [{ "id": 3, "names": "kiya" }] }], await waiters.returnNames());
        });


    });

    after(function() {
        pool.end();
    })

});