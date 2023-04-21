const Follow = require('../models/follow');

const followUserIds = async (identityUserId) => {
    // Devolver un array de usuarios que sigo y un array de usuarios que me siguen
    try {
        // Sacar info de seguidores y seguidos
        let following = await Follow.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })
            .then();

        let followers = await Follow.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .then();;

        // Procesar array de Ids
        let followingClean = [];
        following.forEach((follow) => {
            followingClean.push(follow.followed);
        });

        let followersClean = [];
        followers.forEach((follow) => {
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        }

    } catch (error) {
        return {};
    }

}

const followThisUser = async (identityUserId, profileUserId) => {
    // Sacar info de seguidores y seguidos
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId })

    let follower = await Follow.findOne({ "user": profileUserId, "followed": identityUserId })


    return {
        following: following,
        follower: follower
    };

}

module.exports = {
    followUserIds,
    followThisUser
}