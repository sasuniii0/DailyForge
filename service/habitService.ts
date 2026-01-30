import { db } from "../service/firebase.config"; 
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  Timestamp, 
  deleteDoc 
} from "firebase/firestore";
import { Habit } from "../types/habits";

const HABITS_COLLECTION = "habits";

export const HabitService = {
  // 1. Create a new habit (Updated to match your UI)
  async createHabit(userId: string, habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedToday' | 'totalCompletions'>) {
    return await addDoc(collection(db, HABITS_COLLECTION), {
      ...habitData,
      userId,
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      totalCompletions: 0,
      createdAt: new Date().toISOString(), // Matching your interface's string type
      lastCompletedDate: null,
    });
  },

  // 2. Fetch all habits for a user
  async getUserHabits(userId: string): Promise<Habit[]> {
    const q = query(collection(db, HABITS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
    } as Habit));
  },

  // 3. The "Strike" Logic (Improved streak validation)
  async completeHabit(habitId: string, habit: Habit) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = (habit.currentStreak || 0) + 1;
    const lastDateStr = habit.lastCompletedDate;
    
    if (lastDateStr) {
      const lastDateObj = new Date(lastDateStr);
      lastDateObj.setHours(0, 0, 0, 0);
      
      const diffInDays = Math.floor((today.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return; // Already struck the iron today
      if (diffInDays > 1) {
        newStreak = 1; // Forge cooled down, reset streak
      }
    }

    const isNewBest = newStreak > (habit.bestStreak || 0);

    await updateDoc(habitRef, {
      currentStreak: newStreak,
      bestStreak: isNewBest ? newStreak : habit.bestStreak,
      completedToday: true,
      totalCompletions: (habit.totalCompletions || 0) + 1,
      lastCompletedDate: new Date().toISOString(),
    });

    // Sub-collection for detailed history
    await addDoc(collection(db, `${HABITS_COLLECTION}/${habitId}/logs`), {
      date: serverTimestamp(),
      status: "completed"
    });
  },

  // 4. Delete a habit (Actual deletion or soft delete)
  async deleteHabit(habitId: string) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    // Option A: Hard Delete (Cleans the database)
    await deleteDoc(habitRef);
    
    // Option B: Soft Delete (Use this if you want to keep data for AI insights)
    // await updateDoc(habitRef, { deleted: true });
  }
};