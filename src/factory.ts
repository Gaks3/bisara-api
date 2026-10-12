import { defaultEndpointsFactory } from "express-zod-api";

import { authMiddleware } from "./middlewares/auth.middleware";

const authedFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

export { authedFactory };
