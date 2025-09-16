<template>
   <ion-card class="post-card">
      <ion-grid>
         <ion-row>
            <ion-col size="auto">
               <ion-label>
                  <h2>{{ post.username }}</h2>
               </ion-label>
            </ion-col>
            <ion-col size="auto">
               <ion-label>
                  <p>{{ formatDate(post.created_at) }}</p>
               </ion-label>
            </ion-col>
            <ion-col size="auto" class="align-right">
               <ion-button fill="clear" @click="presentActionPostSheet(post)">
                  <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
               </ion-button>
            </ion-col>
         </ion-row>
      </ion-grid>
      <ion-card-content>
         <ion-row>
            {{ post.content }}
         </ion-row>
         <ion-row>
            <img loading="lazy" :src="post.post_image" style="max-width: 100%; max-height: 200px; border-radius: 6%;" />
         </ion-row>
         <ion-row class="actionbtns">
            <ion-button @click="toggleLike('post', post.post_id)" fill="clear">
               <ion-icon size="4" :icon="heart"></ion-icon>
            </ion-button>
            <ion-label>{{ post.like_count || 0 }}</ion-label>
            <ion-button @click="activateReply('post', post.post_id)" fill="clear">
               <ion-icon size="4" :icon="chatbox"></ion-icon>
            </ion-button>
            <ion-label>{{ post.reply_count || 0 }}</ion-label>
         </ion-row>
         <div v-if="replyingTo.type === 'post' && replyingTo.id === post.post_id">
            <ion-textarea v-model="replyContent" :counter="true" maxlength="200" :auto-grow="true" placeholder="Type a reply..."></ion-textarea>
            <ion-button @click="addReply(post.post_id, post.reply_id)">Post Reply</ion-button>
         </div>
         <ion-card v-if="showReply[post.post_id]" v-for="{ reply_id, content, created_at, username, like_count, account_id, reply_count, parent_reply_id, profilephoto } in  replies.filter(reply => reply.post_id === post.post_id).reverse() " :key="reply_id" class="reply-card">
            <ion-grid>
               <ion-card-header>
                  <ion-row>
                     <ion-col size="auto">
                        <ion-avatar size="small">
                           <img :src="profilephoto" alt="Profile Photo" />
                        </ion-avatar>
                     </ion-col>
                     <ion-col>
                        <ion-label>
                           <h2>{{ username }}</h2>
                        </ion-label>
                     </ion-col>
                     <ion-col size="auto" class="align-right">
                        <ion-label>
                           <p>{{ formatDate(created_at) }}</p>
                        </ion-label>
                     </ion-col>
                     <ion-col size="auto" class="align-right" v-if="accountId == account_id">
                        <ion-button fill="clear" :id="`reply-popover-button-${reply_id}`">
                           <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                        </ion-button>
                        <ion-popover :trigger="`reply-popover-button-${reply_id}`" :dismiss-on-select="true">
                           <ion-content>
                              <ion-list>
                                 <ion-item :button="true" :detail="false">Update</ion-item>
                                 <ion-item :button="true" :detail="false" @click="verwijderReply(post_id, reply_id, parent_reply_id)">Delete</ion-item>
                              </ion-list>
                           </ion-content>
                        </ion-popover>
                     </ion-col>
                  </ion-row>
               </ion-card-header>
            </ion-grid>
            <ion-row style="margin-left: 16px;">
               {{ content }}
            </ion-row>
            <ion-row class="actionbtns">
               <ion-button @click="toggleLike('reply', reply_id)" fill="clear">
                  <ion-icon size="4" :icon="heart"></ion-icon>
               </ion-button>
               <ion-label>{{ like_count || 0 }}</ion-label>
               <ion-button @click="activateReply('reply', reply_id)" fill="clear">
                  <ion-icon size="4" :icon="chatbox"></ion-icon>
               </ion-button>
               <ion-label>{{ reply_count || 0 }}</ion-label>
            </ion-row>
            <div v-if="replyingTo.type === 'reply' && replyingTo.id === reply_id">
               <ion-textarea v - model=" replyContent" :counter="true" maxlength="200" :auto-grow="true" placeholder="Type a reply..."></ion-textarea>
               <ion-button @click="addReply(post_id, reply_id)">Post Reply</ion-button>
            </div>
         </ion-card>
      </ion-card-content>
   </ion-card>
</template>

<script lang="js">

import { IonPage, IonHeader, IonButton, IonFooter, IonSegmentView, IonTextarea, onIonViewWillEnter, IonSearchbar, IonGrid, IonList, IonRow, IonCol, IonPopover, IonCardHeader, IonSegmentContent, IonSegment, IonSegmentButton, IonButtons, IonMenu, IonMenuButton, IonInput, IonToolbar, IonModal, IonTitle, toastController, IonCardSubtitle, IonContent, IonCard, IonCardContent, IonIcon, IonItem, IonAvatar, IonLabel, actionSheetController, alertController } from '@ionic/vue';
import { totalLikes } from '@/components/likes/fetchLikes';
import { totalReplies } from '@/components/replies/fetchReplies';

const { activateReply, replyingTo, showReply }

const acc_id = localStorage.getItem('account_id');

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

const presentActionPostSheet = async (post) => {
   const actionSheet = await actionSheetController.create({
      header: 'Acties',
      buttons: [
         {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
               const alertButtons = await alertController.create({
                  header: 'Confirm Delete',
                  messsage: 'Are you sure you want to delete this',
                  buttons: [
                     {
                        text: 'Cancel',
                        role: 'Cancel',
                        handler: () => {
                           console.log('Delete cancelled');
                        }
                     },
                     {
                        text: 'Delete',
                        handler: () => {
                           deleteApiPost(acc_id, post.post_id)
                        }
                     }
                  ]
               });
               await alertButtons.present();
            },
         },
         {
            text: 'Edit',
            role: 'selected',
            handler: () => {
               console.log('Selected');
            }
         }
      ]
   })
   await actionSheet.present();
}


</script>

<style scoped></style>
