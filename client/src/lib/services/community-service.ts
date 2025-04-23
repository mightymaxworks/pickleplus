/**
 * Community Service
 * 
 * Provides data operations for community management
 * following Framework 5.3 principles for frontend-first data handling.
 * 
 * @module CommunityService
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-04-23
 */

import { BaseEntity, getStorageService, IStorageService } from './storage-service';
import { queryClient, apiRequest } from '../queryClient';
import { toast } from '@/hooks/use-toast';
import featureFlags from '../featureFlags';
import { syncManager } from './sync-manager';

// Community types
export interface Community extends BaseEntity {
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  location?: string;
  primaryColor?: string;
  isPrivate: boolean;
  joinApprovalRequired: boolean;
  creatorId: number;
  memberCount: number;
  maxMembers?: number;
  tags?: string[];
  rules?: string;
  announcementsEnabled: boolean;
  eventsEnabled: boolean;
  forumEnabled: boolean;
  mediaGalleryEnabled: boolean;
  leaderboardEnabled: boolean;
}

export interface CommunityMember extends BaseEntity {
  communityId: string | number;
  userId: number;
  role: 'admin' | 'moderator' | 'member';
  joinDate: string;
  status: 'active' | 'inactive' | 'banned';
  visibility: 'public' | 'members_only' | 'private';
  lastActiveDate?: string;
  contributionScore?: number;
}

export interface CommunityPost extends BaseEntity {
  communityId: string | number;
  authorId: number;
  title?: string;
  content: string;
  imageUrls?: string[];
  tags?: string[];
  status: 'published' | 'draft' | 'archived' | 'removed';
  isAnnouncement: boolean;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface CommunityComment extends BaseEntity {
  postId: string | number;
  authorId: number;
  content: string;
  imageUrls?: string[];
  status: 'published' | 'archived' | 'removed';
  likeCount: number;
  replyCount: number;
  parentCommentId?: string | number;
}

export interface CommunityJoinRequest extends BaseEntity {
  communityId: string | number;
  userId: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  responseMessage?: string;
  responderId?: number;
}

export interface CommunityInput {
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  location?: string;
  primaryColor?: string;
  isPrivate: boolean;
  joinApprovalRequired: boolean;
  creatorId: number;
  maxMembers?: number;
  tags?: string[];
  rules?: string;
  announcementsEnabled?: boolean;
  eventsEnabled?: boolean;
  forumEnabled?: boolean;
  mediaGalleryEnabled?: boolean;
  leaderboardEnabled?: boolean;
}

export interface CommunityPostInput {
  communityId: string | number;
  authorId: number;
  title?: string;
  content: string;
  imageUrls?: string[];
  tags?: string[];
  isAnnouncement?: boolean;
  isPinned?: boolean;
}

export interface CommunityCommentInput {
  postId: string | number;
  authorId: number;
  content: string;
  imageUrls?: string[];
  parentCommentId?: string | number;
}

/**
 * Community Service class for handling community data
 */
export class CommunityService {
  public communityStorage: IStorageService<Community>;
  public memberStorage: IStorageService<CommunityMember>;
  public postStorage: IStorageService<CommunityPost>;
  public commentStorage: IStorageService<CommunityComment>;
  public joinRequestStorage: IStorageService<CommunityJoinRequest>;
  
  constructor() {
    this.communityStorage = getStorageService<Community>('communities');
    this.memberStorage = getStorageService<CommunityMember>('community-members');
    this.postStorage = getStorageService<CommunityPost>('community-posts');
    this.commentStorage = getStorageService<CommunityComment>('community-comments');
    this.joinRequestStorage = getStorageService<CommunityJoinRequest>('community-join-requests');
  }
  
  /**
   * Get all communities with frontend-first approach
   */
  async getAllCommunities(): Promise<Community[]> {
    try {
      console.log('CommunityService: Getting all communities');
      
      // Try to get from local storage first
      let communities = await this.communityStorage.getAll();
      
      // If using frontend-first, return local data
      if (featureFlags.useFrontendFirst('community')) {
        return communities;
      }
      
      // Otherwise try to get from server
      try {
        const response = await apiRequest('GET', `/api/communities`);
        
        if (response.ok) {
          const serverCommunities = await response.json();
          
          // Replace local storage with server data
          if (Array.isArray(serverCommunities)) {
            // Delete all local communities first
            for (const community of communities) {
              await this.communityStorage.delete(community.id);
            }
            
            // Add server communities to local storage
            communities = [];
            for (const communityData of serverCommunities) {
              const community = await this.communityStorage.create(communityData);
              communities.push(community);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching communities from server:', error);
        // In case of server error, we fall back to local data
      }
      
      return communities;
    } catch (error) {
      console.error('CommunityService: Error getting communities:', error);
      return [];
    }
  }
  
  /**
   * Get community by ID with frontend-first approach
   */
  async getCommunityById(id: string | number): Promise<Community | null> {
    try {
      console.log('CommunityService: Getting community by ID:', id);
      
      // Try to get from local storage first
      const community = await this.communityStorage.getById(id);
      
      // If found in local storage, return it
      if (community) {
        return community;
      }
      
      // Otherwise try to get from server if frontend-first is disabled
      if (!featureFlags.useFrontendFirst('community')) {
        const response = await apiRequest('GET', `/api/communities/${id}`);
        
        if (response.ok) {
          const serverCommunity = await response.json();
          
          // Save to local storage
          if (serverCommunity) {
            return await this.communityStorage.create(serverCommunity);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('CommunityService: Error getting community:', error);
      return null;
    }
  }
  
  /**
   * Create a community with frontend-first approach
   */
  async createCommunity(communityData: CommunityInput): Promise<Community> {
    try {
      console.log('CommunityService: Creating community:', communityData);
      
      // Create in local storage first
      const community = await this.communityStorage.create({
        ...communityData,
        memberCount: 1,
        announcementsEnabled: communityData.announcementsEnabled ?? true,
        eventsEnabled: communityData.eventsEnabled ?? true,
        forumEnabled: communityData.forumEnabled ?? true,
        mediaGalleryEnabled: communityData.mediaGalleryEnabled ?? true,
        leaderboardEnabled: communityData.leaderboardEnabled ?? false
      });
      
      // Add creator as admin member
      await this.memberStorage.create({
        communityId: community.id,
        userId: communityData.creatorId,
        role: 'admin',
        joinDate: new Date().toISOString(),
        status: 'active',
        visibility: 'public',
        contributionScore: 0,
      });
      
      console.log('CommunityService: Community created locally:', community);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('community')) {
        this.syncCommunityWithServer(community).catch(error => {
          console.error('CommunityService: Background sync failed:', error);
          syncManager.addToSyncQueue('communities', community.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateCommunityQueries();
      
      return community;
    } catch (error) {
      console.error('CommunityService: Error creating community:', error);
      throw error;
    }
  }
  
  /**
   * Update a community with frontend-first approach
   */
  async updateCommunity(id: string | number, communityData: Partial<Community>): Promise<Community> {
    try {
      console.log('CommunityService: Updating community:', id, communityData);
      
      // Update in local storage first
      const community = await this.communityStorage.update(id, communityData);
      
      console.log('CommunityService: Community updated locally:', community);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('community')) {
        this.syncCommunityWithServer(community).catch(error => {
          console.error('CommunityService: Background sync failed:', error);
          syncManager.addToSyncQueue('communities', community.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateCommunityQueries();
      this.invalidateCommunityQuery(id);
      
      return community;
    } catch (error) {
      console.error('CommunityService: Error updating community:', error);
      throw error;
    }
  }
  
  /**
   * Create a post in a community with frontend-first approach
   */
  async createPost(postData: CommunityPostInput): Promise<CommunityPost> {
    try {
      console.log('CommunityService: Creating post:', postData);
      
      // Create in local storage first
      const post = await this.postStorage.create({
        ...postData,
        status: 'published',
        isAnnouncement: postData.isAnnouncement || false,
        isPinned: postData.isPinned || false,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      });
      
      console.log('CommunityService: Post created locally:', post);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('community')) {
        this.syncPostWithServer(post).catch(error => {
          console.error('CommunityService: Background post sync failed:', error);
          syncManager.addToSyncQueue('community-posts', post.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateCommunityPostsQueries(post.communityId);
      
      return post;
    } catch (error) {
      console.error('CommunityService: Error creating post:', error);
      throw error;
    }
  }
  
  /**
   * Create a comment on a post with frontend-first approach
   */
  async createComment(commentData: CommunityCommentInput): Promise<CommunityComment> {
    try {
      console.log('CommunityService: Creating comment:', commentData);
      
      // Create in local storage first
      const comment = await this.commentStorage.create({
        ...commentData,
        status: 'published',
        likeCount: 0,
        replyCount: 0,
      });
      
      console.log('CommunityService: Comment created locally:', comment);
      
      // Update post comment count
      try {
        const post = await this.postStorage.getById(commentData.postId);
        if (post) {
          await this.postStorage.update(post.id, {
            ...post,
            commentCount: post.commentCount + 1,
          });
          
          // If this is a reply to another comment, update parent comment reply count
          if (commentData.parentCommentId) {
            const parentComment = await this.commentStorage.getById(commentData.parentCommentId);
            if (parentComment) {
              await this.commentStorage.update(parentComment.id, {
                ...parentComment,
                replyCount: parentComment.replyCount + 1,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error updating comment counts:', error);
      }
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('community')) {
        this.syncCommentWithServer(comment).catch(error => {
          console.error('CommunityService: Background comment sync failed:', error);
          syncManager.addToSyncQueue('community-comments', comment.id);
        });
      }
      
      // Invalidate related queries
      this.invalidatePostCommentsQueries(comment.postId);
      
      return comment;
    } catch (error) {
      console.error('CommunityService: Error creating comment:', error);
      throw error;
    }
  }
  
  /**
   * Join a community with frontend-first approach
   */
  async joinCommunity(communityId: string | number, userId: number): Promise<CommunityMember | CommunityJoinRequest> {
    try {
      console.log('CommunityService: Joining community:', communityId, userId);
      
      // Get community to check if approval is required
      const community = await this.getCommunityById(communityId);
      
      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }
      
      if (community.joinApprovalRequired) {
        // Create join request
        const joinRequest = await this.joinRequestStorage.create({
          communityId,
          userId,
          status: 'pending',
        });
        
        console.log('CommunityService: Join request created:', joinRequest);
        
        // Try to sync with server in background
        if (featureFlags.useFrontendFirst('community')) {
          this.syncJoinRequestWithServer(joinRequest).catch(error => {
            console.error('CommunityService: Background join request sync failed:', error);
            syncManager.addToSyncQueue('community-join-requests', joinRequest.id);
          });
        }
        
        // Invalidate related queries
        this.invalidateJoinRequestsQueries(communityId);
        
        return joinRequest;
      } else {
        // Direct membership
        const member = await this.memberStorage.create({
          communityId,
          userId,
          role: 'member',
          joinDate: new Date().toISOString(),
          status: 'active',
          visibility: 'public',
          contributionScore: 0,
        });
        
        console.log('CommunityService: Member created:', member);
        
        // Update community member count
        await this.communityStorage.update(communityId, {
          ...community,
          memberCount: community.memberCount + 1,
        });
        
        // Try to sync with server in background
        if (featureFlags.useFrontendFirst('community')) {
          this.syncMemberWithServer(member).catch(error => {
            console.error('CommunityService: Background member sync failed:', error);
            syncManager.addToSyncQueue('community-members', member.id);
          });
        }
        
        // Invalidate related queries
        this.invalidateCommunityMembersQueries(communityId);
        this.invalidateCommunityQuery(communityId);
        
        return member;
      }
    } catch (error) {
      console.error('CommunityService: Error joining community:', error);
      throw error;
    }
  }
  
  /**
   * Get posts for a community with frontend-first approach
   */
  async getCommunityPosts(communityId: string | number): Promise<CommunityPost[]> {
    try {
      console.log('CommunityService: Getting posts for community:', communityId);
      
      // Try to get from local storage first
      const posts = await this.postStorage.query(
        post => post.communityId === communityId && post.status === 'published'
      );
      
      // If using frontend-first, return local data
      if (featureFlags.useFrontendFirst('community')) {
        return posts;
      }
      
      // Otherwise try to get from server
      const response = await apiRequest('GET', `/api/communities/${communityId}/posts`);
      
      if (response.ok) {
        const serverPosts = await response.json();
        
        // Replace local storage with server data
        if (Array.isArray(serverPosts)) {
          // Delete existing posts for this community
          for (const post of posts) {
            await this.postStorage.delete(post.id);
          }
          
          // Add server posts to local storage
          const updatedPosts = [];
          for (const postData of serverPosts) {
            const post = await this.postStorage.create(postData);
            updatedPosts.push(post);
          }
          
          return updatedPosts;
        }
      }
      
      // If server failed, return local data
      return posts;
    } catch (error) {
      console.error('CommunityService: Error getting community posts:', error);
      return [];
    }
  }
  
  /**
   * Get comments for a post with frontend-first approach
   */
  async getPostComments(postId: string | number): Promise<CommunityComment[]> {
    try {
      console.log('CommunityService: Getting comments for post:', postId);
      
      // Try to get from local storage first
      const comments = await this.commentStorage.query(
        comment => comment.postId === postId && comment.status === 'published'
      );
      
      // If using frontend-first, return local data
      if (featureFlags.useFrontendFirst('community')) {
        return comments;
      }
      
      // Otherwise try to get from server
      const response = await apiRequest('GET', `/api/posts/${postId}/comments`);
      
      if (response.ok) {
        const serverComments = await response.json();
        
        // Replace local storage with server data
        if (Array.isArray(serverComments)) {
          // Delete existing comments for this post
          for (const comment of comments) {
            await this.commentStorage.delete(comment.id);
          }
          
          // Add server comments to local storage
          const updatedComments = [];
          for (const commentData of serverComments) {
            const comment = await this.commentStorage.create(commentData);
            updatedComments.push(comment);
          }
          
          return updatedComments;
        }
      }
      
      // If server failed, return local data
      return comments;
    } catch (error) {
      console.error('CommunityService: Error getting post comments:', error);
      return [];
    }
  }
  
  /**
   * Sync community with the server
   * Made public so it can be used by SyncManager
   */
  public async syncCommunityWithServer(community: Community): Promise<void> {
    try {
      console.log('CommunityService: Syncing community with server:', community);
      
      // Determine if this is a create or update
      const method = community.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/communities` 
        : `/api/communities/${community.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, community);
      
      if (!response.ok) {
        console.error('CommunityService: Server sync failed with status:', response.status);
        syncManager.addToSyncQueue('communities', community.id);
        return;
      }
      
      // Get the server's version of the community
      const serverCommunity = await response.json();
      console.log('CommunityService: Server sync successful, received:', serverCommunity);
      
      // Update local version with server data
      if (serverCommunity && serverCommunity.id) {
        if (method === 'POST' && community.id !== serverCommunity.id) {
          // If this was a creation and we got a new ID, we need to update all related entities
          await this.handleCommunityIdChange(community.id, serverCommunity.id);
        } else {
          // Otherwise just update the existing entry
          await this.communityStorage.update(community.id, serverCommunity);
        }
      }
      
      // Invalidate related queries
      this.invalidateCommunityQueries();
      this.invalidateCommunityQuery(serverCommunity.id || community.id);
      
    } catch (error) {
      console.error('CommunityService: Error syncing with server:', error);
      syncManager.addToSyncQueue('communities', community.id);
      throw error;
    }
  }
  
  /**
   * Sync post with the server
   * Made public so it can be used by SyncManager
   */
  public async syncPostWithServer(post: CommunityPost): Promise<void> {
    try {
      console.log('CommunityService: Syncing post with server:', post);
      
      // Determine if this is a create or update
      const method = post.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/communities/${post.communityId}/posts` 
        : `/api/communities/posts/${post.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, post);
      
      if (!response.ok) {
        console.error('CommunityService: Post sync failed with status:', response.status);
        syncManager.addToSyncQueue('community-posts', post.id);
        return;
      }
      
      // Get the server's version of the post
      const serverPost = await response.json();
      console.log('CommunityService: Post sync successful, received:', serverPost);
      
      // Update local version with server data
      if (serverPost && serverPost.id) {
        if (method === 'POST' && post.id !== serverPost.id) {
          // If this was a creation and we got a new ID, we need to update all related entities
          await this.handlePostIdChange(post.id, serverPost.id);
        } else {
          // Otherwise just update the existing entry
          await this.postStorage.update(post.id, serverPost);
        }
      }
      
      // Invalidate related queries
      this.invalidateCommunityPostsQueries(post.communityId);
      
    } catch (error) {
      console.error('CommunityService: Error syncing post with server:', error);
      syncManager.addToSyncQueue('community-posts', post.id);
      throw error;
    }
  }
  
  /**
   * Sync comment with the server
   * Made public so it can be used by SyncManager
   */
  public async syncCommentWithServer(comment: CommunityComment): Promise<void> {
    try {
      console.log('CommunityService: Syncing comment with server:', comment);
      
      // Determine if this is a create or update
      const method = comment.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/posts/${comment.postId}/comments` 
        : `/api/comments/${comment.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, comment);
      
      if (!response.ok) {
        console.error('CommunityService: Comment sync failed with status:', response.status);
        syncManager.addToSyncQueue('community-comments', comment.id);
        return;
      }
      
      // Get the server's version of the comment
      const serverComment = await response.json();
      console.log('CommunityService: Comment sync successful, received:', serverComment);
      
      // Update local version with server data
      if (serverComment && serverComment.id) {
        if (method === 'POST' && comment.id !== serverComment.id) {
          // If this was a creation and we got a new ID, we need to delete the local entry
          // and create a new one with the server ID
          await this.commentStorage.delete(comment.id);
          await this.commentStorage.create(serverComment);
        } else {
          // Otherwise just update the existing entry
          await this.commentStorage.update(comment.id, serverComment);
        }
      }
      
      // Invalidate related queries
      this.invalidatePostCommentsQueries(comment.postId);
      
    } catch (error) {
      console.error('CommunityService: Error syncing comment with server:', error);
      syncManager.addToSyncQueue('community-comments', comment.id);
      throw error;
    }
  }
  
  /**
   * Sync member with the server
   * Made public so it can be used by SyncManager
   */
  public async syncMemberWithServer(member: CommunityMember): Promise<void> {
    try {
      console.log('CommunityService: Syncing member with server:', member);
      
      // Determine if this is a create or update
      const method = member.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/communities/${member.communityId}/members` 
        : `/api/communities/members/${member.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, member);
      
      if (!response.ok) {
        console.error('CommunityService: Member sync failed with status:', response.status);
        syncManager.addToSyncQueue('community-members', member.id);
        return;
      }
      
      // Get the server's version of the member
      const serverMember = await response.json();
      console.log('CommunityService: Member sync successful, received:', serverMember);
      
      // Update local version with server data
      if (serverMember && serverMember.id) {
        if (method === 'POST' && member.id !== serverMember.id) {
          // If this was a creation and we got a new ID, we need to delete the local entry
          // and create a new one with the server ID
          await this.memberStorage.delete(member.id);
          await this.memberStorage.create(serverMember);
        } else {
          // Otherwise just update the existing entry
          await this.memberStorage.update(member.id, serverMember);
        }
      }
      
      // Invalidate related queries
      this.invalidateCommunityMembersQueries(member.communityId);
      
    } catch (error) {
      console.error('CommunityService: Error syncing member with server:', error);
      syncManager.addToSyncQueue('community-members', member.id);
      throw error;
    }
  }
  
  /**
   * Sync join request with the server
   * Made public so it can be used by SyncManager
   */
  public async syncJoinRequestWithServer(joinRequest: CommunityJoinRequest): Promise<void> {
    try {
      console.log('CommunityService: Syncing join request with server:', joinRequest);
      
      // Determine if this is a create or update
      const method = joinRequest.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/communities/${joinRequest.communityId}/join-requests` 
        : `/api/communities/join-requests/${joinRequest.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, joinRequest);
      
      if (!response.ok) {
        console.error('CommunityService: Join request sync failed with status:', response.status);
        syncManager.addToSyncQueue('community-join-requests', joinRequest.id);
        return;
      }
      
      // Get the server's version of the join request
      const serverJoinRequest = await response.json();
      console.log('CommunityService: Join request sync successful, received:', serverJoinRequest);
      
      // Update local version with server data
      if (serverJoinRequest && serverJoinRequest.id) {
        if (method === 'POST' && joinRequest.id !== serverJoinRequest.id) {
          // If this was a creation and we got a new ID, we need to delete the local entry
          // and create a new one with the server ID
          await this.joinRequestStorage.delete(joinRequest.id);
          await this.joinRequestStorage.create(serverJoinRequest);
        } else {
          // Otherwise just update the existing entry
          await this.joinRequestStorage.update(joinRequest.id, serverJoinRequest);
        }
      }
      
      // Invalidate related queries
      this.invalidateJoinRequestsQueries(joinRequest.communityId);
      
    } catch (error) {
      console.error('CommunityService: Error syncing join request with server:', error);
      syncManager.addToSyncQueue('community-join-requests', joinRequest.id);
      throw error;
    }
  }
  
  /**
   * Handle community ID change after server sync (e.g., from local_123 to server-assigned ID)
   */
  private async handleCommunityIdChange(oldId: string | number, newId: string | number): Promise<void> {
    try {
      console.log('CommunityService: Handling community ID change from', oldId, 'to', newId);
      
      // Get the community from local storage
      const community = await this.communityStorage.getById(oldId);
      
      if (!community) {
        throw new Error(`Community ${oldId} not found in local storage`);
      }
      
      // Create a new community with the new ID
      await this.communityStorage.create({
        ...community,
        id: newId,
      });
      
      // Delete the old community
      await this.communityStorage.delete(oldId);
      
      // Update all related entities (members, posts, join requests)
      const members = await this.memberStorage.query(member => member.communityId === oldId);
      for (const member of members) {
        await this.memberStorage.update(member.id, {
          ...member,
          communityId: newId,
        });
      }
      
      const posts = await this.postStorage.query(post => post.communityId === oldId);
      for (const post of posts) {
        await this.postStorage.update(post.id, {
          ...post,
          communityId: newId,
        });
      }
      
      const joinRequests = await this.joinRequestStorage.query(
        request => request.communityId === oldId
      );
      for (const request of joinRequests) {
        await this.joinRequestStorage.update(request.id, {
          ...request,
          communityId: newId,
        });
      }
      
    } catch (error) {
      console.error('CommunityService: Error handling community ID change:', error);
      throw error;
    }
  }
  
  /**
   * Handle post ID change after server sync
   */
  private async handlePostIdChange(oldId: string | number, newId: string | number): Promise<void> {
    try {
      console.log('CommunityService: Handling post ID change from', oldId, 'to', newId);
      
      // Get the post from local storage
      const post = await this.postStorage.getById(oldId);
      
      if (!post) {
        throw new Error(`Post ${oldId} not found in local storage`);
      }
      
      // Create a new post with the new ID
      await this.postStorage.create({
        ...post,
        id: newId,
      });
      
      // Delete the old post
      await this.postStorage.delete(oldId);
      
      // Update all related comments
      const comments = await this.commentStorage.query(comment => comment.postId === oldId);
      for (const comment of comments) {
        await this.commentStorage.update(comment.id, {
          ...comment,
          postId: newId,
        });
      }
      
    } catch (error) {
      console.error('CommunityService: Error handling post ID change:', error);
      throw error;
    }
  }
  
  /**
   * Invalidate community queries when data changes
   */
  private invalidateCommunityQueries(): void {
    console.log('CommunityService: Invalidating community queries');
    queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
  }
  
  /**
   * Invalidate specific community query when data changes
   */
  private invalidateCommunityQuery(id: string | number): void {
    console.log('CommunityService: Invalidating community query:', id);
    queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}`] });
  }
  
  /**
   * Invalidate community posts queries when data changes
   */
  private invalidateCommunityPostsQueries(communityId: string | number): void {
    console.log('CommunityService: Invalidating community posts queries:', communityId);
    queryClient.invalidateQueries({ 
      queryKey: [`/api/communities/${communityId}/posts`] 
    });
  }
  
  /**
   * Invalidate post comments queries when data changes
   */
  private invalidatePostCommentsQueries(postId: string | number): void {
    console.log('CommunityService: Invalidating post comments queries:', postId);
    queryClient.invalidateQueries({ 
      queryKey: [`/api/posts/${postId}/comments`] 
    });
  }
  
  /**
   * Invalidate community members queries when data changes
   */
  private invalidateCommunityMembersQueries(communityId: string | number): void {
    console.log('CommunityService: Invalidating community members queries:', communityId);
    queryClient.invalidateQueries({ 
      queryKey: [`/api/communities/${communityId}/members`] 
    });
  }
  
  /**
   * Invalidate join requests queries when data changes
   */
  private invalidateJoinRequestsQueries(communityId: string | number): void {
    console.log('CommunityService: Invalidating join requests queries:', communityId);
    queryClient.invalidateQueries({ 
      queryKey: [`/api/communities/${communityId}/join-requests`] 
    });
  }
}

// Create a singleton instance
export const communityService = new CommunityService();

// Export a hook to use the community service
export function useCommunityService() {
  return communityService;
}