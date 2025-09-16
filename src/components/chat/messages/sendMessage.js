import { ref, push } from 'firebase/database';
import database from '../../../firebase.js';

export const sendMessage = async (conversationId, userId, newMessage) => {
    if (!conversationId || !userId || !newMessage) {
        throw new Error('Missing required data to send a message.');
    }

    const payload = {
        senderId: userId,
        message: newMessage,
        timestamp: Date.now(),
    };

    try {
        const messagesRef = ref(database, `conversations/${conversationId}/messages`);
        await push(messagesRef, payload);
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};