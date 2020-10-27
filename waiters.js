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
    async function colorsAssign() {
        let getDay = await pool.query('select days from weekdays join all_info on weekdays.Id = all_info.days_Id order by weekdays.id')
        let arr = getDay.rows

        var map = {},
            colors = []
        arr.forEach(day => {
            if (map[day.days] == undefined) {
                map[day.days] = 0;
            }

            map[day.days] += 1;

        })


        for (const key in map) {
            colors.push({
                days: key,
                color: (map[key] == 3) ? 'green' : (map[key] < 3) ? 'red' : 'purple'
            })
        }
        return colors


    }
    async function returnNames() {
        let names = await pool.query('select names from waiters_info join all_info on waiters_info.id = all_info.names_id')
        console.log(names.rows)
        return names.rows
            // for (let i = 0; i < list.length; i++) {

        //     return Object.values(list[i])
        // }
        // return Object.values(list[i])
    }
    async function resetSchedule() {
        await pool.query('delete names_id from all_info')
    }
    return {
        waiterEntry,
        dayEntry,
        returnDays,
        colorsAssign,
        returnNames,
        resetSchedule
    }
}