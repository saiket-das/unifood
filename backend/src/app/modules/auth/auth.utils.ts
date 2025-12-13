import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

interface Payload {
  userId: string;
  role: string;
}

// Generate JWT
export const generateToken = (
  jwtPayload: Payload,
  secret: string,
  expiresIn: string | number
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as number,
  };
  return jwt.sign(jwtPayload as JwtPayload, secret, {});
};

// Verify JWT
export const verifyToken = (token: string, secret: string): JwtPayload => {
  const decoded = jwt.verify(token, secret) as JwtPayload;
  return decoded;
};
