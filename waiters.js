module.exports = function Waiters(pool) {

    async function waiterEntry(name) {
        const selectQuery = await pool.query('select id from waiters_info where (names)=($1)', [name])
        if (selectQuery.rowCount === 0) {
            await pool.query('insert into waiters_info (names) values ($1)', [name])

        }
    }
    async function allNames() {
        let all = await pool.query('select names from waiters_info');
        return all.rows
    }
    async function dayEntry(name, day) {
        const selectQuery = await pool.query('select id from waiters_info where (names)=($1)', [name])
        const nameId = selectQuery.rows[0].id
        for (let i = 0; i < day.length; i++) {
            const selectedDays = await pool.query('select id from weekdays where days =($1)', [day[i]])
            const dayId = selectedDays.rows[0].id
                // console.log(dayId)
            await pool.query('insert into all_info (names_id, days_id) values ($1, $2)', [nameId, dayId])

        }
    }
    async function allInfoTable() {
        let allInfo = await pool.query('select * from all_info')
        return allInfo.rows
    }

    async function returnDays() {
        const days = await pool.query('select * from weekdays');
        return days.rows

    }
    async function returnNames() {
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
        console.log(shifts)
        return shifts

    }
    async function getId(param) {
        let nameId = await pool.query('select id from waiters_info where (names)=($1)', [param])
        return nameId.rows[0].id
    }
    async function selectedShifts(id) {
        let getId = await pool.query('select * from weekdays join all_info on weekdays.id = all_info.days_id where names_id =($1)', [id])
        return getId.rows
    }
    async function deleteId(nameId) {
        await pool.query('delete from all_info where id = ($1)', [nameId])
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
        getId,
        selectedShifts,
        deleteId,
        resetSchedule
    }
}