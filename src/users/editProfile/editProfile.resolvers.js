import client from "../../client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { protectResolver } from "../user.utils";
import { createWriteStream } from "fs";
import { uploadToS3 } from "../../shared/shared.utils";

const resolverFn = async(
        _, { firstName, lastName, username, email, password: newPassword, bio, avatar }, { loggedInUser, protectResolver } //context에 들어가는 건 모든 resolver에서 접근이 가능하다.
    ) =>
    //resolver에서만 새롭게 변수를 정의하고 싶은 경우 --> password: newPassword
    {
        // 로컬에 저장 시 사용
        let avatarUrl = null;
        if (avatar) {
            avatarUrl = await uploadToS3(avatar, loggedInUser.id, "avatars");
            /* const { filename, createReadStream } = await avatar;
                                                      const newFilename = `${loggedInUser.id}-${Date.now()}-${filename}`;
                                                      const readStream = createReadStream();
                                                      const writeStream = createWriteStream(
                                                          process.cwd() + "/uploads/" + newFilename
                                                      ); //current working directory
                                                      readStream.pipe(writeStream);
                                                      avatarUrl = `http://localhost:4000/static/${newFilename}`; */
        }

        let uglyPassword = null;
        if (newPassword) {
            uglyPassword = await bcrypt.hash(newPassword, 10);
        }
        const updatedUser = await client.user.update({
            //업데이트는 유저를 반환한다.
            where: {
                id: loggedInUser.id, //어떤 유저인지 명시
            },
            data: {
                firstName,
                lastName,
                username,
                email,
                bio,
                ...(uglyPassword && { password: uglyPassword }), // es6, 첫 번째가 true라면 다음 오브젝트 반환
                ...(avatarUrl && { avatar: avatarUrl }),
            },
        });
        if (updatedUser.id) {
            return {
                ok: true,
            };
        } else {
            return {
                ok: false,
                error: "Could not update profile.",
            };
        }
    };

export default {
    Mutation: {
        editProfile: protectResolver(resolverFn),
    },
};