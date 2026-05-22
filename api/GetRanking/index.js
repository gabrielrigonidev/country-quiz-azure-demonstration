const appInsights = require("applicationinsights");
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup().start();
}

const { TableClient } = require("@azure/data-tables");

module.exports = async function (context) {

    const aiClient = appInsights.defaultClient;

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

        if (aiClient) aiClient.trackEvent({ name: "GetRanking_Called" });

        context.res = {
            status: 200,
            body: players.slice(0, 10)
        };

    } catch (error) {

        if (aiClient) aiClient.trackException({ exception: error });

        context.res = {
            status: 500,
            body: {
                error: error.message,
                stack: error.stack
            }
        };

    }

};