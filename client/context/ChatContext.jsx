import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);


    //function to get all users for sidebar
    const getUsers = async()=>{
        try {
           const {data} = await axios.get("/api/messages/users");
              if(data.success){
                 setUsers(data.users);
                 setUnseenMessages(data.unseenMessages);
              }
        } catch (error) {
            toast.error(error.message)
        }
    }
    //function to get all messages for selected user
    const getMessages = async(UserId)=>{
      try {
         const {data}= await axios.get(`/api/messages/${UserId}`);
       if(data.success){
          setMessages(data.messages);
       }
      } catch (error) {
        toast.error(error.message)
      }
    }
    //function to send message to selected user
    const sendMessage = async(messageData)=>{
        if (!selectedUser) {
            toast.error('No user selected');
            return;
        }
        
        try {
            console.log('ChatContext: Sending message to:', selectedUser._id, 'with data:', messageData);
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            console.log('ChatContext: Server response:', data);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage]);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe to messages for selected user
    const subscribeToMessages = ()=>{
        if(!socket) return;
        socket.on("newMessage",(newMessage)=>{
            if (selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages, newMessage]);
                // Mark message as seen
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(err => 
                    console.error('Failed to mark message as seen:', err)
                );
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId]+1 : 1
                }))
            }
        })
    }


    //function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return()=> unsubscribeFromMessages();
    },[socket, selectedUser])

    // Load messages when selectedUser changes
    useEffect(()=>{
        if(selectedUser){
            getMessages(selectedUser._id);
            // Clear unseen messages for selected user
            setUnseenMessages(prev => ({
                ...prev,
                [selectedUser._id]: 0
            }));
        } else {
            setMessages([]);
        }
    },[selectedUser])




    const value ={
        messages,
        users, 
        selectedUser, 
        getUsers, 
        getMessages,
        setMessages, 
        sendMessage,
        setSelectedUser, 
        unseenMessages, 
        setUnseenMessages
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}