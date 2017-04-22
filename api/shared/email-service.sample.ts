require("dotenv").config({silent: true});
import * as util from "util";

import {UserEmailService} from "../users/user-email.service";

describe("Email Service Test", () => {
    let user = {email: "gabrielemanuel@gmail.com", firstName: "Gabriel"};

    it("should send password forgot email", async () => {
        await UserEmailService.sendForgotPassword(user, "asd123");
    });
    it("should send password changed email", async () => {
        await UserEmailService.sendPasswordChanged(user);
    });

    it("should send sign up successful email", async () => {
        await UserEmailService.sendSignUpSuccessful(user);
    });
});