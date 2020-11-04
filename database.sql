drop database if exists launchstoredb;
create database launchstoredb;

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "category_id" int NOT NULL,
  "user_id" int,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "old_price" int,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "status" int DEFAULT 1,
  "created_at" timestamp DEFAULT (now()),
  "update_at" timestamp DEFAULT (now())
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL
);

insert into categories(name) values ('comida');
insert into categories(name) values ('eletrônicos');
insert into categories(name) values ('automóveis');

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL,
  "product_id" int
);

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "files" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");


CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "cpf_cnpj" text UNIQUE NOT NULL,
  "cep" int,
  "address" text,
  "created_at" timestamp DEFAULT (now()),
  "update_at" timestamp DEFAULT (now())
);

-- foreing key

ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id")

-- create procedure

CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auto update_at products

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- auto update_at users

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Connect pg simple table
 
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- cascade effect when delete user and products

alter table "products" 
drop constraint products_user_id_fkey,
add constraint products_user_id_fkey
foreign key ("user_id")
references "users" ("id")
on delete cascade;

alter table "files"
drop constraint files_product_id_fkey,
add constraint files_product_id_fkey
foreign key ("product_id")
references "products" ("id")
on delete cascade;

-- Reset tables

delete from products;
delete from users;
delete from files;

-- restart sequence auto increment from table ids
alter sequence products_id_seq restart with 1;
alter sequence users_id_seq restart with 1;
alter sequence files_id_seq restart with 1;


-- password recovery
alter table "users" add column reset_token text;
alter table "users" add column reset_token_expires text;

-- create Orders

create table "orders" (
	"id" serial primary key,
  "seller_id" int not null,
  "buyer_id" int not null,
  "product_id" int not null,
  "price" int not null,
  "quantity" int default 0,
  "total" int not null,
  "status" text not null,
  "created_at" timestamp default (now()),
  "updated_at" timestamp default (now())
  );
  
alter table "orders" add foreign key ("seller_id") references "users" ("id");
alter table "orders" add foreign key ("buyer_id") references "users" ("id");
alter table "orders" add foreign key ("product_id") references "products" ("id");

create trigger set_timestamp
before update on orders
for each row
execute procedure trigger_set_timestamp();