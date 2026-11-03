package com.batterybrightnessapp;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.ContentObserver;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.Window;
import android.view.WindowManager;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class BrightnessModule extends ReactContextBaseJavaModule {

    private ContentObserver brightnessObserver;

    public BrightnessModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "BrightnessModule";
    }

    @ReactMethod
    public void checkPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.System.canWrite(getReactApplicationContext()));
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.System.canWrite(getReactApplicationContext())) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS);
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
            }
        }
    }

    // Đọc độ sáng hệ thống và chuyển từ Tuyến tính -> Thị giác bằng Math.sqrt()
    @ReactMethod
    public void getBrightness(Promise promise) {
        try {
            int systemBrightness = Settings.System.getInt(
                getReactApplicationContext().getContentResolver(),
                Settings.System.SCREEN_BRIGHTNESS,
                128
            );
            float linear = systemBrightness / 255.0f;
            float perceptual = (float) Math.sqrt(linear); // Chuyển sang thang đo thị giác hệ thống
            promise.resolve(perceptual);
        } catch (Exception e) {
            promise.resolve(0.5f);
        }
    }

    // Ghi độ sáng và chuyển từ Thị giác -> Tuyến tính bằng Math.pow(val, 2)
    @ReactMethod
    public void setBrightness(final float brightnessValue, final Promise promise) {
        try {
            Context context = getReactApplicationContext();
            float perceptual = Math.max(0.01f, Math.min(brightnessValue, 1.0f));
            
            // Quy đổi ngược về thang đo tuyến tính để ghi vào hệ thống Android
            float linear = (float) Math.pow(perceptual, 2);
            int brightnessInt = Math.round(linear * 255);

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.System.canWrite(context)) {
                Settings.System.putInt(
                    context.getContentResolver(),
                    Settings.System.SCREEN_BRIGHTNESS,
                    brightnessInt
                );
            }

            final Activity currentActivity = getCurrentActivity();
            if (currentActivity != null) {
                currentActivity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            Window window = currentActivity.getWindow();
                            WindowManager.LayoutParams layoutParams = window.getAttributes();
                            layoutParams.screenBrightness = perceptual;
                            window.setAttributes(layoutParams);
                        } catch (Exception ignored) {}
                    }
                });
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("BRIGHTNESS_ERROR", e.getMessage());
        }
    }

    // Lắng nghe độ sáng hệ thống và quy đổi căn bậc 2 trước khi gửi về React Native
    @ReactMethod
    public void startListening() {
        if (brightnessObserver != null) return;

        brightnessObserver = new ContentObserver(new Handler(Looper.getMainLooper())) {
            @Override
            public void onChange(boolean selfChange, Uri uri) {
                super.onChange(selfChange, uri);
                try {
                    int systemBrightness = Settings.System.getInt(
                        getReactApplicationContext().getContentResolver(),
                        Settings.System.SCREEN_BRIGHTNESS,
                        128
                    );
                    float linear = systemBrightness / 255.0f;
                    float perceptual = (float) Math.sqrt(linear); // Quy đổi căn bậc 2

                    WritableMap params = Arguments.createMap();
                    params.putDouble("brightness", perceptual);

                    if (getReactApplicationContext().hasActiveReactInstance()) {
                        getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onBrightnessChanged", params);
                    }
                } catch (Exception ignored) {}
            }
        };

        Uri brightnessUri = Settings.System.getUriFor(Settings.System.SCREEN_BRIGHTNESS);
        getReactApplicationContext().getContentResolver().registerContentObserver(
            brightnessUri,
            false,
            brightnessObserver
        );
    }

    @ReactMethod
    public void stopListening() {
        if (brightnessObserver != null) {
            try {
                getReactApplicationContext().getContentResolver().unregisterContentObserver(brightnessObserver);
            } catch (Exception ignored) {}
            brightnessObserver = null;
        }
    }
}