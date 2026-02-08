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
  // 1. Create a new habit
  async createHabit(userId: string, habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedToday' | 'totalCompletions'>) {
    return await addDoc(collection(db, HABITS_COLLECTION), {
      ...habitData,
      userId,
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      totalCompletions: 0,
      createdAt: new Date().toISOString(),
      lastCompletedDate: null,
    });
  },

  // 2. Fetch all habits for a user (with auto-reset of daily status)
  async getUserHabits(userId: string): Promise<Habit[]> {
    const q = query(collection(db, HABITS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const habits = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
    } as Habit));

    // Reset completedToday if it's a new day
    const today = new Date().toISOString().split('T')[0];
    
    for (const habit of habits) {
      if (habit.lastCompletedDate) {
        const lastCompletedDay = habit.lastCompletedDate.split('T')[0];
        
        // If last completed date is NOT today, reset completedToday flag
        if (lastCompletedDay !== today && habit.completedToday === true) {
          const habitRef = doc(db, HABITS_COLLECTION, habit.id);
          await updateDoc(habitRef, {
            completedToday: false
          });
          habit.completedToday = false; // Update local object too
        }
      }
    }

    return habits;
  },

  // 3. Check and reset daily completion status for a single habit
  async checkAndResetDailyStatus(habitId: string, habit: Habit): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    if (habit.lastCompletedDate) {
      const lastCompletedDay = habit.lastCompletedDate.split('T')[0];
      
      // If last completed date is NOT today and still marked as completed
      if (lastCompletedDay !== today && habit.completedToday === true) {
        const habitRef = doc(db, HABITS_COLLECTION, habitId);
        await updateDoc(habitRef, {
          completedToday: false
        });
        return false; // Return new status
      }
    }
    
    return habit.completedToday; // Return current status if no reset needed
  },

  // 4. The "Strike" Logic (Improved streak validation)
  async completeHabit(habitId: string, habit: Habit) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Check if already completed today
    if (habit.lastCompletedDate) {
      const lastCompletedDay = habit.lastCompletedDate.split('T')[0];
      if (lastCompletedDay === todayStr) {
        return; // Already completed today
      }
    }

    let newStreak = (habit.currentStreak || 0) + 1;
    const lastDateStr = habit.lastCompletedDate;
    
    if (lastDateStr) {
      const lastDateObj = new Date(lastDateStr);
      lastDateObj.setHours(0, 0, 0, 0);
      
      const diffInDays = Math.floor((today.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays > 1) {
        newStreak = 1; // Streak broken, reset to 1
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

  // 5. Uncomplete a habit (if marked by mistake)
  async uncompleteHabit(habitId: string, habit: Habit) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    
    await updateDoc(habitRef, {
      completedToday: false,
      currentStreak: Math.max(0, (habit.currentStreak || 0) - 1),
      totalCompletions: Math.max(0, (habit.totalCompletions || 0) - 1),
    });
  },

  // 6. Delete a habit
  async deleteHabit(habitId: string) {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    await deleteDoc(habitRef);
  }
};