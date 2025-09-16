import { ref } from 'vue';
import { totalFollowers } from '../api/followers/getFollowers';
import { presentToast } from '../components/toasts/toasts';

const { followers } = totalFollowers();
export const totalGlobalMethods = () => {
   const searchFollowerResults = ref([]);
   const searchFollowingResults = ref([]);
   console.log(followers);

   const handleInput = (event) => {
      const query = event.target.value.toLowerCase();
      console.log(followers.value);
      searchFollowingResults.value = followers.value.filter((user) => user.following_username.toLowerCase().includes(query));
      console.log(followers.value.filter((user) => user.following_username.toLowerCase().includes(query)));
      console.log("event target:", event.target.value);
   }

   const handleFollowerInput = (event) => {
      const query = event.target.value.toLowerCase();
      searchFollowerResults.value = followers.value.filter((user) => user.follower_username.toLowerCase().includes(query));
      console.log(followers.value.filter((user) => user.follower_username))
      console.log("event target:", event.target.value);
   }

   const formatDate = (created_at) => {
      const now = new Date();
      const postDate = new Date(created_at);
      const diffInMilli = now - postDate;

      const diffInMinutes = diffInMilli / 60000;
      const diffInHours = diffInMilli / 3600000;

      if (diffInMinutes < 60) {
         return `${Math.floor(diffInMinutes)} minute${Math.floor(diffInMinutes) > 1 ? 's' : ''} ago`;
      }
      if (diffInHours < 24) {
         return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
      }

      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return postDate.toLocaleDateString('nl-BE', options);
   };

   return {
      formatDate
   }
}
