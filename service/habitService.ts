import { db } from "../service/firebase.config"; 
import { collection, addDoc, updateDoc, doc, query, where, getDocs, increment,serverTimestamp,Timestamp } from "firebase/firestore";
import { Habit } from "../types/habits";

const HABITS_COLLECTION = "habits";

export const HabitService = {
  // 1. Create a new habit (The Blueprint)
  async createHabit(userId: string, title: string) {
    return await addDoc(collection(db, HABITS_COLLECTION), {
      userId,
      title,
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      createdAt: serverTimestamp(),
    });
  },

  // 2. Fetch all habits for a user
  async getUserHabits(userId: string): Promise<Habit[]> {
    const q = query(collection(db, HABITS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  },

  // 3. The "Strike" Logic (Mark complete and update streak)
  async completeHabit(habitId: string, currentStreak: number, bestStreak: number, lastDate: Timestamp | null) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = currentStreak + 1;
    
    // Check if the streak was broken (last completed was before yesterday)
    if (lastDate) {
      const lastDateObj = lastDate.toDate();
      lastDateObj.setHours(0, 0, 0, 0);
      
      const diffInDays = (today.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffInDays > 1) {
        newStreak = 1; // Cooled down! Reset to 1
      } else if (diffInDays === 0) {
        return; // Already forged today, do nothing
      }
    }

    const isNewBest = newStreak > bestStreak;

    await updateDoc(habitRef, {
      currentStreak: newStreak,
      bestStreak: isNewBest ? newStreak : bestStreak,
      lastCompletedDate: serverTimestamp(),
    });

    // Add a log entry for history
    await addDoc(collection(db, `${HABITS_COLLECTION}/${habitId}/logs`), {
      date: serverTimestamp(),
      status: "completed"
    });
  },

  // 4. Delete a habit
  async deleteHabit(habitId: string) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    await updateDoc(habitRef, { deleted: true });
  }
};