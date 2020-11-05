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
    after(function() {
        pool.end();
    })

});