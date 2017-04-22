let app = require("../../index");

import config from "../../configs/config";


describe("[API] [Sockets]", () => {
    let socket;

    before(done => {
        socket = require("socket.io-client")(config.test.url);
        socket.on("connect", done);
    });

    it("should connect to socket", done => {
        socket.emit("syn");
        socket.on("ack", done);
    });

});