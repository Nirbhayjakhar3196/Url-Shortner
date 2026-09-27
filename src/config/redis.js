
const {createClient} = require("redis");

const redisClient = createClient({
    url : process.env.REDIS_URL
});

redisClient.on("error" , (error)=>{
    console.log(error);
})

const connectRedis = async(req , res) => {

    try {
        
        await redisClient.connect();
        console.log("Redis connected");
        

    } catch (error) {
        console.log("Redis connection failed: " , error);        
    }
}

module.exports = {
    redisClient , connectRedis
}