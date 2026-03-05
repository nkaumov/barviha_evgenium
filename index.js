require("dotenv").config();

const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const locale = require("./config/locales/ru.json");
const siteRoutes = require("./routes/site");

const app = express();
const PORT = process.env.PORT || 3000;

const getLocaleValue = (object, key) => {
  if (!key || typeof key !== "string") {
    return "";
  }

  return key.split(".").reduce((acc, part) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
      return acc[part];
    }

    return undefined;
  }, object);
};

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      t: (key) => {
        const value = getLocaleValue(locale, key);
        return value === undefined ? key : value;
      }
    }
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/css", express.static(path.join(__dirname, "var", "styles", "css")));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.contact = locale.contacts;
  next();
});

app.use("/", siteRoutes);

app.use((req, res) => {
  res.status(404).render("404", { pageTitleKey: "notFoundPage.title" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
