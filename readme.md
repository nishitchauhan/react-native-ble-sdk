# React Native BLE SDK

A simple JavaScript SDK wrapper for `react-native-ble-manager` to handle Bluetooth Low Energy (BLE) operations in React Native projects.

## Installation

### 1. Install the SDK

```sh
npm install react-native-ble-sdk
```

### 2. Install Peer Dependencies

Since this package relies on `react-native-ble-manager`, install it in your React Native project:

```sh
npm install react-native-ble-manager
```

### 3. Link Native Modules

For React Native 0.60 and above, auto-linking should work:

```sh
npx pod-install
```

For older versions, manually link the package:

```sh
react-native link react-native-ble-manager
```

## iOS Setup

Add the following permissions to your `Info.plist` file:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>We require Bluetooth access to connect to BLE devices.</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>We need Bluetooth access to communicate with peripherals.</string>
```

## Android Setup

Ensure the following permissions are in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
```

For Android 12+, update your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE"/>
```

And ensure you request runtime permissions.

## Usage

```typescript
import BLESDK from "react-native-ble-sdk";

// Start scanning for devices
BLESDK.scanDevices([], 10).then(() => console.log("Scanning started"));

// Stop scanning
BLESDK.stopScan().then(() => console.log("Scanning stopped"));

// Connect to a device
BLESDK.connect("DEVICE_ID").then(() => console.log("Connected"));

// Disconnect from a device
BLESDK.disconnect("DEVICE_ID").then(() => console.log("Disconnected"));

// Read characteristic
BLESDK.readCharacteristic(
  "DEVICE_ID",
  "SERVICE_UUID",
  "CHARACTERISTIC_UUID"
).then((data) => console.log("Read data:", data));

// Write characteristic
BLESDK.writeCharacteristic("DEVICE_ID", "SERVICE_UUID", "CHARACTERISTIC_UUID", [
  0x01,
]).then(() => console.log("Write successful"));

// Start notification
BLESDK.startNotification(
  "DEVICE_ID",
  "SERVICE_UUID",
  "CHARACTERISTIC_UUID"
).then(() => console.log("Notification started"));

// Stop notification
BLESDK.stopNotification(
  "DEVICE_ID",
  "SERVICE_UUID",
  "CHARACTERISTIC_UUID"
).then(() => console.log("Notification stopped"));

// Retrieve connected devices
BLESDK.retrieveConnectedDevices([]).then((devices) =>
  console.log("Connected devices:", devices)
);

// Check if a device is connected
BLESDK.isPeripheralConnected("DEVICE_ID").then((isConnected) =>
  console.log("Device connected:", isConnected)
);

// Read RSSI
BLESDK.readRSSI("DEVICE_ID").then((rssi) => console.log("RSSI:", rssi));
```

## Event Listeners

Listen for BLE events:

```typescript
// Listen for stop scan
BLESDK.onStopScan(() => {
  console.log("Stopped scanning");
});

// Listen for discovered devices
BLESDK.onDiscoverPeripheral((data) => {
  console.log("Discovered Device:", data);
});

// Listen for connection events
BLESDK.onConnectPeripheral((device) => {
  console.log("Connected to:", device);
});

// Listen for disconnection events
BLESDK.onDisconnectPeripheral((device) => {
  console.log("Disconnected from:", device);
});
```

## License

MIT
