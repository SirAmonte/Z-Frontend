<template>
   <ion-page>
      <ion-menu side="end" content-id="main-content">
         <ion-header>
            <ion-toolbar>
               <ion-buttons>
                  <ion-button v-if="!toggle" @click="toonButtons()">
                     <ion-icon :icon="caretBack"></ion-icon>
                     Terug
                  </ion-button>
               </ion-buttons>
            </ion-toolbar>
         </ion-header>
         <ion-content class="ion-padding">
            <ion-button expand="block" fill="outline" @click="toonButtons()" :class="{ visible: !toggle }">Accountcentrum</ion-button>
            <ion-list>
               <ion-toggle :checked="paletteToggle" @ionChange="toggleChange($event)" justify="space-between" :class="{ visible: !toggle }">Dark Mode</ion-toggle>
            </ion-list>
            <ion-button expand="block" fill="outline" @click="logOut()" :class="{ visible: !toggle }">Log uit</ion-button>
            <div :class="{ visible: toggle }">
               <ion-button expand="block" fill="outline" @click="openGegevens()">Profielgegevens</ion-button>
               <ion-button expand="block" fill="outline" @click="openWachtwoord()">Wachtwoord en beveiliging</ion-button>
            </div>
         </ion-content>
         <ion-footer>
            <ion-button expand="block" fill="outline" color="danger" @click="presentActionSheet()" :class="{ visible: !toggle }">Verwijder Account</ion-button>
         </ion-footer>
      </ion-menu>
      <ion-page id="main-content">
         <ion-content>
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
               <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-card>
               <ion-item class="profile" lines="none">
                  <ion-avatar slot="start">
                     <img :src="profilephoto || defaultProfilePicture" alt=" Profile picture" />
                  </ion-avatar>
                  <ion-label>
                     <h2 class="username" style="font-size:large">{{ gebruikersnaam }}</h2>
                     <p class="joined-date">Joined: {{ joinedOn }}</p>
                  </ion-label>
               </ion-item>
               <ion-card-content>
                  <p class="bio">{{ bio }}</p>
               </ion-card-content>
               <ion-toolbar>
                  <ion-buttons>
                     <ion-button @click="recommendedModalOpen = true">
                        <p class="small-text">Recommended</p>
                     </ion-button>
                     <ion-modal :is-open="recommendedModalOpen">
                        <ion-header>
                           <ion-toolbar>
                              <ion-title>Recommended</ion-title>
                              <ion-buttons slot="end">
                                 <ion-button @click="recommendedModalOpen = false">Close</ion-button>
                              </ion-buttons>
                           </ion-toolbar>
                        </ion-header>
                        <ion-searchbar @ionInput="handleRecommendedInput($event)" placeholder="Zoek naar recommandaties"></ion-searchbar>
                        <ion-content class="ion-padding">
                           <ion-grid :fixed="true">
                              <ion-row>
                                 <ion-col></ion-col>
                                 <ion-col></ion-col>
                              </ion-row>
                              <ion-row v-for="recommend in searchRecommendedResults.filter(rm => rm.account_id != acc_id)" :key="recommend.account_id">
                                 <ion-col v-if="isFollowing(acc_id, recommend.account_id)">
                                    <ion-list>
                                       <ion-item @click="viewProfile(recommend.account_id)" class="result-item">
                                          <div slot="start" class="avatar-with-text">
                                             <ion-avatar class="profile-avatar">
                                                <img loading="lazy" alt="Silhouette of a person's head" :src="recommend.profilephoto || defaultProfilePicture" class="profile-photo" />
                                             </ion-avatar>
                                             <p class="user-username"> {{ recommend.username }}</p>
                                          </div>
                                          <ion-button slot="end" fill="solid" color="primary" class="follow-button" @click.stop="addFollowers(recommend.account_id, recommend.username)">Follow</ion-button>
                                       </ion-item>
                                    </ion-list>
                                 </ion-col>
                              </ion-row>
                           </ion-grid>
                        </ion-content>
                     </ion-modal>
                  </ion-buttons>
                  <ion-buttons slot="secondary">
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
                                       <ion-list>
                                          <ion-item @click="viewProfile(follower.follower_id)" class="result-item">
                                             <div slot="start" class="avatar-with-text">
                                                <ion-avatar>
                                                   <img loading="lazy" alt="Silhouette of a person's head" :src="follower.follower_photo || defaultProfilePicture" class="profile-photo" />
                                                </ion-avatar>
                                                <p class="user-username"> {{ follower.follower_username }}</p>
                                             </div>
                                             <ion-button slot="end" v-if="!checkFollowing(follower.follower_id)" @click.stop="addFollowers(follower.follower_id, follower.follower_username)">Follow</ion-button>
                                             <ion-button slot="end" v-else @click.stop="deleteFollower(follower.follower_id)">Unfollow</ion-button>
                                          </ion-item>
                                       </ion-list>
                                    </ion-col>
                                 </ion-row>
                              </div>
                              <div v-else class="no-results">
                                 <ion-icon :icon="personCircleOutline" class="no-results-icon"></ion-icon>
                                 <p class="no-results-text">No people are following you</p>
                              </div>
                           </ion-grid>
                        </ion-content>
                     </ion-modal>
                  </ion-buttons>
                  <ion-buttons slot="primary">
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
                                          <ion-button slot="end" class="profilebutton" v-if="isFollowingAccount(follower.following_id)" @click.stop="deleteFollower(follower.following_id)">Unfollow</ion-button>
                                       </ion-item>
                                    </ion-col>
                                 </ion-row>
                              </div>
                              <div v-else class="no-results">
                                 <ion-icon :icon="personCircleOutline" class="no-results-icon"></ion-icon>
                                 <p class="no-results-text">Go start following some people</p>
                              </div>
                           </ion-grid>
                        </ion-content>
                     </ion-modal>
                  </ion-buttons>
               </ion-toolbar>
            </ion-card>
            <ion-segment v-model="profileSegment">
               <ion-segment-button value="posts" content-id="posts">
                  <ion-label>Posts</ion-label>
               </ion-segment-button>
               <ion-segment-button value="liked" content-id="liked">
                  <ion-label>Liked</ion-label>
               </ion-segment-button>
            </ion-segment>
            <ion-segment-view>
               <ion-segment-content id="posts">
                  <div v-if="posts.filter(p => p.account_id == acc_id).length > 0">
                     <ion-card v-for="post in posts.filter(p => p.account_id == acc_id)" :key="post.post_id" class="post-card">
                        <ion-grid>
                           <ion-row>
                              <ion-col class="profile-info">
                                 <h2 class="username">{{ post.username }}</h2>
                                 <p class="date-text">{{ formatDate(post.created_at) }}</p>
                              </ion-col>
                              <ion-col size="auto" class="align-right">
                                 <ion-button fill="clear" @click="presentActionPostSheet(post)" class="icon-buttons">
                                    <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                                 </ion-button>
                              </ion-col>
                           </ion-row>
                        </ion-grid>
                        <ion-card-content>
                           <p class="content-text"> {{ post.content }}</p>
                           <img class="post-image" loading="lazy" :src="post.post_image" />
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
                                          <h2 :class="parseInt(account_id) !== parseInt(acc_id) ? 'user-name' : 'username'">{{ username }}</h2>
                                          <p class="date-text">{{ formatDate(created_at) }}</p>
                                       </ion-col>
                                       <ion-col size="auto">
                                          <ion-button fill="clear" :id="`reply-popover-button-${reply_id}`" v-if="acc_id == account_id">
                                             <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                                          </ion-button>
                                          <ion-popover :trigger="`reply-popover-button-${reply_id}`" :dismiss-on-select="true">
                                             <ion-content>
                                                <ion-list>
                                                   <ion-item :button="true" :detail="false">Update</ion-item>
                                                   <ion-item :button="true" :detail="false" @click="verwijderReply(post.post_id, reply_id, parent_reply_id)">Delete</ion-item>
                                                </ion-list>
                                             </ion-content>
                                          </ion-popover>
                                       </ion-col>
                                    </ion-row>
                                 </ion-card-header>
                              </ion-grid>
                              <p class="reply-content">{{ content }}</p>
                              <ion-row class="actionbtns">
                                 <ion-button @click="toggleLike('reply', reply_id)" fill="clear">
                                    <ion-icon size="4" :icon="heart" :class="{ 'is-liked': hasLikedReply(reply_id) }"></ion-icon>
                                    <ion-label style="margin-left:4px">{{ like_count || 0 }}</ion-label>
                                 </ion-button>
                                 <ion-button @click="activateReply('reply', reply_id)" fill="clear">
                                    <ion-icon size="4" :icon="chatbox"></ion-icon>
                                    <ion-label style="margin-left: 4px;">{{ reply_count || 0 }}</ion-label>
                                 </ion-button>
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
                     <p class="no-results-text">No posts yet</p>
                     <ion-button expand="outline" class="to-homepage" @click="toHomePage()">
                        <p>go post your first post</p>
                     </ion-button>
                  </div>
               </ion-segment-content>
               <ion-segment-content id="liked">
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
                                 <h2 :class="parseInt(likedPost.account_id) === parseInt(acc_id) ? 'username' : 'post-username'">{{ likedPost.username }}</h2>
                                 <p class="date-text">{{ formatDate(likedPost.created_at) }}</p>
                              </ion-col>
                              <ion-col size="auto" class="align-right">
                                 <ion-button fill="clear" @click="presentActionPostSheet(likedPost)" v-if="likedPost.account_id == acc_id" style="margin-top: 12px;">
                                    <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                                 </ion-button>
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
                                 <span style="margin-left: 4px;">{{ likedPost.reply_count || 0 }}</span>
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
                                          <h2 :class="parseInt(account_id) !== parseInt(acc_id) ? 'user-name' : 'username'">{{ username }}</h2>
                                          <p class="date-text">{{ formatDate(created_at) }}</p>
                                       </ion-col>
                                       <ion-col size="auto">
                                          <ion-button fill="clear" :id="`reply-popover-button-${reply_id}`" v-if="acc_id == account_id">
                                             <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
                                          </ion-button>
                                          <ion-popover :trigger="`reply-popover-button-${reply_id}`" :dismiss-on-select="true">
                                             <ion-content>
                                                <ion-list>
                                                   <ion-item :button="true" :detail="false">Update</ion-item>
                                                   <ion-item :button="true" :detail="false" @click="verwijderReply(likedPost.post_id, reply_id, parent_reply_id)">Delete</ion-item>
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
                                    <ion-label style="margin-left:4px">{{ like_count || 0 }}</ion-label>
                                 </ion-button>
                                 <ion-button @click="activateReply('reply', reply_id)" fill="clear">
                                    <ion-icon size="4" :icon="chatbox"></ion-icon>
                                    <ion-label style="margin-left: 4px;">{{ reply_count || 0 }}</ion-label>
                                 </ion-button>
                              </ion-row>
                           </ion-card>
                        </ion-card-content>
                     </ion-card>
                  </div>
                  <div v-else class="no-results">
                     <ion-icon :icon="camera" class="no-results-icon"></ion-icon>
                     <p class="no-results-text">No liked posts yet</p>
                     <ion-button expand="outline" class="to-homepage" @click="toHomePage()">
                        <p>go like your first post</p>
                     </ion-button>
                  </div>
               </ion-segment-content>
            </ion-segment-view>
         </ion-content>
         <ion-modal :is-open="isModalGegevens" ref="modal" @didDismiss="cancelGegevens">
            <ion-header>
               <ion-toolbar>
                  <ion-buttons slot="start">
                     <ion-button @click="cancelGegevens()">Cancel</ion-button>
                  </ion-buttons>
                  <ion-title>Gegevens</ion-title>
                  <ion-buttons slot="end">
                     <ion-button :strong="true" @click="confirmGegevens()">Confirm</ion-button>
                  </ion-buttons>
               </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
               <ion-item>
                  <ion-input label="Username" v-model="gebruikersnaam" :value="gebruikersnaam" label-placement="stacked" type="text"></ion-input>
               </ion-item>
               <ion-item>
                  <ion-input label="Email" v-model="email" :value="email" label-placement="stacked" type="email"></ion-input>
               </ion-item>
               <ion-item>
                  <ion-input label="Bio" v-model="bio" :value="bio" label-placement="stacked" type="text"></ion-input>
               </ion-item>
               <ion-item>
                  <ion-grid class="my-grid">
                     <ion-row>
                        <ion-col class="parent-col">
                           <ion-avatar class="image-container">
                              <img loading="lazy" id="imageElement" alt="Profile Picture" :src="profilephoto" />
                              <ion-icon :icon="camera" class="camera-icon" @click="handleTakePhoto()"></ion-icon>
                           </ion-avatar>
                        </ion-col>
                     </ion-row>
                     <ion-row>
                        <ion-col>
                           <ion-button expand="block" @click="openGallery">Profielfoto veranderen</ion-button>
                        </ion-col>
                     </ion-row>
                  </ion-grid>
               </ion-item>
            </ion-content>
         </ion-modal>
         <ion-modal :is-open="isModalWachtwoord" ref="modal" @didDismiss="cancelWachtwoord">
            <ion-header>
               <ion-toolbar>
                  <ion-buttons slot="start">
                     <ion-button @click="cancelWachtwoord()">Cancel</ion-button>
                  </ion-buttons>
                  <ion-title>Wachtwoord</ion-title>
                  <ion-buttons slot="end">
                     <ion-button :strong="true" @click="confirmWachtwoord()">Confirm</ion-button>
                  </ion-buttons>
               </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
               <ion-item>
                  <ion-input label="Nieuw Wachtwoord" v-model="nieuwwachtwoord" :value="nieuwwachtwoord" label-placement="stacked" type="password"></ion-input>
               </ion-item>
               <ion-item>
                  <ion-input label="Bevestig Wachtwoord" v-model="bevestigwachtwoord" :value="bevestigwachtwoord" label-placement="stacked" type="password"></ion-input>
               </ion-item>
            </ion-content>
         </ion-modal>
      </ion-page>
   </ion-page>
</template>

<script setup lang="js">
import { ref, reactive, watchEffect, computed } from 'vue';
import { IonPage, IonHeader, IonButton, IonFooter, IonSegmentView, IonRefresher, IonRefresherContent, IonToggle, IonTextarea, onIonViewWillEnter, IonSearchbar, IonGrid, IonList, IonRow, IonCol, IonPopover, IonCardHeader, IonSegmentContent, IonSegment, IonSegmentButton, IonButtons, IonMenu, IonMenuButton, IonInput, IonToolbar, IonModal, IonTitle, toastController, IonCardSubtitle, IonContent, IonCard, IonCardContent, IonIcon, IonItem, IonAvatar, IonLabel, actionSheetController, alertController } from '@ionic/vue';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import { logoDeviantart, caretBack, ellipsisVerticalOutline, heart, chatbox, camera, personCircleOutline } from 'ionicons/icons';

import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import { totalNotifications } from '@/components/notifications/fetchNotifications';
import { totalLikes } from '@/components/likes/fetchLikes';
import { totalPosts } from '@/components/posts/fetchPosts';
import { totalFollowers } from '@/api/followers/getFollowers';
import { totalReplies } from '@/components/replies/fetchReplies';
import { totalAccount, fetchAccount, fetchAccounts } from '@/api/accounts/getAccounts';
import { totalGlobalMethods } from '@/global_methods/globalMethods'
import { onMounted } from 'vue';
import { usePhotoGallery } from '@/components/usePhotoGallery';
import { presentToast } from '@/components/toasts/toasts';
const acc_id = localStorage.getItem('account_id')
const { addNotification } = totalNotifications(acc_id);
const { likedPosts, getLikedPostsId, likes, likeFromPost, getLikesFromPost, hasLikedPost, hasLikedReply } = totalLikes();
const { posts, getPosts, deleteApiPost } = totalPosts();
const { replies, getReplies, replyingTo, showReply, activateReply } = totalReplies();
const { followers, searchFollowerResults, searchFollowingResults, getFollowers, following, getFollowing, addFollowers, deleteFollower } = totalFollowers();
const { getInformationAccount, gebruikersnaam, profilephoto, bio, joinedOn, email } = totalAccount();
const { formatDate } = totalGlobalMethods();
const { takePhoto, photos } = usePhotoGallery();

const route = useRoute();
const router = useRouter();
const defaultProfilePicture = 'default_profile_picture.svg';
const toggle = ref(true);
const gebruikerwachtwoord = ref('');
const nieuwwachtwoord = ref('');
const bevestigwachtwoord = ref('')
const isModalGegevens = ref(false);
const isModalWachtwoord = ref(false);
const replyContent = ref('');
gebruikersnaam.value = acc_id
console.log(acc_id);
const followerModalOpen = ref(false);
const followingModalOpen = ref(false);
const recommendedModalOpen = ref(false);
const recommended = ref([]);
let blob = new Blob([]);
const isDarkMode = ref(false);

// https://ionicframework.com/docs/theming/dark-mode
const paletteToggle = ref(false);

// Use matchMedia to check the user preference
const prefersDark = window.matchMedia('(prefers-color-scheme: light)');

// Add or remove the "ion-palette-dark" class on the html element
const toggleDarkPalette = (shouldAdd) => {
   document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
};

// Check/uncheck the toggle and update the palette based on isDark
const initializeDarkPalette = () => {
   const savedToggleState = localStorage.getItem('paletteToggle');
   paletteToggle.value = savedToggleState !== null ? savedToggleState === 'true' : prefersDark.matches;
   toggleDarkPalette(paletteToggle.value);
};

// Initialize the dark palette based on the initial
// value of the prefers-color-scheme media query
initializeDarkPalette();

// Listen for changes to the prefers-color-scheme media query
prefersDark.addEventListener('change', (mediaQuery) => {
   initializeDarkPalette(mediaQuery.matches)
   localStorage.setItem('paletteToggle', mediaQuery.matches);
});

// Listen for the toggle check/uncheck to toggle the dark palette
const toggleChange = (event) => {
   const isChecked = event.detail.checked;
   toggleDarkPalette(isChecked);
   localStorage.setItem('paletteToggle', isChecked);
};

const handleTakePhoto = async () => {
   await takePhoto();
   if (photos.value.length > 0) {
      console.log(`photos value: ${photos.value[0].webviewPath}`)
      profilephoto.value = photos.value[0].webviewPath;
      blob = await fetch(photos.value[0].webviewPath).then(res => res.blob());
   }
}

// bekijk profile van andere gebruikers, werkt nog niet
const viewProfile = (follower_id) => {
   followerModalOpen.value = false;
   followingModalOpen.value = false;
   recommendedModalOpen.value = false;
   router.push({ path: 'otherprofile', query: { account_id: follower_id } })
   console.log(follower_id)
}

onMounted(() => {
   getInformationAccount(acc_id);
   getAllAccounts();
   getPosts();
   getFollowing(acc_id);
   handleFollowing();
})


const hash = async (string) => {
   const utf8 = new TextEncoder().encode(string);
   const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
   return hashHex;
}

const searchRecommendedResults = ref([]);

const handleInput = (event) => {
   const query = event.target.value.toLowerCase();
   // console.log(followers.value);
   searchFollowingResults.value = followers.value.filter((user) => user.following_username.toLowerCase().includes(query));
   // console.log(followers.value.filter((user) => user.following_username.toLowerCase().includes(query)));
   // console.log("event target:", event.target.value);
}

const handleFollowerInput = (event) => {
   const query = event.target.value.toLowerCase();
   searchFollowerResults.value = followers.value.filter((user) => user.follower_username.toLowerCase().includes(query));
   // console.log(followers.value.filter((user) => user.follower_username))
   // console.log("event target:", event.target.value);
}

const handleRecommendedInput = (event) => {
   const query = event.target.value.toLowerCase();
   // console.log(recommended.value);
   searchRecommendedResults.value = recommended.value.filter((user) => user.username.toLowerCase().includes(query));

}

const isFollowing = (current_id, follower_id) => {
   // console.log(`account_id ${current_id}, followed ${follower_id}`)
   // console.log(follower_id)
   // console.log(followers.value.some(fl => fl.following_id === follower_id && fl.follower_id === current_id))
   const result = followers.value.some(fl =>
      parseInt(fl.following_id) === parseInt(follower_id) && parseInt(fl.follower_id) === parseInt(current_id));
   // console.log(result);
   // console.log(followers.value);
   return !result;
}


const isFollowingAccount = (follower_id) => {
   return searchFollowingResults.value.some(fl => parseInt(fl.follower_id) === parseInt(acc_id) && parseInt(fl.following_id) === parseInt(follower_id));
}


const handleFollowing = async () => {
   await getFollowing(acc_id);
   console.log(following.value)
}

const checkFollowing = (follower_id) => {
   console.log(follower_id);
   console.log(following.value);
   // console.log("Following:", following.value.some(fl => fl.following_id === parseInt(follower_id)))
   console.log("Following:", followers.value.some(fl => fl.follower_id === parseInt(acc_id) && fl.following_id === parseInt(follower_id)));
   return followers.value.some(fl => fl.follower_id === parseInt(acc_id) && fl.following_id === parseInt(follower_id));
}

const toonButtons = () => {
   toggle.value = !toggle.value;
}

const openGegevens = () => {
   isModalGegevens.value = true;
}

const cancelGegevens = () => {
   isModalGegevens.value = false;
}

const confirmGegevens = async () => {
   cancelGegevens();
   await uploadImage(blob);
   changeAccountInformation();
}

const openWachtwoord = () => {
   isModalWachtwoord.value = true;
}

const cancelWachtwoord = () => {
   isModalWachtwoord.value = false;
}

const confirmWachtwoord = () => {
   if (nieuwwachtwoord.value.length < 8) {
      presentToast('Het wachtwoord moet minstens 8 karakters hebben');
   } else {
      if (nieuwwachtwoord.value === bevestigwachtwoord.value) {
         gebruikerwachtwoord.value = bevestigwachtwoord.value;
         changePasswordInformation();
         cancelWachtwoord();
      } else {
         presentToast('De wachtwoorden komen niet overeen');
      }
   }
}


const toHomePage = () => {
   router.push({ path: '/home' });
}

const logOut = () => {
   gebruikersnaam.value = '';
   email.value = '';
   bio.value = '';
   profilephoto.value = '';
   localStorage.removeItem('account_id')
   router.push('/login').then(() => {
      // reload de pagina
      location.reload();
   });
}

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

const presentActionSheet = async () => {
   const actionSheet = await actionSheetController.create({
      header: 'Bent u zeker?',
      buttons: [
         {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
               deleteAccount()
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

const getAllAccounts = () => {
   axios
      .get('https://teomanliman.be/zapi/api2/accounts/')
      .then(response => {
         console.log(response);
         console.log(response.data.data);
         recommended.value = response.data.data;
         searchRecommendedResults.value = response.data.data;
      })
}

// https://www.taniarascia.com/how-to-upload-files-to-a-server-with-plain-javascript-and-php/
const uploadImage = async (imageBlob) => {
   console.log(imageBlob);
   if (!acc_id) {
      console.log('No account ID found');
      return;
   }

   const formData = new FormData();
   formData.append('profile_image', imageBlob, 'profile.jpg');
   formData.append('account_id', acc_id);

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

// https://forum.ionicframework.com/t/get-image-from-gallery/122440
// https://ionicframework.com/docs/native/camera/
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
         profilephoto.value = image.dataUrl;
         blob = await fetch(image.dataUrl).then(res => res.blob());
      } else {
         console.log('image null');
      }
   } catch (error) {
      console.log('Error', error);
   }
};

const changeAccountInformation = async () => {
   axios
      .put('https://teomanliman.be/zapi/api2/accounts/', {
         username: gebruikersnaam.value,
         email: email.value,
         bio: bio.value,
         account_id: acc_id
      })
      .then(response => {
         console.log(response);
         if (response.status === 200) {
            presentToast('Profielgegevens succesvol aangepast');
            console.log(response.data);
         }
         console.log(gebruikersnaam.value);
         console.log(email.value);
         console.log(profilephoto.value);
         console.log(bio.value);
         console.log(acc_id);
      })
}

const changePasswordInformation = async () => {
   const hashPassword = await hash(gebruikerwachtwoord.value)
   axios
      .put('https://teomanliman.be/zapi/api2/accounts/', {
         password: hashPassword,
         account_id: acc_id
      })
      .then(response => {
         console.log(response);
         if (response.status === 200) {
            console.log(response.data);
            presentToast('Wachtwoord succesvol aangepast');
         }
      })
}

const deleteAccount = () => {
   axios
      .delete('https://teomanliman.be/zapi/api2/accounts/', {
         data: { account_id: acc_id }
      })
      .then(response => {
         if (response.status === 200) {
            presentToast('Account succesvol verwijderd');
            router.push('/login');
         } else {
            presentToast(`Mislukt, response: ${response.status}`);
         }
      })
      .catch(error => {
         console.log('Error: ', error);
      })
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
            account_id: acc_id,
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

const verwijderReply = (post_id, reply_id, parent_reply_id = null) => {
   if (!post_id && !reply_id) {
      presentToast('ID ontbreekt!');
      return;
   }
   deleteApiReply(post_id, reply_id, parent_reply_id);
};


const postApiReply = (post_id, reply_id = null) => {
   axios
      .post('https://teomanliman.be/zapi/api2/replies/', {
         account_id: acc_id,
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
               if (parseInt(followers.value[i].follower_id) === parseInt(acc_id)) {
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


const handleRefresh = (event) => {
   getPosts();
   getLikedPostsId(acc_id);
   getFollowers();
   getFollowing();
   setTimeout(() => {
      event.target.complete();
      window.location.reload();
   }, 2000)
}

onIonViewWillEnter(() => {
   getPosts();
   getLikedPostsId(acc_id);
   getFollowers();
   getFollowing()
})

</script>

<style scoped>
ion-card {
   margin: 20px;
}

.spacebetween {
   display: flex;
   justify-content: space-between;
   align-items: center;
   width: 100%;
}

.iconCol {
   display: flex;
   margin: 0;
   padding: 0;
}

.profileperson {
   display: flex;
   justify-content: space-between;
}

ion-footer {
   margin-bottom: 20px;
   padding-left: 10px;
   padding-right: 10px;
}

.change-profile {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 10px;
}

.my-grid {
   width: 100%;
}

.my-grid ion-col.md {
   display: flex;
   align-items: center;
   justify-content: center;
}

ion-card-content {
   padding: 10px;
}

ion-list {
   padding: 0;
}

.to-homepage {
   --border-color: var(--to-home-border-color);
}

.to-homepage p {
   color: var(--to-home-color);
}

.visible {
   display: none;
}

.image-container {
   position: relative;
   width: 100px;
   height: 100px;
}

.image-container img {
   width: 100%;
   height: 100%;
   display: block;
}

.camera-icon {
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   font-size: 30px;
   color: white;
   display: none;
}

.image-container:hover .camera-icon {
   display: block;
}
</style>