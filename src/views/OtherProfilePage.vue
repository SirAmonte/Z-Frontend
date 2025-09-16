<template>
   <ion-page>
      <ion-buttons slot="start" class="go-back">
         <ion-button @click="goBack">
            <ion-icon :icon="caretBack"></ion-icon>
         </ion-button>
      </ion-buttons>
      <ion-page id="main-content">
         <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
         </ion-refresher>
         <ion-content>
            <ion-card>
               <ion-item class="profile" lines="none">
                  <ion-avatar slot="start">
                     <img loading="lazy" :src="profilephoto || defaultProfilePicture" alt="Profile picture" />
                  </ion-avatar>
                  <ion-label>
                     <h2 class="username" style="margin-bottom: 2px;">{{ gebruikersnaam }}</h2>
                     <p class="joined-date">Joined: {{ joinedOn }}</p>
                  </ion-label>
               </ion-item>
               <ion-card-content>
                  <p class="bio">{{ bio }}</p>
               </ion-card-content>
               <ion-toolbar>
                  <ion-buttons slot="start">
                     <ion-button @click="getFollowers(); followerModalOpen = true">
                        <p class="small-text">Followers</p>
                     </ion-button>
                     <ion-modal :is-open="followerModalOpen">
                        <ion-header>
                           <ion-toolbar>
                              <ion-title>Followers</ion-title>
                              <ion-buttons slot="end">
                                 <ion-button @click="followerModalOpen = false">Close</ion-button>
                              </ion-buttons>
                           </ion-toolbar>
                        </ion-header>
                        <ion-searchbar @ionInput="handleFollowerInput($event)" placeholder="Zoek een volger"></ion-searchbar>
                        <ion-content class="ion-padding">
                           <ion-grid :fixed="true">
                              <ion-row>
                                 <ion-col></ion-col>
                                 <ion-col></ion-col>
                              </ion-row>
                              <div v-if="searchFollowerResults.filter(fl => fl.following_id == acc_id).length > 0">
                                 <ion-row v-for="follower in searchFollowerResults.filter(fl => fl.following_id == acc_id)">
                                    <ion-col>
                                       <ion-item @click="viewProfile(follower.follower_id)" class="result-item">
                                          <div slot="start" class="avatar-with-text">
                                             <ion-avatar>
                                                <img loading="lazy" alt="Silhouette of a person's head" :src="follower.follower_photo || defaultProfilePicture" class="profile-photo" />
                                             </ion-avatar>
                                             <p class="user-username"> {{ follower.follower_username }}</p>
                                          </div>
                                          <ion-button slot="end" class="profilebutton" v-if="isFollowingAccount(follower.follower_id) && parseInt(accountId) !== parseInt(follower.follower_id)" @click.stop="deleteFollower(follower.follower_id)">Unfollow</ion-button>
                                          <ion-button slot="end" class="profilebutton" v-else-if="!isFollowingAccount(follower.follower_id) && parseInt(accountId) !== parseInt(follower.follower_id)" @click.stop="addFollowers(follower.follower_id, follower.follower_username)">Follow</ion-button>
                                       </ion-item>
                                    </ion-col>
                                 </ion-row>
                              </div>
                              <div v-else class="no-results">
                                 <ion-icon :icon="personCircleOutline" class="no-results-icon"></ion-icon>
                                 <p class="no-results-text">No followers yet</p>
                              </div>
                           </ion-grid>
                        </ion-content>
                     </ion-modal>
                  </ion-buttons>
                  <ion-buttons slot="start">
                     <ion-button @click="getFollowers(); followingModalOpen = true">
                        <p class="small-text">Following</p>
                     </ion-button>
                     <ion-modal :is-open="followingModalOpen">
                        <ion-header>
                           <ion-toolbar>
                              <ion-title>Following</ion-title>
                              <ion-buttons slot="end">
                                 <ion-button @click="followingModalOpen = false">Close</ion-button>
                              </ion-buttons>
                           </ion-toolbar>
                        </ion-header>
                        <ion-searchbar v-model="searchQuery" @ionInput="handleInput($event)" placeholder="Zoek gebruiker"></ion-searchbar>
                        <ion-content class="ion-padding">
                           <ion-grid :fixed="true">
                              <ion-row>
                                 <ion-col></ion-col>
                                 <ion-col></ion-col>
                              </ion-row>
                              <div v-if="searchFollowingResults.filter(fl => fl.follower_id == acc_id).length > 0">
                                 <ion-row v-for="follower in searchFollowingResults.filter(fl => fl.follower_id == acc_id)">
                                    <ion-col>
                                       <ion-item @click="viewProfile(follower.following_id)" class="result-item">
                                          <div slot="start" class="avatar-with-text">
                                             <ion-avatar>
                                                <img loading="lazy" alt="Silhouette of a person's head" :src="follower.following_photo || defaultProfilePicture" class="profile-photo" />
                                             </ion-avatar>
                                             <p class="user-username"> {{ follower.following_username }}</p>
                                          </div>
                                          <ion-button slot="end" class="profilebutton" v-if="isFollowingAccount(follower.following_id) && parseInt(accountId) !== parseInt(follower.following_id)" @click.stop="deleteFollower(follower.following_id)">Unfollow</ion-button>
                                          <ion-button slot="end" class="profilebutton" v-else-if="!isFollowingAccount(follower.following_id) && parseInt(accountId) !== parseInt(follower.following_id)" @click.stop="addFollowers(follower.following_id, follower.following_username)">Follow</ion-button>
                                       </ion-item>
                                    </ion-col>
                                 </ion-row>
                              </div>
                              <div v-else class="no-results">
                                 <ion-icon :icon="personCircleOutline" class="no-results-icon"></ion-icon>
                                 <p class="no-results-text">Hasn't started following</p>
                              </div>
                           </ion-grid>
                        </ion-content>
                     </ion-modal>
                  </ion-buttons>
                  <ion-buttons slot="end">
                     <ion-button class="white-button" expand="block" v-if="!checkFollower()" @click="addFollowers(acc_id, gebruikersnaam)">
                        <p class="small-text">Follow</p>
                     </ion-button>
                     <ion-button class="white-button" expand="block" v-if="checkFollower()" @click="deleteFollower(acc_id)">
                        <p class="small-text">Unfollow</p>
                     </ion-button>
                  </ion-buttons>
               </ion-toolbar>
            </ion-card>
            <ion-segment v-model="otherSegment">
               <ion-segment-button value="posts2" content-id="posts2">
                  <ion-label>Posts</ion-label>
               </ion-segment-button>
               <ion-segment-button value="liked2" content-id="liked2">
                  <ion-label>Liked</ion-label>
               </ion-segment-button>
            </ion-segment>
            <ion-segment-view>
               <ion-segment-content id="posts2">
                  <div v-if="posts.filter(p => p.account_id == acc_id).length > 0">
                     <ion-card v-for="post in posts.filter(p => p.account_id == acc_id)" :key="post.post_id" class="post-card">
                        <ion-grid>
                           <ion-row>
                              <ion-col class="profile-info">
                                 <h2 class="post-username">{{ post.username }}</h2>
                                 <p class="date-text">{{ formatDate(post.created_at) }}</p>
                              </ion-col>
                           </ion-row>
                        </ion-grid>
                        <ion-card-content>
                           <p class="content-text">{{ post.content }}</p>
                           <img class="post-image" laoding="lazy" :src="post.post_image" />
                           <div class="actionbtns">
                              <ion-button @click="toggleLike('post', post.post_id)" fill="clear" class="post-buttons">
                                 <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedPost(post.post_id) }"></ion-icon>
                                 <span style="margin-left: 4px;">{{ post.like_count || 0 }}</span>
                              </ion-button>
                              <ion-button @click="activateReply('post', post.post_id)" fill="clear" class="post-buttons">
                                 <ion-icon size="4" :icon="chatbox"></ion-icon>
                                 <span style="margin-left: 4px;">{{ post.reply_count || 0 }}</span>
                              </ion-button>
                           </div>
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
                                          <h2 :class="parseInt(account_id) !== parseInt(accountId) ? 'user-name' : 'username'">{{ username }}</h2>
                                          <p class="date-text">{{ formatDate(created_at) }}</p>
                                       </ion-col>
                                       <ion-col size="auto">
                                          <ion-button fill="clear" :id="`reply-popover-button-${reply_id}`" v-if="accountId == account_id">
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
                              <p class="reply-content"> {{ content }} </p>
                              <ion-row class="actionbtns">
                                 <ion-button @click="toggleLike('reply', reply_id)" fill="clear">
                                    <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedReply(reply_id) }"></ion-icon>
                                 </ion-button>
                                 <ion-label>{{ like_count || 0 }}</ion-label>
                                 <ion-button @click="activateReply('reply', reply_id)" fill="clear">
                                    <ion-icon size="4" :icon="chatbox"></ion-icon>
                                 </ion-button>
                                 <ion-label>{{ reply_count || 0 }}</ion-label>
                              </ion-row>
                              <div v-if="replyingTo.type === 'reply' && replyingTo.id === reply_id">
                                 <ion-textarea v - model=" replyContent" :counter="true" maxlength="200" :auto-grow="true" placeholder="Type a reply..."></ion-textarea>
                                 <ion-button @click="addReply(post.post_id, reply_id)">Post Reply</ion-button>
                              </div>
                           </ion-card>
                        </ion-card-content>
                     </ion-card>
                  </div>
                  <div v-else class="no-results">
                     <ion-icon :icon="camera" class="no-results-icon"></ion-icon>
                     <p class="no-results-text">No posts available</p>
                  </div>
               </ion-segment-content>
               <ion-segment-content id="liked2">
                  <div v-if="likedPosts.length > 0">
                     <ion-card v-for="likedPost in likedPosts" :key="likedPost.post_id" class="post-card">
                        <ion-grid>
                           <ion-row>
                              <ion-col size="auto">
                                 <ion-avatar>
                                    <img loading="lazy" :src="likedPost.profilephoto" alt="likedpost profile" />
                                 </ion-avatar>
                              </ion-col>
                              <ion-col class="profile-info">
                                 <h2 :class="parseInt(likedPost.account_id) === parseInt(accountId) ? 'username' : 'post-username'">{{ likedPost.username }}</h2>
                                 <p class="date-text">{{ formatDate(likedPost.created_at) }}</p>
                              </ion-col>
                           </ion-row>
                        </ion-grid>
                        <ion-card-content>
                           <p class="content-text"> {{ likedPost.content }}</p>
                           <img class="post-image" loading="lazy" :src="likedPost.post_image" />
                           <div class="actionbtns">
                              <ion-button @click="toggleLike('post', likedPost.post_id)" fill="clear" class="post-buttons">
                                 <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedPost(likedPost.post_id) }"></ion-icon>
                                 <span style="margin-left: 4px;">{{ likedPost.like_count || 0 }}</span>
                              </ion-button>
                              <ion-button @click="activateReply('post', likedPost.post_id)" fill="clear" class="post-buttons">
                                 <ion-icon size="4" :icon="chatbox"></ion-icon>
                                 <span style="margin-left: 4px">{{ likedPost.reply_count || 0 }}</span>
                              </ion-button>
                           </div>
                           <ion-card v-if="showReply[likedPost.post_id]" v-for="{ reply_id, content, created_at, username, like_count, account_id, reply_count, parent_reply_id, profilephoto } in  replies.filter(reply => reply.post_id === likedPost.post_id).reverse() " :key="reply_id" class="reply-card">
                              <ion-grid>
                                 <ion-card-header>
                                    <ion-row>
                                       <ion-col size="auto">
                                          <ion-avatar size="small">
                                             <img :src="profilephoto" alt="Profile Photo" />
                                          </ion-avatar>
                                       </ion-col>
                                       <ion-col>
                                          <h2 :class="parseInt(account_id) !== parseInt(accountId) ? 'user-name' : 'username'">{{ username }}</h2>
                                          <p class="date-text">{{ formatDate(created_at) }}</p>
                                       </ion-col>
                                       <ion-col size="auto">
                                          <ion-button fill="clear" :id="`reply-popover-button-${reply_id}`" v-if="accountId == account_id">
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
                              <p class="reply-content"> {{ content }} </p>
                              <ion-row class="actionbtns">
                                 <ion-button @click="toggleLike('reply', reply_id)" fill="clear">
                                    <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedReply(reply_id) }"></ion-icon>
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
                  </div>
                  <div v-else class="no-results">
                     <ion-icon :icon="camera" class="no-results-icon"></ion-icon>
                     <p class="no-results-text">No liked posts available</p>
                  </div>
               </ion-segment-content>
            </ion-segment-view>
         </ion-content>
      </ion-page>
   </ion-page>
</template>

<script setup lang="js">
import { ref, onMounted, nextTick, watch } from 'vue';
import { IonPage, IonHeader, IonButton, IonFooter, IonRefresher, IonCardHeader, IonPopover, IonTextarea, IonRefresherContent, IonSegmentView, IonSearchbar, IonGrid, IonList, IonRow, IonCol, IonSegmentContent, IonSegment, IonSegmentButton, IonButtons, IonMenu, IonMenuButton, IonInput, IonToolbar, IonModal, IonTitle, toastController, IonCardSubtitle, IonContent, IonCard, IonCardContent, IonIcon, IonItem, IonAvatar, IonLabel, actionSheetController, onIonViewWillEnter } from '@ionic/vue';
import { logoDeviantart, caretBack, ellipsisVerticalOutline, heart, chatbox, camera, personCircleOutline, construct } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { totalFollowers } from '@/api/followers/getFollowers';
import { totalPosts } from '@/components/posts/fetchPosts';
import { totalAccount } from '@/api/accounts/getAccounts';
import { totalReplies } from '@/components/replies/fetchReplies';
import { totalLikes } from '@/components/likes/fetchLikes';
import { fetchAccount } from '@/api/accounts/getAccounts';
import { presentToast } from '@/components/toasts/toasts';
import { totalGlobalMethods } from '@/global_methods/globalMethods';
import { totalNotifications } from '@/components/notifications/fetchNotifications';
const route = useRoute();
const acc_id = route.query.account_id;
const accountId = localStorage.getItem('account_id');
const { addNotification } = totalNotifications(accountId);
const { followers, searchFollowerResults, searchFollowingResults, getFollowers, following, getFollowing, deleteFollower, addFollowers } = totalFollowers();
const { posts, getPosts } = totalPosts();
const { gebruikersnaam, bio, joinedOn, profilephoto, getInformationAccount } = totalAccount();
const { likedPosts, getLikedPostsId, hasLikedPost, likes, hasLikedReply, getLikesFromPost, likeFromPost } = totalLikes();
const { replies, getReplies, replyingTo, showReply, activateReply } = totalReplies();
const { formatDate } = totalGlobalMethods();
const router = useRouter();
const goBack = () => router.back();
const followerModalOpen = ref(false);
const followingModalOpen = ref(false);
const replyContent = ref('');

const defaultProfilePicture = 'default_profile_picture.svg'

onMounted(() => {
   console.log("Page loaded and ready");
   getPosts();
   getInformationAccount(acc_id);
   getLikedPostsId(acc_id);
   getFollowers();
   getFollowing(accountId);
})
console.log(acc_id);

const palette = localStorage.getItem('paletteToggle');

const isDarkModeEnabled = palette === 'true';

if (isDarkModeEnabled) {
   document.documentElement.classList.add('ion-palette-dark');
} else {
   document.documentElement.classList.remove('ion-palette-dark');
}

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

const isFollowingAccount = (follower_id) => {
   console.log("follower_id", follower_id);
   console.log(searchFollowingResults.value.some(fl => parseInt(fl.follower_id) === parseInt(accountId) && parseInt(fl.following_id) === parseInt(follower_id)))
   return searchFollowingResults.value.some(fl => parseInt(fl.follower_id) === parseInt(accountId) && parseInt(fl.following_id) === parseInt(follower_id));
}

const checkFollowing = (follower_id) => {
   console.log(follower_id);
   console.log(following);
   console.log(following.value.some(fl => fl.follower_id === follower_id))
   return following.value.some(fl => fl.follower_id === follower_id);
}

const checkFollower = () => {
   console.log(following.value);
   console.log(followers.value);
   console.log(followers.value.some(fl => fl.follower_id === accountId && fl.following_id === acc_id));
   console.log(followers.value.map(fl => fl.follower_id));
   console.log(accountId);
   console.log(following.value);
   return followers.value.some(fl => fl.follower_id === parseInt(accountId) && fl.following_id === parseInt(acc_id));
}

const handleRefresh = (event) => {
   getPosts();
   getInformationAccount(acc_id);
   getLikedPostsId(acc_id);
   getFollowers();
   getFollowing(accountId);
   setTimeout(() => {
      event.target.complete();
      window.location.reload();
   }, 2000);
}

const toggleApiLike = (type, id) => {
   const isPost = type === 'post';
   let existingLike = false;

   for (let i = 0; i < likes.value.length; i++) {
      const like = likes.value[i];

      if (
         ((isPost && String(like.post_id) === String(id)) ||
            (!isPost && String(like.reply_id) === String(id))) &&
         String(like.account_id) === String(acc_id)
      ) {
         existingLike = true;
         break;
      }
   }

   if (existingLike) {
      axios
         .delete('https://teomanliman.be/zapi/api2/likes/', {
            data: {
               account_id: acc_id,
               post_id: isPost ? id : null,
               reply_id: !isPost ? id : null,
            },
         })
         .then((response) => {
            if (response.status === 200) {
               presentToast('Like succesvol verwijderd!');
               getPosts();
               getReplies();
               getLikesFromPost();
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
            account_id: acc_id,
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
               console.log(result[0].account_id);
               const isOwner = parseInt(acc_id) === result[0].account_id;
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


onIonViewWillEnter(() => {
   getLikedPostsId(acc_id);
})
</script>

<style scoped>
.white-button .small-text {
   font-size: 10px;
   color: black;
}

.white-button {
   --background: white;
   --color: black;
   --border-style: solid;
   --border-width: 1px;
   --border-color: black;
   border-radius: 6%;
}

.post-username {
   font-size: 1.2rem;
   font-weight: bold;
   padding: 0;
   margin: 0;
}


.is-liked {
   color: rgb(172, 10, 10);
}

.no-results-icon {
   font-size: 2rem;
   margin-bottom: 10px;
   color: #ccc;
}

.no-results-text {
   font-size: 1.2rem;
   color: #666;
}

ion-card-content {
   padding: 10px;
}
</style>