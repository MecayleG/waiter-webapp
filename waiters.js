module.exports = function Waiters(pool) {

    async function waiterEntry(name) {
        const selectQuery = await pool.query('select id from waiters_info where (names)=($1)', [name])
        if (selectQuery.rowCount === 0) {
            await pool.query('insert into waiters_info (names) values ($1)', [name])

        }
    }
    async function allNames() {
        let all = await pool.query('select names from waiters_info');
        // console.log(all.rows.names)
        return all.rows
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
    async function allInfoTable() {
        let allInfo = await pool.query('select * from all_info')
        return allInfo.rows
    }

    async function returnDays() {
        const days = await pool.query('select days from weekdays');
        return days.rows

    }
    async function returnNames() {

        // let shifts = [{
        //         day: "",
        //         days_Id: 1,
        //         waiters: [],
        //         color: ""
        //     },
        //     {
        //         day: "",
        //         days_Id: 2,
        //         waiters: [],
        //         color: ""
        //     },
        //     {
        //         day: "",
        //         days_Id: 3,
        //         waiters: [],
        //         color: ""
        //     },
        //     {
        //         day: "",
        //         days_Id: 4,
        //         waiters: [],
        //         color: ""
        //     },
        //     {
        //         day: "",
        //         days_Id: 5,
        //         waiters: [],
        //         color: ""
        //     },
        //     {
        //         day: "",
        //         days_Id: 6,
        //         waiters: [],
        //         color: ""
        //     },
        //     {
        //         day: "",
        //         days_Id: 7,
        //         waiters: [],
        //         color: ""
        //     }

        // ];

        // get all the days from the database
        const getAllTheDaysSQL = 'select * from weekdays';
        const eachWeekday = await pool.query(getAllTheDaysSQL)
        const shifts = eachWeekday.rows


        // loop over shifts

        // run the select query for each...

        // add the waiters to the waiters array
        for (let shift of shifts) {
            const sql = 'select names, all_info.id  from waiters_info join all_info on waiters_info.id = all_info.names_id where days_id = $1'
            let name = await pool.query(sql, [shift.id])
            let waiterNames = name.rows
            shift.waiters = waiterNames

            if (shift.waiters && shift.waiters.length > 0) {
                if (shift.waiters.length > 3) {
                    shift.color = 'red'
                } else if (shift.waiters.length === 3) {

                    shift.color = 'green'
                } else {
                    shift.color = 'gold'
                }
            }

        }

        return shifts

    }

    async function resetSchedule() {
        await pool.query('delete from all_info')
    }
    return {
        waiterEntry,
        allNames,
        dayEntry,
        allInfoTable,
        returnDays,
        returnNames,
        resetSchedule
    }
}