const appInsights = require("applicationinsights");
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup().start();
}

const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

    const aiClient = appInsights.defaultClient;

    try {
        const tableClient =
            TableClient.fromConnectionString(
                process.env.STORAGE,
                "ranking"
            );

        await tableClient.createTable();

        await tableClient.createEntity({
            partitionKey: "quiz",
            rowKey: Date.now().toString(),
            name: req.body.name,
            score: req.body.score
        });

        if (aiClient) aiClient.trackEvent({
            name: "ScoreSaved",
            properties: {
                playerName: String(req.body.name),
                score: String(req.body.score)
            }
        });

        context.res = {
            status: 200,
            body: "ok"
        };

    } catch (error) {
        if (aiClient) aiClient.trackException({ exception: error });

        context.res = {
            status: 500,
            body: error.message
        };
    }

};