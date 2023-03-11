export interface IUserData {
  user_id: string;
  phone?: string;
  [key: string]: any;
}
export enum EActivityType {
  COMMENT = 0,
  LIKE_POST = 1,
  LIKE_COMMENT = 2,
}

export enum EReadActivity {
  READ = 1,
  UN_READ = 0,
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  skip?: number;
  [key: string]: any;
}
