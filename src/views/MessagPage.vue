<template>
   <ion-page>
      <!-- Desktop -->
      <ion-split-pane v-if="!isMobile" content-id="main-content" when="md">
         <!-- Conversations Sidebar -->
         <ion-menu content-id="main-content">
            <ion-header>
               <ion-toolbar class="conversation-list-header">
                  <div class="conversation-header">
                     <IonSearchbar @ionInput="handleInput" placeholder="Search conversations"></IonSearchbar>
                     <ion-button @click="openCreateModal" color="medium">
                        <ion-icon :icon="addCircleOutline" />
                     </ion-button>
                  </div>
               </ion-toolbar>
            </ion-header>
            <ion-content>
               <ion-list>
                  <ion-item
                     v-for="conversation in searchResults"
                     :key="conversation.id"
                     @click="openConversation(conversation)">
                     <ion-avatar slot="start">
                        <img :src="conversation.participantImage || defaultProfilePicture" :alt="conversation.participantName" />
                     </ion-avatar>
                     <ion-label>
                        <h2>{{ conversation.participantName }}</h2>
                     </ion-label>
                     <ion-button color="danger" slot="end" @click.stop="showDeleteAlert(conversation.id)">
                        <ion-icon :icon="trashOutline" />
                     </ion-button>
                  </ion-item>
               </ion-list>
            </ion-content>
         </ion-menu>

         <!--Chat -->
         <div id="main-content">
            <ion-header>
               <ion-toolbar>
                  <div class="chat-header-desktop chat-header">
                     <img :src="participantImage || defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
                     <ion-title>{{ selectedParticipantName || 'Chat' }}</ion-title>
                  </div>
               </ion-toolbar>
            </ion-header>
            <ion-content ref="chatContent" class="chat-messages">
               <ion-list lines="none" v-if="userId !== null" class="chat-messages-list">
                  <ion-item
                     class="chat-message-item"
                     v-for="message in messages"
                     :key="message.id">
                     <ion-label
                        class="chat-message-label"
                        :class="sentOrReceived(message.senderId)">
                        <p class="message-text">{{ message.message }}</p>
                     </ion-label>
                  </ion-item>
               </ion-list>
            </ion-content>
            <ion-footer class="chat-input">
               <ion-item lines="full">
                  <ion-input v-model="newMessage" placeholder="Type a message..." />
                  <ion-button color="medium" @click="sendMessageAndScroll(activeConversationId, userId, newMessage)">
                     <ion-icon :icon="sendOutline" />
                  </ion-button>
               </ion-item>
            </ion-footer>
         </div>
      </ion-split-pane>

      <!-- Mobile -->
      <div v-else style="height: 100%; display: flex; flex-direction: column;">
         <!--Conversations List -->
         <div v-if="!activeConversationId" style="flex: 1; overflow-y: auto;">
            <ion-header>
               <ion-toolbar class="conversation-list-header">
                  <div class="conversation-header">
                     <IonSearchbar @ionInput="handleInput" placeholder="Search conversations"></IonSearchbar>
                     <ion-button @click="openCreateModal" color="medium">
                        <ion-icon :icon="addCircleOutline" />
                     </ion-button>
                  </div>
               </ion-toolbar>
            </ion-header>
            <ion-content>
               <ion-list class="conversation-list">
                  <ion-item
                     v-for="conversation in searchResults"
                     :key="conversation.id"
                     @click="openConversation(conversation)">
                     <ion-avatar slot="start">
                        <img :src="conversation.participantImage || defaultProfilePicture" :alt="conversation.participantName" />
                     </ion-avatar>
                     <ion-label>
                        <h2>{{ conversation.participantName }}</h2>
                     </ion-label>
                     <ion-button color="danger" slot="end" @click.stop="showDeleteAlert(conversation.id)">
                        <ion-icon :icon="trashOutline" />
                     </ion-button>
                  </ion-item>
               </ion-list>
            </ion-content>
         </div>

         <!-- Chat -->
         <div v-else style="flex: 1; display: flex; flex-direction: column;">
            <ion-header class="chat-header">
               <ion-button @click="closeConversation" color="medium">
                  <ion-icon :icon="arrowBackOutline" />
               </ion-button>
               <div class="chat-header">
                  <img :src="participantImage || defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
                  <ion-title>{{ selectedParticipantName || 'Chat' }}</ion-title>
               </div>
            </ion-header>
            <ion-content ref="chatContent" class="chat-messages">
               <ion-list lines="none" v-if="userId !== null" class="chat-messages-list">
                  <ion-item
                     class="chat-message-item"
                     v-for="message in messages"
                     :key="message.id">
                     <ion-label
                        class="chat-message-label"
                        :class="sentOrReceived(message.senderId)">
                        <p class="message-text">{{ message.message }}</p>
                     </ion-label>
                  </ion-item>
               </ion-list>
            </ion-content>
            <ion-footer class="chat-input">
               <ion-item lines="full">
                  <ion-input v-model="newMessage" placeholder="Type a message..." />
                  <ion-button color="medium" @click="sendMessageAndScroll(activeConversationId, userId, newMessage)">
                     <ion-icon :icon="sendOutline" />
                  </ion-button>
               </ion-item>
            </ion-footer>
         </div>
      </div>

      <!-- Modals -->
      <ContactModalAdd
         :isOpen="isCreateModalOpen"
         :userId="userId"
         @close="closeCreateModal"
         @refresh="refreshConversations" />

      <!-- Alert -->
      <ion-alert
         :is-open="showAlert"
         header="Confirm Delete"
         message="Are you sure you want to delete this conversation?"
         :buttons="[{
            text: 'Cancel',
            role: 'cancel',
            handler: () => (showAlert.value = false),
         }, {
            text: 'Yes',
            handler: confirmDelete,
         }]" />
   </ion-page>
</template>

<script setup lang="js">
import { ref, onMounted, nextTick } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSplitPane, IonMenu, IonList, IonItem, IonAvatar, IonLabel, IonButton, IonInput, IonAlert, IonFooter, IonIcon, IonSearchbar } from '@ionic/vue';
import { sendOutline, trashOutline, addCircleOutline, arrowBackOutline } from 'ionicons/icons';
import axios from 'axios';
import ContactModalAdd from './components/Messages/ContactModalAdd.vue';

import { fetchConversations } from '../components/chat/conversations/fetchConversations.js';
import { deleteConversation } from '../components/chat/conversations/deleteConversation.js';
import { fetchMessages } from '../components/chat/messages/fetchMessages.js';
import { sendMessage } from '../components/chat/messages/sendMessage.js';

const isCreateModalOpen = ref(false);
const defaultProfilePicture = 'default_profile_picture.svg';

const userId = ref(Number(localStorage.getItem('account_id')) || null);
const conversations = ref([]);
const selectedParticipantName = ref('');
const participantImage = ref('');
const conversationToDelete = ref(null);
const activeConversationId = ref(null);

const chatContent = ref(null);
const messages = ref([]);
const newMessage = ref('');

const showAlert = ref(false);
const searchResults = ref([]);

const isMobile = ref(window.innerWidth < 1024);
window.addEventListener('resize', () => {
   isMobile.value = window.innerWidth < 1024;
});

const handleInput = (event) => {
   const query = event.target.value.toLowerCase().trim();

   if (!query) {
      searchResults.value = conversations.value;
   } else {
      searchResults.value = conversations.value.filter((conversation) =>
         conversation.participantName.toLowerCase().includes(query)
      );
   }
};

const openCreateModal = () => {
   isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
   isCreateModalOpen.value = false;
   refreshConversations();
};

const openConversation = async (conversation) => {
   messages.value = [];
   activeConversationId.value = conversation.id;
   newMessage.value = '';

   const participantId = conversation.user_id_1 === userId.value ? conversation.user_id_2 : conversation.user_id_1;
   const response = await axios.get(`https://teomanliman.be/zapi/api2/accounts.php`);
   const accounts = response.data.data;
   const participantAccount = accounts.find((account) => account.account_id === participantId);

   if (participantAccount) {
      selectedParticipantName.value = participantAccount.username;
      participantImage.value = participantAccount.profilephoto;
   }

   await fetchMessages(conversation.id, messages);
   nextTick(() => {
      setTimeout(() => {
         scrollToBottom();
      }, 250);
   });
};

const closeConversation = () => {
   activeConversationId.value = null;
};

const showDeleteAlert = (conversationId) => {
   if (!conversationId) return;

   conversationToDelete.value = conversationId;
   showAlert.value = false;

   nextTick(() => {
      showAlert.value = true;
   });
};

const confirmDelete = async () => {
   if (!conversationToDelete.value) return;

   await deleteConversation(
      conversationToDelete.value,
      conversations.value,
      (updatedConversations) => (conversations.value = updatedConversations)
   );

   searchResults.value = conversations.value;
   conversationToDelete.value = null;
   showAlert.value = false;
   closeConversation();
};

const refreshConversations = async () => {
   const fetchedConversations = await fetchConversations(userId.value);
   conversations.value = fetchedConversations;
   searchResults.value = fetchedConversations;
};

const sentOrReceived = (senderId) => {
   const currentUserId = Number(localStorage.getItem('account_id'));
   newMessage.value = '';
   return senderId === currentUserId ? 'sent' : 'received';
};

const scrollToBottom = () => {
   nextTick(() => {
      const chatMessages = chatContent.value.$el.querySelectorAll('.chat-message-item');
      if (chatMessages.length > 0) {
         chatMessages[chatMessages.length - 1].scrollIntoView({ behavior: 'smooth' });
      }
   });
};

const sendMessageAndScroll = async (conversationId, userId, message) => {
   await sendMessage(conversationId, userId, message);
   newMessage.value = '';
   nextTick(() => scrollToBottom());
};

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

onMounted(async () => {
   const userIdFromStorage = localStorage.getItem('account_id');
   if (userIdFromStorage) {
      userId.value = Number(userIdFromStorage);
      const fetchedConversations = await fetchConversations(userId.value);
      conversations.value = fetchedConversations;
      searchResults.value = conversations.value;
   }
});
</script>

<style>
@media screen and (max-width: 1024px) {
   .chat-messages-list {
      padding-bottom: 65px;
   }

   .conversation-list {
      padding-bottom: 65px;
   }

   .chat-header {
      padding: 3px 5px 5px 10px;
   }

   .list-md {
      padding-bottom: 54px;
   }
}

:host {
   display: block;
   height: 100%;
}

::-webkit-scrollbar {
   width: 0px;
}

body {
   overflow: hidden;
}

.list-md {
   padding-top: 0px;
}

.conversation-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0px 10px 0px 0px;
}

.conversation-list-header {
   padding-left: 10px;
}

.profile-picture {
   width: 40px;
   height: 40px;
   border-radius: 50%;
}

.chat-header {
   display: flex;
   align-items: center;
   justify-content: left;
}

.chat-header-desktop {
   padding: 0px 20px;
}

.chat-header-mobile {
   display: flex;
}

.chat-message-item {
   display: flex;
   flex-shrink: 0;
}

.chat-message-list {
   padding: 0px;
}

.chat-message-label {
   max-width: 50%;
   padding: 10px 15px;
   border-radius: 12px;
   font-size: 14px;
   line-height: 1.5;
   word-break: break-word;
}

.chat-message-label.sent {
   background-color: #0967ca;
   text-align: right;
   margin-left: auto;
   border-radius: 13px 13px 3px 13px;
}

.chat-message-label.received {
   background-color: #eb2d3a;
   text-align: left;
   margin-right: auto;
   border-radius: 13px 13px 13px 3px;
}

.chat-messages {
   height: calc(100% - 125px);
   overflow-y: auto;
   padding: 10px;
   display: flex;
   flex-direction: column;
   gap: 10px;
   background-color: #f5f5f5;
}

.message-text {
   color: #fff !important;
}

.chat-input {
   position: fixed;
   bottom: 0;
   width: 100%;
   z-index: 1000;
   border-top: 1px solid #f7f7f7;
}
</style>

<!-- 
    To Do

- Notifications for new messages

- Emojis for desktop
-->