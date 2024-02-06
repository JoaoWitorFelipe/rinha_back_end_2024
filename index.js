import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: 'rinha',
    user: 'admin',
    password: '123',
})

const app = express();

app.use(bodyParser.json());

app.post('/clientes/:id/transacoes', async ({ body, params }, res) => {
    await client.connect()
 
    const dbRes = await client.query(
        `
            INSERT INTO transacoes
                (
                    valor,
                    tipo,
                    descricao,
                    cliente_id
                )
            VALUES
                (   
                    $1,
                    $2,
                    $3,
                    $4
                )
        `,
        [
            body.valor,
            body.tipo,
            body.descricao,
            params.id,
        ],
    );

    console.log(dbRes);

    await client.end()

    res.send();
})

app.listen(3000, () => {
    console.log('aa');
});