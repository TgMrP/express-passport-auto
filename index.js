const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const session = require("express-session");

class PassportClass {
  constructor(app, userModel, options = {}) {
    if (!options.session?.secret) throw new Error("you must specify a secret");
    this.session = {
      resave: false,
      saveUninitialized: true,
      ...options.session,
    };

    this.app = app;
    this.user = userModel;

    if (!options.routes) this.routes = {};
    if (!options.routes?.login) this.routes = { ...this.routes, login: true };
    if (!options.routes?.logout)
      options.routes = { ...this.routes, logout: true };

    this.options = options;

    this.init();
  }

  get passport() {
    return passport;
  }

  get bcrypt() {
    return bcrypt;
  }

  get localStrategy() {
    return localStrategy;
  }

  installPassport() {
    this.app.use(session(this.session));
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  installSerialize() {
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await this.user.findOne({ _id: id });
        done(null, user);
      } catch (error) {
        done(null, false);
      }
    });
  }

  installLocalStrategy() {
    passport.use(
      new localStrategy(
        {
          usernameField: "email",
          passwordField: "password",
          passReqToCallback: true,
        },
        async (req, email, password, done) => {
          const user = await this.user.findOne({ email });

          if (!user) {
            return done(null, false, {
              message: "Incorrect user/password",
            });
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log(passwordMatch);
          if (!passwordMatch) {
            return done(null, false, {
              message: "Incorrect user/password",
            });
          }

          done(null, user);
        }
      )
    );
  }

  initLoginRoute() {
    this.app.post(
      "/auth/login",
      passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login?error=true",
      })
    );
  }

  initLogoutRoute() {
    this.app.get("/auth/logout", (req, res) => {
      req.logout();
      res.json({
        success: true,
        message: "logout successfully",
      });
    });
  }

  init() {
    this.installPassport();
    this.installSerialize();
    this.installLocalStrategy();

    if (this.options.routes.login) {
      this.initLoginRoute();
    }

    if (this.options.routes.logout) {
      this.initLogoutRoute();
    }
  }

  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
  }

  isGuest(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.sendStatus(401);
  }
}

module.exports = PassportClass;
