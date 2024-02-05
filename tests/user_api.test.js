const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");

const api = supertest(app);

beforeEach(async () => {
    await User.deleteMany({});
});

test("add and get users", async () => {
    const users = [
        {
            username: "fishman",
            name: "Fish Man",
            password: "Fish Man's favorite food"
        },
        {
            username: "quickfox",
            name: "The Quick Brown Fox",
            password: "thelayyyzydogg"
        }
    ];

    for (const user of users) {
        await api
            .post("/api/users")
            .send(user)
            .expect(201)
            .expect("Content-Type", /application\/json/);
    }

    const addedUsers = (await api
        .get("/api/users")
        .expect(200)
    ).body;

    expect(addedUsers).toHaveLength(users.length);

    for (const user of users) {
        const addedUser = addedUsers.find(user_ => user_.username === user.username);
        expect(addedUser).toBeDefined();
        expect(addedUser.name).toBe(user.name);
        expect(addedUser.passwordHash).not.toBeDefined();
    }
});

test("username must be valid", async () => {
    const user = {
        username: "ab",
        name: "Mr. A B",
        password: "cde"
    };

    await api
        .post("/api/users")
        .send(user)
        .expect(400);
    
    expect((await api.get("/api/users")).body).toHaveLength(0);
});

test("password must be valid", async () => {
    const user = {
        username: "AAAAAA!!!",
        name: "A",
        password: "aa"
    };

    await api
        .post("/api/users")
        .send(user)
        .expect(400);
    
    expect((await api.get("/api/users")).body).toHaveLength(0);
});