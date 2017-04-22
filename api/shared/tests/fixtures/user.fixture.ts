import {getRandomInt} from "../test.utils";

const userFixture = {
    firstName: "Test ",
    lastName: "Guy",
    email: "test@email.com",
    password: "Test#1234"
};

let getRandomUser = (props = {}) => {
    const randomNumber = getRandomInt(0, 10000);
    let user = Object.assign({}, userFixture, {email: `test-${randomNumber}@noemail.com`}, props);
    return user;
};

export {userFixture, getRandomUser};
