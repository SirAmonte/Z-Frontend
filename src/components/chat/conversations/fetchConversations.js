import axios from 'axios';
export const fetchConversations = async (userId) => {
    try {
        const conversationsResponse = await axios.get(
            `https://teomanliman.be/zapi/api2/conversation.php?user_id=${userId}`
        );
        return await Promise.all(
            conversationsResponse.data.data.map(async (conversation) => {
                const otherUser = conversation.user_id_1 === userId ? conversation.user_id_2 : conversation.user_id_1;

                const response = await axios.get(`https://teomanliman.be/zapi/api2/accounts.php?user_id=${otherUser}`);
                const participantAccount = response.data.data.find((account) => account.account_id === otherUser);

                const participantName = participantAccount ? participantAccount.username : 'Unknown Participant';
                const participantImage = participantAccount ? participantAccount.profilephoto : 'default-avatar.png';

                return {
                    ...conversation,
                    otherUser: otherUser,
                    participantName: participantName,
                    participantImage: participantImage,
                };
            })
        );
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};