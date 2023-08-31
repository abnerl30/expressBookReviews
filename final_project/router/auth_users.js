const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //code to check is the username is valid and existed
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.query.review;

  // Check if the provided ISBN exists in the 'books' object
  if (!books.hasOwnProperty(isbn)) {
    return res
      .status(404)
      .json({ message: "Book not found for the specified ISBN" });
  }

  // Check if the user is authenticated
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bookReviews = books[isbn].reviews;

  if (bookReviews.hasOwnProperty(username)) {
    // If the book has already been reviewed by the same user, update the review
    bookReviews[username] = review;
    return res.status(200).json({
      message: `Review for book with ISBN=${isbn} modified successfully`,
    });
  } else {
    // If the book has not been reviewed by the same user, add a new review
    bookReviews[username] = review;
    return res.status(200).json({
      message: `Review for book with ISBN=${isbn} added successfully`,
    });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check if the provided ISBN exists in the 'books' object
  if (!books.hasOwnProperty(isbn)) {
    return res
      .status(404)
      .json({ message: "Book not found for the specified ISBN" });
  }

  // Check if the user is authenticated
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bookReviews = books[isbn].reviews;

  // Check if the user has a review for this book
  if (bookReviews.hasOwnProperty(username)) {
    // Delete the user's review for this book
    delete bookReviews[username];
    return res
      .status(200)
      .json({
        message: `Review for the book with ISBN=${isbn} posted by User=${username} deleted successfully!`,
      });
  } else {
    return res.status(404).json({
      message: `Review not found for the specified book with ISBN=${isbn} and User=${username}`,
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
