import express from "express";
import { accountModel } from "../models/accountModel.js";

const app = express();

app.get("/accounts", async (req, res) => {
  try {
    const accounts = await accountModel.find({});

    res.send(accounts);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch("/accounts/deposit/:agency/:account/:value", (req, res) => {
  let { agency, account, value } = req.params;

  if (value <= 0) {
    res.status(404).send("Operação inválida!");
  } else {
    const filteredAccount = accountModel
      .findOneAndUpdate(
        {
          agencia: agency,
          conta: account,
        },
        {
          $inc: { balance: value },
        },
        {
          new: true,
        }
      )
      .then((filteredAccount) => {
        if (!filteredAccount) {
          res.status(404).send("Conta ou agência incorreta!");
        } else {
          res.status(200).send("Depósito realizado com sucesso!");
          console.log(filteredAccount);
        }
      })
      .catch((error) => console.log(error));
  }
});

app.patch("/accounts/withdraw/:agency/:account/:value", (req, res) => {
  let { agency, account, value } = req.params;

  if (value <= 0) {
    res.status(404).send("Operação inválida!");
  } else {
    const filteredAccount = accountModel
      .findOneAndUpdate(
        {
          agencia: agency,
          conta: account,
          balance: { $gt: value },
        },
        {
          $inc: { balance: -value - 1 },
        },
        {
          new: true,
        }
      )
      .then((filteredAccount) => {
        if (!filteredAccount) {
          res
            .status(404)
            .send("Conta ou agência incorreta, ou saldo insuficiente!");
        } else {
          res.status(200).send("Saque realizado com sucesso!");
          console.log(filteredAccount);
        }
      })
      .catch((error) => console.log(error));
  }
});

app.get("/accounts/balance/:agency/:account", async (req, res) => {
  try {
    const { agency, account } = req.params;

    const accounts = await accountModel.findOne({
      agencia: agency,
      conta: account,
    });

    if (!accounts) {
      console.log("Agência ou conta inválida(s)");
      res.send("Agência ou conta inválida(s)");
    } else {
      res.send(accounts);
      console.log("Balance: ", accounts.balance);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/accounts/delete/:agency/:account", async (req, res) => {
  try {
    const { agency, account } = req.params;

    const accounts = await accountModel.findOneAndDelete({
      agencia: agency,
      conta: account,
    });

    if (accounts) {
      const totalAccounts = await accountModel.countDocuments({
        agencia: agency,
      });
      console.log(
        "Conta deletada com sucesso! Total de contas ativas na agência: ",
        totalAccounts
      );

      res.send("Conta deletada com sucesso!");
    } else {
      console.log("Conta ou agência não localizada!");
      res.send("Conta ou agência não localizada!");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch(
  "/accounts/transfer/:fromAccountNumber/:toAccountNumber/:value",
  async (req, res) => {
    try {
      const { fromAccountNumber, toAccountNumber, value } = req.params;
      let fare = 0;

      if (value <= 0) {
        res.status(404).send("Operação inválida!");
      } else {
        const fromAccount = await accountModel.findOne({
          conta: fromAccountNumber,
        });

        const toAccount = await accountModel.findOne({
          conta: toAccountNumber,
        });

        if (fromAccount.agencia !== toAccount.agencia) {
          fare = 8;
        }

        await accountModel.findOneAndUpdate(
          {
            conta: fromAccount.conta,
          },
          {
            $inc: { balance: -value - fare },
          },
          {
            new: true,
          }
        );

        await accountModel.findOneAndUpdate(
          {
            conta: toAccount.conta,
          },
          {
            $inc: { balance: +value },
          },
          {
            new: true,
          }
        );
        res.status(200).send("Transferencia realizada com sucesso!");
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

app.get("/accounts/average/:agency", async (req, res) => {
  try {
    const { agency } = req.params;
    let totalBalance = 0;

    const accounts = await accountModel.find({
      agencia: agency,
    });

    accounts.forEach((account) => {
      totalBalance = account.balance + totalBalance;
    });

    if (!accounts) {
      console.log("Agência inválida!");
      res.send("Agência inválida!");
    } else {
      let average = (totalBalance / accounts.length).toFixed(2);
      res.send(average);
      console.log("Balances average: ", average);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/accounts/lesserbalances/:limit", async (req, res) => {
  try {
    const { limit } = req.params;

    const accounts = await accountModel
      .find(
        {},
        {
          name: 0,
        }
      )
      .limit(Number(limit))
      .sort({ balance: 1 });

    res.send(accounts);
    console.log(accounts);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/accounts/greaterbalances/:limit", async (req, res) => {
  try {
    const { limit } = req.params;

    const accounts = await accountModel
      .find({})
      .limit(Number(limit))
      .sort({ balance: -1, name: 1 });

    res.send(accounts);
    console.log(accounts);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch("/accounts/private", async (req, res) => {
  try {
    const accounts = await accountModel.find({});
    const agencies = await accountModel.distinct("agencia");
    let biggestList = [];

    agencies.forEach((agency) => {
      let biggestBalances = 0;
      let biggest = [];
      accounts.forEach((account) => {
        if (account.balance > biggestBalances && account.agencia === agency) {
          biggestBalances = account.balance;
          biggest = account;
        }
      });
      biggestList.push(biggest);
    });

    biggestList.forEach(async (item) => {
      await accountModel.findOneAndUpdate(
        { _id: item._id },
        {
          agencia: 99,
        },
        {
          new: true,
        }
      );
    });

    const privateAgency = await accountModel.find({ agencia: 99 });
    res.send(privateAgency);
  } catch (error) {
    res.status(500).send(error);
  }
});

export { app as accountRouter };
