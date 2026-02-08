import { FeedPostType, FeedPostVisibility } from '@prisma/client'

export interface CreateFeedPostInput {
  type: FeedPostType
  visibility?: FeedPostVisibility
  content: string
  mediaUrls?: string[]
  thumbnails?: string[]
  campaignId?: string
  hashtags?: string[]
  mentions?: string[]
}

export interface UpdateFeedPostInput {
  content?: string
  visibility?: FeedPostVisibility
  mediaUrls?: string[]
  hashtags?: string[]
}

export interface CreateCommentInput {
  content: string
  parentId?: string
}

export interface CreatePollInput {
  question: string
  options: string[]
  endsAt?: string
}

export interface FeedFilters {
  authorId?: string
  type?: FeedPostType
  visibility?: FeedPostVisibility
  hashtag?: string
  followingOnly?: boolean
  page?: number
  pageSize?: number
}

export interface FeedPostWithEngagement {
  id: string
  author: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
  type: FeedPostType
  visibility: FeedPostVisibility
  content: string
  mediaUrls: string[]
  hashtags: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  viewsCount: number
  isLikedByUser: boolean
  createdAt: Date
}
