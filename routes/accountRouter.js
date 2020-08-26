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

export { app as accountRouter };
