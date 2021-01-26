import supertest from "supertest";
const { app } = require("./server");

test("POST /account", async () => {
  /**
   * personId exists return 200
   */

  const account1 = { personId: 1, dailyWithdrawalLimit: 300, accountType: 1 };

  const response1 = await supertest(app)
    .post("/account")
    .send(account1)
    .set("Accept", "application/json");

  expect(response1.status).toBe(200);
  expect(response1.body).toEqual(expect.any(Number));

  /**
   * personId doesn't exist return 404
   */

  const account2 = { personId: 40, dailyWithdrawalLimit: 100, accountType: 4 };

  const response = await supertest(app)
    .post("/account")
    .send(account2)
    .set("Accept", "application/json");

  expect(response.status).toBe(404);
  expect(response.text).toEqual("The person id doesn't exists");
});

test("PUT /account/deposit", async () => {
  /**
   * valid deposit operation
   */

  const data1 = { value: 100, accountId: 16 };

  const response1 = await supertest(app)
    .put("/account/deposit")
    .send(data1)
    .set("Accept", "application/json");

  expect(response1.status).toBe(200);
  expect(response1.body).toEqual(expect.any(Number));

  /**
   * accountId doesn't exist returns 404
   */

  const data2 = { accountId: 5, value: 100 };

  const response2 = await supertest(app)
    .put("/account/deposit")
    .send(data2)
    .set("Accept", "application/json");

  expect(response2.status).toBe(404);
  expect(response2.text).toEqual("The account doesn't exists");

  /**
   * blocked account returns 400
   */

  const data3 = { accountId: 24, value: 100 };

  const response3 = await supertest(app)
    .put("/account/deposit")
    .send(data3)
    .set("Accept", "application/json");

  expect(response3.status).toBe(400);
  expect(response3.text).toEqual("Cannot perform operations on this account");
});

test("GET /account/balance_inquiry/{accountId}", async () => {
  /**
   * valid balance inquiry returns 200
   */

  const response1 = await supertest(app).get("/account/balance_inquiry/16");

  expect(response1.status).toBe(200);
  expect(response1.body).toEqual(expect.any(Number));

  /**
   * accountId doesn't exist returns 404
   */

  const response2 = await supertest(app).get("/account/balance_inquiry/5");

  expect(response2.status).toBe(404);
  expect(response2.text).toEqual("The account doesn't exists");
});

test("PUT /account/withdrawal", async () => {
  /**
   * valid withdrawal operation returns 200
   */

  const response1 = await supertest(app)
    .put("/account/withdrawal")
    .send({ accountId: 16, value: 20 });

  expect(response1.status).toBe(200);
  expect(response1.body).toEqual(expect.any(Number));

  /**
   * accountId doesn't exist returns 404
   */

  const response2 = await supertest(app)
    .put("/account/withdrawal")
    .send({ accountId: 5, value: 100 });

  expect(response2.status).toBe(404);
  expect(response2.text).toEqual("The account doesn't exists");

  /**
   *  exceeds daily withdrawal limit returns 400
   */

  const response3 = await supertest(app)
    .put("/account/withdrawal")
    .send({ accountId: 16, value: 10000 });

  expect(response3.status).toBe(400);
  expect(response3.text).toEqual("Exceeds daily withdrawal!");

  /**
   * blocked account returns 400
   */

  const response4 = await supertest(app)
    .put("/account/withdrawal")
    .send({ accountId: 24, value: 100 });

  expect(response4.status).toBe(400);
  expect(response4.text).toEqual("Cannot perform operations on this account");
});

test("PUT /account/block", async () => {
  /**
   * valid block operation returns 200
   */

  const response1 = await supertest(app)
    .put("/account/block")
    .send({ accountId: 33 });

  expect(response1.status).toBe(200);
  expect(response1.text).toEqual("The account has been blocked!");
});

test("GET /account/log/{accountId}", async () => {
  /**
   * account log returns 200
   */

  const response1 = await supertest(app).get("/account/log/16");

  expect(response1.status).toBe(200);
  expect(response1.body[0]).toMatchSnapshot({
    accountId: 16,
    transactionDate: expect.any(String),
    value: expect.any(String),
  });
});
