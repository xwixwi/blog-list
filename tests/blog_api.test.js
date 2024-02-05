const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const User = require("../models/user");
const Blog = require("../models/blog");

const api = supertest(app);

beforeEach(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
});

describe("adding blog", () => {
    test("adding blog", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        const blog = {
            title: "My beautiful blog",
            author: "Me",
            url: "http://mybeautifulurl.com",
            likes: 65536
        };
    
        await api
            .post("/api/blogs")
            .set("authorization", `Bearer ${token}`)
            .send(blog)
            .expect(201)
            .expect("Content-Type", /application\/json/);
        
        const body = (await api
            .get("/api/blogs")
            .expect(200)
        ).body;
        expect(body).toHaveLength(1);
        expect(body[0].url).toBe(blog.url);
    });

    test("fails without token", async () => {
        await helper.createInitialUsers(api);

        const blog = {
            title: "My beautiful blog",
            author: "Me",
            url: "http://mybeautifulurl.com",
            likes: 65536
        };
    
        await api
            .post("/api/blogs")
            .send(blog)
            .expect(401);
    });
    
    test("likes default to 0", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        const blog = {
            title: "My beautiful blog",
            author: "Me",
            url: "http://mybeautifulurl.com"
        };
    
        await api
            .post("/api/blogs")
            .set("authorization", `Bearer ${token}`)
            .send(blog)
            .expect(201)
            .expect("Content-Type", /application\/json/);
        
        expect((await api.get("/api/blogs")).body[0].likes).toBe(0);
    });
    
    test("blogs require title", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        const blog = {
            author: "Me",
            url: "http://mybeautifulurl.com",
            likes: 0
        };
    
        await api
            .post("/api/blogs")
            .set("authorization", `Bearer ${token}`)
            .send(blog)
            .expect(400);
    });
    
    test("blogs require url", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        const blog = {
            title: "My beautiful blog",
            author: "Me",
            likes: 0
        };
    
        await api
            .post("/api/blogs")
            .set("authorization", `Bearer ${token}`)
            .send(blog)
            .expect(400);
    });

    test("blog is registered to user", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        const blog = {
            title: "My beautiful blog",
            author: "Me",
            url: "http://mybeautifulurl.com",
            likes: 65536
        };
    
        await api
            .post("/api/blogs")
            .set("authorization", `Bearer ${token}`)
            .send(blog)
            .expect(201)
            .expect("Content-Type", /application\/json/);
        
        const addedBlog = (await api
            .get("/api/blogs")
            .expect(200)
        ).body[0];

        const user = (await api
            .get("/api/users")
            .expect(200)
        ).body.find(user_ => user_.username === helper.initialUsers[0].username);

        expect(addedBlog.user.id).toBe(user.id);
        expect(user.blogs).toHaveLength(1);
        expect(user.blogs[0].id).toBe(addedBlog.id);
    });
});

describe("getting blogs", () => {
    test("correct amount", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        await helper.createInitialBlogs(api, token);

        expect((await api.get("/api/blogs")).body).toHaveLength(helper.initialBlogs.length);
    });

    test("blogs have ids", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);

        await helper.createInitialBlogs(api, token);

        for (const blog of (await api.get("/api/blogs").expect(200)).body) {
            expect(blog.id).toBeDefined();
        }
    });
});

describe("deleting blog", () => {
    test("works for own blog", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);
    
        await helper.createInitialBlogs(api, token);
    
        const startBlogs = (await api.get("/api/blogs")).body;
        const blog = startBlogs[0];
    
        await api
            .delete(`/api/blogs/${blog.id}`)
            .set("authorization", `Bearer ${token}`)
            .expect(204);
        
        const endBlogs = (await api.get("/api/blogs")).body;
        expect(endBlogs).toHaveLength(startBlogs.length - 1);
        expect(endBlogs.map(blog => blog.url)).not.toContain(blog.url);
    });

    test("fails for someone else's blog", async () => {
        await helper.createInitialUsers(api);
        let token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);
    
        await helper.createInitialBlogs(api, token);
    
        const startBlogs = (await api.get("/api/blogs")).body;
        const blog = startBlogs[0];

        token = await helper.login(api, helper.initialUsers[1].username, helper.initialUsers[1].password);
    
        await api
            .delete(`/api/blogs/${blog.id}`)
            .set("authorization", `Bearer ${token}`)
            .expect(401);
    });

    test("blog is removed from user", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);
    
        await helper.createInitialBlogs(api, token);

        const startBlogs = (await api.get("/api/blogs")).body;
        const blog = startBlogs[0];
    
        await api
            .delete(`/api/blogs/${blog.id}`)
            .set("authorization", `Bearer ${token}`)
            .expect(204);
        
        expect((await api
            .get("/api/users")
            .send()
        ));

        expect(
            (await api
                .get("/api/users")
                .expect(200)
            ).body.find(user_ =>
                user_.username === helper.initialUsers[0].username
            ).blogs
        ).toHaveLength(helper.initialBlogs.length - 1);
    });
});

describe("updating blog", () => {
    test("works for own blog", async () => {
        await helper.createInitialUsers(api);
        const token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);
    
        await helper.createInitialBlogs(api, token);
    
        const startBlogs = (await api.get("/api/blogs")).body;
        const blog = startBlogs[0];
    
        await api
            .put(`/api/blogs/${blog.id}`)
            .set("authorization", `Bearer ${token}`)
            .send({likes: blog.likes + 1})
            .expect(200);
        
        // i love one-liners
        expect((await api.get("/api/blogs")).body.find(blog_ => blog_.url === blog.url).likes).toBe(blog.likes + 1);
    });

    test("fails for someone else's blog", async () => {
        await helper.createInitialUsers(api);
        let token = await helper.login(api, helper.initialUsers[0].username, helper.initialUsers[0].password);
    
        await helper.createInitialBlogs(api, token);
    
        const startBlogs = (await api.get("/api/blogs")).body;
        const blog = startBlogs[0];

        token = await helper.login(api, helper.initialUsers[1].username, helper.initialUsers[1].password);
    
        await api
            .put(`/api/blogs/${blog.id}`)
            .set("authorization", `Bearer ${token}`)
            .send({likes: blog.likes + 1})
            .expect(401);
    });
});