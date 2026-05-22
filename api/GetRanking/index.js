const { TableClient } = require("@azure/data-tables");

module.exports = async function (context) {

    try {

        context.log("Iniciando GetRanking");

        const tableClient =
            TableClient.fromConnectionString(
                process.env.STORAGE,
                "ranking"
            );

        await tableClient.createTable();

        let players = [];

        for await (const row of tableClient.listEntities()) {

            players.push({
                name: row.name,
                score: row.score
            });

        }

        players.sort((a, b) => b.score - a.score);

        context.res = {
            status: 200,
            body: players.slice(0, 10)
        };

    } catch (error) {

        context.res = {
            status: 500,
            body: {
                error: error.message,
                stack: error.stack
            }
        };

    }

};