import * as bcrypt from 'bcrypt';
import { ECommonStatus, EIsDelete } from 'enum';
import moment = require('moment');
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { DeepPartial } from 'typeorm';

export async function handleBCRYPTHash(text: string) {
  const saltOrRounds = await bcrypt.genSalt();
  return await bcrypt.hash(text, saltOrRounds);
}

export async function handleBCRYPTCompare(text: string, hash: string) {
  return await bcrypt.compare(text, hash);
}

export function returnPagingData(data: any, totalItems: number, params: any) {
  return {
    data,
    is_last_page:
      params.pageIndex < Math.ceil(totalItems / params.take)
        ? !!ECommonStatus.NO
        : !!ECommonStatus.YES,
  };
}

export function returnPostsData(user_id: string, post: DeepPartial<Post>) {
  return {
    post_id: post?.post_id,
    content: post?.content,
    user_data: {
      nick_name: post.user.user_name,
      user_id: post.user_id,
      user_image: {
        image_url: post.user.userDetail.image_url,
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
    image: post?.postImage?.map((image) => {
      return {
        image_url: image?.image_url,
      };
    }),
    created: moment(JSON.stringify(post?.created_at), 'YYYY-MM-DD').format(
      'YYYY-MM-DD',
    ),
    updated: post?.updated_at,
    is_incognito: !!post?.is_incognito,
  };
}

export function returnPostsImage(post: DeepPartial<Post>) {
  return {
    post_id: post?.post_id,
    image: post?.postImage?.map((image) => {
      return {
        image_url: image?.image_url,
      };
    }),
    created: moment(JSON.stringify(post?.created_at), 'YYYY-MM-DD').format(
      'YYYY-MM-DD',
    ),
    updated: post?.updated_at,
    is_incognito: !!post?.is_incognito,
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
