import Knex from "knex";

export const knex = Knex({
  client: "pg",
  connection: {
    ssl: { rejectUnauthorized: false },
    port: 5432,
    host: "ec2-54-170-190-29.eu-west-1.compute.amazonaws.com",
    user: "bwzcuxvgbhikqz",
    password:
      "244ed2355dfa9a2696d124330d63c774142dbb7969b590e33f590b043ba63812",
    database: "d1eu26ibbqhsad",
  },
});
