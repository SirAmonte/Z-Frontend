<template>
   <IonModal :is-open="isOpen" @willDismiss="closeModal">
      <IonHeader>
         <IonToolbar>
            <div class="contact-modal-header">
               <IonTitle>Start a Conversation</IonTitle>
               <ion-button @click="closeModal" class="contact-modal-close-button" color="medium">
                  <ion-icon :icon="closeOutline" />
               </ion-button>
            </div>
         </IonToolbar>
      </IonHeader>
      <IonContent>
         <IonSearchbar @ionInput="handleInput"></IonSearchbar>
         <IonList>
            <IonItem v-for="user in searchResults" :key="user.id">
               <IonAvatar slot="start">
                  <img :src="user.profilephoto || defaultProfilePicture" :alt="user.username" />
               </IonAvatar>
               <IonLabel>{{ user.username }}</IonLabel>
               <IonButton slot="end" @click="startConversation(user)">
                  <ion-icon :icon="addCircleOutline" />
               </IonButton>
            </IonItem>
         </IonList>
      </IonContent>
   </IonModal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonList, IonItem, IonAvatar, IonLabel, IonButton, IonIcon } from '@ionic/vue';
import { addCircleOutline, closeOutline } from 'ionicons/icons';
import { fetchAccounts } from '../../../api/accounts/getAccounts.js';
import { alertController, modalController } from '@ionic/vue';
import { createConversation } from '../../../firebase.js';
import axios from 'axios';

defineProps({
   isOpen: Boolean
});
const emit = defineEmits(['close', 'refresh']);

const searchResults = ref([]);
const usersList = ref([]);
const loggedInUserId = localStorage.getItem('account_id');
const defaultProfilePicture = 'default_profile_picture.svg';

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

fetchAccounts().then((accounts) => {
   usersList.value = accounts.map((user) => ({
      ...user,
      profilephoto: user.profilephoto || 'default-avatar.png',
   }));
   searchResults.value = accounts;
});

const handleInput = (event) => {
   const query = event.target.value.toLowerCase();
   searchResults.value = usersList.value.filter((user) =>
      user.username.toLowerCase().includes(query) && user.id !== parseInt(loggedInUserId)
   );
};

const startConversation = async (user) => {
   try {
      const response = await axios.post('https://teomanliman.be/zapi/api2/conversation.php', {
         user_id_1: localStorage.getItem('account_id'),
         user_id_2: user.account_id,
      });

      const conversationId = response.data?.data?.conversation_id;
      if (!conversationId) {
         console.error("Error: conversationId is undefined. Response:", response.data);
         return;
      }

      const conversationData = {
         user_id_1: localStorage.getItem('account_id'),
         user_id_2: user.account_id,
         messages: [],
      };

      await createConversation(conversationId.toString(), conversationData);

      const alert = await alertController.create({
         header: 'Conversation created',
         message: 'The conversation was successfully created.',
         buttons: [
            {
               text: 'OK',
               handler: () => {
                  modalController.dismiss();
                  emit('refresh');
               },
            },
         ],
      });
      await alert.present();

   } catch (error) {
      if (error.response && error.response.status === 404) {
         const alert = await alertController.create({
            header: 'Conversation already exists',
            message: 'You are already in a conversation with this user.',
            buttons: [{ text: 'OK' }],
         });
         await alert.present();
      }
   }
};
const closeModal = () => {
   emit('close');
};
</script>

<style>
.contact-modal-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.contact-modal-close-button {
   padding: 0px 20px;
}
</style>
