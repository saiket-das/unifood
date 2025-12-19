import { JwtPayload } from "jsonwebtoken";
import { StaffAssignmentProps } from "../modules/staffAssignment/staffAssignment.interface";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string; role: string };
      staffAssignment?: StaffAssignmentProps;
    }
  }
}
