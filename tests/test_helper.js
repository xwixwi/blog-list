const initialUsers = [
    {
        username: "fishman",
        name: "Fish Man",
        password: "Fish Man's favorite food"
    },
    {
        username: "quickfoxx",
        name: "The Quick Brown Fox",
        password: "thelayyyzydogg"
    }
];

const createInitialUsers = async api => {
    for (const user of initialUsers) {
        await api
            .post("/api/users")
            .send(user)
            .expect(201);
    }
};

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
    },
    {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10
    },
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0
    },
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }
];

const createInitialBlogs = async (api, token) => {
    for (const blog of initialBlogs) {
        await api
            .post("/api/blogs")
            .set("authorization", `Bearer ${token}`)
            .send(blog)
            .expect(201);
    }
};

const login = async (api, username, password) => {
    const token = (await api
        .post("/api/login")
        .send({username, password})
        .expect(200)
    ).body.token;
    expect(token).toBeDefined();
    return token;
};

module.exports = {
    initialUsers,
    createInitialUsers,
    initialBlogs,
    createInitialBlogs,
    login
};