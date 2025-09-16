import axios from 'axios';
import { ref } from 'vue';

export const fetchAccounts = async () => {
   try {
      const response = await axios.get('https://teomanliman.be/zapi/api2/accounts/');
      return response.data.data;
   } catch (error) {
      console.log(error);
      return null;
   }
};

export const fetchAccount = async (acc_id) => {
   try {
      const response = await axios
         .get('https://teomanliman.be/zapi/api2/accounts/', {
            params: {
               account_id: acc_id
            }
         });
      return response.data.data;
   } catch (error) {
      console.log(error);
      return null;
   }
}

export const totalAccount = () => {
   const gebruikersnaam = ref('');
   const bio = ref('');
   const profilephoto = ref('');
   const joinedOn = ref('');
   const email = ref('');
   const getInformationAccount = async (acc_id) => {
      try {
         const response = await axios
            .get('https://teomanliman.be/zapi/api2/accounts/', {
               params: {
                  account_id: acc_id
               }
            });
         if (response.status === 200) {
            gebruikersnaam.value = response.data.data[0].username;
            profilephoto.value = response.data.data[0].profilephoto;
            email.value = response.data.data[0].email;
            bio.value = response.data.data[0].bio ? response.data.data[0].bio : "nog geen bio";
            joinedOn.value = response.data.data[0].created_at.substring(0, 10);
         }
         return response.data.data;
      } catch (error) {
         console.log(error);
         return null;
      }
   }
   return {
      gebruikersnaam,
      bio,
      profilephoto,
      joinedOn,
      email,
      getInformationAccount
   }
}