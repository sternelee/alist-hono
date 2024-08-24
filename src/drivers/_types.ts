export interface ILink {
  id: string;
  url: string;
  title: string;
  checked: 0 | 1;
  saved: 0 | 1;
  feedId: string;
  userId: string;
  driver: string;
  folderId: string;
}

export interface ISaveBody {
  userId: string;
  driver: string;
  url: string;
  title: string;
  folderId: string;
}
