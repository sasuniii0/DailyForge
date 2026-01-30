import { db } from "./firebase.config";
import { 
  collection, addDoc, query, orderBy, limit, getDocs, 
  serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc 
} from "firebase/firestore";

const COMMUNITY_COLLECTION = "posts";

export const CommunityService = {
  // Create Post with Base64 Image (No Storage Billing)
  async createPost(userId: string, userName: string, content: string, base64Image?: string | null) {
    try {
      const docRef = await addDoc(collection(db, COMMUNITY_COLLECTION), {
        userId,
        userName: userName || "Anonymous Smith",
        content: content.trim(),
        imageUrl: base64Image || null, // Storing the string directly
        likes: [],
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error forging spark:", error);
      throw error;
    }
  },

  async getFeed(limitCount: number = 20) { // Kept small to save data
    try {
      const q = query(collection(db, COMMUNITY_COLLECTION), orderBy("createdAt", "desc"), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching feed:", error);
      return [];
    }
  },

  async toggleLike(postId: string, userId: string, hasLiked: boolean) {
    const postRef = doc(db, COMMUNITY_COLLECTION, postId);
    await updateDoc(postRef, {
      likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  },

  async deletePost(postId: string) {
    await deleteDoc(doc(db, COMMUNITY_COLLECTION, postId));
  }
};