import client from "../client";

export default {
    Photo: {
        user: ({ userId }) => client.user.findUnique({ where: { id: userId } }),
        hashtags: ({ id }) =>
            client.hashtag.findMany({
                where: {
                    photos: {
                        some: {
                            id,
                        },
                    },
                },
            }),
        likes: ({ id }) =>
            client.like.count({
                where: {
                    photoId: id,
                },
            }),
        commentNumber: ({ id }) =>
            client.comment.count({
                where: {
                    photoId: id,
                },
            }),
        comments: ({ id }) =>
            client.comment.findMany({
                where: { photoId: id },
                include: {
                    user: true,
                },
            }),
        isMine: ({ userId }, _, { loggedInUser }) => {
            if (!loggedInUser) {
                return false;
            }
            return userId === loggedInUser.id;
        },
        isLiked: async({ id }, _, { loggedInUser }) => {
            if (!loggedInUser) {
                return false;
            }
            const ok = await client.like.findUnique({
                where: {
                    photoId_userId: {
                        photoId: id,
                        userId: loggedInUser.id,
                    },
                },
                select: {
                    id: true,
                },
            });
            if (ok) {
                //로그인한 유저가 좋아요를 누른 글이라면?
                return true;
            }
            return false;
        },
    },
    Hashtag: {
        //parent, args, context
        photos: ({ id }, { page }, { loggedInUser }) => {
            return client.hashtag
                .findUnique({
                    where: {
                        id,
                    },
                })
                .photos(); //photo들을 가져온다.
        },
        totalPhotos: ({ id }) =>
            client.photo.count({
                where: {
                    hashtags: {
                        some: {
                            id,
                        },
                    },
                },
            }),
    },
};