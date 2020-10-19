const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { auth, requiredScopes } = require("express-oauth2-bearer");

const {
  NODE_ENV = "development",
  PORT = 5000,
  VERCEL_GITHUB_REPO,
  VERCEL_GITHUB_ORG,
} = process.env;

const app = express();

let appUrl = `http://localhost:${PORT}`;

if (NODE_ENV === "production") {
  appUrl = `https://${VERCEL_GITHUB_REPO}.${VERCEL_GITHUB_ORG.toLowerCase()}.vercel.app`;

  app.use((req, res, next) => {
    const host = req.headers.host;
    if (!appUrl.includes(host)) {
      return res.status(301).redirect(appUrl);
    }
    return next();
  });
}

app.use(cors());

const expenses = [
  {
    date: new Date(),
    description: "Pizza for a Coding Dojo session.",
    value: 102,
  },
  {
    date: new Date(),
    description: "Coffee for a Coding Dojo session.",
    value: 42,
  },
];

/****************************
 * This method is here to allow a
 * successful response on root requests.
 * This stops content security policy
 * from preventing the user to make
 * requests via the browsers console.
 ****************************/
app.get("/", (req, res) => {
  res.status(200).end("OK");
});
/****************************/

app.get("/total", (req, res) => {
  const total = expenses.reduce((accum, expense) => accum + expense.value, 0);
  res.send({ total, count: expenses.length });
});

// 👆 public routes above 👆
app.use(auth());
// 👇 private routes below 👇

app.get("/reports", requiredScopes("read:reports"), (req, res) => {
  res.send(expenses);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    message: err.message,
  });
});

const port = process.env.PORT || 5000;

createServer(app).listen(port, () => {
  console.log(`listening on ${port}`);
});
