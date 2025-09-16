import { ref, reactive } from 'vue';
import axios from 'axios';
import { presentToast } from '../toasts/toasts';
const replies = ref([]);
const replyingTo = ref({ type: null, id: null });
const showReply = reactive({});
const acc_id = localStorage.getItem('account_id');
export const totalReplies = () => {
   const getReplies = () => {
      axios
         .get('https://teomanliman.be/zapi/api2/replies/')
         .then(response => {
            if (response.status !== 200) {
               presentToast('Fout bij het ophalen van replies.');
               console.log(response.status);
            }
            if (!response.data.data) {
               presentToast('Geen data beschikbaar.');
               return;
            }
            console.log(response.data);
            replies.value = [];
            for (let i = 0, end = response.data.data.length; i < end; i++) {
               const reply = response.data.data[i];
               replies.value.push(reply);
            }
            console.log("Replies :");
            console.log(replies.value);
         });
   }

   const activateReply = (type, id) => {
      if (replyingTo.value.type === type && replyingTo.value.id === id) {
         replyingTo.value = { type: null, id: null };
      } else {
         replyingTo.value = { type, id };
      }
      console.log(replyingTo.value)
      console.log(replies.value);
      if (showReply[id]) {
         showReply[id] = !showReply[id];
      } else {
         showReply[id] = true;
      }
      console.log(showReply);
   };

   const deleteApiReply = (post_id, reply_id, parent_reply_id = null) => {
      axios
         .delete('https://teomanliman.be/zapi/api2/replies/', {
            data: {
               account_id: acc_id,
               post_id: post_id,
               reply_id: reply_id,
               parent_reply_id: parent_reply_id
            },
         })
         .then((response) => {
            if (response.status === 200) {
               presentToast('Reply succesvol verwijderd!');
               getPosts();
               getReplies();
            } else {
               console.error('Fout bij het verwijderen van reply');
            }
         })
         .catch(error => {
            console.error('Fout:', error);
            presentToast('Er is een fout opgetreden: ' + (error.response?.data?.message || error.message));
         });
   };


   const verwijderReply = (post_id, reply_id, parent_reply_id = null) => {
      if (!post_id && !reply_id) {
         presentToast('ID ontbreekt!');
         return;
      }
      deleteApiReply(post_id, reply_id, parent_reply_id);
   };

   return {
      replies,
      getReplies,
      replyingTo,
      showReply,
      activateReply,
      verwijderReply
   }
}

