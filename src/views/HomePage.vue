<template>
   <ion-page>
      <!-- Content ---------------------------->
      <ion-content :fullscreen="true">
         <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
         </ion-refresher>
         <ion-modal :is-open="isPostModalOpen" ref="modal" @willDisMiss="onWillDismiss">
            <ion-header>
               <ion-toolbar>
                  <ion-buttons slot="start">
                     <ion-button @click="cancel()">Cancel</ion-button>
                  </ion-buttons>
                  <ion-title>Make a new Post</ion-title>
               </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
               <ion-textarea :counter="true" maxlength="200" :auto-grow="true" v-model="content" placeholder="What's on your mind?"></ion-textarea>
               <div class="image-upload-container">
                  <img :src="imageSrc" alt="Selected Image" />
                  <div>
                     <ion-button fill="clear" @click="triggerFileInput()" class="upload-button">
                        <ion-icon :icon="imagesSharp"></ion-icon>
                        Upload Image
                     </ion-button>
                     <input type="file" accept="image/*" @change="handleChange" ref="fileInput" style="display: none;" />
                     <ion-button @click="deselectImage" fill="clear" color="danger">
                        <ion-icon name="trash-bin"></ion-icon>
                        Remove Image
                     </ion-button>
                  </div>
               </div>
               <ion-button @click="addPost" expand="block">Add Post</ion-button>
               <ion-fab vertical="bottom" horizontal="end" slot="fixed" style="margin-bottom: 40px;">
                  <ion-fab-button expand="block" @click="handleTakePhoto()">
                     <ion-icon :icon="camera"></ion-icon>
                  </ion-fab-button>
               </ion-fab>
            </ion-content>
         </ion-modal>
         <div v-if="currentPosts.length > 0">
            <IonCard v-for="{ post_id, content, created_at, username, account_id, like_count, reply_count, profilephoto, post_image } in currentPosts " :key="post_id" class="post-card">
               <IonGrid>
                  <IonCardHeader>
                     <IonRow>
                        <IonCol size="auto">
                           <IonAvatar size="small">
                              <img loading="lazy" :src="profilephoto || defaultProfilePicture" alt="Profile Photo" />
                           </IonAvatar>
                        </IonCol>
                        <IonCol class="profile-info">
                           <h2 :class="parseInt(account_id) !== parseInt(accountId) ? 'user-name' : 'username'">{{ username }}</h2>
                           <p class="date-text">{{ formatDate(created_at) }}</p>
                        </IonCol>
                        <IonCol size="auto" class="align-right" v-if="account_id == accountId">
                           <IonButton fill="clear" :id="`popover-button-${post_id}`" class="icon-button">
                              <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                           </IonButton>
                           <IonPopover :trigger="`popover-button-${post_id}`" :dismiss-on-select="true">
                              <IonContent>
                                 <IonList>
                                    <IonItem :button="true" :detail="false" @click="openUpdateModal(post_id, content, post_image)">Update</IonItem>
                                    <IonItem :button="true" :detail="false" @click="presentActionSheet(post_id)">Delete</IonItem>
                                 </IonList>
                              </IonContent>
                           </IonPopover>
                           <IonModal :is-open="isUpdateModalOpen" @did-dismiss="closeUpdateModal">
                              <ion-header>
                                 <ion-toolbar>
                                    <ion-title>Update Post</ion-title>
                                    <ion-buttons slot="start">
                                       <ion-button @click="closeUpdateModal">Cancel</ion-button>
                                    </ion-buttons>
                                 </ion-toolbar>
                              </ion-header>
                              <IonContent class="ion-padding">
                                 <IonGrid>
                                    <IonRow>
                                       <ion-col size="12">
                                          <ion-textarea v-model="updatedContent" placeholder="Update your post..." maxlength="200" :auto-grow="true"></ion-textarea>
                                          <div class="image-upload-container">
                                             <img :src="modalImageSrc" v-if="modalImageSrc" alt="Selected image" class="uploaded-image" />
                                             <div>
                                                <ion-button fill="clear" @click="openGallery()" class="upload-button">
                                                   <ion-icon :icon="imagesSharp"></ion-icon>
                                                   Change Image
                                                </ion-button>
                                                <ion-button @click="deselectImage" fill="clear" color="danger">
                                                   <ion-icon name="trash-bin"></ion-icon>
                                                   Remove Image
                                                </ion-button>
                                             </div>
                                          </div>
                                          <ion-button expand="block" @click="updatePost" class="update-button">
                                             Update Post
                                          </ion-button>
                                       </ion-col>
                                    </IonRow>
                                 </IonGrid>
                                 <ion-fab vertical="bottom" horizontal="end" slot="fixed" style="margin-bottom: 40px;">
                                    <ion-fab-button expand="block" @click="handleTakePhotoModal()">
                                       <ion-icon :icon="camera"></ion-icon>
                                    </ion-fab-button>
                                 </ion-fab>
                              </IonContent>
                           </IonModal>
                        </IonCol>
                     </IonRow>
                  </IonCardHeader>
               </IonGrid>
               <IonCardContent>
                  <p class="content-text">{{ content }}</p>
                  <img v-if="post_image" loading="lazy" :src=post_image alt="Post Image" class="post-image" />
                  <div class="actionbtns">
                     <IonButton @click="toggleLike('post', post_id)" fill="clear" class="post-buttons">
                        <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedPost(post_id) }"></ion-icon>
                        <span style="margin-left: 4px;">{{ like_count || 0 }}</span>
                     </IonButton>
                     <IonButton @click="activateReply('post', post_id)" fill="clear" class="post-buttons">
                        <ion-icon size="4" :icon="chatbox"></ion-icon>
                        <span style="margin-left: 4px;">{{ reply_count || 0 }}</span>
                     </IonButton>
                  </div>
                  <div v-if="replyingTo.type === 'post' && replyingTo.id === post_id">
                     <ion-textarea v-model="replyContent" :counter="true" maxlength="200" :auto-grow="true" placeholder="Type a reply..."></ion-textarea>
                     <ion-button @click="addReply(post_id, reply_id)">Post Reply</ion-button>
                  </div>
                  <IonCard v-if="showReply[post_id]" v-for="{ reply_id, content, created_at, username, like_count, account_id, reply_count, parent_reply_id, profilephoto } in  replies.filter(reply => reply.post_id === post_id && !reply.parent_reply_id).reverse() " :key="reply_id" class="reply-card">
                     <IonGrid>
                        <IonCardHeader>
                           <IonRow>
                              <IonCol size="auto">
                                 <IonAvatar size="small">
                                    <img :src="profilephoto || defaultProfilePicture" alt="Profile Photo" />
                                 </IonAvatar>
                              </IonCol>
                              <IonCol>
                                 <h2 :class="parseInt(account_id) !== parseInt(accountId) ? 'user-name' : 'username'">{{ username }}</h2>
                                 <p>{{ formatDate(created_at) }}</p>
                              </IonCol>
                              <IonCol size="auto">
                                 <IonButton fill="clear" :id="`reply-popover-button-${reply_id}`" v-if="accountId == account_id">
                                    <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                                 </IonButton>
                                 <IonPopover :trigger="`reply-popover-button-${reply_id}`" :dismiss-on-select="true">
                                    <IonContent>
                                       <IonList>
                                          <IonItem :button="true" :detail="false" @click="openUpdateModal(post_id, content, post_image, reply_id)">Update</IonItem>
                                          <IonItem :button="true" :detail="false" @click="presentActionReplySheet(post_id, reply_id, parent_reply_id)">Delete</IonItem>
                                       </IonList>
                                    </IonContent>
                                 </IonPopover>
                                 <IonModal :is-open="isUpdateModalOpen" @did-dismiss="closeUpdateModal">
                                    <ion-header>
                                       <ion-toolbar>
                                          <ion-title>Update Reply</ion-title>
                                          <ion-buttons slot="start">
                                             <ion-button @click="closeUpdateModal">Cancel</ion-button>
                                          </ion-buttons>
                                       </ion-toolbar>
                                    </ion-header>
                                    <IonContent class="ion-padding">
                                       <IonGrid>
                                          <IonRow>
                                             <ion-col size="12">
                                                <ion-textarea v-model="updatedContent" placeholder="Update your reply..." maxlength="200" :auto-grow="true"></ion-textarea>
                                                <ion-button expand="block" @click="updateReply" class="update-button">
                                                   Update Reply
                                                </ion-button>
                                             </ion-col>
                                          </IonRow>
                                       </IonGrid>
                                    </IonContent>
                                 </IonModal>
                              </IonCol>
                           </IonRow>
                        </IonCardHeader>
                     </IonGrid>
                     <p class="reply-content"> {{ content }} </p>
                     <IonRow class="actionbtns">
                        <IonButton @click="toggleLike('reply', reply_id)" fill="clear">
                           <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedReply(reply_id) }"></ion-icon>
                        </IonButton>
                        <IonLabel>{{ like_count || 0 }}</IonLabel>
                     </IonRow>
                     <div v-if="showReply[reply_id]">
                        <IonCard v-for="{ reply_id, content, created_at, username, like_count, profilephoto, parent_reply_id } in replies.filter(reply => reply.parent_reply_id === reply_id)" :key="reply_id" class="reply-card">
                           <IonGrid>
                              <IonCardHeader>
                                 <IonRow>
                                    <IonCol size="auto">
                                       <IonAvatar size="small">
                                          <img :src="profilephoto || defaultProfilePicture" alt="Profile Photo" />
                                       </IonAvatar>
                                    </IonCol>
                                    <IonCol>
                                       <IonLabel>
                                          <h2>{{ username }}</h2>
                                       </IonLabel>
                                    </IonCol>
                                    <IonCol size="auto" class="align-right">
                                       <IonLabel>
                                          <p>{{ formatDate(created_at) }}</p>
                                       </IonLabel>
                                    </IonCol>
                                    <IonCol size="auto" class="align-right" v-if="accountId == account_id">
                                       <IonButton fill="clear" :id="`reply-popover-button-${reply_id}`">
                                          <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                                       </IonButton>
                                       <IonPopover :trigger="`reply-popover-button-${reply_id}`" :dismiss-on-select="true">
                                          <IonContent>
                                             <IonList>
                                                <IonItem :button="true" :detail="false">Update</IonItem>
                                                <IonItem :button="true" :detail="false" @click="presentActionReplySheet(post_id, reply_id, parent_reply_id)">Delete</IonItem>
                                             </IonList>
                                          </IonContent>
                                       </IonPopover>
                                    </IonCol>
                                 </IonRow>
                              </IonCardHeader>
                           </IonGrid>
                           <IonRow style="margin-left: 16px;">
                              {{ content }}
                           </IonRow>
                           <IonRow class="actionbtns">
                              <IonButton @click="toggleLike('reply', reply_id)" fill="clear">
                                 <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedReply(reply_id) }"></ion-icon>
                              </IonButton>
                              <IonLabel>{{ like_count || 0 }}</IonLabel>
                           </IonRow>
                        </IonCard>
                     </div>
                  </IonCard>
               </IonCardContent>
            </IonCard>
         </div>
         <div v-else class="no-results">
            <ion-icon :icon="camera" class="no-results-icon"></ion-icon>
            <p class="no-results-text">No posts</p>
            <p class="no-results-text">Start following someone</p>
         </div>
         <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button expand="block" @click="openPostModal">
               <ion-icon :icon="add"></ion-icon>
            </ion-fab-button>
         </ion-fab>
      </ion-content>
   </ion-page>
</template>

<script setup lang="js">
import { ref, reactive, inject, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon, IonCard, IonRefresher, IonRefresherContent, actionSheetController, IonCardHeader, IonButtons, IonToolbar, IonHeader, IonCardContent, IonTitle, IonFab, IonFabButton, onIonViewWillEnter, IonAvatar, IonLabel, IonGrid, IonRow, IonCol, IonTextarea, IonButton, IonToast, IonPopover, IonList, IonItem, IonModal } from '@ionic/vue';
import { heart, chatbox, ellipsisVerticalOutline, imagesSharp, add, camera } from 'ionicons/icons';
import { fetchAccount } from '@/api/accounts/getAccounts';
import { totalLikes } from '@/components/likes/fetchLikes';
import { onBeforeRouteLeave } from 'vue-router';
import { totalNotifications } from '../components/notifications/fetchNotifications';
import { usePhotoGallery } from '../components/usePhotoGallery'
import { totalFollowers } from '../api/followers/getFollowers';
import { totalPosts } from '@/components/posts/fetchPosts';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import { totalReplies } from '@/components/replies/fetchReplies';
import { presentToast } from '@/components/toasts/toasts';
import { totalGlobalMethods } from '@/global_methods/globalMethods';
import { computed } from 'vue';
import { watchEffect } from 'vue';
const { likeFromPost, likes, getLikes, getLikedPostsId, getLikesFromPost, hasLikedPost, hasLikedReply } = totalLikes();
const { replies, getReplies, showReply, replyingTo, activateReply } = totalReplies();
const { posts, getPosts, deleteApiPost } = totalPosts();
const { followers, getFollowers } = totalFollowers();
const { formatDate } = totalGlobalMethods();
// const accountId = route.query.account_id;
const accountId = localStorage.getItem('account_id');
const { addNotification } = totalNotifications(accountId);
// const posts = ref([]);
// const likes = ref([]);
// const replies = ref([]);
const content = ref('');
const replyContent = ref('');
const gebruikersnaam = ref('');
const defaultProfilePicture = 'default_profile_picture.svg';
const { photos, takePhoto } = usePhotoGallery();
// const followers = ref([]);
fetchAccount(accountId).then(response => {
   console.log(response);
   gebruikersnaam.value = response[0].username;
})

const isUpdateModalOpen = ref(false);
const updatedContent = ref('');
const selectedPostId = ref(null);
const selectedReplyId = ref(null);
const isPostModalOpen = ref(false);

const selectedFilter = ref(localStorage.getItem('selectedFilter'));

let intervalId;

function pullLocalStorage() {
   const currentFilter = localStorage.getItem('selectedFilter');
   if (currentFilter !== selectedFilter.value) {
      selectedFilter.value = currentFilter;
      console.log(selectedFilter.value)
   }
}

// kijke elke seconde of er wijzigingen zijn aan de selectedFilter;
onMounted(() => {
   intervalId = setInterval(pullLocalStorage, 1000)
})

const currentPosts = computed(() => {
   followersPosts();
   console.log(posts.value);
   console.log(filteredPost.value);
   return selectedFilter.value === "Alles" ? posts.value : filteredPost.value;
})


const openPostModal = () => {
   isPostModalOpen.value = true;
}

const cancel = () => {
   isPostModalOpen.value = false;
}

const openUpdateModal = (post_id, content, post_image, reply_id = null) => {
   updatedContent.value = content;
   modalImageSrc.value = post_image;
   selectedPostId.value = post_id;
   selectedReplyId.value = reply_id;
   console.log('Post ID:', selectedPostId.value);
   console.log('Reply ID:', selectedReplyId.value);
   console.log('image source:', modalImageSrc.value);
   console.log('post_image', post_image);
   isUpdateModalOpen.value = true;
};

const closeUpdateModal = () => {
   isUpdateModalOpen.value = false;
};

const imageSrc = ref('');
const modalImageSrc = ref('');
const fileInput = ref('');

const triggerFileInput = () => {
   if (fileInput.value) {
      fileInput.value.click();
   }
   console.log('ok');
};

// was aan het twijfelen tss fileReader en URL maar url leek mij beter voor een preview (minder geheugengebruik): https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
const handleChange = (e) => {
   const file = e.target.files[0];
   if (file) {
      console.log('File geselecteerd:', file);
      imageSrc.value = URL.createObjectURL(file);
   }
};

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

const handleTakePhoto = async () => {
   try {
      await takePhoto();
      if (photos.value.length > 0) {
         console.log(`photos value: ${photos.value[0].webviewPath}`)
         imageSrc.value = photos.value[0].webviewPath;
         getPosts();
      } else {
         console.log("Geen foto's");
      }
   } catch (error) {
      console.error("Error:", error)
   }

}

const handleTakePhotoModal = async () => {
   try {
      await takePhoto();
      if (photos.value.length > 0) {
         console.log(`photos value: ${photos.value[0].webviewPath}`)
         modalImageSrc.value = photos.value[0].webviewPath;
         getPosts();
      } else {
         console.log("Geen foto's");
      }
   } catch (error) {
      console.error("Error:", error);
   }
}

const openGallery = async () => {
   try {
      const image = await Camera.getPhoto({
         quality: 90,
         allowEditing: true,
         resultType: CameraResultType.DataUrl,
         source: CameraSource.Photos
      });
      console.log(image);
      if (image.dataUrl) {
         console.log(image.dataUrl);
         modalImageSrc.value = image.dataUrl;
      } else {
         console.log('image null');
      }
   } catch (error) {
      console.log('Error', error);
   }
};


const deselectImage = () => {
   if (isUpdateModalOpen.value) {
      modalImageSrc.value = null;
   } else {
      imageSrc.value = null;
   }
   fileInput.value.value = "";
};

const axios = inject('axios');

const uploadImage = async (imageBlob, posting_id) => {
   console.log(imageBlob);
   const formData = new FormData();
   formData.append('post_image', imageBlob, 'profile.jpg');
   formData.append('account_id', accountId);
   formData.append('post_id', posting_id)

   try {
      const response = await fetch('https://teomanliman.be/zapi/api2/uploads/', {
         method: 'POST',
         body: formData
      });

      const result = await response.json();
      console.log(result);

      if (result.status === 'success') {
         console.log('Image uploaded successfully:', result.file_path);
      } else {
         console.error('Image upload failed:', result.message);
      }
   } catch (error) {
      console.error('Error uploading image:', error);
   }
};


const presentActionReplySheet = async (post_id, reply_id, parent_reply_id = null) => {
   const actionSheet = await actionSheetController.create({
      header: 'Bent u zeker?',
      buttons: [
         {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
               verwijderReply(post_id, reply_id, parent_reply_id = null);
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

const presentActionSheet = async (post_id) => {
   const actionSheet = await actionSheetController.create({
      header: 'Bent u zeker?',
      buttons: [
         {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
               verwijderPost(post_id);
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

const filteredPost = ref([]);
const followersPosts = () => {
   console.log("posts", posts.value);
   console.log("followers", followers.value);
   const followersPosts = followers.value.filter(follower => parseInt(follower.follower_id) === parseInt(accountId)).map(follower => follower.following_id)
   followersPosts.push(parseInt(accountId));
   console.log(followersPosts)
   filteredPost.value = posts.value.filter(post => followersPosts.includes(parseInt(post.account_id)));
};

followersPosts();

const postApiPost = async () => {
   console.log(imageSrc.value === '');
   try {
      const response = await axios.post('https://teomanliman.be/zapi/api2/posts/', {
         account_id: accountId,
         content: content.value,
         has_image: imageSrc.value !== '' ? 'true' : 'false'
      });

      console.log(response);
      if (response.status !== 200) {
         presentToast('Fout bij het toevoegen van post.');
      } else {
         content.value = '';
         presentToast('Post succesvol toegevoegd!');
         console.log("PostId: ", response.data.data);

         if (imageSrc.value !== '') {
            const res = await fetch(imageSrc.value);
            const blob = await res.blob();
            await uploadImage(blob, response.data.post_id);
            console.log(imageSrc.value);
         }
         console.log(followers.value.length);
         console.log(followers.value);
         for (let i = 0; i < followers.value.length; i++) {
            if (parseInt(followers.value[i].following_id) === parseInt(accountId)) {
               addNotification(followers.value[i].follower_id, `${followers.value[i].following_username} heeft een nieuwe post geplaatst`, 'posts')
               console.log("gelijk");
            }
         }
         getPosts();
      }
   } catch (error) {
      console.error('Error during API call:', error);
      presentToast('Er is een technische fout opgetreden.');
   }
};

const updateApiPost = async () => {
   console.log(modalImageSrc.value === '');
   try {
      const response = await axios.put('https://teomanliman.be/zapi/api2/posts/', {
         post_id: selectedPostId.value,
         account_id: accountId,
         content: updatedContent.value,
         has_image: modalImageSrc.value && modalImageSrc.value !== '' ? 'true' : 'false'
      });

      console.log(response);
      if (response.status !== 200) {
         presentToast('Fout bij het updaten van post.');
      } else {
         content.value = '';
         presentToast('Post succesvol bewerkt!');
         console.log("PostId: ", response.data.data);
         if (modalImageSrc.value !== '' && !modalImageSrc.value.includes('teomanliman')) {
            console.log(modalImageSrc.value);
            const res = await fetch(modalImageSrc.value);
            const blob = await res.blob();
            await uploadImage(blob, selectedPostId.value);
            console.log(modalImageSrc.value);
         }
         console.log(modalImageSrc.value);
         console.log(followers.value.length);
         getPosts();
      }
   } catch (error) {
      console.error('Error during API call:', error);
      presentToast('Er is een technische fout opgetreden.');
   }
};

const updateApiReply = () => {
   const replyData = {
      post_id: selectedPostId.value,
      reply_id: selectedReplyId.value,
      content: updatedContent.value,
      account_id: accountId
   };

   axios
      .put('https://teomanliman.be/zapi/api2/replies/', replyData)
      .then(response => {
         if (response.status !== 200) {
            showToast('Fout bij het bijwerken van reply.');
            return;
         }
         presentToast('Reply succesvol bijgewerkt!');
         getReplies();
      })
      .catch(error => {
         console.error("Fout bij het bijwerken van reply:", error);
         presentToast('Er is een fout opgetreden bij het bijwerken van reply.');
      });
};

const postApiReply = (post_id, reply_id = null) => {
   axios
      .post('https://teomanliman.be/zapi/api2/replies/', {
         account_id: accountId,
         post_id: post_id,
         parent_reply_id: reply_id,
         content: replyContent.value
      })
      .then(response => {
         console.log(response);
         if (response.status !== 200) {
            presentToast('Fout bij het toevoegen van reply.');
            console.log(response.status);
         } else {
            replyContent.value = '';
            for (let i = 0; i < followers.value.length; i++) {
               if (parseInt(followers.value[i].follower_id) === parseInt(accountId)) {
                  addNotification(followers.value[i].following_id, `${followers.value[i].follower_username} heeft een reply op je post geplaatst`, 'posts')
               }
            }
            getPosts();
            presentToast('Reply succesvol toegevoegd!');
         }
      });
}

const toggleApiLike = (type, id) => {
   const isPost = type === 'post';
   let existingLike = false;
   console.log(likes.value);
   for (let i = 0; i < likes.value.length; i++) {
      const like = likes.value[i];
      console.log(like);
      if (
         ((isPost && String(like.post_id) === String(id)) ||
            (!isPost && String(like.reply_id) === String(id))) &&
         String(like.account_id) === String(accountId)
      ) {
         existingLike = true;
         break;
      }
   }

   if (existingLike) {
      axios
         .delete('https://teomanliman.be/zapi/api2/likes/', {
            data: {
               account_id: accountId,
               post_id: isPost ? id : null,
               reply_id: !isPost ? id : null,
            },
         })
         .then((response) => {
            if (response.status === 200) {
               presentToast('Like succesvol verwijderd!');
               getPosts();
               getReplies();
            } else {
               console.error('Fout bij het verwijderen van like');
            }
         })
         .catch(error => {
            console.error('Fout:', error);
            presentToast('Er is een fout opgetreden: ' + (error.response?.data?.message || error.message));
         });
   } else {
      axios
         .post('https://teomanliman.be/zapi/api2/likes/', {
            account_id: accountId,
            post_id: isPost ? id : null,
            reply_id: !isPost ? id : null,
         })
         .then((response) => {
            if (response.status === 200) {
               console.log('ok');
               console.log(response);
               presentToast('Like succesvol toegevoegd!');
               console.log(getLikesFromPost(response.data.like_id));
               return getLikesFromPost(response.data.like_id);
            } else {
               console.error('Fout bij het toevoegen van like');
            }
         }).then(() => {
            fetchAccount(likeFromPost.value[0].like_account).then(result => {
               console.log(accountId);
               console.log(result[0].account_id);
               const isOwner = parseInt(accountId) === result[0].account_id;
               const type = isPost ? 'post' : 'reply';
               const action = isOwner ? 'Je hebt je eigen' : `${gebruikersnaam.value} heeft je`;
               const message = `${action} ${type} geliket`;

               addNotification(result[0].account_id, message, 'likes');
            });
            getPosts();
            getReplies();
         })
         .catch(error => {
            console.error('Fout:', error);
            presentToast('Er is een fout opgetreden: ' + (error.response?.data?.message || error.message));
         });
   }
};


const addPost = () => {
   if (!content.value) {
      presentToast('Vul iets in om te posten!');
      return;
   } else {
      postApiPost();
      cancel();
   }
};

const updatePost = () => {
   if (!updatedContent.value || !accountId || !selectedPostId.value) {
      presentToast('Vul iets in om te bewerken!');
      return;
   } else {
      updateApiPost();
      closeUpdateModal();
   }
};

const updateReply = () => {
   if (!updatedContent.value || !accountId || !selectedPostId.value || !selectedReplyId.value) {
      presentToast('Vul iets in om te bewerken!');
      return;
   } else {
      updateApiReply();
      closeUpdateModal();
   }
};

const addReply = (post_id, reply_id) => {
   if (!replyContent.value) {
      presentToast('Vul iets in voor een reply!');
      return;
   }
   postApiReply(post_id, reply_id);
};

const toggleLike = (type, id) => {
   if (!type || !id) {
      presentToast('Type of ID ontbreekt!');
      return;
   }
   toggleApiLike(type, id);
};

const deleteApiReply = (post_id, reply_id, parent_reply_id = null) => {
   axios
      .delete('https://teomanliman.be/zapi/api2/replies/', {
         data: {
            account_id: accountId,
            post_id: post_id,
            reply_id: reply_id,
            parent_reply_id: parent_reply_id
         },
      })
      .then((response) => {
         if (response.status === 200) {
            presentToast('Reply succesvol verwijderd!');
            getPosts();
            getReplies();
         } else {
            console.error('Fout bij het verwijderen van reply');
         }
      })
      .catch(error => {
         console.error('Fout:', error);
         presentToast('Er is een fout opgetreden: ' + (error.response?.data?.message || error.message));
      });
};

const verwijderPost = (post_id) => {
   if (!post_id) {
      presentToast('ID ontbreekt!');
      return;
   }
   deleteApiPost(accountId, post_id);
};

const verwijderReply = (post_id, reply_id, parent_reply_id = null) => {
   if (!post_id && !reply_id) {
      presentToast('ID ontbreekt!');
      return;
   }
   deleteApiReply(post_id, reply_id, parent_reply_id);
};

const handleRefresh = (event) => {
   getPosts();
   getReplies();
   getFollowers();
   followersPosts();
   setTimeout(() => {
      event.target.complete();
      window.location.reload();
   }, 2000)
}

onIonViewWillEnter(() => {
   getPosts();
   getReplies();
   getFollowers();
   followersPosts();
   console.log(selectedFilter);
});



</script>
<style scoped>
.align-right button {
   width: fit-content;
}

.align-right {
   display: flex;
   justify-content: flex-end;
   align-items: center;
   width: fit-content;
   padding: 0;
   margin: 0;
}

.user-name {
   font-size: 1.2rem;
   color: #9b9fa3;
   font-weight: bold;
   padding: 0;
   margin: 0;
}

.image-upload-container {
   margin-top: 15px;
   text-align: center;
}

.uploaded-image {
   max-width: 100%;
   max-height: 200px;
   border-radius: 6%;
   margin-bottom: 10px;
}


.upload-button,
.update-button {
   --padding-start: 0;
   --padding-end: 0;
   justify-content: start;
}

.image-preview-row,
.image-preview-col {
   justify-content: center;
   align-items: center;
}

ion-card-header {
   padding-bottom: 5px;
   padding-right: 0px;
}

ion-card-content {
   padding-top: 0;
}

.date-text {
   font-size: 0.85rem;
   color: #888888;
   float: right;
   padding: 0;
   margin: 0;
}

.reply-card:hover {
   transition: box-shadow 0.3s ease;
   box-shadow: 0 4px 10px rgba(176, 169, 169, 0.3);
}
</style>