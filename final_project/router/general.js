const express = require("express");
let books = require("./booksdb.js");
let doesExist = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({
        message: "Customer successfully registred. Now you can login",
      });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    try {
      const bookList = Object.values(books);
      resolve(bookList);
    } catch (error) {
      reject("Error fetching book data");
    }
  });

  getBooksPromise
    .then((books) => {
      res.status(200).send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBNPromise = new Promise((resolve, reject) => {
    try {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    } catch (error) {
      reject("Error fetching book data");
    }
  });

  getBookByISBNPromise
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  const getBooksByAuthorPromise = new Promise((resolve, reject) => {
    try {
      const booksByAuthor = [];

      for (const bookId in books) {
        if (books.hasOwnProperty(bookId)) {
          const book = books[bookId];
          if (book.author === author) {
            const isbn = bookId;
            const { title, reviews } = book;
            booksByAuthor.push({ isbn, title, reviews });
          }
        }
      }

      // Check if any books were found for the specified author
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found for the specified author");
      }
    } catch (error) {
      reject("Error fetching book data");
    }
  });

  getBooksByAuthorPromise
    .then((booksByAuthor) => {
      res.status(200).json({ booksbyauthor: booksByAuthor });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const getBooksByTitlePromise = new Promise((resolve, reject) => {
    try {
      const booksByTitle = [];

      for (const bookId in books) {
        if (books.hasOwnProperty(bookId)) {
          const book = books[bookId];
          // Check if the book's title matches the provided title parameter
          if (book.title === title) {
            const isbn = bookId;
            const { author, reviews } = book;
            booksByTitle.push({ isbn, author, reviews });
          }
        }
      }

      // Check if any books were found for the specified title
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("No books found for the specified title");
      }
    } catch (error) {
      reject("Error fetching book data");
    }
  });

  getBooksByTitlePromise
    .then((booksByTitle) => {
      res.status(200).json({ booksbytitle: booksByTitle });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];
  const reviews = book.reviews;

  return res.status(200).send(reviews);
});

module.exports.general = public_users;
