import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, NativeModules, DeviceEventEmitter } from 'react-native';

const { BatteryModule } = NativeModules;

export default function BatteryScreen() {
    const [batteryLevel, setBatteryLevel] = useState(80);

    useEffect(() => {
        // 1. Lấy mức pin ban đầu khi vừa mở màn hình
        if (BatteryModule && BatteryModule.getBatteryLevel) {
            BatteryModule.getBatteryLevel()
                .then((level) => setBatteryLevel(level))
                .catch((err) => console.log('Lỗi lấy pin:', err));
        }

        // 2. Kích hoạt lắng nghe sự kiện từ Android Native
        if (BatteryModule && BatteryModule.startListening) {
            BatteryModule.startListening();
        }

        // 3. Lắng nghe sự kiện phát ra từ Java 
        const subscription = DeviceEventEmitter.addListener('onBatteryLevelChanged', (event) => {
            if (event && event.level !== undefined) {
                setBatteryLevel(event.level);
            }
        });

        // 4. Hủy lắng nghe khi unmount
        return () => {
            subscription.remove();
            if (BatteryModule && BatteryModule.stopListening) {
                BatteryModule.stopListening();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Battery</Text>

                {/* Khung chứa Pin */}
                <View style={styles.batteryOuter}>
                    {/* Thanh màu xanh tăng/giảm theo % pin */}
                    <View style={[styles.batteryFill, { height: `${batteryLevel}%` }]} />

                    {/* Chữ số % nằm tách biệt, CỐ ĐỊNH ở CHÍNH GIỮA viên pin và luôn MÀU TRẮNG */}
                    <View style={styles.centerTextContainer}>
                        <Text style={styles.percentText}>{batteryLevel}%</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: 240,
        height: 380,
        backgroundColor: '#192620',
        borderRadius: 24,
        paddingTop: 24,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    cardTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 24,
    },
    batteryOuter: {
        width: 150,
        height: 240,
        borderRadius: 24,
        backgroundColor: '#0f1713',
        justifyContent: 'flex-end', // Cột pin tăng từ đáy lên
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2d3f36',
        position: 'relative', // Cần thiết để căn vị trí tuyệt đối cho chữ
    },
    batteryFill: {
        width: '100%',
        backgroundColor: '#00e5a3',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    /* Vùng chứa chữ cố định ở chính giữa viên pin */
    centerTextContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Đảm bảo chữ luôn đè lên trên thanh màu xanh
    },
    percentText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff', // Cố định màu trắng
    },
    symbolText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff', // Cố định màu trắng
        marginTop: -4,
    },
});