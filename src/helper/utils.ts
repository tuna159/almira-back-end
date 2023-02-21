import * as bcrypt from 'bcrypt';
import { EIsDelete } from 'enum';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { DeepPartial } from 'typeorm';

export async function handleBCRYPTHash(text: string) {
  const saltOrRounds = await bcrypt.genSalt();
  return await bcrypt.hash(text, saltOrRounds);
}

export async function handleBCRYPTCompare(text: string, hash: string) {
  return await bcrypt.compare(text, hash);
}

export function returnPostsData(user_id: string, post: DeepPartial<Post>) {
  return {
    post_id: post?.post_id,
    title: post?.title,
    content: post?.content,
    user_data: {
      user_id:
        post.user_id != user_id || post.user.is_deleted == EIsDelete.DELETED
          ? null
          : post.user_id,
      user_image: {
        image_url: post.user.userDetail.image_url,
        thumbnail_url: post.user.userDetail.thumbnail_url,
      },
      is_deleted: !!post.user.is_deleted,
    },
    comment_count: post?.postComments?.length,
    is_commented: post?.postComments
      .map((postComment) => postComment?.user_id)
      .includes(user_id),
    like_count: post?.postLikes?.filter(
      (e) => e?.user?.is_deleted == EIsDelete.NOT_DELETE,
    )?.length,
    is_liked: post?.postLikes
      ?.map((postLike) => postLike?.user_id)
      .includes(user_id),
    files: post?.postImage?.map((image) => {
      return {
        media_type: image?.media_type,
        media_url: image?.media_url,
        thumbnail_url: image?.thumbnail_url,
        title: image?.title,
        size: image?.size,
      };
    }),
    created: post?.created_at,
    updated: post?.updated_at,
    is_incognito: !!post?.is_incognito,
    post_type: post?.post_type,
  };
}

// export async function checkTokenUser(token: string) {
//   const user = await getManager()
//     .getRepository(User)
//     .findOne({ where: { token } });
//   if (!user) {
//     throw new HttpException(
//       ErrorMessage.INVALID_TOKEN,
//       HttpStatus.UNAUTHORIZED,
//     );
//   }
// }
