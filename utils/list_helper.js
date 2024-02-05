const dummy = () => 1;

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const favoriteBlog = (blogs) => blogs.reduce((favorite, blog) => favorite == null || blog.likes > favorite.likes ? blog : favorite, null);

const mostBlogs = (blogs) => {
    const counts = {};
    for (const blog of blogs) {
        if (counts[blog.author] === undefined) {
            counts[blog.author] = 0;
        }

        counts[blog.author]++;
    }

    return Object.entries(counts).reduce((most, entry) => entry[1] > most.blogs ? {author: entry[0], blogs: entry[1]} : most, {author: null, blogs: 0});
};

const mostLikes = (blogs) => {
    const counts = {};
    for (const blog of blogs) {
        if (counts[blog.author] == undefined) {
            counts[blog.author] = 0;
        }

        counts[blog.author] += blog.likes;
    }

    return Object.entries(counts).reduce((most, entry) => entry[1] > most.likes ? {author: entry[0], likes: entry[1]} : most, {author: null, likes: 0});
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
};