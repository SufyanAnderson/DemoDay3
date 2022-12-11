const Upload = require('../models/Upload');
const cloudinary = require('../middleware/cloudinary');
const { ObjectID } = require('mongodb');




exports.getTeam = async (req, res) => {
    try {
     //  const post = await Post.find({ _id: req.params.id });
     const uploads = await Upload.find(req.params.id);
     const uploadUrls = await Upload.findById(req.params.id);
     const sortedLikes = uploads.sort((a,b )=> b.likes - a.likes)
     console.log(uploads)
     res.render("team.ejs", { uploads: uploads, uploadUrls  });
    } catch (err) {
      console.log(err);
    }
  },

  exports.getRoom = (req,res) => {
    res.render("chat.ejs")
  },

  exports.likeVideo  = async (req,res) => {
  console.log(req.params.id, 'liking')
    try {
      await Upload.findOneAndUpdate(

        
        { _id: ObjectID(req.params.id) },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/team`);
    } catch (err) {
      console.log(err);
    }
  },

exports.uploadVideo = (req, res) => {
    cloudinary.uploader.upload(req.file.path,
        {
            resource_type: "video",
            folder: "video",
          },
        
        (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        var upload = new Upload({
            name: req.file.originalname,
            url: result.url,
            cloudinary_id: result.public_id,
            description: req.body.description,
            group: req.params.id, 
            user: req.user.group,
            likes: 0 
        });
        upload.save((err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.redirect(`/team`);
        }
        );
        
    }
    );
}