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

app.get("/accounts/:agency/:account", async (req, res) => {
  try {
    const { agency, account } = req.params;

    const accounts = await accountModel.findOne({
      agencia: agency,
      conta: account,
    });

    if (!accounts) {
      console.log("Agencia ou conta inválida(s)");
      res.send("Agencia ou conta inválida(s)");
    } else {
      res.sendStatus(accounts.balance);
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

// Crie um endpoint para realizar transferências entre contas. Este endpoint deverá
// receber como parâmetro o número da “conta” origem, o número da “conta” destino e
// o valor de transferência. Este endpoint deve validar se as contas são da mesma
// agência para realizar a transferência, caso seja de agências distintas o valor de tarifa
// de transferencia (8) deve ser debitado na “conta” origem. O endpoint deverá retornar
// o saldo da conta origem.

app.patch(
  "/accounts/transfer/:fromAccountNumber/:toAccountNumber/:value",
  async (req, res) => {
    try {
      const { fromAccountNumber, toAccountNumber, value } = req.params;

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
          await accountModel.findOneAndUpdate(
            {
              balance: { $gt: value + 8 },
            },
            {
              $inc: { balance: -value - 8 },
            }
          );
        } else {
          console.log("deu bom");
        }
        // fromAccount =

        // console.log(fromAccount.conta);

        // console.log("from ", fromAccountNumber);
        // console.log("to ", toAccountNumber);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

export { app as accountRouter };
