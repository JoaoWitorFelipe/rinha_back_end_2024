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

await client.connect()

const app = express();

app.use(bodyParser.json());

app.post('/clientes/:id/transacoes', async ({ body, params }, res) => {
    try {
        const result = await client.query(`SELECT * from clientes where id = $1`, [params.id]);

        if (!result.rowCount) {
            return res.status(404).send()
        }

        await client.query(
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

        const updateBalance = async (balance, userId) => {
            await client.query(`UPDATE clientes SET saldo_inicial = $1 where id = $2`, [balance, userId]);
        }

        const balance = result.rows[0].saldo_inicial - body.valor;

        if (body.tipo === 'c') {
            await updateBalance(balance, params.id);
        } else {
            if (balance < result.rows[0].limite) {
                return res.status(422).json({
                    message: 'Num pode'
                })
            }

            await updateBalance(balance, params.id);
        }

        return res.json({
            'limite': result.rows[0].limite,
            'saldo': balance
        });
    } catch (err) {
        return res.status(500).send();
    }
})


app.get('/clientes/:id/extrato', async (req, res) => {
    try {
        const result = await client.query(`SELECT * from clientes where id = $1`, [req.params.id]);

        if (!result.rowCount) {
            return res.status(404).send()
        }

        const transactions = await client.query('SELECT * FROM transacoes where cliente_id = $1 ORDER BY data_de_criacao DESC LIMIT 10', [req.params.id])

        return res.json({
                "saldo": {
                "total": result.rows[0].saldo_inicial,
                "data_extrato": new Date(),
                "limite": result.rows[0].limite
                },

                "ultimas_transacoes": transactions.rows.map((transaction) => ({
                    "valor": transaction.valor,
                    "tipo": transaction.tipo,
                    "descricao": transaction.descricao,
                    "realizada_em": transaction.data_de_criacao
                }))
        })
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
})


app.listen(3000, () => {
    console.log('Running at: 3000');
});