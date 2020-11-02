module.exports = function Waiters(pool) {

    async function waiterEntry(name) {
        const selectQuery = await pool.query('select id from waiters_info where (names)=($1)', [name])
        if (selectQuery.rowCount === 0) {
            await pool.query('insert into waiters_info (names) values ($1)', [name])

        }
    }
    async function dayEntry(name, day) {
        const selectQuery = await pool.query('select id from waiters_info where (names)=($1)', [name])
        const nameId = selectQuery.rows[0].id
        for (let i = 0; i < day.length; i++) {
            const selectedDays = await pool.query('select id from weekdays where days =($1)', [day[i]])
            const dayId = selectedDays.rows[0].id
            await pool.query('insert into all_info (names_id, days_id) values ($1, $2)', [nameId, dayId])
        }
    }

    async function returnDays() {
        const days = await pool.query('select days from weekdays');
        return days.rows

    }
    async function returnNames() {

        let shifts = [{
                day: "",
                days_Id: 1,
                waiters: [],
                color: ""
            },
            {
                day: "",
                days_Id: 2,
                waiters: [],
                color: ""
            },
            {
                day: "",
                days_Id: 3,
                waiters: [],
                color: ""
            },
            {
                day: "",
                days_Id: 4,
                waiters: [],
                color: ""
            },
            {
                day: "",
                days_Id: 5,
                waiters: [],
                color: ""
            },
            {
                day: "",
                days_Id: 6,
                waiters: [],
                color: ""
            },
            {
                day: "",
                days_Id: 7,
                waiters: [],
                color: ""
            }

        ];

        // loop over shifts

        // run the select query for each...

        // add the waiters to the waiters array
        for (let shift of shifts) {
            const sql = 'select names from waiters_info join all_info on waiters_info.id = all_info.names_id where days_id = $1'
            let name = await pool.query(sql, [shift.days_Id])
            let waiterNames = name.rows
            shift.waiters.push(waiterNames)
            if (shift.waiters[0].length > 3) {
                shift.color = 'red'
            } else if (shift.waiters[0].length < 3) {

                shift.color = 'purple'
            } else {
                shift.color = 'green'
            }
        }
        for (let eachDay of shifts) {
            const sql = 'select days from weekdays right join all_info on weekdays.Id = all_info.days_Id where days_id = $1'
            let day = await pool.query(sql, [eachDay.days_Id])
            let dayNames = day.rows[0].days
                // console.log(dayNames)
            eachDay.day = dayNames
        }

        return shifts

    }

    // async function resetSchedule() {
    //     await pool.query('alter table all_info drop column names_id')
    // }
    return {
        waiterEntry,
        dayEntry,
        returnDays,
        returnNames,
        // resetSchedule
    }
}