const { TableClient } = require("@azure/data-tables");

module.exports = async function (context) {

    const client =
        TableClient.fromConnectionString(
            process.env.STORAGE,
            "ranking"
        );

    let players = [];

    for await (const row of client.listEntities()) {
        players.push({
            name: row.name,
            score: row.score
        });
    }

    players.sort((a, b) => b.score - a.score);

    context.res = {
        body: players.slice(0, 10)
    };
};