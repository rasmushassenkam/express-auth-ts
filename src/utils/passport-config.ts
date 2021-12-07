import { PassportStatic } from "passport";
import LocalStrategy from "passport-local";
import IProfile from "../interfaces/schemas/IProfile";
import Profile from "../models/Profile";
import bcryptjs from "bcryptjs";

const initialize = (passport: PassportStatic) => {
  const authenticateUser = async (
    email: string,
    password: string,
    done: Function
  ) => {
    const lowerCaseEmail = email.toLowerCase();
    const profile = await Profile.findOne({ email: lowerCaseEmail });

    if (!profile) {
      return done(null, false, { message: "Auth error" });
    }
    try {
      if (await bcryptjs.compare(password, profile.password)) {
        return done(null, profile);
      } else {
        return done(null, false, { message: "Auth error" });
      }
    } catch (err) {
      console.log("###### PASSPORT CONFIG ERROR ######", err);
      done(err);
    }
  };

  passport.use(
    new LocalStrategy.Strategy({ usernameField: "email" }, authenticateUser)
  );

  passport.serializeUser((profile: any, done) => {
    console.log("Serialize: ", profile);
    done(null, profile.id);
  });
  passport.deserializeUser((id, done) => {
    Profile.findOne({ _id: id }, (err: any, profile: IProfile) => {
      console.log("Deserialize: ", profile);
      done(err, profile);
    });
  });
};

export default initialize;
