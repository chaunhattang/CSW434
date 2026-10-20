import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function HomeScreen({ navigation }) {
    const [name, setName] = useState('');

    const handleStartChat = () => {
        if (name.trim() === '') {
            Alert.alert('Error', 'Please enter your name.');
            return;
        }
        navigation.navigate('Chat', { userName: name });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Name</Text>
            <Text style={styles.subtitle}>Please enter your name to start the chat.</Text>

            <Text style={styles.titleInput}>Your Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={(text) => setName(text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleStartChat}>
                <Text style={styles.buttonText}>Start Chat</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 10,
    },
    titleInput: {
        color: '#2D8C7F',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        color: 'gray',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#2D8C7F',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});