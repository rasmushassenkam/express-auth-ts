import { Router, NextFunction, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { EStatusCode } from "../../enums";
import IRegisterRequest from "../../interfaces/requests/IRegisterRequest";
import IRequest from "../../interfaces/requests/IRequest";
import { IResponse } from "../../interfaces/responses/IResponse";
import IProfile from "../../interfaces/schemas/IProfile";
import Profile from "../../models/Profile";
import passport from "passport";

const router = Router();

// Register
router.post(
  "/register",
  async (
    req: IRequest<IRegisterRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password, password2 } = req.body;

      if (!email || !password || !password2) {
        return res.send(<IResponse<IProfile>>{
          error: {
            validationError: { allFields: "Alle felter skal udfyldes" },
          },
          status: EStatusCode.BAD_REQUEST,
        });
      }

      if (password !== password2) {
        return res.send(<IResponse<IProfile>>{
          error: {
            validationError: { password: "Kodeordene skal være de samme" },
          },
          status: EStatusCode.BAD_REQUEST,
        });
      }

      if (password.length < 6) {
        return res.send(<IResponse<IProfile>>{
          error: {
            validationError: {
              password: "Dit kodeord skal være mindst 6 tegn",
            },
          },
          status: EStatusCode.BAD_REQUEST,
        });
      }

      const lowerCaseEmail = email.toLowerCase();

      const profile = await Profile.findOne({ email: lowerCaseEmail });

      if (profile) {
        // Profile exists
        return res.send(<IResponse<IProfile>>{
          error: {
            validationError: { email: "Email addressen er allerede i brug" },
          },
          status: EStatusCode.BAD_REQUEST,
        });
      } else {
        const newProfile = new Profile({
          email,
          password,
        } as IProfile);
        // Hash Password
        bcryptjs.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcryptjs.hash(newProfile.password, salt, async (err, hash) => {
            // TODO: test if this error is handled correctly
            if (err) throw err;
            // Set password to hashed
            newProfile.password = hash;
            // Save profile
            await newProfile.save();
            res.send(<IResponse<IProfile>>{
              response: newProfile,
              status: EStatusCode.OK,
            });
          });
        });
      }
    } catch (err) {
      console.log("###### REGISTER ERROR ######", err);
      return res.send(<IResponse<IProfile>>{
        status: EStatusCode.INTERNAL_SERVER_ERROR,
        error: {
          message: err,
        },
      });
    }
  }
);

router.post("/login", async (req, res, next) => {
  authenticate(req, res, next, () =>
    res.send(<IResponse<IProfile>>{
      response: req.user,
      status: EStatusCode.OK,
    })
  );
});

router.get("/me", async (req, res, next) => {
  console.log("REQ.USER: ", req.user);
  return res.send(<IResponse<IProfile>>{
    response: req.user,
    status: EStatusCode.OK,
  });
});

router.get("/logout", (req, res) => {
  try {
    req.logOut();
    return res.send(<IResponse<string>>{
      status: EStatusCode.OK,
      response: "Logged out",
    });
  } catch (err) {
    console.log("###### LOGOUT ERROR ######", err);
    return res.send(<IResponse<string>>{
      status: EStatusCode.INTERNAL_SERVER_ERROR,
      error: { message: JSON.stringify(err) },
    });
  }
});

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
  onSuccessResponse: () => void
) => {
  passport.authenticate("local", (err, profile, info) => {
    if (err) {
      return res.send(<IResponse<IProfile>>{
        error: { message: JSON.stringify(err) },
        status: EStatusCode.INTERNAL_SERVER_ERROR,
      });
    }
    if (profile) {
      req.logIn(profile, (err) => {
        if (err) {
          return res.send(<IResponse<IProfile>>{
            error: { message: JSON.stringify(err) },
            status: EStatusCode.INTERNAL_SERVER_ERROR,
          });
        }
        return onSuccessResponse();
      });
    } else {
      return res.send(<IResponse<IProfile>>{
        status: EStatusCode.UNAUTHORIZED,
      });
    }
  })(req, res, next);
};

export const AuthRoutes = router;
