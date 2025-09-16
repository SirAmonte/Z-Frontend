import { ref, remove } from 'firebase/database';
import database from '../../../firebase.js';
import axios from 'axios';

export const deleteConversation = async (conversationId, conversations, setConversations) => {
    if (!conversationId || !Array.isArray(conversations)) {
        throw new Error('Invalid conversation ID or conversations array');
    }

    const conversationRef = ref(database, `conversations/${conversationId}`);
    await remove(conversationRef);

    const response = await axios.delete('https://teomanliman.be/zapi/api2/conversation.php', {
        data: { conversation_id: conversationId },
    });

    if (response.status !== 200) {
        throw new Error(`Failed to delete conversation from API. Status: ${response.status}`);
    }
    const updatedConversations = conversations.filter(
        (conversation) => conversation.id !== conversationId
    );
    setConversations(updatedConversations);
};
