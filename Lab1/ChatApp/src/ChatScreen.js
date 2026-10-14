import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://10.0.2.2:3000', {
    transports: ['websocket'],
});

export default function ChatScreen({ route }) {
    const userName = route?.params?.userName || 'Guest';

    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Kết nối Socket thành công! ID:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.log('Lỗi kết nối Socket:', err.message);
        });

        socket.emit('join', { userName });

        socket.on('receiveMessage', (newMessage) => {
            setMessageList((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('receiveMessage');
        };
    }, [userName]);

    const handleSendMessage = () => {
        if (message.trim() === '') return;

        const messageData = {
            text: message,
            sender: userName,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        socket.emit('sendMessage', messageData);
        setMessage('');
    };

    const renderItem = ({ item }) => {
        const isMyMessage = item.sender === userName;

        const avatarUrl = isMyMessage
            ? "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482739Fzk/anh-mo-ta.png"
            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8_OCdXTTPSKdrE0AYcJiK5SJhpYfNKnXB7MrcbgfA3Emjes9qp6HLcRg&s=10";

        return (
            <View style={[styles.itemContainer, isMyMessage ? styles.myContainer : styles.otherContainer]}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />

                <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
                    {!isMyMessage && <Text style={styles.senderName}>{item.sender}</Text>}
                    <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
                    <Text style={isMyMessage ? styles.myTimeText : styles.otherTimeText}>{item.time}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messageList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingVertical: 10 }}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your message ..."
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    itemContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 10,
        alignItems: 'flex-end',
    },
    myContainer: {
        flexDirection: 'row-reverse',
        alignSelf: 'flex-end',
    },
    otherContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginHorizontal: 6,
    },
    messageBubble: {
        padding: 10,
        borderRadius: 16,
        maxWidth: '75%',
    },
    myMessage: {
        backgroundColor: '#2D8C7F',
        borderBottomRightRadius: 2,
    },
    otherMessage: {
        backgroundColor: '#e5e5ea',
        borderBottomLeftRadius: 2,
    },
    senderName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 3,
    },
    myMessageText: {
        color: '#fff',
        fontSize: 15,
    },
    otherMessageText: {
        color: '#000',
        fontSize: 15,
    },
    myTimeText: {
        fontSize: 10,
        color: '#e0e0e0',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    otherTimeText: {
        fontSize: 10,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#2D8C7F',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});