const {nanoid} = require('nanoid');

const Url = require("../models/Url")


const createShortUrl = async(req , res) => {

    try {
        
        const {title , originalUrl} = req.body;

        if(!title || !originalUrl){
            return res.status(400).json({
                message : "Both title and originalUrl are required"
            });
        }

        let parsedUrl;

        try {
            
            parsedUrl = new URL(originalUrl);
        } catch (error) {
            return res.status(400).json({
                message : "Invalid URL"
            })
        }

        if(parsedUrl.protocol !== "http:" && 
            parsedUrl.protocol !== "https:"
        ){
            return res.status(400).json({
                message : "Only HTTP and HTTPS URLs are allowed"
            })
        }

        const shortId = nanoid(7);

        const url = await Url.create({
            title,
            originalUrl,
            shortId,
            userId : req.user.id
        })

        res.status(201).json({
            message : "Short Url created successfully",
            title : url.title,
            shortId: url.shortId,
            shortUrl : `${process.env.BASE_URL}/${url.shortId}`
        })

    } catch (error) {
        
        console.log(error);

        res.status(500).json({
            message : "Internal server error"
        })
        
    }
}

const redirectUrl = async(req, res) => {

    try {
        
        const {shortId} = req.params;

        const url = await Url.findOne({
            shortId : shortId
        })

        if(!url){
            return res.status(400).json({
                message : "Short URL not found"
            });
        }

        url.clicks += 1;
        url.lastClickedAt = new Date();

        await url.save();

        res.redirect(url.originalUrl);

    } catch (error) {

        console.log(error);
        
        res.status(500).json({
            message : "Internal server down"
        })   
    }
}

const getAnalytics = async(req , res) => {

    try {
        
        const {shortId} = req.params;

        const url = await Url.findOne({ shortId });

        if (!url) {
            return res.status(404).json({
                message: "Short URL not found"
            });
        }

        res.status(200).json({
            title : url.title,
            shortId : url.shortId,
            originalUrl : url.originalUrl,
            clicks : url.clicks,
            createdAt: url.createdAt,
            lastClickedAt : url.lastClickedAt
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message : "Internal server error"
        })
    }

}

const getUrls = async (req, res) => {

    try{

        const urls = await Url.find({userId : req.user.id}).sort({createdAt : -1});

        res.status(200).json({
            urls
        })

    }catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal server error"
        })
    }

}

const deleteUrl = async (req, res) => {

    try{
        const {shortId} = req.params;

        const url = await Url.findOneAndDelete({shortId, userId : req.user.id});

        if(!url){
            return res.status(404).json({
                message : "Short URL not found or you are not authorized to delete it"
            })
        }

        res.status(200).json({
            message : "Short URL deleted successfully"
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal server error"
        })
    }
}

module.exports = {
    createShortUrl,
    redirectUrl,
    getAnalytics,
    getUrls,
    deleteUrl
}