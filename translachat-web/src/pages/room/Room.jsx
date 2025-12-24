// src/pages/Room.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getUserData } from '../../services/storageServices';
import apiClient from '../../services/apiClient';
import { Send, MessageSquare, ArrowLeft, Smile, Users, ChevronRight, ArrowLeftToLine } from 'lucide-react';
import LeaveConfirmationModal from './LeaveConfirmationModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../custom hooks/useToast';
import EmojiPicker from 'emoji-picker-react';
import { useResponsive } from '../../contexts/ResponsiveContext';


const SOCKET_URL = `${import.meta.env.VITE_SOCKET_URL}`;
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// --- Global Socket Instance ---
let socket;

const Room = () => {
    const { isMobile } = useResponsive();
    const { id: roomId } = useParams(); // Get the room ID from the URL
    const navigate = useNavigate();
    const currentUser = getUserData();

    // State for UI and Chat data
    const [roomName, setRoomName] = useState('Loading...');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isJoining, setIsJoining] = useState(true);
    const [memberNames, setMemberNames] = useState({});

    // NEW: Leave Confirmation State
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveModalRoom, setLeaveModalRoom] = useState(null);

    // Reference for auto-scrolling the chat box
    const messagesEndRef = useRef(null);
    const { showToast } = useToast();
    // NEW STATE: Toggle emoji picker visibility
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // NEW STATE: Presence & Typing

    const [onlineUsers, setOnlineUsers] = useState([]); // Array of user IDs

    const [typingUsers, setTypingUsers] = useState([]); // Array of {userId, name}

    const [isMembersOpen, setIsMembersOpen] = useState(false); // Sidebar toggle

    const typingTimeoutRef = useRef(null);


    // NEW HANDLER: Function to add the selected emoji to the input message
    const onEmojiClick = (emojiData) => {
        setInputMessage(prevInput => prevInput + emojiData.emoji);
        // Optional: Keep the picker open, or close it after selection
        // setShowEmojiPicker(false);
    };

    // --- Utility Functions ---

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getSenderName = (senderId) => {
        if (senderId === currentUser?._id) {
            return 'You';
        }
        // Look up the name from the populated map
        return memberNames[senderId] || `User (${senderId?.substring(0, 4)}...)`;
    };

    // --- Typing Logic ---

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputMessage(val);
        if (!socket || isJoining) return;
        // Emit typing event to server
        // console.log("Emitting typing for:", currentUser.name);
        socket.emit('typing', {
            roomId,
            userId: currentUser._id,
            name: currentUser.name
        });
        // Debounce: Clear existing "stop typing" timer
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        // Set new timer to emit "stopTyping" after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { roomId, userId: currentUser._id });
        }, 2000);
    };

    // --- API & Socket Initialization Effect ---
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchRoomDetails = async () => {
            try {
                const historyResponse = await apiClient.get(`${API_BASE_URL}/rooms/${roomId}`);
                const { name, history, members } = historyResponse.data.room;
                console.log(history, name);
                setRoomName(name)
                const initialMessages = history.map(msg => ({
                    ...msg,
                    translatedText: msg.translatedText || msg.originalText,
                    senderId: msg.sender._id || msg.sender
                }));
                setMessages(initialMessages);

                const namesMap = {};
                members.forEach(member => {
                    if (member._id && member.name) {
                        namesMap[member._id] = member.name;
                    }
                });
                setMemberNames(namesMap);

                // --- 1. Initialize Socket.IO Connection ---
                socket = io(SOCKET_URL, {
                    // Optional: You might pass the token here or configure it globally
                });

                // --- 2. Handle Connection Events ---
                socket.on('connect', () => {
                    console.log(`Connected to socket.io. Joining room: ${roomId}`);

                    // Emit the joinRoom event as defined in the backend (socketHandler.js)
                    socket.emit('joinRoom', {
                        roomId: roomId,
                        userId: currentUser._id,
                        preferredLanguage: currentUser.preferredLanguage || 'en' // Pass user's language
                    });

                    setIsJoining(false);
                });

                // --- 3. Handle Incoming Messages (Key Real-time Event) ---
                socket.on('newMessage', (message) => {
                    // Message object contains: senderId, translatedText, originalText, timestamp
                    console.log('New message received:', message);
                    setMessages(prevMessages => [...prevMessages, message]);
                });

                // --- 4. Handle Room Joined Confirmation ---
                socket.on('roomJoined', (data) => {
                    console.log('Room joined confirmation:', data);
                    // Fetch message history here (if you had the endpoint)
                    // setMessages(fetchedHistory);
                });

                socket.on('notification', (data) => {
                    console.log('Notification:', data);
                    // Display system messages, e.g., "User joined"
                });

                // Update presence list
                socket.on('updateMemberList', (onlineIds) => {
                    setOnlineUsers(onlineIds);
                });
                // Typing Indicators
                socket.on('userTyping', ({ userId, name }) => {
                    if (userId === currentUser._id) return;
                    setTypingUsers(prev => {
                        if (prev.find(u => u.userId === userId)) return prev;
                        return [...prev, { userId, name }];
                    });
                });
                socket.on('userStoppedTyping', ({ userId }) => {
                    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
                });

            } catch (error) {
                console.error('Error setting up chat room:', error);
                const status = error.response?.status;
                if (status === 404 || status === 403) {
                    showToast("Cannot access this room.", 'error');
                }
                navigate('/rooms'); // Navigate back on critical error
            }
        };

        fetchRoomDetails();

        // --- 5. Cleanup Function (Runs when component unmounts) ---
        return () => {
            if (socket) {
                socket.disconnect();
                console.log('Socket disconnected on component unmount.');
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [roomId, currentUser._id, navigate]); // Depend on roomId, user, and navigate

    // --- Auto-Scroll Effect ---
    useEffect(scrollToBottom, [messages, roomId, typingUsers]);

    // --- Message Sending Handler ---
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() === '' || !socket || isJoining) return;

        // Emit the sendMessage event as defined in the backend
        socket.emit('sendMessage', {
            roomId: roomId,
            originalText: inputMessage.trim()
        });

        // Immediately stop typing status on send
        socket.emit('stopTyping', { roomId, userId: currentUser._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        setInputMessage('');
        setShowEmojiPicker(false);
    };

    const handleLeaveRoom = async (roomId) => {
        try {
            // Assuming the leave endpoint is POST /rooms/:roomId/leave
            await apiClient.post(`/rooms/${roomId}/leave`);

            showToast('Successfully left the room!', 'success');
            setIsLeaveModalOpen(false);

            // Refetch the list to update the room's status (isJoined: false)
            navigate('/rooms')

        } catch (error) {
            showToast(`Failed to leave room: ${error.response?.data?.message || 'Server error'}`, 'error');
        }
    };

    const openLeaveDialog = () => {
        setLeaveModalRoom({ _id: roomId, name: roomName });
        setIsLeaveModalOpen(true);
    }


    // --- Layout and UI ---

    if (isJoining) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
                <Spinner size="xl" color="indigo" />
                <div className="mt-4 text-xl font-semibold text-indigo-400">
                    Establishing secure connection to chat room...
                </div>
            </div>
        );
    }

    const formatRoomName = (name) => {
        if (!name) return "";
        if (isMobile && name.length > 10) {
            return name.substring(0, 7) + "...";
        }
        return name;
    };

    return (
        <div className="flex flex-col h-full bg-gray-950 text-white">

            {/* Chat Header (Fixed height, no flex properties needed) */}
            <div className="p-4 border-b border-indigo-700 bg-gray-900 flex justify-between items-center shadow-md">
                <h2 className="text-xl font-bold text-indigo-400 flex items-center">
                    <button
                        onClick={() => navigate('/rooms')}
                        className={`p-2 mr-5 rounded-lg transition-colors bg-gray-800 text-indigo-400 hover:bg-gray-700`}
                        title="Back To Rooms"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <MessageSquare className="w-5 h-5 mr-2" /> {formatRoomName(roomName)}
                </h2>
                <div className="flex justify-end items-center">
                    <button
                        onClick={() => setIsMembersOpen(!isMembersOpen)}
                        className={`p-2 mx-5 rounded-lg transition-colors ${isMembersOpen ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-indigo-400 hover:bg-gray-700'}`}
                        title="Room Members"
                    >
                        <Users className="w-5 h-5" />
                    </button>
                    <button
                        onClick={openLeaveDialog}
                        className={`flex items-center p-2 rounded-lg border border-red-400 text-sm transition-colors bg-gray-800 text-red-400 hover:bg-gray-700`}
                        title="Leave This Room"
                    >
                        {!isMobile && <ArrowLeftToLine className="w-5 h-5 mr-1" />}
                        Exit Room
                    </button>
                </div>
            </div>

            {/* Message Display Area (The Scrollable area) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.senderId === currentUser._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-lg relative 
                            ${msg.senderId === currentUser._id
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600'
                                }`}
                        >
                            <p className="text-xs font-semibold mb-1 opacity-80">
                                {getSenderName(msg.senderId)}
                            </p>
                            <p className="text-sm">
                                {msg.translatedText || msg.originalText}
                            </p>
                            <span className="block mt-1 text-xs text-right opacity-60">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator Bar */}
            <div className="h-6 px-6 bg-transparent">
                {typingUsers.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
                        </div>
                        <span className="text-xs italic text-indigo-300">
                            {typingUsers.length <= 2
                                ? `${typingUsers.map(u => u.name).join(' & ')} is typing...`
                                : 'Several people are typing...'}
                        </span>
                    </div>
                )}
            </div>

            {/* Message Input Area (Fixed height, no flex properties needed) */}
            <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-indigo-700 bg-gray-900 flex items-center relative"
            >
                {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-4">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            // Customize the picker to fit your dark theme
                            theme="dark"
                            skinTonesDisabled={true}
                            width={300}
                            height={400}
                            // Use a custom style to match the indigo border/shadow
                            pickerStyle={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', border: '1px solid #4f46e5' }}
                        />
                    </div>
                )}

                {/* 2. Emoji Button */}
                <button
                    type="button" // Important: must be type="button" to prevent form submission
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="p-3 mr-2 bg-gray-800 text-indigo-400 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                    disabled={isJoining}
                >
                    <Smile className="w-5 h-5" />
                </button>
                <input
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                    disabled={isJoining}
                    className="flex-1 px-4 py-3 mr-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                    type="submit"
                    disabled={inputMessage.trim() === '' || isJoining}
                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:bg-indigo-400"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>

            {isLeaveModalOpen && leaveModalRoom && (
                <LeaveConfirmationModal
                    room={leaveModalRoom}
                    onConfirm={handleLeaveRoom}
                    onClose={() => setIsLeaveModalOpen(false)}
                />
            )}

            {/* --- ROOM MEMBERS OVERLAY --- */}
            {isMembersOpen && (
                <>
                    {/* 1. Backdrop: Dims the background and closes the menu on click */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setIsMembersOpen(false)}
                    />

                    {/* 2. The Drawer: Slides in from the right */}
                    <div className={`
            fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-indigo-700 
            shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
            flex flex-col
            ${isMembersOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>

                        {/* Drawer Header */}
                        <div className="p-5 border-b border-indigo-700 flex justify-between items-center bg-gray-800/50">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 mr-3 text-indigo-400" />
                                <h3 className="font-bold text-white uppercase text-sm tracking-widest">
                                    Room Members
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsMembersOpen(false)}
                                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" /> {/* This acts as your "Back" button */}
                            </button>
                        </div>

                        {/* Members List Container */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar pb-10">
                            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">
                                Online/Offline — {Object.keys(memberNames).length} members
                            </div>

                            {Object.entries(memberNames).map(([id, name]) => {
                                const isOnline = onlineUsers.includes(id);
                                return (
                                    <div key={id} className="flex items-center space-x-4 group">
                                        <div className="relative">
                                            {/* Avatar */}
                                            <div className="w-11 h-11 rounded-full bg-linear-to-br from-indigo-600 to-indigo-800 flex items-center justify-center font-bold text-white border-2 border-gray-800 shadow-lg capitalize">
                                                {name.charAt(0)}
                                            </div>
                                            {/* Status Indicator with Glow */}
                                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 
                                    ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-600'}`}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center">
                                                <p className={`text-sm font-semibold truncate ${isOnline ? 'text-white' : 'text-gray-400'}`}>
                                                    {name}
                                                </p>
                                                {id === currentUser._id && (
                                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-bold border border-indigo-500/30">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] font-medium text-gray-500 mt-0.5 italic">
                                                {isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Optional Footer: Information or quick actions */}
                        <div className="p-4 border-t border-indigo-900/50 bg-gray-950/50 text-center">
                            <p className="text-[10px] text-gray-600">
                                Real-time presence powered by Socket.io
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Room;