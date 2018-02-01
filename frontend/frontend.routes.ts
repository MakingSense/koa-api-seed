import * as Router from "koa-router";



let frontend = new Router();

frontend.prefix("/front");

// frontend.get("/", async (ctx, next) => {
//     ctx.body = "ok";
//     await next();
// });

frontend.get("/",  async (ctx, next) => {
    await ctx.render("index", {
        // version: stats.appVersion,
        // commit: stats.appCommit,
        // STYLE_URL: STYLE_URL,
        // SCRIPT_URL: SCRIPT_URL_APP
    });
});

export default frontend;

// import * as Router from "koa-router";
// import status from "../api/status.routes";
//
// let frontend = new Router();
//
//
// frontend.prefix("front", );
//
// // frontend.get("/",  async (ctx, next) => {
// //     await ctx.render("index", {
// //         // version: stats.appVersion,
// //         // commit: stats.appCommit,
// //         // STYLE_URL: STYLE_URL,
// //         // SCRIPT_URL: SCRIPT_URL_APP
// //     });
// // });
//
// status.get("/", async (ctx, next) => {
//     ctx.body = "ok";
//     await next();
// });
//
//
// /**
//  * Mount routers
//  */
// frontend.use("/front", frontend.routes());
//
// export default frontend;