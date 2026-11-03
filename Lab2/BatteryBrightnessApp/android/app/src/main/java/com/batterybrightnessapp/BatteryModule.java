package com.batterybrightnessapp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class BatteryModule extends ReactContextBaseJavaModule {

    private BroadcastReceiver batteryReceiver;

    public BatteryModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "BatteryModule";
    }

    // Lấy phần trăm pin ban đầu
    @ReactMethod
    public void getBatteryLevel(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = context.registerReceiver(null, ifilter);

            if (batteryStatus != null) {
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                float batteryPct = (level / (float) scale) * 100;
                promise.resolve((int) batteryPct);
            } else {
                promise.reject("BATTERY_ERROR", "Không thể lấy thông tin pin.");
            }
        } catch (Exception e) {
            promise.reject("BATTERY_ERROR", e.getMessage());
        }
    }

    // Đăng ký sự kiện tự động lắng nghe khi Android đổi % Pin (Event-driven)
    @ReactMethod
    public void startListening() {
        if (batteryReceiver != null)
            return;

        batteryReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                int level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                float batteryPct = (level / (float) scale) * 100;

                WritableMap params = Arguments.createMap();
                params.putInt("level", (int) batteryPct);

                // Phát sự kiện "onBatteryLevelChanged" sang React Native
                getReactApplicationContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onBatteryLevelChanged", params);
            }
        };

        IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        getReactApplicationContext().registerReceiver(batteryReceiver, filter);
    }

    // Hủy đăng ký lắng nghe khi thoát ứng dụng
    @ReactMethod
    public void stopListening() {
        if (batteryReceiver != null) {
            try {
                getReactApplicationContext().unregisterReceiver(batteryReceiver);
            } catch (Exception ignored) {
            }
            batteryReceiver = null;
        }
    }
}