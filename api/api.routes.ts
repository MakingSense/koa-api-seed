import * as Router from "koa-router";
import userCtrl from "./users/user.controller";
import authCtrl from "./auth/auth.controller";
import bookCtrl from "./books/book.controller";
import {getMultipartParser, getUploadValidationMiddleware} from "./middleware/file-upload.middleware";
import uploadStrategyDecider from "./middleware/uploadStrategyDecider";
import userController from "./users/user.controller";
import config from "../configs/config";

import { race } from "bluebird";


let api = new Router();
let users = new Router();
let books = new Router();

api.prefix("/api");

/**
 * User Routes
 */
users.param("user", userCtrl.loadUser);

users.use(authCtrl.loadUser);
users.use(authCtrl.loadUserDetails);

users.post("/", userCtrl.create);
users.post("/login", authCtrl.login);

users.post("/forgot-password", userCtrl.createForgotPassword);
users.post("/forgot-password/use", userCtrl.changePasswordByCode);
users.get("/forgot-password/:code", userCtrl.findForgotPassword);
users.put("/forgot-password/:code", authCtrl.adminsOnly, userCtrl.updateForgotPassword);

users.use(authCtrl.isLoggedIn);

users.get("/", userCtrl.search);
users.get("/:user", userCtrl.show);
users.put("/:userId", userCtrl.update);
users.put("/:userId/password", userCtrl.changePassword);
users.delete("/:userId", userCtrl.delete);
users.post(
    "/:user/image",
    getMultipartParser("users"),
    getUploadValidationMiddleware("users"),
    uploadStrategyDecider("users"),
    userCtrl.setImage
);

/**
 * Book Routes
 */
books.get("/", bookCtrl.search);
books.get("/:isbn", bookCtrl.show);
books.put("/:isbn", bookCtrl.update);
books.delete("/:isbn", bookCtrl.delete);
books.post("/", bookCtrl.create);

/**
 * Mount routers
 */
api.use("/users", users.routes());
api.use("/books", books.routes());

export default api;