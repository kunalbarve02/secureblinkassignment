const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");
const User = require("../../models/user");

const adminUser = {
    name : "test",
    username : "admintestuser",
    email : "admintestuser@test.com",
    password : "Password",
    role : 1
}

const user = {
    name : "test",
    username : "normaluser",
    email : "normalUser@test.com",
    password : "Password",
    role : 0
}

beforeAll(async () => {
    const response = await request(app).post("/api/signup").send(adminUser);
    adminUser.token = response._body.token;
    adminUser.id = response._body.id;
    const response2 = await request(app).post("/api/signup").send(user);
    user.token = response2._body.token;
    user.id = response2._body.id;
    console.log(user);
    console.log(adminUser)
})

afterAll(async () => {
    await User.deleteOne({ username : adminUser.username });
    await User.deleteOne({ username : user.username });
    await mongoose.connection.close();
})

describe("User Controller", () => {
    describe("GET /profile/self", () => {
        it("should return 200 OK", async () => {
            const response = await request(app).get("/api/profile/self").set("Authorization", `Bearer ${adminUser.token}`);
            expect(response.statusCode).toBe(200);
        })
        it("should return 401 Unauthorized", async () => {
            const response = await request(app).get("/api/profile/self");
            expect(response.statusCode).toBe(401);
        })
    })
    describe("GET /profile/other/:id", () => {
        it("should return 200 OK", async () => {
            const response = await request(app).get(`/api/profile/other/${user.id}`).set("Authorization", `Bearer ${adminUser.token}`);
            expect(response.statusCode).toBe(200);
        })
        it("should return 404 not found", async () => {
            const response = await request(app).get(`/api/profile/other/000`).set("Authorization", `Bearer ${adminUser.token}`);
            expect(response.statusCode).toBe(404);
        })
        it("should return 403 Forbidden", async () => {
            const response = await request(app).get(`/api/profile/other/${adminUser.id}`).set("Authorization", `Bearer ${user.token}`);
            expect(response.statusCode).toBe(403);
        })
    })
    describe("GET /profile/all", () => {
        it("should return 200 OK", async () => {
            adminUser.role = 1;
            const response = await request(app).get(`/api/profile/all`).set("Authorization", `Bearer ${adminUser.token}`);
            expect(response.statusCode).toBe(200);
        })
        it("should return 403 Forbidden", async () => {
            const response = await request(app).get(`/api/profile/all`).set("Authorization", `Bearer ${user.token}`);
            expect(response.statusCode).toBe(403);
        })
    })
        
})

