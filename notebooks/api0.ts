export function createApi():Api{
    return new ApiImpl();
}
import RamlWrapper=require('./deps/Raml08Wrapper')
        import executor=require('./deps/executor')
        import env=require('./deps/executionEnvironment')
        import endpoints=require('./deps/endpoints')

        env.setPath(__dirname);
        env.getReportManager().setLogPath(__dirname);

            class Channels_historyResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_historyResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.history`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_infoResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_infoResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.info`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_inviteResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_inviteResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.invite`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_joinResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_joinResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.join`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_leaveResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_leaveResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.leave`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Channels_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_markResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_markResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.mark`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_setPurposeResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_setPurposeResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.setPurpose`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Channels_setTopicResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Channels_setTopicResourceGetOptions )=>{
var res=<any> 
this.invoke(`/channels.setTopic`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Chat_deleteResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Chat_deleteResourceGetOptions )=>{
var res=<any> 
this.invoke(`/chat.delete`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Chat_postMessageResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Chat_postMessageResourceGetOptions )=>{
var res=<any> 
this.invoke(`/chat.postMessage`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Chat_updateResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Chat_updateResourceGetOptions )=>{
var res=<any> 
this.invoke(`/chat.update`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Emoji_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Emoji_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/emoji.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Files_infoResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Files_infoResourceGetOptions )=>{
var res=<any> 
this.invoke(`/files.info`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Files_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Files_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/files.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Files_uploadResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Files_uploadResourceGetOptions )=>{
var res=<any> 
this.invoke(`/files.upload`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Groups_historyResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Groups_historyResourceGetOptions )=>{
var res=<any> 
this.invoke(`/groups.history`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Groups_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Groups_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/groups.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Groups_markResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Groups_markResourceGetOptions )=>{
var res=<any> 
this.invoke(`/groups.mark`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Groups_setPurposeResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Groups_setPurposeResourceGetOptions )=>{
var res=<any> 
this.invoke(`/groups.setPurpose`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Groups_setTopicResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Groups_setTopicResourceGetOptions )=>{
var res=<any> 
this.invoke(`/groups.setTopic`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Im_historyResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Im_historyResourceGetOptions )=>{
var res=<any> 
this.invoke(`/im.history`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Im_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Im_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/im.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Im_markResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Im_markResourceGetOptions )=>{
var res=<any> 
this.invoke(`/im.mark`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Search_allResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Search_allResourceGetOptions )=>{
var res=<any> 
this.invoke(`/search.all`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Search_filesResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Search_filesResourceGetOptions )=>{
var res=<any> 
this.invoke(`/search.files`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Search_messagesResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options:Search_messagesResourceGetOptions )=>{
var res=<any> 
this.invoke(`/search.messages`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Stars_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Stars_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/stars.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
class Users_listResourceImpl

{


            invoke(path:string,method:string,obj:any){return this._parent.invoke(path,method,obj)}
            constructor( private _parent:{invoke(path:string,method:string,obj:any):void}){
                
            }
get=( options?:Users_listResourceGetOptions )=>{
var res=<any> 
this.invoke(`/users.list`,'get',{
"options":options
});
return res;/*d*get*/}

 /* type ending */ }
export interface ChannelsHistory{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //latest
         latest?:string


        /**
         *
         **/
         //messages
         messages?:ChannelsHistoryMessages[] | ChannelsHistoryMessages1[] | ChannelsHistoryMessages2[]


        /**
         *
         **/
         //has_more
         has_more?:boolean
}
export interface ChannelsHistoryMessages{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //ts
         ts?:string


        /**
         *
         **/
         //user
         user?:string


        /**
         *
         **/
         //text
         text?:string
}
export interface ChannelsHistoryMessages1{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //ts
         ts?:string


        /**
         *
         **/
         //user
         user?:string


        /**
         *
         **/
         //text
         text?:string


        /**
         *
         **/
         //is_starred
         is_starred?:boolean
}
export interface ChannelsHistoryMessages2{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //ts
         ts?:string


        /**
         *
         **/
         //wibblr
         wibblr?:boolean
}
export interface ChannalsInfo{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //channel
         channel?:ChannalsInfoChannel
}
export interface ChannalsInfoChannel{

        /**
         *
         **/
         //id
         id?:string


        /**
         *
         **/
         //name
         name?:string


        /**
         *
         **/
         //created
         created?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //is_archived
         is_archived?:boolean


        /**
         *
         **/
         //is_general
         is_general?:boolean


        /**
         *
         **/
         //is_member
         is_member?:boolean


        /**
         *
         **/
         //members
         members?:string


        /**
         *
         **/
         //topic
         topic?:string


        /**
         *
         **/
         //purpose
         purpose?:string


        /**
         *
         **/
         //last_read
         last_read?:string


        /**
         *
         **/
         //latest
         latest?:string


        /**
         *
         **/
         //unread_count
         unread_count?:number
}
export interface ChannelsInvite{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //channel
         channel?:ChannelsInviteChannel
}
export interface ChannelsInviteTopic{

        /**
         *
         **/
         //value
         value?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //last_set
         last_set?:string
}
export interface ChannelsInvitePurpose{

        /**
         *
         **/
         //value
         value?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //last_set
         last_set?:string
}
export type ChannelsInvitePurpose1=ChannelsInviteTopic
export interface ChannelsInviteChannel{

        /**
         *
         **/
         //id
         id?:string


        /**
         *
         **/
         //name
         name?:string


        /**
         *
         **/
         //created
         created?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //is_archived
         is_archived?:boolean


        /**
         *
         **/
         //is_member
         is_member?:boolean


        /**
         *
         **/
         //is_general
         is_general?:boolean


        /**
         *
         **/
         //last_read
         last_read?:string


        /**
         *
         **/
         //latest
         latest?:string


        /**
         *
         **/
         //unread_count
         unread_count?:number


        /**
         *
         **/
         //members
         members?:string


        /**
         *
         **/
         //topic
         topic?:ChannelsInviteTopic


        /**
         *
         **/
         //purpose
         purpose?:ChannelsInvitePurpose
}
export interface Ok{

        /**
         *
         **/
         //ok
         ok?:boolean
}
export interface Channels{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //channels
         channels?:ChannelsChannels[]
}
export interface ChannelsTopic{

        /**
         *
         **/
         //value
         value?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //last_set
         last_set?:string
}
export type ChannelsTopic1=ChannelsInviteTopic
export interface ChannelsPurpose{

        /**
         *
         **/
         //value
         value?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //last_set
         last_set?:string
}
export type ChannelsPurpose1=ChannelsInviteTopic
export interface ChannelsChannels{

        /**
         *
         **/
         //id
         id?:string


        /**
         *
         **/
         //name
         name?:string


        /**
         *
         **/
         //created
         created?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //is_archived
         is_archived?:boolean


        /**
         *
         **/
         //is_member
         is_member?:boolean


        /**
         *
         **/
         //num_members
         num_members?:number


        /**
         *
         **/
         //topic
         topic?:ChannelsTopic


        /**
         *
         **/
         //purpose
         purpose?:ChannelsPurpose
}
export interface Purpose{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //purpose
         purpose?:string
}
export interface Topic{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //topic
         topic?:string
}
export interface ChatOk{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //ts
         ts?:string


        /**
         *
         **/
         //channel
         channel?:string
}
export interface ChatUpdate{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //channel
         channel?:string


        /**
         *
         **/
         //ts
         ts?:string


        /**
         *
         **/
         //text
         text?:string
}
export interface EmojiList{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //emoji
         emoji?:EmojiListEmoji
}
export interface EmojiListEmoji{

        /**
         *
         **/
         //bowtie
         bowtie?:string


        /**
         *
         **/
         //squirrel
         squirrel?:string


        /**
         *
         **/
         //shipit
         shipit?:string
}
export interface Groups{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //groups
         groups?:GroupsGroups[]
}
export interface GroupsTopic{

        /**
         *
         **/
         //value
         value?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //last_set
         last_set?:string
}
export type GroupsTopic1=ChannelsInviteTopic
export interface GroupsPurpose{

        /**
         *
         **/
         //value
         value?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //last_set
         last_set?:string
}
export type GroupsPurpose1=ChannelsInviteTopic
export interface GroupsGroups{

        /**
         *
         **/
         //id
         id?:string


        /**
         *
         **/
         //name
         name?:string


        /**
         *
         **/
         //created
         created?:string


        /**
         *
         **/
         //creator
         creator?:string


        /**
         *
         **/
         //is_archived
         is_archived?:boolean


        /**
         *
         **/
         //members
         members?:string[]


        /**
         *
         **/
         //topic
         topic?:GroupsTopic


        /**
         *
         **/
         //purpose
         purpose?:GroupsPurpose
}
export interface Ims{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //ims
         ims?:ImsIms[]
}
export interface ImsIms{

        /**
         *
         **/
         //id
         id?:string


        /**
         *
         **/
         //user
         user?:string


        /**
         *
         **/
         //created
         created?:number


        /**
         *
         **/
         //is_user_deleted
         is_user_deleted?:boolean
}
export interface SearchAll{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //query
         query?:string


        /**
         *
         **/
         //messages
         messages?:string


        /**
         *
         **/
         //files
         files?:string
}
export interface SearchFiles{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //query
         query?:string


        /**
         *
         **/
         //files
         files?:SearchFilesFiles
}
export interface SearchFilesPaging{

        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //total
         total?:number


        /**
         *
         **/
         //page
         page?:number


        /**
         *
         **/
         //pages
         pages?:number
}
export interface SearchFilesFiles{

        /**
         *
         **/
         //total
         total?:number


        /**
         *
         **/
         //paging
         paging?:SearchFilesPaging


        /**
         *
         **/
         //matches
         matches?:string
}
export interface SearchMessages{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //query
         query?:string


        /**
         *
         **/
         //messages
         messages?:SearchMessagesMessages
}
export interface SearchMessagesPaging{

        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //total
         total?:number


        /**
         *
         **/
         //page
         page?:number


        /**
         *
         **/
         //pages
         pages?:number
}
export type SearchMessagesPaging1=SearchFilesPaging
export interface SearchMessagesMessages{

        /**
         *
         **/
         //total
         total?:number


        /**
         *
         **/
         //paging
         paging?:SearchMessagesPaging


        /**
         *
         **/
         //matches
         matches?:string
}
export interface StarList{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //items
         items?:StarListItems[] | StarListItems1[] | StarListItems2[] | StarListItems3[]


        /**
         *
         **/
         //paging
         paging?:StarListPaging
}
export interface StarListItems{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //channel
         channel?:string


        /**
         *
         **/
         //message
         message?:string
}
export interface StarListItems1{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //file
         file?:string
}
export interface StarListItems2{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //file
         file?:string


        /**
         *
         **/
         //comment
         comment?:string
}
export interface StarListItems3{

        /**
         *
         **/
         //type
         "type"?:string


        /**
         *
         **/
         //channel
         channel?:string
}
export interface StarListPaging{

        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //total
         total?:number


        /**
         *
         **/
         //page
         page?:number


        /**
         *
         **/
         //pages
         pages?:number
}
export type StarListPaging1=SearchFilesPaging
export interface UsersList{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //members
         members?:UsersListMembers[]
}
export interface UsersListProfile{

        /**
         *
         **/
         //first_name
         first_name?:string


        /**
         *
         **/
         //last_name
         last_name?:string


        /**
         *
         **/
         //real_name
         real_name?:string


        /**
         *
         **/
         //email
         email?:string


        /**
         *
         **/
         //skype
         skype?:string


        /**
         *
         **/
         //phone
         phone?:string


        /**
         *
         **/
         //image_24
         image_24?:string


        /**
         *
         **/
         //image_32
         image_32?:string


        /**
         *
         **/
         //image_48
         image_48?:string


        /**
         *
         **/
         //image_72
         image_72?:string


        /**
         *
         **/
         //image_192
         image_192?:string
}
export interface UsersListMembers{

        /**
         *
         **/
         //id
         id?:string


        /**
         *
         **/
         //name
         name?:string


        /**
         *
         **/
         //deleted
         deleted?:boolean


        /**
         *
         **/
         //color
         color?:string


        /**
         *
         **/
         //profile
         profile?:UsersListProfile


        /**
         *
         **/
         //is_admin
         is_admin?:boolean


        /**
         *
         **/
         //is_owner
         is_owner?:boolean


        /**
         *
         **/
         //has_files
         has_files?:boolean
}
export interface FileObj{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //file
         file?:FileObjFile
}
export interface FileObjFile{}
export interface Files{

        /**
         *
         **/
         //ok
         ok?:boolean


        /**
         *
         **/
         //files
         files?:string


        /**
         *
         **/
         //paging
         paging?:FilesPaging
}
export interface FilesPaging{

        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //total
         total?:number


        /**
         *
         **/
         //page
         page?:number


        /**
         *
         **/
         //pages
         pages?:number
}
export type FilesPaging1=SearchFilesPaging
export interface Api{
declaration():RamlWrapper.Api
authenticate(schemaName?:string,options?:any):any
log(vName:string,val:any)

        /**
         * 
         * @ramlpath /channels.history
         **/


         channels_history:Channels_historyResource


        /**
         * 
         * @ramlpath /channels.info
         **/


         channels_info:Channels_infoResource


        /**
         * 
         * @ramlpath /channels.invite
         **/


         channels_invite:Channels_inviteResource


        /**
         * 
         * @ramlpath /channels.join
         **/


         channels_join:Channels_joinResource


        /**
         * 
         * @ramlpath /channels.leave
         **/


         channels_leave:Channels_leaveResource


        /**
         * 
         * @ramlpath /channels.list
         **/


         channels_list:Channels_listResource


        /**
         * 
         * @ramlpath /channels.mark
         **/


         channels_mark:Channels_markResource


        /**
         * 
         * @ramlpath /channels.setPurpose
         **/


         channels_setPurpose:Channels_setPurposeResource


        /**
         * 
         * @ramlpath /channels.setTopic
         **/


         channels_setTopic:Channels_setTopicResource


        /**
         * 
         * @ramlpath /chat.delete
         **/


         chat_delete:Chat_deleteResource


        /**
         * 
         * @ramlpath /chat.postMessage
         **/


         chat_postMessage:Chat_postMessageResource


        /**
         * 
         * @ramlpath /chat.update
         **/


         chat_update:Chat_updateResource


        /**
         * 
         * @ramlpath /emoji.list
         **/


         emoji_list:Emoji_listResource


        /**
         * 
         * @ramlpath /files.info
         **/


         files_info:Files_infoResource


        /**
         * 
         * @ramlpath /files.list
         **/


         files_list:Files_listResource


        /**
         * 
         * @ramlpath /files.upload
         **/


         files_upload:Files_uploadResource


        /**
         * 
         * @ramlpath /groups.history
         **/


         groups_history:Groups_historyResource


        /**
         * 
         * @ramlpath /groups.list
         **/


         groups_list:Groups_listResource


        /**
         * 
         * @ramlpath /groups.mark
         **/


         groups_mark:Groups_markResource


        /**
         * 
         * @ramlpath /groups.setPurpose
         **/


         groups_setPurpose:Groups_setPurposeResource


        /**
         * 
         * @ramlpath /groups.setTopic
         **/


         groups_setTopic:Groups_setTopicResource


        /**
         * 
         * @ramlpath /im.history
         **/


         im_history:Im_historyResource


        /**
         * 
         * @ramlpath /im.list
         **/


         im_list:Im_listResource


        /**
         * 
         * @ramlpath /im.mark
         **/


         im_mark:Im_markResource


        /**
         * 
         * @ramlpath /search.all
         **/


         search_all:Search_allResource


        /**
         * 
         * @ramlpath /search.files
         **/


         search_files:Search_filesResource


        /**
         * 
         * @ramlpath /search.messages
         **/


         search_messages:Search_messagesResource


        /**
         * 
         * @ramlpath /stars.list
         **/


         stars_list:Stars_listResource


        /**
         * 
         * @ramlpath /users.list
         **/


         users_list:Users_listResource
}
export interface Channels_historyResource{

        /**
         * Fetches history of messages and events from a channel.
         * @ramlpath /channels.history  get
         **/
         get( options:Channels_historyResourceGetOptions ):ChannelsHistory
}
export interface Channels_historyResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //latest
         latest?:string


        /**
         *
         **/
         //oldest
         oldest?:string


        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //has_more
         has_more?:boolean


        /**
         *
         **/
         //is_limited
         is_limited?:boolean
}
export interface Channels_infoResource{

        /**
         * Gets information about a channel.
         * @ramlpath /channels.info  get
         **/
         get( options:Channels_infoResourceGetOptions ):ChannalsInfo
}
export interface Channels_infoResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string
}
export interface Channels_inviteResource{

        /**
         * Invites a user to a channel.
         * @ramlpath /channels.invite  get
         **/
         get( options:Channels_inviteResourceGetOptions ):ChannelsInvite
}
export interface Channels_inviteResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //user
         user:string
}
export interface Channels_joinResource{

        /**
         * Joins a channel, creating it if needed.
         * @ramlpath /channels.join  get
         **/
         get( options:Channels_joinResourceGetOptions ):ChannelsInvite
}
export interface Channels_joinResourceGetOptions{

        /**
         *
         **/
         //name
         name:string
}
export interface Channels_leaveResource{

        /**
         * Leaves a channel.
         * @ramlpath /channels.leave  get
         **/
         get( options:Channels_leaveResourceGetOptions ):Ok
}
export type Channels_leaveResourceGetOptions=Channels_infoResourceGetOptions
export interface Channels_listResource{

        /**
         * Lists all channels in a Slack team.
         * @ramlpath /channels.list  get
         **/
         get( options?:Channels_listResourceGetOptions ):Channels
}
export interface Channels_listResourceGetOptions{

        /**
         *
         **/
         //exclude_archived
         exclude_archived?:string
}
export interface Channels_markResource{

        /**
         * Sets the read cursor in a channel.
         * @ramlpath /channels.mark  get
         **/
         get( options:Channels_markResourceGetOptions ):Ok
}
export interface Channels_markResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //ts
         ts:string
}
export interface Channels_setPurposeResource{

        /**
         * Sets the purpose for a channel.
         * @ramlpath /channels.setPurpose  get
         **/
         get( options:Channels_setPurposeResourceGetOptions ):Purpose
}
export interface Channels_setPurposeResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //purpose
         purpose:string
}
export interface Channels_setTopicResource{

        /**
         * Sets the topic for a channel.
         * @ramlpath /channels.setTopic  get
         **/
         get( options:Channels_setTopicResourceGetOptions ):Topic
}
export interface Channels_setTopicResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //topic
         topic:string
}
export interface Chat_deleteResource{

        /**
         * Deletes a message.
         * @ramlpath /chat.delete  get
         **/
         get( options:Chat_deleteResourceGetOptions ):ChatOk
}
export type Chat_deleteResourceGetOptions=Channels_markResourceGetOptions
export interface Chat_postMessageResource{

        /**
         * Sends a message to a channel.
         * @ramlpath /chat.postMessage  get
         **/
         get( options:Chat_postMessageResourceGetOptions ):ChatOk
}
export interface Chat_postMessageResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //text
         text:string


        /**
         *
         **/
         //username
         username?:string


        /**
         *
         **/
         //parse
         parse?:string


        /**
         *
         **/
         //link_names
         link_names?:string


        /**
         *
         **/
         //unfurl_links
         unfurl_links?:string


        /**
         *
         **/
         //icon_url
         icon_url?:string


        /**
         *
         **/
         //icon_emoji
         icon_emoji?:string


        /**
         *
         **/
         //attachments
         attachments?:string
}
export interface Chat_updateResource{

        /**
         * Updates a message.
         * @ramlpath /chat.update  get
         **/
         get( options:Chat_updateResourceGetOptions ):ChatUpdate
}
export interface Chat_updateResourceGetOptions{

        /**
         *
         **/
         //channel
         channel:string


        /**
         *
         **/
         //text
         text:string


        /**
         *
         **/
         //ts
         ts:string
}
export interface Emoji_listResource{

        /**
         * Lists custom emoji for a team.
         * @ramlpath /emoji.list  get
         **/
         get( options?:Emoji_listResourceGetOptions ):EmojiList
}
export type Emoji_listResourceGetOptions=FileObjFile
export interface Files_infoResource{

        /**
         * Gets information about a team file.
         * @ramlpath /files.info  get
         **/
         get( options:Files_infoResourceGetOptions ):FileObj
}
export interface Files_infoResourceGetOptions{

        /**
         *
         **/
         //file
         file:string


        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //page
         page?:number
}
export interface Files_listResource{

        /**
         * Lists and filters team files.
         * @ramlpath /files.list  get
         **/
         get( options:Files_listResourceGetOptions ):Files
}
export interface Files_listResourceGetOptions{

        /**
         *
         **/
         //file
         file:string


        /**
         *
         **/
         //user
         user?:string


        /**
         *
         **/
         //ts_from
         ts_from?:string


        /**
         *
         **/
         //ts_to
         ts_to?:string


        /**
         *
         **/
         //types
         types?:string
}
export interface Files_uploadResource{

        /**
         * Uploads or creates a file.
         * @ramlpath /files.upload  get
         **/
         get( options?:Files_uploadResourceGetOptions ):FileObj
}
export interface Files_uploadResourceGetOptions{

        /**
         *
         **/
         //file
         file?:string


        /**
         *
         **/
         //content
         content?:string


        /**
         *
         **/
         //filetype
         filetype?:string


        /**
         *
         **/
         //filename
         filename?:string


        /**
         *
         **/
         //title
         title?:string


        /**
         *
         **/
         //initial_comment
         initial_comment?:string


        /**
         *
         **/
         //channels
         channels?:string
}
export interface Groups_historyResource{

        /**
         * Fetches history of messages and events from a private group.
         * @ramlpath /groups.history  get
         **/
         get( options:Groups_historyResourceGetOptions ):ChannelsHistory
}
export type Groups_historyResourceGetOptions=Channels_historyResourceGetOptions
export interface Groups_listResource{

        /**
         * Lists private groups that the calling user has access to.
         * @ramlpath /groups.list  get
         **/
         get( options?:Groups_listResourceGetOptions ):Groups
}
export type Groups_listResourceGetOptions=Channels_listResourceGetOptions
export interface Groups_markResource{

        /**
         * Sets the read cursor in a private group.
         * @ramlpath /groups.mark  get
         **/
         get( options:Groups_markResourceGetOptions ):Ok
}
export type Groups_markResourceGetOptions=Channels_markResourceGetOptions
export interface Groups_setPurposeResource{

        /**
         * Sets the purpose for a private group.
         * @ramlpath /groups.setPurpose  get
         **/
         get( options:Groups_setPurposeResourceGetOptions ):Purpose
}
export type Groups_setPurposeResourceGetOptions=Channels_setPurposeResourceGetOptions
export interface Groups_setTopicResource{

        /**
         * Sets the topic for a private group.
         * @ramlpath /groups.setTopic  get
         **/
         get( options:Groups_setTopicResourceGetOptions ):Topic
}
export type Groups_setTopicResourceGetOptions=Channels_setTopicResourceGetOptions
export interface Im_historyResource{

        /**
         * Fetches history of messages and events from direct message channel.
         * @ramlpath /im.history  get
         **/
         get( options:Im_historyResourceGetOptions ):ChannelsHistory
}
export type Im_historyResourceGetOptions=Channels_historyResourceGetOptions
export interface Im_listResource{

        /**
         * Lists direct message channels for the calling user.
         * @ramlpath /im.list  get
         **/
         get( options?:Im_listResourceGetOptions ):Ims
}
export type Im_listResourceGetOptions=FileObjFile
export interface Im_markResource{

        /**
         * Sets the read cursor in a direct message channel.
         * @ramlpath /im.mark  get
         **/
         get( options:Im_markResourceGetOptions ):Ok
}
export type Im_markResourceGetOptions=Channels_markResourceGetOptions
export interface Search_allResource{

        /**
         * Searches for messages and files matching a query.
         * @ramlpath /search.all  get
         **/
         get( options:Search_allResourceGetOptions ):SearchAll
}
export interface Search_allResourceGetOptions{

        /**
         *
         **/
         //query
         query:string


        /**
         *
         **/
         //sort
         sort?:string


        /**
         *
         **/
         //sort_dir
         sort_dir?:string


        /**
         *
         **/
         //highlight
         highlight?:string


        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //page
         page?:number
}
export interface Search_filesResource{

        /**
         * Searches for files matching a query.
         * @ramlpath /search.files  get
         **/
         get( options:Search_filesResourceGetOptions ):SearchFiles
}
export type Search_filesResourceGetOptions=Search_allResourceGetOptions
export interface Search_messagesResource{

        /**
         * Searches for messages matching a query.
         * @ramlpath /search.messages  get
         **/
         get( options:Search_messagesResourceGetOptions ):SearchMessages
}
export type Search_messagesResourceGetOptions=Search_allResourceGetOptions
export interface Stars_listResource{

        /**
         * Lists stars for a user.
         * @ramlpath /stars.list  get
         **/
         get( options?:Stars_listResourceGetOptions ):StarList
}
export interface Stars_listResourceGetOptions{

        /**
         *
         **/
         //user
         user?:string


        /**
         *
         **/
         //count
         count?:number


        /**
         *
         **/
         //page
         page?:number
}
export interface Users_listResource{

        /**
         * Lists all users in a Slack team.
         * @ramlpath /users.list  get
         **/
         get( options?:Users_listResourceGetOptions ):UsersList
}
export type Users_listResourceGetOptions=FileObjFile

            export interface UnknownResponse{ __$harEntry__ : har.Entry }
            export interface payloadType{}
            export interface responseType{}
            export interface invoker{ (url:String,method:string,options:any):any; }
            export class ApiImpl implements Api 
{
private baseUrl:string='https://slack.com/api'
private cfgEncoded=/*CONFIGENCODEDSTART*/{"numberIsString":true,"createTypesForResources":true,"queryParametersSecond":true,"collapseGet":false,"collapseOneMethod":false,"collapseMediaTypes":false,"methodNamesAsPrefixes":false,"storeHarEntry":true,"createTypesForParameters":true,"reuseTypeForParameters":true,"createTypesForSchemaElements":true,"reuseTypesForSchemaElements":true,"throwExceptionOnIncorrectStatus":false,"async":false,"debugOptions":{"generateImplementation":true,"generateSchemas":true,"generateInterface":true,"resourcePathFilter":null},"overwriteModules":true};/*CONFIGENCODEDEND*/
private apiEncoded=/*APIENCODEDSTART*/{"data":{"title":"Slack","baseUri":"https://slack.com/api","securitySchemes":[{"oauth_2_0":{"description":"","type":"OAuth 2.0","describedBy":{"queryParameters":{"token":{"description":"Used to send a valid OAuth 2 access token. \n"}}},"settings":{"authorizationUri":"https://slack.com/oauth/authorize","accessTokenUri":"https://slack.com/api/oauth.access","authorizationGrants":["code"],"scopes":["identify","read","post"]}}}],"schemas":[{"channelsHistory":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"latest\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_starred\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"wibblr\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    } ,\n    \"has_more\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}"},{"channalsInfo":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"id\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"name\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"created\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"creator\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"is_archived\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_general\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_member\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"members\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"topic\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"purpose\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"last_read\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"latest\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"unread_count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}"},{"channelsInvite":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"id\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"name\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"created\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"creator\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"is_archived\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_member\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_general\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"last_read\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"latest\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"unread_count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"members\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"topic\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"value\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"last_set\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"purpose\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"value\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"last_set\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        }\n      }\n    }\n  }\n}"},{"ok":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}"},{"channels":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channels\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"name\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"created\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_archived\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"is_member\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"num_members\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"topic\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            } ,\n            \"purpose\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}"},{"purpose":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"purpose\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}"},{"topic":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"topic\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}"},{"chatOk":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"ts\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}"},{"chatUpdate":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"ts\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"text\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}"},{"emojiList":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"emoji\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"bowtie\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"squirrel\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"shipit\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}"},{"groups":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"groups\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"name\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"created\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_archived\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"members\" : {\n              \"type\" : \"array\" ,\n              \"required\" : false ,\n              \"items\" : [\n                {\n                  \"type\" : \"string\"\n                }\n              ]\n            } ,\n            \"topic\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            } ,\n            \"purpose\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}"},{"ims":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"ims\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"created\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"is_user_deleted\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    }\n  }\n}"},{"searchAll":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"query\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"files\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}"},{"searchFiles":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"query\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"files\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"paging\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"count\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"total\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"page\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"pages\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"matches\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}"},{"searchMessages":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"query\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"paging\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"count\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"total\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"page\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"pages\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"matches\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}"},{"starList":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"items\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"channel\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"message\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"file\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"file\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"comment\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"channel\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    } ,\n    \"paging\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"page\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"pages\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}"},{"usersList":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"members\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"name\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"deleted\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"color\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"profile\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"first_name\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_name\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"real_name\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"email\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"skype\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"phone\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_24\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_32\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_48\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_72\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_192\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            } ,\n            \"is_admin\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"is_owner\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"has_files\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    }\n  }\n}"},{"fileObj":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"file\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false\n    }\n  }\n}"},{"files":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"files\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"paging\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"page\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"pages\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}"}],"resourceTypes":[{"setPurposeType":{"get?":{"description":"Sets the purpose for a channel.","queryParameters":{"channel":{"description":"<<resourceName>> to fetch history for.","required":true,"example":"C1234567890"},"purpose":{"description":"The new purpose","required":true,"example":"My Purpose"}},"responses":{"200":{"body":{"application/json":{"schema":"purpose","example":"{\n  \"ok\" : true ,\n  \"purpose\" : \"This is the new purpose!\"\n}"}}}}}}},{"historyType":{"get?":{"queryParameters":{"channel":{"description":"<<resourceName>> to fetch history for.","required":true,"example":"C1234567890"},"latest":{"description":"Timestamp of the oldest recent seen message.","default":"now","example":1234567890.123456},"oldest":{"description":"Timestamp of the latest previously seen message.","default":0,"example":1234567890.123456},"count":{"description":"Number of messages to return, between 1 and 1000.","type":"number","default":100,"example":100},"has_more":{"type":"boolean"},"is_limited":{"type":"boolean"}},"responses":{"200":{"body":{"application/json":{"schema":"channelsHistory","example":"{\n  \"ok\" : true ,\n  \"latest\" : \"1358547726.000003\" ,\n  \"messages\" : [\n    {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000008\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"Hello\"\n    } , {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"World\" ,\n      \"is_starred\" : true\n    } , {\n      \"type\" : \"something_else\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"wibblr\" : true\n    }\n  ] ,\n  \"has_more\" : false\n}"}}}}}}},{"markType":{"get?":{"queryParameters":{"channel":{"description":"<<resourceName>> to fetch history for.","required":true,"example":"C1234567890"},"ts":{"description":"Timestamp of the most recently seen message.","required":true,"example":1234567890.123456}},"responses":{"200":{"body":{"application/json":{"schema":"ok","example":"{\n  \"ok\" : true\n}"}}}}}}}],"securedBy":["oauth_2_0"],"documentation":[{"title":"Headline","content":"Slack brings all your communication together in one place. It's real-time messaging, archiving and search for modern teams."}],"protocols":["HTTPS"],"resources":[{"type":{"historyType":{"resourceName":"Channel"}},"relativeUri":"/channels.history","methods":[{"queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"latest":{"description":"Timestamp of the oldest recent seen message.","default":"now","example":1234567890.123456,"displayName":"latest","type":"string"},"oldest":{"description":"Timestamp of the latest previously seen message.","default":0,"example":1234567890.123456,"displayName":"oldest","type":"string"},"count":{"description":"Number of messages to return, between 1 and 1000.","type":"number","default":100,"example":100,"displayName":"count"},"has_more":{"type":"boolean","displayName":"has_more"},"is_limited":{"type":"boolean","displayName":"is_limited"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"latest\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_starred\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"wibblr\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    } ,\n    \"has_more\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"latest\" : \"1358547726.000003\" ,\n  \"messages\" : [\n    {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000008\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"Hello\"\n    } , {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"World\" ,\n      \"is_starred\" : true\n    } , {\n      \"type\" : \"something_else\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"wibblr\" : true\n    }\n  ] ,\n  \"has_more\" : false\n}"}}}},"description":"Fetches history of messages and events from a channel.","protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.history"]},{"relativeUri":"/channels.info","methods":[{"description":"Gets information about a channel.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"id\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"name\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"created\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"creator\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"is_archived\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_general\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_member\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"members\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"topic\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"purpose\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"last_read\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"latest\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"unread_count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"channel\" : {\n    \"id\" : \"C024BE91L\" ,\n    \"name\" : \"fun\" ,\n    \"created\" : \"1360782804\" ,\n    \"creator\" : \"U024BE7LH\" ,\n    \"is_archived\" : false ,\n    \"is_general\" : false ,\n    \"is_member\" : true ,\n    \"members\" : \"\" ,\n    \"topic\" : \"\" ,\n    \"purpose\" : \"\" ,\n    \"last_read\" : \"1401383885.000061\" ,\n    \"latest\" : \"\" ,\n    \"unread_count\" : 0\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.info"]},{"relativeUri":"/channels.invite","methods":[{"description":"Invites a user to a channel.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"user":{"description":"User to invite to channel.","required":true,"example":"U1234567890","displayName":"user","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"id\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"name\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"created\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"creator\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"is_archived\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_member\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_general\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"last_read\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"latest\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"unread_count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"members\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"topic\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"value\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"last_set\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"purpose\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"value\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"last_set\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"channel\" : {\n    \"id\" : \"C024BE91L\" ,\n    \"name\" : \"fun\" ,\n    \"created\" : \"1360782804\" ,\n    \"creator\" : \"U024BE7LH\" ,\n    \"is_archived\" : false ,\n    \"is_member\" : true ,\n    \"is_general\" : false ,\n    \"last_read\" : \"1401383885.000061\" ,\n    \"latest\" : \"\" ,\n    \"unread_count\" : 0 ,\n    \"members\" : \"\" ,\n    \"topic\" : {\n      \"value\" : \"Fun times\" ,\n      \"creator\" : \"U024BE7LV\" ,\n      \"last_set\" : \"1369677212\"\n    } ,\n    \"purpose\" : {\n      \"value\" : \"This channel is for fun\" ,\n      \"creator\" : \"U024BE7LH\" ,\n      \"last_set\" : \"1360782804\"\n    }\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.invite"]},{"relativeUri":"/channels.join","methods":[{"description":"Joins a channel, creating it if needed.","queryParameters":{"name":{"description":"Name of channel to join","required":true,"displayName":"name","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"id\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"name\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"created\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"creator\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"is_archived\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_member\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"is_general\" : {\n          \"type\" : \"boolean\" ,\n          \"required\" : false\n        } ,\n        \"last_read\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"latest\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"unread_count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"members\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"topic\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"value\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"last_set\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"purpose\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"value\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"last_set\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"channel\" : {\n    \"id\" : \"C024BE91L\" ,\n    \"name\" : \"fun\" ,\n    \"created\" : \"1360782804\" ,\n    \"creator\" : \"U024BE7LH\" ,\n    \"is_archived\" : false ,\n    \"is_member\" : true ,\n    \"is_general\" : false ,\n    \"last_read\" : \"1401383885.000061\" ,\n    \"latest\" : \"\" ,\n    \"unread_count\" : 0 ,\n    \"members\" : \"\" ,\n    \"topic\" : {\n      \"value\" : \"Fun times\" ,\n      \"creator\" : \"U024BE7LV\" ,\n      \"last_set\" : \"1369677212\"\n    } ,\n    \"purpose\" : {\n      \"value\" : \"This channel is for fun\" ,\n      \"creator\" : \"U024BE7LH\" ,\n      \"last_set\" : \"1360782804\"\n    }\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.join"]},{"relativeUri":"/channels.leave","methods":[{"description":"Leaves a channel.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.leave"]},{"relativeUri":"/channels.list","methods":[{"description":"Lists all channels in a Slack team.","queryParameters":{"exclude_archived":{"description":"Don't return archived channels.","default":0,"example":1,"displayName":"exclude_archived","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channels\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"name\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"created\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_archived\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"is_member\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"num_members\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"topic\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            } ,\n            \"purpose\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"channels\" : [\n    {\n      \"id\" : \"C024BE91L\" ,\n      \"name\" : \"fun\" ,\n      \"created\" : \"1360782804\" ,\n      \"creator\" : \"U024BE7LH\" ,\n      \"is_archived\" : false ,\n      \"is_member\" : false ,\n      \"num_members\" : 6 ,\n      \"topic\" : {\n        \"value\" : \"Fun times\" ,\n        \"creator\" : \"U024BE7LV\" ,\n        \"last_set\" : \"1369677212\"\n      } ,\n      \"purpose\" : {\n        \"value\" : \"This channel is for fun\" ,\n        \"creator\" : \"U024BE7LH\" ,\n        \"last_set\" : \"1360782804\"\n      }\n    } \n  ]\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.list"]},{"type":{"markType":{"resourceName":"Channel"}},"relativeUri":"/channels.mark","methods":[{"queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"ts":{"description":"Timestamp of the most recently seen message.","required":true,"example":1234567890.123456,"displayName":"ts","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true\n}"}}}},"description":"Sets the read cursor in a channel.","protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.mark"]},{"type":{"setPurposeType":{"resourceName":"Channel"}},"relativeUri":"/channels.setPurpose","methods":[{"description":"Sets the purpose for a channel.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"purpose":{"description":"The new purpose","required":true,"example":"My Purpose","displayName":"purpose","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"purpose\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"purpose\" : \"This is the new purpose!\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.setPurpose"]},{"relativeUri":"/channels.setTopic","methods":[{"description":"Sets the topic for a channel.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"topic":{"description":"The new topic","required":true,"example":"My Topic","displayName":"topic","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"topic\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"topic\" : \"This is the new topic!\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["channels.setTopic"]},{"relativeUri":"/chat.delete","methods":[{"description":"Deletes a message.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"ts":{"description":"Timestamp of the most recently seen message.","required":true,"example":1234567890.123456,"displayName":"ts","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"ts\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"ts\" : \"1405895017.000506\" ,\n  \"channel\" : \"C024BE91L\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["chat.delete"]},{"relativeUri":"/chat.postMessage","methods":[{"description":"Sends a message to a channel.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"text":{"description":"Text of the message to send. See below for an explanation of formatting.","required":true,"example":"Hello world","displayName":"text","type":"string"},"username":{"description":"Name of bot.","example":"My Bot","displayName":"username","type":"string"},"parse":{"description":"Change how messages are treated. See below.","example":"full","displayName":"parse","type":"string"},"link_names":{"description":"Find and link channel names and usernames.","example":1,"displayName":"link_names","type":"string"},"unfurl_links":{"description":"Pass 1 to enable unfurling of primarily text-based content.","example":1,"displayName":"unfurl_links","type":"string"},"icon_url":{"description":"URL to an image to use as the icon for this message","example":"http://lorempixel.com/48/48","displayName":"icon_url","type":"string"},"icon_emoji":{"description":"emoji to use as the icon for this message. Overrides icon_url.","example":":chart_with_upwards_trend:","displayName":"icon_emoji","type":"string"},"attachments":{"description":"Structured message attachments.","displayName":"attachments","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"ts\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"ts\" : \"1405895017.000506\" ,\n  \"channel\" : \"C024BE91L\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["chat.postMessage"]},{"relativeUri":"/chat.update","methods":[{"description":"Updates a message.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"text":{"description":"Text of the message to send. See below for an explanation of formatting.","required":true,"example":"Hello world","displayName":"text","type":"string"},"ts":{"description":"Timestamp of the most recently seen message.","required":true,"example":1234567890.123456,"displayName":"ts","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"channel\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"ts\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"text\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"channel\" : \"C024BE91L\" ,\n  \"ts\" : \"1401383885.000061\" ,\n  \"text\" : \"Updated Text\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["chat.update"]},{"relativeUri":"/emoji.list","methods":[{"description":"Lists custom emoji for a team.","responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"emoji\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"bowtie\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"squirrel\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        } ,\n        \"shipit\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"emoji\" : {\n    \"bowtie\" : \"https://my.slack.com/emoji/bowtie/46ec6f2bb0.png\" ,\n    \"squirrel\" : \"https://my.slack.com/emoji/squirrel/f35f40c0e0.png\" ,\n    \"shipit\" : \"alias:squirrel\"\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["emoji.list"]},{"relativeUri":"/files.info","methods":[{"description":"Gets information about a team file.","queryParameters":{"file":{"description":"File to fetch info for","required":true,"example":"F1234567890","displayName":"file","type":"string"},"count":{"description":"Number of items to return per page.","type":"number","default":100,"example":100,"displayName":"count"},"page":{"description":"Page number of results to return.","type":"number","default":1,"example":2,"displayName":"page"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"file\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"file\" : {}\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["files.info"]},{"relativeUri":"/files.list","methods":[{"description":"Lists and filters team files.","queryParameters":{"file":{"description":"File to fetch info for","required":true,"example":"F1234567890","displayName":"file","type":"string"},"user":{"description":"Filter files created by a single user.","example":"U1234567890","displayName":"user","type":"string"},"ts_from":{"description":"Filter files created after this timestamp (inclusive).","default":0,"example":123456789,"displayName":"ts_from","type":"string"},"ts_to":{"description":"Filter files created before this timestamp (inclusive).","default":"now","example":123456789,"displayName":"ts_to","type":"string"},"types":{"description":"You can pass multiple values in the types argument, like types=posts,snippets.The default value is all, which does not filter the list.","enum":["pdfs","zips","posts","images","snippets","gdocs","all"],"displayName":"types","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"files\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"paging\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"page\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"pages\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"files\" : \"\" ,\n  \"paging\" : {\n    \"count\" : 100 ,\n    \"total\" : 295 ,\n    \"page\" : 1 ,\n    \"pages\" : 3\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["files.list"]},{"relativeUri":"/files.upload","methods":[{"description":"Uploads or creates a file.","queryParameters":{"file":{"description":"File contents via multipart/form-data.","displayName":"file","type":"string"},"content":{"description":"File contents via a POST var.","displayName":"content","type":"string"},"filetype":{"description":"Slack-internal file type identifier.","example":"php","displayName":"filetype","type":"string"},"filename":{"description":"Filename of file.","example":"foo.txt","displayName":"filename","type":"string"},"title":{"description":"Title of file.","example":"My File","displayName":"title","type":"string"},"initial_comment":{"description":"Initial comment to add to file.","example":"Best!","displayName":"initial_comment","type":"string"},"channels":{"description":"Comma separated list of channels to share the file into.","example":"C1234567890","displayName":"channels","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"file\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"file\" : {}\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["files.upload"]},{"type":{"historyType":{"resourceName":"Group"}},"relativeUri":"/groups.history","methods":[{"queryParameters":{"channel":{"description":"Group to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"latest":{"description":"Timestamp of the oldest recent seen message.","default":"now","example":1234567890.123456,"displayName":"latest","type":"string"},"oldest":{"description":"Timestamp of the latest previously seen message.","default":0,"example":1234567890.123456,"displayName":"oldest","type":"string"},"count":{"description":"Number of messages to return, between 1 and 1000.","type":"number","default":100,"example":100,"displayName":"count"},"has_more":{"type":"boolean","displayName":"has_more"},"is_limited":{"type":"boolean","displayName":"is_limited"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"latest\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_starred\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"wibblr\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    } ,\n    \"has_more\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"latest\" : \"1358547726.000003\" ,\n  \"messages\" : [\n    {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000008\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"Hello\"\n    } , {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"World\" ,\n      \"is_starred\" : true\n    } , {\n      \"type\" : \"something_else\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"wibblr\" : true\n    }\n  ] ,\n  \"has_more\" : false\n}"}}}},"description":"Fetches history of messages and events from a private group.","protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["groups.history"]},{"relativeUri":"/groups.list","methods":[{"description":"Lists private groups that the calling user has access to.","queryParameters":{"exclude_archived":{"description":"Don't return archived channels.","default":0,"example":1,"displayName":"exclude_archived","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"groups\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"name\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"created\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"creator\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_archived\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"members\" : {\n              \"type\" : \"array\" ,\n              \"required\" : false ,\n              \"items\" : [\n                {\n                  \"type\" : \"string\"\n                }\n              ]\n            } ,\n            \"topic\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            } ,\n            \"purpose\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"value\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"creator\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_set\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"groups\" : [\n    {\n      \"id\" : \"G024BE91L\" ,\n      \"name\" : \"secretplans\" ,\n      \"created\" : \"1360782804\" ,\n      \"creator\" : \"U024BE7LH\" ,\n      \"is_archived\" : false ,\n      \"members\" : [\n        \"U024BE7LH\"\n      ] ,\n      \"topic\" : {\n        \"value\" : \"Secret plans on hold\" ,\n        \"creator\" : \"U024BE7LV\" ,\n        \"last_set\" : \"1369677212\"\n      } ,\n      \"purpose\" : {\n        \"value\" : \"Discuss secret plans that no-one else should know\" ,\n        \"creator\" : \"U024BE7LH\" ,\n        \"last_set\" : \"1360782804\"\n      }\n    }\n  ]\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["groups.list"]},{"type":{"markType":{"resourceName":"Group"}},"relativeUri":"/groups.mark","methods":[{"queryParameters":{"channel":{"description":"Group to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"ts":{"description":"Timestamp of the most recently seen message.","required":true,"example":1234567890.123456,"displayName":"ts","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true\n}"}}}},"description":"Sets the read cursor in a private group.","protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["groups.mark"]},{"type":{"setPurposeType":{"resourceName":"Group"}},"relativeUri":"/groups.setPurpose","methods":[{"description":"Sets the purpose for a private group.","queryParameters":{"channel":{"description":"Group to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"purpose":{"description":"The new purpose","required":true,"example":"My Purpose","displayName":"purpose","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"purpose\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"purpose\" : \"This is the new purpose!\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["groups.setPurpose"]},{"relativeUri":"/groups.setTopic","methods":[{"description":"Sets the topic for a private group.","queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"topic":{"description":"The new topic","required":true,"example":"My Topic","displayName":"topic","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"topic\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"topic\" : \"This is the new topic!\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["groups.setTopic"]},{"type":{"historyType":{"resourceName":"Direct message channel"}},"relativeUri":"/im.history","methods":[{"queryParameters":{"channel":{"description":"Direct message channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"latest":{"description":"Timestamp of the oldest recent seen message.","default":"now","example":1234567890.123456,"displayName":"latest","type":"string"},"oldest":{"description":"Timestamp of the latest previously seen message.","default":0,"example":1234567890.123456,"displayName":"oldest","type":"string"},"count":{"description":"Number of messages to return, between 1 and 1000.","type":"number","default":100,"example":100,"displayName":"count"},"has_more":{"type":"boolean","displayName":"has_more"},"is_limited":{"type":"boolean","displayName":"is_limited"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"latest\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"text\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"is_starred\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"ts\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"wibblr\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    } ,\n    \"has_more\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"latest\" : \"1358547726.000003\" ,\n  \"messages\" : [\n    {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000008\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"Hello\"\n    } , {\n      \"type\" : \"message\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"user\" : \"U2147483896\" ,\n      \"text\" : \"World\" ,\n      \"is_starred\" : true\n    } , {\n      \"type\" : \"something_else\" ,\n      \"ts\" : \"1358546515.000007\" ,\n      \"wibblr\" : true\n    }\n  ] ,\n  \"has_more\" : false\n}"}}}},"description":"Fetches history of messages and events from direct message channel.","protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["im.history"]},{"relativeUri":"/im.list","methods":[{"description":"Lists direct message channels for the calling user.","responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"ims\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"user\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"created\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"is_user_deleted\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"ims\" : [\n    {\n      \"id\" : \"D024BFF1M\" ,\n      \"user\" : \"USLACKBOT\" ,\n      \"created\" : 1372105335 ,\n      \"is_user_deleted\" : false\n    } , {\n      \"id\" : \"D024BE7RE\" ,\n      \"user\" : \"U024BE7LH\" ,\n      \"created\" : 1356250715 ,\n      \"is_user_deleted\" : false\n    }\n  ]\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["im.list"]},{"type":{"markType":{"resourceName":"Direct message channel"}},"relativeUri":"/im.mark","methods":[{"queryParameters":{"channel":{"description":"Channel to fetch history for.","required":true,"example":"C1234567890","displayName":"channel","type":"string"},"ts":{"description":"Timestamp of the most recently seen message.","required":true,"example":1234567890.123456,"displayName":"ts","type":"string"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true\n}"}}}},"description":"Sets the read cursor in a direct message channel.","protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["im.mark"]},{"relativeUri":"/search.all","methods":[{"description":"Searches for messages and files matching a query.","queryParameters":{"query":{"description":"Search query. May contains booleans, etc.","required":true,"example":"pickleface","displayName":"query","type":"string"},"sort":{"description":"Return matches sorted by either score or timestamp.","enum":["timestamp","score"],"default":"score","example":"timestamp","displayName":"sort","type":"string"},"sort_dir":{"description":"Change sort direction to ascending (asc) or descending (desc).","enum":["desc","asc"],"default":"desc","example":"asc","displayName":"sort_dir","type":"string"},"highlight":{"description":"Pass a value of 1 to enable query highlight markers .","example":1,"displayName":"highlight","type":"string"},"count":{"description":"Number of items to return per page.","type":"number","default":100,"example":100,"displayName":"count"},"page":{"description":"Page number of results to return.","type":"number","default":1,"example":2,"displayName":"page"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"query\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"files\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"query\" : \"Best Pickles\" ,\n  \"messages\" : \"\" ,\n  \"files\" : \"\"\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["search.all"]},{"relativeUri":"/search.files","methods":[{"description":"Searches for files matching a query.","queryParameters":{"query":{"description":"Search query. May contains booleans, etc.","required":true,"example":"pickleface","displayName":"query","type":"string"},"sort":{"description":"Return matches sorted by either score or timestamp.","enum":["timestamp","score"],"default":"score","example":"timestamp","displayName":"sort","type":"string"},"sort_dir":{"description":"Change sort direction to ascending (asc) or descending (desc).","enum":["desc","asc"],"default":"desc","example":"asc","displayName":"sort_dir","type":"string"},"highlight":{"description":"Pass a value of 1 to enable query highlight markers .","example":1,"displayName":"highlight","type":"string"},"count":{"description":"Number of items to return per page.","type":"number","default":100,"example":100,"displayName":"count"},"page":{"description":"Page number of results to return.","type":"number","default":1,"example":2,"displayName":"page"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"query\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"files\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"paging\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"count\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"total\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"page\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"pages\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"matches\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"query\" : \"test\" ,\n  \"files\" : {\n    \"total\" : 829 ,\n    \"paging\" : {\n      \"count\" : 20 ,\n      \"total\" : 829 ,\n      \"page\" : 1 ,\n      \"pages\" : 42\n    } ,\n    \"matches\" : \"\"\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["search.files"]},{"relativeUri":"/search.messages","methods":[{"description":"Searches for messages matching a query.","queryParameters":{"query":{"description":"Search query. May contains booleans, etc.","required":true,"example":"pickleface","displayName":"query","type":"string"},"sort":{"description":"Return matches sorted by either score or timestamp.","enum":["timestamp","score"],"default":"score","example":"timestamp","displayName":"sort","type":"string"},"sort_dir":{"description":"Change sort direction to ascending (asc) or descending (desc).","enum":["desc","asc"],"default":"desc","example":"asc","displayName":"sort_dir","type":"string"},"highlight":{"description":"Pass a value of 1 to enable query highlight markers .","example":1,"displayName":"highlight","type":"string"},"count":{"description":"Number of items to return per page.","type":"number","default":100,"example":100,"displayName":"count"},"page":{"description":"Page number of results to return.","type":"number","default":1,"example":2,"displayName":"page"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"query\" : {\n      \"type\" : \"string\" ,\n      \"required\" : false\n    } ,\n    \"messages\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"paging\" : {\n          \"type\" : \"object\" ,\n          \"required\" : false ,\n          \"properties\" : {\n            \"count\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"total\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"page\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            } ,\n            \"pages\" : {\n              \"type\" : \"number\" ,\n              \"required\" : false\n            }\n          }\n        } ,\n        \"matches\" : {\n          \"type\" : \"string\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"query\" : \"test\" ,\n  \"messages\" : {\n    \"total\" : 829 ,\n    \"paging\" : {\n      \"count\" : 20 ,\n      \"total\" : 829 ,\n      \"page\" : 1 ,\n      \"pages\" : 42\n    } ,\n    \"matches\" : \"\"\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["search.messages"]},{"relativeUri":"/stars.list","methods":[{"description":"Lists stars for a user.","queryParameters":{"user":{"description":"Show stars by this user. Defaults to the authed user.","example":"U1234567890","displayName":"user","type":"string"},"count":{"description":"Number of items to return per page.","type":"number","default":100,"example":100,"displayName":"count"},"page":{"description":"Page number of results to return.","type":"number","default":1,"example":2,"displayName":"page"}},"responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"items\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"channel\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"message\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"file\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"file\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"comment\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        } , {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"type\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"channel\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    } ,\n    \"paging\" : {\n      \"type\" : \"object\" ,\n      \"required\" : false ,\n      \"properties\" : {\n        \"count\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"total\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"page\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        } ,\n        \"pages\" : {\n          \"type\" : \"number\" ,\n          \"required\" : false\n        }\n      }\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"items\" : [\n    {\n      \"type\" : \"message\" ,\n      \"channel\" : \"C2147483705\" ,\n      \"message\" : \"\"\n    } , {\n      \"type\" : \"file\" ,\n      \"file\" : \"\"\n    } , {\n      \"type\" : \"file_comment\" ,\n      \"file\" : \"\" ,\n      \"comment\" : \"\"\n    } , {\n      \"type\" : \"channel\" ,\n      \"channel\" : \"C2147483705\"\n    }\n  ] ,\n  \"paging\" : {\n    \"count\" : 100 ,\n    \"total\" : 4 ,\n    \"page\" : 1 ,\n    \"pages\" : 1\n  }\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["stars.list"]},{"relativeUri":"/users.list","methods":[{"description":"Lists all users in a Slack team.","responses":{"200":{"body":{"application/json":{"schema":"{\n  \"required\" : true ,\n  \"$schema\" : \"http://json-schema.org/draft-03/schema\" ,\n  \"type\" : \"object\" ,\n  \"properties\" : {\n    \"ok\" : {\n      \"type\" : \"boolean\" ,\n      \"required\" : false\n    } ,\n    \"members\" : {\n      \"type\" : \"array\" ,\n      \"required\" : false ,\n      \"items\" : [\n        {\n          \"type\" : \"object\" ,\n          \"properties\" : {\n            \"id\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"name\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"deleted\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"color\" : {\n              \"type\" : \"string\" ,\n              \"required\" : false\n            } ,\n            \"profile\" : {\n              \"type\" : \"object\" ,\n              \"required\" : false ,\n              \"properties\" : {\n                \"first_name\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"last_name\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"real_name\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"email\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"skype\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"phone\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_24\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_32\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_48\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_72\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                } ,\n                \"image_192\" : {\n                  \"type\" : \"string\" ,\n                  \"required\" : false\n                }\n              }\n            } ,\n            \"is_admin\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"is_owner\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            } ,\n            \"has_files\" : {\n              \"type\" : \"boolean\" ,\n              \"required\" : false\n            }\n          }\n        }\n      ]\n    }\n  }\n}","example":"{\n  \"ok\" : true ,\n  \"members\" : [\n    {\n      \"id\" : \"U023BECGF\" ,\n      \"name\" : \"bobby\" ,\n      \"deleted\" : false ,\n      \"color\" : \"9f69e7\" ,\n      \"profile\" : {\n        \"first_name\" : \"Bobby\" ,\n        \"last_name\" : \"Tables\" ,\n        \"real_name\" : \"Bobby Tables\" ,\n        \"email\" : \"bobby@slack.com\" ,\n        \"skype\" : \"my-skype-name\" ,\n        \"phone\" : \"+1 (123) 456 7890\" ,\n        \"image_24\" : \"https://...\" ,\n        \"image_32\" : \"https://...\" ,\n        \"image_48\" : \"https://...\" ,\n        \"image_72\" : \"https://...\" ,\n        \"image_192\" : \"https://...\"\n      } ,\n      \"is_admin\" : true ,\n      \"is_owner\" : true ,\n      \"has_files\" : true\n    }\n  ]\n}"}}}},"protocols":["HTTPS"],"method":"get","securedBy":["oauth_2_0"]}],"relativeUriPathSegments":["users.list"]}]}};/*APIENCODEDEND*/
declaration():RamlWrapper.Api{var api : RamlWrapper.Api = new RamlWrapper.Api(<any>this.apiEncoded.data); endpoints.setApi(api); return api;}
authentificate(schemaName:string, options?:any){}
log(vName:string,val:any){this.inv.log(vName,val);return val;}baseUrlResolved():string{
        var burl=this.baseUrl;
        
        return burl;
        }
            private inv:executor.APIExecutor
            private options:any
            
        invoke(path:string,method:string,obj:any){
            env.registerApi(this.declaration())
            return this.inv.execute(this.baseUrlResolved()+path,method,obj)
        }
            authenticate(schemaName?:string,options?:any):any{return null;}
            constructor(){
            this.inv=new executor.APIExecutor(this.declaration(),this.baseUrlResolved(),<any>this.cfgEncoded);
            
            }
channels_history=new Channels_historyResourceImpl(this)
channels_info=new Channels_infoResourceImpl(this)
channels_invite=new Channels_inviteResourceImpl(this)
channels_join=new Channels_joinResourceImpl(this)
channels_leave=new Channels_leaveResourceImpl(this)
channels_list=new Channels_listResourceImpl(this)
channels_mark=new Channels_markResourceImpl(this)
channels_setPurpose=new Channels_setPurposeResourceImpl(this)
channels_setTopic=new Channels_setTopicResourceImpl(this)
chat_delete=new Chat_deleteResourceImpl(this)
chat_postMessage=new Chat_postMessageResourceImpl(this)
chat_update=new Chat_updateResourceImpl(this)
emoji_list=new Emoji_listResourceImpl(this)
files_info=new Files_infoResourceImpl(this)
files_list=new Files_listResourceImpl(this)
files_upload=new Files_uploadResourceImpl(this)
groups_history=new Groups_historyResourceImpl(this)
groups_list=new Groups_listResourceImpl(this)
groups_mark=new Groups_markResourceImpl(this)
groups_setPurpose=new Groups_setPurposeResourceImpl(this)
groups_setTopic=new Groups_setTopicResourceImpl(this)
im_history=new Im_historyResourceImpl(this)
im_list=new Im_listResourceImpl(this)
im_mark=new Im_markResourceImpl(this)
search_all=new Search_allResourceImpl(this)
search_files=new Search_filesResourceImpl(this)
search_messages=new Search_messagesResourceImpl(this)
stars_list=new Stars_listResourceImpl(this)
users_list=new Users_listResourceImpl(this)

 /* type ending */ }

            
 var meta={}
