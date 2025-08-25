// Run this in browser console to clean up duplicate welcome messages

const cleanDuplicateMessages = async () => {
  console.log('🧹 Cleaning duplicate welcome messages...');

  try {
    const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./lib/firebase');

    // Get all messages
    const messagesRef = collection(db, 'messages');
    const snapshot = await getDocs(messagesRef);

    // Group messages by conversation, sender, and exact content
    const messageGroups = new Map();

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Create a more specific key to identify exact duplicates
      const key = `${data.conversationId}_${data.senderId}_${data.content.trim()}`;

      if (!messageGroups.has(key)) {
        messageGroups.set(key, []);
      }

      messageGroups.get(key).push({
        id: docSnapshot.id,
        data: data,
        timestamp: data.timestamp,
      });
    });

    let deletedCount = 0;

    // Find and delete exact duplicates (keep the earliest one)
    for (const [key, messages] of messageGroups) {
      if (messages.length > 1) {
        console.log(
          `Found ${messages.length} exact duplicate messages for: ${key
            .split('_')
            .slice(2)
            .join('_')}`
        );

        // Sort by timestamp (keep earliest) or by document creation if no timestamp
        messages.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return a.timestamp.seconds - b.timestamp.seconds;
          }
          // If no timestamp, sort by document ID as fallback
          return a.id.localeCompare(b.id);
        });

        // Delete all but the first (earliest) message
        for (let i = 1; i < messages.length; i++) {
          await deleteDoc(doc(db, 'messages', messages[i].id));
          console.log(`Deleted duplicate message: ${messages[i].id}`);
          deletedCount++;
        }
      }
    }

    console.log(`✅ Cleanup completed! Deleted ${deletedCount} duplicate messages.`);

    if (deletedCount > 0) {
      console.log('🔄 Refreshing page...');
      window.location.reload();
    } else {
      console.log('No duplicates found. Page will not refresh.');
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Run the cleanup
cleanDuplicateMessages();
