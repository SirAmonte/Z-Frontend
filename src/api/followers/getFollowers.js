import { ref, onMounted } from 'vue';
import axios from "axios";
import { presentToast } from '../../components/toasts/toasts';
import { totalNotifications } from '../../components/notifications/fetchNotifications';
import { fetchAccount } from '../accounts/getAccounts'

const gebruikersnaam = ref('');
const acc_id = localStorage.getItem('account_id');


fetchAccount(acc_id).then(response => {
   console.log(response);
   gebruikersnaam.value = response[0].username;
});

export const totalFollowers = () => {
   const followers = ref([]);
   const following = ref([]);
   const searchFollowingResults = ref([]);
   const searchFollowerResults = ref([]);
   const { addNotification } = totalNotifications(acc_id);
   const getFollowers = async () => {
      try {
         const response = await axios.get('https://teomanliman.be/zapi/api2/followers/');
         followers.value = response.data.data;
         searchFollowingResults.value = response.data.data;
         searchFollowerResults.value = response.data.data;
         console.log(followers.value);
         return response.data.data
      } catch (error) {
         console.log(error);
      }
   }

   const getFollowing = async (acc_id) => {
      try {
         const response = await axios.get('https://teomanliman.be/zapi/api2/followers/', {
            params: {
               follower_id: acc_id,
               following_id: acc_id
            }
         });
         console.log(response.data.data);
         following.value = response.data.data;
         return response.data.data
      } catch (error) {
         console.log(error);
         return null;
      }
   }

   const addFollowers = async (following_id, following_username) => {
      try {
         const response = await axios.post('https://teomanliman.be/zapi/api2/followers/', {
            follower_id: acc_id,
            following_id: following_id
         });
         if (response.status === 200) {
            presentToast(`U volgt ${following_username}`);
            addNotification(following_id, `${gebruikersnaam.value} is begonnen je te volgen`, 'follow')
            await getFollowers();
            await getFollowing();
         } else {
            presentToast(`Mislukt, response: ${response.status}`)
         }
      } catch (error) {
         console.log('Error', error);
      }
   }

   const deleteFollower = (following_id) => {
      axios
         .delete('https://teomanliman.be/zapi/api2/followers/', {
            data: { follower_id: acc_id, following_id: following_id }
         })
         .then(response => {
            if (response.status === 200) {
               presentToast('Succesvol ontvlogt');
               getFollowers();
               getFollowing();
            } else {
               presentToast(`Mislukt, response: ${response.status}`)
            }
         })
         .catch(error => {
            console.log('Error', error);
         })
   }

   onMounted(() => {
      getFollowers();
   })
   return {
      followers,
      following,
      searchFollowerResults,
      searchFollowingResults,
      getFollowers,
      getFollowing,
      addFollowers,
      deleteFollower
   }
}
