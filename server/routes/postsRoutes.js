const express = require('express');
const router = express.Router();
const { Posts, Likes, Users } = require('../models'); //post instance
const validateToken = require('../middlewares/AuthMiddleware');
// *fetch all posts
router.get('/', validateToken, async (req, res) => {
  const postList = await Posts.findAll({ include: [Likes] });
  // find out all the likes the current users has made no which posts.
  const userLikes = await Likes.findAll({ where: { UserId: req.user.id } });
  res.json({ listOfPosts: postList, listOfLikes: userLikes });
});

// *get ONE post
router.get('/byId/:id', async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findOne({ where: { id: id } }); //inventado pero funciona.
  // const post = await Posts.findByPk(id); //find by primary key
  res.json(post);
});

// *CREATE a post
router.post('/', validateToken, async (req, res) => {
  const post = req.body;
  post.username = req.user.username;
  await Posts.create(post); // Sequelize inserts the posts in the Posts table
  res.json(post);
});

// *DELETE a post
router.delete('/byId/:id', validateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const user = await Users.findOne({ where: { id: userId } });
  const username = user.username;
  try {
    await Posts.destroy({ where: { id: postId, username: username } });
    res.status(200).json('Post was deleted');
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
