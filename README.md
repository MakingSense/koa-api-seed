# API Seed

>originally based on [https://github.com/arg20/koa-api-seed](https://github.com/arg20/koa-api-seed)

This seed has the following stack implemented:

* Node.js
* MongoDB
* Koa
* Socket.io
* Passport.js
* Typescript
* Gulp

It uses mostly `async/await` to perform asynchronous operations. 

## Features

### TLDR

Users, Roles, Emails, Websockets, Logging, Facebook, Live Reload, S3 Uploads, TDD, CORS, GZIP, Password Recovery.
  
### List

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
* Error Handling Mechanism optimized for bug finding & careful logging strategy.
* Support for wallaby.js
* Password Recovery options:
    * A user can create a forgot password request that expires in a set time
    * An email is sent to the user with a link to continue the recovery process
* More than e2e 70 test cases.
* Code Style enforced through linting tasks.
* Winston for logging.

## How To

### Before
1. This requires node v7+.
2. Make sure you have typescript installed: `npm install -g typescript`.
3. Make sure you have gulp installed: `npm install -g gulp`.

### Install
1. Clone this repository: `git clone git@github.com:arg20/koa-api-seed.git`
2. Install dependencies: `npm install`
3. Create a `.env` file in your Project root and declare your environment variables there more info [here](https://github.com/motdotla/dotenv).
4. Run test _(optional)_: `gulp test`
5. Run: `gulp serve`

### Deploy
1. Build the project using: `gulp build`

## Environment Variables Used

#### Core
`NODE_ENV` = "development", "production", etc.

`PORT` = port to which KOA will bind.

`DATABASE_URL` = URI for the MongoDB database. (eg: `DATABASE_URL=mongodb://localhost/api-seed`
)

`REDIS_HOST` = Redis Host

`REDIS_PORT` = Redis Port

`WEBSOCKETS_ENABLED` = true/false Whether Websockets should be enabled.

`WEBSOCKETS_USE_ADAPTER` = Whether or not to use redis With Socket.io, Use this if you are running in a cluster.

`TEST_URL` = The URL the tests should hit

#### Social Networks
`FACEBOOK_CLIENT_ID`

`FACEBOOK_CLIENT_SECRET`

#### JWT Secret and Password Recovery
`PASSWORD_ITERATIONS` = How many iterations to use in password hashing

`JWT_SECRET` = The secret to use to sign your JWT Tokens

`FORGOT_PASSWORD_DURATION_AMOUNT` = How long should a password recovery token last. Eg. `1`

`FORGOT_PASSWORD_DURATION_UNIT` = How long should a password recovery token last. Eg. `days`

#### Emails
`TOGGLE_EMAILS` = Whether or not to activate email sending. If deactivated, when you send an email it will behave as a noop.

`EMAIL_FROM` = The email used to send emails.

`EMAIL_API_KEY` = Sendgrid token.

#### Logging
`LOGENTRIES_LEVEL` = Level to use in logentries. 

`LOGENTRIES_TOKEN` = Token from logentries to use.

`LOG_FILE_ERRORS`

`LOG_FILE_ALL`

`LOG_FILE_EVENTS`

`LOG_LEVELS_CONSOLE`

`LOG_LEVELS_FILE`

#### Uploads
`UPLOADS_STRATEGY` = `local` or `s3`. Whether Uploaded files should be saved locally or moved to s3.

`UPLOADS_TEMP` = temp folders in which to keep the uploaded files.

`UPLOADS_BASE` = folders in which uploaded files will be stored permanently.

##### For Local Uploads

`UPLOADS_LOCAL_PATH` = folders in which uploaded files will be stored permanently.

`UPLOADS_LOCAL_HOST` = host in which uploaded files will be stored permanently.

##### For S3 Uploads
`UPLOADS_S3_API_VERSION`

`UPLOADS_S3_REGION`

`UPLOADS_S3_ACCESS_KEY`

`UPLOADS_S3_SECRET_KEY`

`UPLOADS_S3_OMIT_CREDENTIALS`

`UPLOADS_S3_BUCKET`
