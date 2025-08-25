// Run this in browser console to clean up duplicate conversations
// Only run this if you have duplicate conversations in Firestore

const cleanupDuplicateConversations = async () => {
  // This is a client-side cleanup utility
  console.log('🧹 Starting duplicate conversation cleanup...');

  try {
    const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');

    const conversationsRef = collection(db, 'conversations');
    const snapshot = await getDocs(conversationsRef);

    const userConversations = new Map();
    const duplicates = [];

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const userParticipant = data.participants.find((p) => p.userRole === 'user');

      if (userParticipant) {
        const userId = userParticipant.userId;

        if (userConversations.has(userId)) {
          // This is a duplicate
          duplicates.push({
            id: docSnapshot.id,
            userId: userId,
            createdAt: data.createdAt,
          });
        } else {
          // First conversation for this user
          userConversations.set(userId, {
            id: docSnapshot.id,
            createdAt: data.createdAt,
          });
        }
      }
    });

    console.log(`Found ${duplicates.length} duplicate conversations`);

    // Delete duplicates (keeping the first one for each user)
    for (const duplicate of duplicates) {
      console.log(`Deleting duplicate conversation ${duplicate.id} for user ${duplicate.userId}`);
      await deleteDoc(doc(db, 'conversations', duplicate.id));
    }

    console.log('✅ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Uncomment the line below to run the cleanup
// cleanupDuplicateConversations();
