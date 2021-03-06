import client from "../../client";
import { protectResolver } from "../../users/user.utils";

export default {
    Query: {
        seeRoom: protectResolver((_, { id }, { loggedInUser }) => {
            console.log(id);
            return client.room.findFirst({
                where: {
                    id,
                    users: {
                        some: {
                            id: loggedInUser.id,
                        },
                    },
                },
            });
        }),
    },
};