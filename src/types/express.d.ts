import { JwtPayload } from "../schema/auth.schema";
import { RoomTypeWithIdSchema } from "../schema/roomType.schema";
import { AdminCreateAt, UserFullSchema } from "../schema/user.schema";


declare global {
  namespace Express {
    interface Request {
      payload?: JwtPayload;
      user?: UserFullSchema;
      admin?:AdminCreateAt
    }
  }
}