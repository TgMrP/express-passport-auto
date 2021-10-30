# express-passport-auto

## How To Use?

create user model file

```
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
```

import **express-passport-auto**

```
const PassportClass = require("express-passport-auto");
```

and init on your express app

```
const Passport = new PassportClass(app, User, options);
```

### sample for app

```
const express = require("express");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const User = require("./models/User");
const PassportClass = require("express-passport-auto");
const app = express();
const MongoStore = require("connect-mongo");

mongoose.connect("mongodb://localhost:27017/auth", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const mongoStore = new MongoStore({
  mongoUrl: "mongodb://localhost:27017/auth",
});

// Middleware
app.engine("hbs", hbs({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/public"));
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const Passport = new PassportClass(app, User, {
  session: {
    secret: "my-secrets",
    store: mongoStore,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 * 24 * 7 },
  },
});

app.listen(3000, () => {
  console.log("Listen on 3000");
});
```

### now you have 2 routes in your app

POST http://localhost:3000/auth/login

GET http://localhost:3000/auth/logout

# Options

#### session

default

```
{
    resave: false,
    saveUninitialized: true
}
```

#### routes

default

```
routes: {
    login: true,
    logout: true
}
```
