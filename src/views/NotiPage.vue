<template>
   <ion-page>
      <ion-content :fullscreen="true">
         <ion-segment v-model="selectedSegment">
            <ion-segment-button value="unread">
               <ion-label>Unread</ion-label>
            </ion-segment-button>
            <ion-segment-button value="read">
               <ion-label>Read</ion-label>
            </ion-segment-button>
         </ion-segment>
         <ion-grid :fixed="true">
            <ion-row>
               <ion-col></ion-col>
               <ion-col size="8">
                  <ion-button v-if="selectedSegment === 'read' && hasReadNotifications()" color="danger" @click="presentActionSheet()">
                     Delete All
                  </ion-button>
               </ion-col>
            </ion-row>
            <div v-if="notifications.length > 0">
               <ion-row v-for="notification in filteredNotifications()" :key="notification.notification_id">
                  <ion-col>
                     <ion-item>
                        <div class="notifications">
                           <p>{{ notification.context }}</p>
                           <p>{{ formatDate(notification.created_at) }}</p>
                        </div>
                     </ion-item>
                  </ion-col>
               </ion-row>
            </div>
            <div v-else class="no-results">
               <ion-icon :icon="mail" class="no-results-icon"></ion-icon>
               <p class="no-results-text">No {{ selectedSegment }} notifications yet</p>
               <!-- <ion-button expand="outline" class="to-homepage" @click="toHomePage()">
                  <p>go post your first post</p>
               </ion-button> -->
            </div>
         </ion-grid>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { IonPage, IonContent, IonSegment, IonList, IonSelect, IonSegmentButton, IonButton, IonSegmentContent, IonSegmentView, IonLabel, IonItem, IonGrid, IonRow, toastController, IonCol, actionSheetController } from '@ionic/vue';
import axios from 'axios';
import { onBeforeRouteLeave } from 'vue-router';
import { ref } from 'vue';
import { logoDeviantart, mail } from 'ionicons/icons';
import { totalNotifications } from '../components/notifications/fetchNotifications';
import { presentToast } from '@/components/toasts/toasts';

const acc_id = localStorage.getItem('account_id')

const { notifications, getNotifications, updateNotifications, unreadNotifications } = totalNotifications(acc_id);

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

// const notifications = ref([])
const selectedSegment = ref('unread');

const presentActionSheet = async () => {
   const actionSheet = await actionSheetController.create({
      header: 'Bent u zeker?',
      buttons: [
         {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
               deleteAllNotifcations()
            },
         },
         {
            text: 'Cancel',
            role: 'cancel',
            data: {
               action: 'cancel',
            },
         },
      ],
   });
   await actionSheet.present();
};

// https://stackoverflow.com/questions/67888087/vue-router-composition-api-onbeforerouteleave-invalid-navigation-guard
onBeforeRouteLeave((to, from) => {
   if (from.path === '/notification') {
      console.log('left notification page');
      unread.forEach(nt => updateNotifications(nt.notification_id));
   }
})

// https://stackoverflow.com/questions/10632346/how-to-format-a-date-in-mm-dd-yyyy-hhmmss-format-in-javascript
const formatDate = (dateString) => {
   const date = new Date(dateString);
   const day = date.getDate().toString().padStart(2, '0');
   console.log(day);
   const month = (date.getMonth() + 1).toString().padStart(2, '0');
   console.log(dateString)
   console.log(month);
   const hours = date.getHours().toString().padStart(2, '0');
   const minutes = date.getMinutes().toString().padStart(2, '0');
   return `${day}/${month} ${hours}:${minutes}`
}

const hasReadNotifications = () => {
   return notifications.value.some(nt => nt.is_read === 1)
}

let unread = []
const filteredNotifications = () => {
   console.log(selectedSegment.value);
   if (selectedSegment.value === 'unread') {
      unread = notifications.value.filter(nt => nt.is_read === 0);
      console.log(unread);
      return notifications.value.filter(nt => nt.is_read === 0).reverse();
   } else {
      return notifications.value.filter(nt => nt.is_read === 1).reverse();
   }
}

const deleteAllNotifcations = () => {
   axios
      .delete('https://teomanliman.be/zapi/api2/notifications/', {
         data: { account_id: acc_id }
      })
      .then(response => {
         if (response.status === 200) {
            console.log(response.status);
            presentToast('Notificaties succesvol verwijdert');
            getNotifications();
         }
      })
      .catch(error => {
         console.log('Error', error);
      })
}
getNotifications();

</script>

<style scoped>
.notifications {
   display: flex;
   align-items: center;
   justify-content: space-between;
   width: 100%;
}

.no-results {
   margin-top: 40px;
   text-align: center;
   padding: 20px;
   color: var(--no-results-text-color);
}

.no-results-icon {
   font-size: 2rem;
   margin-bottom: 10px;
   color: var(--no-results-icon-color);
}

.no-results-text {
   font-size: 1.2rem;
   color: #666;
}
</style>
