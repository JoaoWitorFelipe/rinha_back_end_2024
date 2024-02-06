-- Coloque scripts iniciais aqui
CREATE TYPE tipo_transacao AS ENUM ('d', 'c');

CREATE TABLE clientes (
   id               serial primary key not null,
   limite           integer not null,
   saldo_inicial    integer not null
);

CREATE TABLE transacoes (
    valor               integer not null,
    tipo                tipo_transacao not null,
    descricao           varchar(10) not null,
    data_de_criacao     timestamp not null default now(),
    cliente_id          integer not null,
    foreign key (cliente_id) references clientes (id)
);

DO $$
BEGIN
  INSERT INTO clientes (limite, saldo_inicial)
  VALUES
    (100000, 0),
    (80000, 0),
    (1000000, 0),
    (10000000, 0),
    (500000, 0);
END; $$