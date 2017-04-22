#API Seed

This seed has the following stack implemented:

* Node.js
* MongoDB
* Koa
* Socket.io
* Passport.js
* Typescript
* Gulp

It uses mostly `async/await` to perform asynchronous operations. 

It currently has implemented:

* CRUD for Users
* Sign In using local strategy
* Sign In/Up using Facebook
* Supports sending emails via SendGrid
* Supports Logging to Logentries
* Generates a RequestId for every request made and uses it to trace through the logs.
* Implements User Roles (user, admin).
* Scaffolds Socket.io for Websocket support.
* Image upload using 2 strategies (Local or to S3).
* Support for CORS Headers
* GZIP Compression
* Gulp `serve` task restarts the project every time it detects changes.
* Uses JWT as authentication mechanism.
* Error Handling Mechanism optimized to find bugs.
* Support for wallaby.js
* Password Recovery options:
    * A user can create a forgot password request that expires in a set time
    * An email is sent to the user with a link to continue the recovery process
* More than e2e 70 test cases.
* Code Style enforced through linting tasks.