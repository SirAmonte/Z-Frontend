import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { presentToast } from '../toasts/toasts';

const likeFromPost = ref([]);
const likes = ref([]);
const accountId = localStorage.getItem('account_id');


export const totalLikes = () => {
   const likedPosts = ref([]);
   const getLikes = () => {
      axios
         .get('https://teomanliman.be/zapi/api2/likes/')
         .then(response => {
            if (response.status !== 200) {
               presentToast('Fout bij het ophalen van likes.');
               console.log(response.status);
            }
            if (!response.data.data) {
               presentToast('Geen data beschikbaar.');
               return;
            }
            console.log(response.data);
            likes.value = [];
            for (let i = 0, end = response.data.data.length; i < end; i++) {
               likes.value.push(response.data.data[i]);
            }
            console.log("Likes :");
            console.log(likes.value);
         });
   }


   const getLikesFromPost = async (like_id) => {
      try {
         const response = await axios.get('https://teomanliman.be/zapi/api2/likes/', {
            params: { like_id: like_id }
         });
         likeFromPost.value = response.data.data;
         return response.data.data;
      } catch (error) {
         console.log(error);
      }
   }

   const getLikedPostsId = async (acc_id) => {
      likedPosts.value = [];
      try {
         const likes = await axios.get('https://teomanliman.be/zapi/api2/likes/');
         if (likes.status === 200) {
            // console.log(likes.data.data)
            const likedPostId = likes.data.data.filter(l => l.account_id == acc_id).map(l => l.post_id);
            // console.log(likedPostId)

            const getPost = likedPostId.map(postId => axios.get('https://teomanliman.be/zapi/api2/posts/', {
               params: { post_id: postId }
            }));
            // console.log("ok");
            const postResponse = await Promise.all(getPost);
            for (let i = 0; i < postResponse.length; i++) {
               likedPosts.value.push(postResponse[i].data.data);
               console.log(postResponse[i].data.data)
            }
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
            likedPosts.value = likedPosts.value.flat().reverse();
            console.log(likedPosts)
         }
      } catch (error) {
         console.log(error);
      }
   }
   const hasLikedPost = (id) => {
      // console.log("Id", id);
      // console.log(likes.value.some(like => parseInt(like.post_id) === parseInt(id) && parseInt(like.account_id) === parseInt(accountId)));
      return likes.value.some(like => parseInt(like.post_id) === parseInt(id) && parseInt(like.account_id) === parseInt(accountId));
   }

   const hasLikedReply = (id) => {
      return likes.value.some(like => parseInt(like.reply_id) === parseInt(id) && parseInt(like.account_id) === parseInt(accountId));
   }

   onMounted(getLikesFromPost, getLikes, getLikedPostsId);
   return {
      likeFromPost,
      likedPosts,
      likes,
      getLikes,
      getLikesFromPost,
      hasLikedPost,
      getLikedPostsId,
      hasLikedReply
   }
}
