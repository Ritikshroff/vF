import { prisma } from '@/lib/db/prisma'
import { Prisma, FeedPostVisibility } from '@prisma/client'
import { CreateFeedPostInput, UpdateFeedPostInput, CreateCommentInput, CreatePollInput, FeedFilters } from '@/types/feed'

// ==================== Feed Post Operations ====================

/**
 * Create a new feed post
 */
export async function createFeedPost(authorId: string, input: CreateFeedPostInput) {
  return prisma.feedPost.create({
    data: {
      authorId,
      type: input.type,
      visibility: input.visibility || 'PUBLIC',
      content: input.content,
      mediaUrls: input.mediaUrls || [],
      thumbnails: input.thumbnails || [],
      campaignId: input.campaignId,
      hashtags: input.hashtags || [],
      mentions: input.mentions || [],
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true, role: true },
      },
    },
  })
}

/**
 * Get feed post by ID with engagement data
 */
export async function getFeedPostById(postId: string, currentUserId?: string) {
  const post = await prisma.feedPost.findUnique({
    where: { id: postId, isDeleted: false },
    include: {
      author: {
        select: { id: true, name: true, avatar: true, role: true },
      },
      poll: {
        include: { votes: true },
      },
      _count: {
        select: { likes: true, comments: true, shares: true },
      },
    },
  })

  if (!post) return null

  let isLikedByUser = false
  if (currentUserId) {
    const like = await prisma.feedLike.findUnique({
      where: { postId_userId: { postId, userId: currentUserId } },
    })
    isLikedByUser = !!like
  }

  return { ...post, isLikedByUser }
}

/**
 * Get personalized feed for a user
 */
export async function getFeed(userId: string, filters: FeedFilters) {
  const { authorId, type, hashtag, followingOnly, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  // Build where clause
  const where: Prisma.FeedPostWhereInput = {
    isDeleted: false,
    ...(authorId && { authorId }),
    ...(type && { type }),
    ...(hashtag && { hashtags: { has: hashtag } }),
  }

  // If following only, get the users the current user follows
  if (followingOnly) {
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)
    followingIds.push(userId) // Include own posts
    where.authorId = { in: followingIds }
  }

  // Visibility filter
  if (!authorId || authorId !== userId) {
    where.OR = [
      { visibility: 'PUBLIC' },
      { authorId: userId },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.feedPost.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        _count: {
          select: { likes: true, comments: true, shares: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feedPost.count({ where }),
  ])

  // Check which posts the user has liked
  const postIds = data.map((p) => p.id)
  const userLikes = await prisma.feedLike.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  })
  const likedPostIds = new Set(userLikes.map((l) => l.postId))

  const postsWithLikeStatus = data.map((post) => ({
    ...post,
    isLikedByUser: likedPostIds.has(post.id),
  }))

  return { data: postsWithLikeStatus, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Update a feed post
 */
export async function updateFeedPost(postId: string, authorId: string, input: UpdateFeedPostInput) {
  return prisma.feedPost.update({
    where: { id: postId, authorId },
    data: {
      ...(input.content && { content: input.content }),
      ...(input.visibility && { visibility: input.visibility }),
      ...(input.mediaUrls && { mediaUrls: input.mediaUrls }),
      ...(input.hashtags && { hashtags: input.hashtags }),
    },
  })
}

/**
 * Delete a feed post (soft delete)
 */
export async function deleteFeedPost(postId: string, authorId: string) {
  return prisma.feedPost.update({
    where: { id: postId, authorId },
    data: { isDeleted: true },
  })
}

// ==================== Engagement Operations ====================

/**
 * Like/Unlike a post (toggle)
 */
export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const existing = await prisma.feedLike.findUnique({
    where: { postId_userId: { postId, userId } },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.feedLike.delete({ where: { id: existing.id } }),
      prisma.feedPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ])
    return false // Unliked
  } else {
    await prisma.$transaction([
      prisma.feedLike.create({ data: { postId, userId } }),
      prisma.feedPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ])
    return true // Liked
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, authorId: string, input: CreateCommentInput) {
  const [comment] = await prisma.$transaction([
    prisma.feedComment.create({
      data: {
        postId,
        authorId,
        content: input.content,
        parentId: input.parentId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    }),
    prisma.feedPost.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    }),
  ])

  return comment
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.feedComment.findMany({
      where: { postId, parentId: null, isDeleted: false },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            author: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 3,
        },
        _count: { select: { replies: true } },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feedComment.count({ where: { postId, parentId: null, isDeleted: false } }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Share a post
 */
export async function sharePost(postId: string, userId: string, note?: string) {
  const [share] = await prisma.$transaction([
    prisma.feedShare.create({
      data: { postId, userId, note },
    }),
    prisma.feedPost.update({
      where: { id: postId },
      data: { sharesCount: { increment: 1 } },
    }),
  ])

  return share
}

// ==================== Poll Operations ====================

/**
 * Create a poll on a post
 */
export async function createPoll(postId: string, input: CreatePollInput) {
  return prisma.feedPoll.create({
    data: {
      postId,
      question: input.question,
      options: input.options,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
    },
  })
}

/**
 * Vote on a poll
 */
export async function voteOnPoll(pollId: string, userId: string, optionIndex: number) {
  return prisma.feedPollVote.upsert({
    where: { pollId_userId: { pollId, userId } },
    update: { optionIndex },
    create: { pollId, userId, optionIndex },
  })
}

// ==================== Follow Operations ====================

/**
 * Follow/Unfollow a user (toggle)
 */
export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const existing = await prisma.userFollow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })

  if (existing) {
    await prisma.userFollow.delete({ where: { id: existing.id } })
    return false // Unfollowed
  } else {
    await prisma.userFollow.create({ data: { followerId, followingId } })
    return true // Followed
  }
}

/**
 * Get followers of a user
 */
export async function getFollowers(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userFollow.count({ where: { followingId: userId } }),
  ])

  return { data: data.map((d) => d.follower), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userFollow.count({ where: { followerId: userId } }),
  ])

  return { data: data.map((d) => d.following), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
