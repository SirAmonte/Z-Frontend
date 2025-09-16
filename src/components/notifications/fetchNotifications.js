import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const notifications = ref([])
export const totalNotifications = (acc_id) => {
   const getNotifications = async () => {
      try {
         const response = await axios.get('https://teomanliman.be/zapi/api2/notifications/', {
            params: { account_id: acc_id }
         });
         notifications.value = response.data.data;
      } catch (error) {
         console.log(error)
      }
   }

   const unreadNotifications = computed(() => {
      return notifications.value.filter(nt => nt.is_read === 0).length;
   });

   const updateNotifications = async (notification_id) => {
      await axios
         .put('https://teomanliman.be/zapi/api2/notifications/', {
            is_read: 1,
            notification_id: notification_id,
            account_id: acc_id
         });
      await getNotifications();
   }

   const addNotification = async (following_id, notificationtype, notificationdata) => {
      await axios
         .post('https://teomanliman.be/zapi/api2/notifications/', {
            account_id: following_id,
            type: notificationtype,
            context: notificationdata
         })
      await getNotifications();
   }

   onMounted(getNotifications);


   return {
      notifications,
      getNotifications,
      updateNotifications,
      addNotification,
      unreadNotifications
   }
}