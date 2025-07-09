import React, { useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {

  const {messages, selectedUser, setSelectedUser,sendMessage, getMessages} = useContext(ChatContext)

  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef()

  const [input, setInput] = useState('');

  const handleSendMessage = async(e)=>{
    e.preventDefault();
    if(input.trim()==="") return;
    
    console.log('Sending message:', input.trim(), 'to user:', selectedUser._id);
    
    try {
      await sendMessage({text:input.trim()});
      setInput("");
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }

  const handleSendImage = async(e) =>{
    const file = e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("Please select a valid image file")
      return;
    }
    
    // Check file size (4MB limit)
    if(file.size > 4 * 1024 * 1024) {
      toast.error("Image size must be less than 4MB")
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = async()=>{
      try {
        await sendMessage({image: reader.result})
        e.target.value = ""
      } catch (error) {
        console.error('Error sending image:', error);
        toast.error('Failed to send image');
      }
    }
    reader.onerror = () => {
      toast.error('Error reading image file');
    }
    reader.readAsDataURL(file)
  }

  useEffect(()=>{
    if(selectedUser){
      getMessages(selectedUser._id)
    }
  },[selectedUser])


  useEffect(()=>{
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({behavior: 'smooth'})
    }
  },[messages])

  // Check if selected user is online
  const isUserOnline = selectedUser && onlineUsers?.includes(selectedUser._id);


  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
        <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
            <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
            <p className='flex-1 text-lg text-white flex items-center gap-2'>
                {selectedUser.fullName || 'Unknown User'}
                {isUserOnline ? (
                    <span className='w-2 h-2 rounded-full bg-green-500'></span>
                ) : (
                    <span className='w-2 h-2 rounded-full bg-gray-400'></span>
                )}
            </p>
            <img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7'/>
            <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />
        </div>
        <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
            {messages && messages.length > 0 ? (
                messages.map((msg,index)=>(
                    <div key={msg._id || index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
                      {msg.image ?(
                        <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
                      ) : (
                        <p  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${ msg.senderId === authUser._id ? 'rounded-br-none': 'rounded-bl-none'}`}>{msg.text}</p>
                      )}

                      <div className='text-center text-xs'>
                        <img src={msg.senderId === authUser._id ? authUser?.profilePic ||  assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-7 rounded-full' />
                        <p className='text-gray-500'>{formatMessageTime( msg.createdAt)}</p>
                      </div>
                    </div>
                ))
            ) : (
                <div className='text-center text-gray-400 py-8'>
                    <p>No messages yet. Start a conversation!</p>
                </div>
            )}
            <div ref={scrollEnd}></div>
        </div>
        <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
            <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
              <input onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=>e.key ==="Enter" ? handleSendMessage(e): null} type="text" placeholder='Send A message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' />
              <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
              <label htmlFor="image">
                <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
              </label>
            </div>
            <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
        </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
        <img src={assets.logo_icon} className='max-w-16' alt="" />
        <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer