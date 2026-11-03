import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, NativeModules, DeviceEventEmitter, Alert } from 'react-native';
import Slider from '@react-native-community/slider';

const { BrightnessModule } = NativeModules;

export default function BrightnessScreen() {
    const [brightness, setBrightness] = useState(0.5);

    useEffect(() => {
        // 1. Kiểm tra và nhắc cấp quyền WRITE_SETTINGS nếu chưa có
        if (BrightnessModule && BrightnessModule.checkPermission) {
            BrightnessModule.checkPermission().then((hasPerm) => {
                if (!hasPerm && BrightnessModule.requestPermission) {
                    Alert.alert(
                        'Cấp quyền điều chỉnh độ sáng',
                        'Vui lòng gạt bật cho phép ứng dụng chỉnh sửa cài đặt hệ thống (Modify system settings).',
                        [
                            {
                                text: 'Mở Cài Đặt',
                                onPress: () => BrightnessModule.requestPermission(),
                            },
                        ]
                    );
                }
            });
        }

        // 2. Đọc độ sáng ban đầu từ hệ thống
        if (BrightnessModule && BrightnessModule.getBrightness) {
            BrightnessModule.getBrightness()
                .then((val) => {
                    if (typeof val === 'number' && val >= 0) {
                        setBrightness(val);
                    }
                })
                .catch((e) => console.log('Lỗi lấy độ sáng:', e));
        }

        // 3. Lắng nghe sự kiện kéo độ sáng từ hệ thống máy ảo
        if (BrightnessModule && BrightnessModule.startListening) {
            BrightnessModule.startListening();
        }

        const subscription = DeviceEventEmitter.addListener('onBrightnessChanged', (event) => {
            if (event && event.brightness !== undefined) {
                setBrightness(event.brightness);
            }
        });

        return () => {
            subscription.remove();
            if (BrightnessModule && BrightnessModule.stopListening) {
                BrightnessModule.stopListening();
            }
        };
    }, []);

    const handleSliderChange = (value) => {
        setBrightness(value);
        if (BrightnessModule && BrightnessModule.setBrightness) {
            BrightnessModule.setBrightness(value);
        }
    };

    const percentage = Math.round(brightness * 100);

    return (
        <View style={styles.container}>
            {/* Vòng tròn hiển thị % Độ sáng */}
            <View style={styles.topCard}>
                <View style={styles.sunContainer}>
                    <View style={[styles.ray, styles.rayTop]} />
                    <View style={[styles.ray, styles.rayBottom]} />
                    <View style={[styles.ray, styles.rayLeft]} />
                    <View style={[styles.ray, styles.rayRight]} />
                    <View style={[styles.ray, styles.rayTL]} />
                    <View style={[styles.ray, styles.rayTR]} />
                    <View style={[styles.ray, styles.rayBL]} />
                    <View style={[styles.ray, styles.rayBR]} />

                    <View style={styles.circle}>
                        <Text style={styles.circleText}>{percentage}%</Text>
                    </View>
                </View>
            </View>

            {/* Thanh Slider chỉnh độ sáng */}
            <View style={styles.bottomCard}>
                <Text style={styles.sliderLabel}>Brightness</Text>
                <View style={styles.sliderRow}>
                    <Text style={styles.sunIcon}>🔆</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0.01}
                        maximumValue={1.0}
                        value={brightness}
                        onValueChange={handleSliderChange}
                        minimumTrackTintColor="#2563eb"
                        maximumTrackTintColor="#fecdd3"
                        thumbTintColor="#2563eb"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f6',
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    topCard: {
        marginTop: 20,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    sunContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 4,
        borderColor: '#64748b',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    circleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#475569',
    },
    ray: {
        position: 'absolute',
        backgroundColor: '#64748b',
        borderRadius: 2,
    },
    rayTop: { width: 4, height: 10, top: 2 },
    rayBottom: { width: 4, height: 10, bottom: 2 },
    rayLeft: { width: 10, height: 4, left: 2 },
    rayRight: { width: 10, height: 4, right: 2 },
    rayTL: { width: 10, height: 4, top: 24, left: 16, transform: [{ rotate: '45deg' }] },
    rayTR: { width: 10, height: 4, top: 24, right: 16, transform: [{ rotate: '-45deg' }] },
    rayBL: { width: 10, height: 4, bottom: 24, left: 16, transform: [{ rotate: '-45deg' }] },
    rayBR: { width: 10, height: 4, bottom: 24, right: 16, transform: [{ rotate: '45deg' }] },
    bottomCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
    },
    sliderLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 12,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sunIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    slider: {
        flex: 1,
        height: 40,
    },
});