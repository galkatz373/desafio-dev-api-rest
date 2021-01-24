import express from "express";
import { knex } from "./config";
const router = express.Router();

/**
 * @swagger
 * /account:
 *   post:
 *     summary: Creating account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personId:
 *                 type: integer
 *               dailyWithdrawalLimit:
 *                 type: double
 *               accountType:
 *                 type: integer
 *             example:
 *               personId: 67
 *               dailyWithdrawalLimit: 1024.56
 *               accountType: 5
 *     produces:
 *       - integer
 *     responses:
 *       200:
 *         description: id of the new account
 */

router.post("/", async function (req, res) {
  try {
    const data = req.body as {
      personId: number;
      dailyWithdrawalLimit: number;
      accountType: number;
    };

    const accounts = await knex("account").insert(data).returning("*");
    res.json(accounts[0].accountId);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /account/deposit:
 *   put:
 *     summary: Deposit operation on a specific account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: integer
 *               value:
 *                 type: double
 *             example:
 *               value: 1020
 *               accountId: 95
 *     produces:
 *       - integer
 *     responses:
 *       400:
 *         description: If the account blocked then error occurs
 *       200:
 *         description: returns new balance
 */

router.put("/deposit", async function (req, res) {
  try {
    const data = req.body as {
      value: number;
      accountId: number;
    };

    const { activeFlag } = await knex("account")
      .where("accountId", data.accountId)
      .select("activeFlag")
      .first();

    if (activeFlag) {
      await knex("transactions").insert(data);

      const accounts = await knex("account")
        .where("accountId", data.accountId)
        .increment("balance", data.value)
        .returning("*");

      res.json(+accounts[0].balance);
    } else {
      res.status(400).send("Cannot perform operations on this account");
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /account/balance_inquiry/{accountId}:
 *   get:
 *     summary: Account balance inquiry.
 *     parameters:
 *      - in: path
 *        name: accountId
 *        type: integer
 *        required: true
 *        description: Numeric ID of the account to get.
 *     produces:
 *       - double
 *     responses:
 *       200:
 *         description: returns new balance
 */

router.get("/balance_inquiry/:accountId", async function (req, res) {
  try {
    const { accountId } = req.params;

    const account = await knex("account")
      .where("accountId", accountId)
      .select("balance")
      .first();

    res.json(+account.balance);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /account/withdrawal:
 *   put:
 *     summary: Withdrawal operation on a specific account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: integer
 *               value:
 *                 type: double
 *             example:
 *               value: 456
 *               accountId: 22
 *     produces:
 *       - double
 *     responses:
 *       400:
 *         description: If exceeds daily withdrawal limit or when account not active
 *       200:
 *         description: returns new balance
 */

router.put("/withdrawal", async function (req, res) {
  try {
    const { accountId, value } = req.body as {
      accountId: number;
      value: number;
    };

    const account = await knex("account")
      .where("accountId", accountId)
      .select("dailyWithdrawalLimit", "activeFlag")
      .first();

    if (account.activeFlag) {
      const transactions = await knex("transactions")
        .where("transactionDate", new Date().toISOString().substring(0, 10))
        .andWhere("accountId", accountId)
        .andWhere("value", "<", 0)
        .sum("value");

      if (
        Math.abs(+transactions[0].sum + -value) > +account.dailyWithdrawalLimit
      ) {
        res.status(400).send("Exceeds daily withdrawal!");
      } else {
        await knex("transactions").insert({
          accountId,
          value: -value,
        });

        const account = await knex("account")
          .decrement("balance", value)
          .where("accountId", accountId)
          .returning("*");

        res.json(account[0].balance);
      }
    } else {
      res.status(400).send("Cannot perform operations on this account");
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /account/block:
 *   put:
 *     summary: Block operation on a specific account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: integer
 *             example:
 *               accountId: 11
 *     produces:
 *       - string
 *     responses:
 *       200:
 *         description: returns success message
 */

router.put("/block", async function (req, res) {
  try {
    const { accountId } = req.body as {
      accountId: number;
    };

    await knex("account")
      .update({
        activeFlag: false,
      })
      .where("accountId", accountId);

    res.json("The account has been blocked!");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /account/log/{accountId}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: accountId
 *        type: integer
 *        required: true
 *        description: Numeric ID of the account.
 *     summary: Get account transactions history.
 *     responses:
 *       200:
 *         description: Returns transactions order by date.
 */

router.get("/log/:accountId", async function (req, res) {
  try {
    const { accountId } = req.params;

    const transactions = await knex("transactions")
      .where("accountId", accountId)
      .orderBy("transactionDate", "desc");

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
