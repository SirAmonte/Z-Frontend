import { ref } from 'vue';
import axios from "axios";
import { presentToast } from '../toasts/toasts';
import { totalReplies } from '../replies/fetchReplies';
import { totalLikes } from '../likes/fetchLikes';
const { getReplies } = totalReplies();
const { getLikes } = totalLikes();

export const totalPosts = () => {
   const posts = ref([]);
   const getPosts = async () => {
      try {
         const response = await axios.get('https://teomanliman.be/zapi/api2/posts/');

         if (response.status === 200) {
            posts.value = [];
            for (const post of response.data.data) {
               posts.value.push(post);
               console.log(post.account_id);
            }
            getReplies();
            getLikes();
         } else {
            presentToast('Fout bij het ophalen van posts');
         }
      } catch (error) {
         console.error('Error fetching posts:', error);
         presentToast('Fout bij het ophalen van posts');
      }
   };

   const deleteApiPost = (accountId, post_id) => {
      axios
         .delete('https://teomanliman.be/zapi/api2/posts/', {
            data: {
               account_id: accountId,
               post_id: post_id
            },
         })
         .then((response) => {
            if (response.status === 200) {
               console.log('post succesvol verwijderd')
               presentToast('post succesvol verwijderd');
               getPosts();
            } else {
               console.error('Fout bij het verwijderen van post');
            }
         })
         .catch(error => {
            console.error('Fout:', error);
            presentToast('Er is een fout opgetreden: ' + (error.response?.data?.message || error.message));
         });
   }
   return {
      posts,
      getPosts,
      deleteApiPost
   }
}