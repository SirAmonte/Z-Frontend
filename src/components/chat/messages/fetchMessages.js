import { ref, onChildAdded, onChildChanged } from 'firebase/database';
import database from '../../../firebase.js';

export const fetchMessages = async (conversationId, messages) => {
    try {
        const messagesRef = ref(database, `conversations/${conversationId}/messages`);

        onChildAdded(messagesRef, (snapshot) => {
            const message = snapshot.val();
            if (message && !messages.value.find((msg) => msg.timestamp === message.timestamp && msg.senderId === message.senderId)) {
                messages.value.push({
                    senderId: Number(message.senderId),
                    message: message.message,
                    timestamp: message.timestamp,
                });
            }
        });

        onChildChanged(messagesRef, (snapshot) => {
            const message = snapshot.val();
            if (message) {
                const index = messages.value.findIndex((msg) => msg.timestamp === message.timestamp);
                if (index !== -1) messages.value[index] = {
                    senderId: Number(message.senderId),
                    message: message.message,
                    timestamp: message.timestamp,
                };
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};