const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {

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

        context.res = {
            status: 200,
            body: "ok"
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: error.message
        };
    }

};