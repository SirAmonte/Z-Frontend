import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, onChildAdded, push, update, set, remove } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCjOKm_lYo6q1LFfxGLTzzhkNioiacHAtc",
    authDomain: "zapi-b6cee.firebaseapp.com",
    databaseURL: "https://zapi-b6cee-default-rtdb.firebaseio.com",
    projectId: "zapi-b6cee",
    storageBucket: "zapi-b6cee.firebasestorage.app",
    messagingSenderId: "703390204824",
    appId: "1:703390204824:web:bcec157a871f1d409621ed"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const fetchConversations = () => {
    const conversationsRef = ref(database, "conversations");

    onValue(conversationsRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
    }, (error) => {
        console.error("Error fetching conversations:", error);
    });
};

export const fetchMessages = (conversationId) => {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        console.log(message);
    }, (error) => {
        console.error("Error fetching messages:", error);
    });
};

export const sendMessage = (conversationId, newMessage) => {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);

    push(messagesRef, newMessage).then(() => {
        console.log("Message sent successfully!");
    }).catch((error) => {
        console.error("Error sending message:", error);
    });

    const conversationRef = ref(database, `conversations/${conversationId}`);
    update(conversationRef, {
        last_message: newMessage.message,
        last_updated: newMessage.created_at,
    }).then(() => {
        console.log("Conversation updated successfully!");
    }).catch((error) => {
        console.error("Error updating conversation:", error);
    });
};

export const createConversation = async (conversationId, conversationData) => {
    const conversationsRef = ref(database, `conversations/${conversationId}`);
    await set(conversationsRef, {
        user_id_1: conversationData.user_id_1,
        user_id_2: conversationData.user_id_2,
        messages: []
    });
};

export const deleteConversationFromFirebase = async (conversationId) => {
    const conversationRef = ref(database, `conversations/${conversationId}`);
    await remove(conversationRef);
};

export default database;