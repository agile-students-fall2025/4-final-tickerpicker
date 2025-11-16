# Backend Testing Guide

This document explains how to run backend tests and how team members should add their own test files. The backend uses Mocha, Chai, Supertest, and c8 for testing.

## 1. Tools Used

- Mocha 
- Assert  
- c8


## 2. Folder Structure

All backend test files should be placed inside:

`back-end/test/`

Example structure:
```psql
back-end/
│
├── server.js
├── package.json
│
└── test/
    ├── watchlist.test.js
    └── (other test files here)
```    


## 3. Installation

Inside the back-end folder, install testing dependencies:

`npm install --save-dev mocha chai supertest c8 cross-env`


## 4. Running Tests

To run all backend tests:

`npm test`

To run with code coverage:

`npm run coverage`

A coverage report will print in the terminal.

## 5. Writing a Test File

Each test file should import the Express app and use Supertest to call routes.  
Example test structure:

```js
import assert from "assert";
import request from "supertest"; //for testing routes
// import the function you want to test
// import { someHelperFunction } from "../src/someFile.js";

describe("Example Unit Tests", function () {
  it("should perform a basic assertion", function () {
    const result = 1 + 2;
    assert.strictEqual(result, 3);
  });
});