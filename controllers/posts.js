const { UploadStream } = require("cloudinary");
const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");
const { ObjectID } = require('mongodb');
const Upload = require('../models/Upload');
// const UploadModel = require("../models/Upload");
let postId = null 

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      postId = post._id
      
      //console.log(JSON.stringify(post.requests))

      const isAdmin = post.admin == req.user.id
      res.render("post.ejs", { post: post, user: req.user, isAdmin, requests: post.requests, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  like: async (req, res) => {
    console.log(req.params)
    try {
      await Upload.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
      
        }
      );

       res.redirect(`/team`);
    } catch (err) {
      console.log(err);
    }
  },
  // },
  // likeUpload: async (req,res) => {
  //   console.log(req.params.id, 'liking')
  //   console.log(Upload, )
  //     try {
  //       await Upload.findOneAndUpdate(
  //       { _id: ObjectID(req.params.id) },
  //         {
  //           $inc: { likes: 1 },
  //         }
  //       );
  //       console.log("Likes +1");
  //       // res.redirect(`/team`);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   },
    
  // getTeam: async (req, res) => {
  //   try {
  //    //  const post = await Post.find({ _id: req.params.id });
  //     const uploads = await UploadModel.find({ group: req.user.group._id });
  //       res.render("team.ejs", { accepted: req.user.group.accepted, uploads: uploads  });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        requests: [],
        accepted: [],
        admin: req.user.id,
        level: req.body.level
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  joinPost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { requests: req.user.id },
      
        }
      );

      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  acceptRequest: async (req, res) => {
    try {
     const acceptedUser = await User.findById(req.params.id)  
     acceptedUser.group = req.user.group 
     acceptedUser.save() 
      await Post.findOneAndUpdate(
        { _id: postId },
        {
          $pull: { requests: [req.params.id]},
          $push: {accepted: [req.params.id]}
         }
      );
      res.redirect(`/post/${postId}`);
    } catch (err) {
      console.log(err);
    }
  },
  denyRequest: async (req, res) => {
    console.log(req.body._id, 'this is request deny')
    const post = await Post.findById(req.body._id).lean()
    
    // let postId = req.params.id.split(",")[0]
    // let userId = req.params.id.split(",")[1]
    let requests = post.requests
    console.log(req.body.userid, requests)
    requests = requests.filter(request => !(request == req.body.userid))

    try {
      const returnValue = await Post.findOneAndUpdate(
      
        { _id: req.body._id },
        {
           requests: requests
        }
      );
      // res.redirect(`/post/${req.params.id}`);
    res.end()
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
