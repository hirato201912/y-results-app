import { IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute } from "iron-session";
import { NextApiHandler } from "next";

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "my-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSession(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}
