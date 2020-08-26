import express from "express";
import mongoose from "mongoose";
import { accountRouter } from "./routes/accountRouter.js";
import { url } from "./url.js";

(async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("Conectado com sucesso ao banco de dados!");
  } catch (error) {
    console.log("Erro ao conectar com o banco de dados: ", error);
  }
})();

const app = express();
app.use(express.json());

app.use(accountRouter);
app.listen(3000, () => console.log("API iniciada com sucesso!"));
