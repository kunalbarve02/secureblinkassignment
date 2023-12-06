const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");
const User = require("../../models/user");

const mockUser = {
    name : "test",
    username : "admintestuser",
    email : "admintestuser@test.com",
    password : "Password"
}

afterAll(async () => {
    await User.deleteOne({ username : mockUser.username });
    await mongoose.connection.close();
})


describe("Auth Controller", () => {
    describe("POST /signup", () => {
        it("should return 200 OK", async () => {
            const response = await request(app).post("/api/signup").send(mockUser);
            expect(response.statusCode).toBe(200);
        })
        it("should return 400 Bad Request", async () => {
            const response = await request(app).post("/api/signup").send({
                name : "test",
                username : "test",
                email : "",
            });
            expect(response.statusCode).toBe(400);
        })
    })
    describe("POST /signin", () => {
        it("should return 200 OK", async () => {
            const response = await request(app).post("/api/signin").send({
                username : mockUser.username,
                password : mockUser.password
            });
            expect(response.statusCode).toBe(200);
        })
        it("should return 400 Bad Request", async () => {
            const response = await request(app).post("/api/signin").send({
                username : "",
                password : ""
            });
            expect(response.statusCode).toBe(400);
        })
        it("should return 401 Incorrect Password", async () => {
            const response = await request(app).post("/api/signin").send({
                username : mockUser.username,
                password : "test"
            });
            expect(response.statusCode).toBe(401);
        })
    })

})
