import {getRandomInt} from "../test.utils";

const bookFixture = {
    title: "Harry portter",
    isbn: "1",
    price: 100,
    year: 1994
};

let getRandomBook = (props = {}) => {
    const randomNumber = getRandomInt(0, 10000);
    let book = Object.assign({}, bookFixture, {}, props);
    return book;
};

export {bookFixture, getRandomBook};
