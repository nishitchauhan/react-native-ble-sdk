import { Platform, PermissionsAndroid } from "react-native";
import BleManager, {
  Peripheral,
  BleDisconnectPeripheralEvent,
} from "react-native-ble-manager";

export type { Peripheral, BleDisconnectPeripheralEvent };

export {
  BleScanMatchMode,
  BleScanCallbackType,
  BleScanMode,
} from "react-native-ble-manager";

class BLESDK {
  constructor() {}

  start() {
    return BleManager.start({ showAlert: false });
  }

  async requestBluetoothPermissions() {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  scanDevices(
    serviceUUIDs: string[] = [],
    scanSeconds = 10,
    allowDuplicates = false,
    options = {}
  ) {
    return BleManager.scan(serviceUUIDs, scanSeconds, allowDuplicates, options);
  }

  companionScan(serviceUUIDs = [], options = {}) {
    return BleManager.companionScan(serviceUUIDs, options);
  }

  stopScan() {
    return BleManager.stopScan();
  }

  connect(deviceId: string) {
    return BleManager.connect(deviceId);
  }

  disconnect(deviceId: string) {
    return BleManager.disconnect(deviceId);
  }

  retrieveConnectedDevices(serviceUUIDs = []) {
    return BleManager.getConnectedPeripherals(serviceUUIDs);
  }

  retrieveServices(deviceId: string) {
    return BleManager.retrieveServices(deviceId);
  }

  readRSSI(deviceId: string) {
    return BleManager.readRSSI(deviceId);
  }

  readDescriptor(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    descriptorUUID: string
  ) {
    return BleManager.readDescriptor(
      deviceId,
      serviceUUID,
      characteristicUUID,
      descriptorUUID
    );
  }

  writeDescriptor(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    descriptorUUID: string,
    data: number[]
  ) {
    return BleManager.writeDescriptor(
      deviceId,
      serviceUUID,
      characteristicUUID,
      descriptorUUID,
      data
    );
  }

  startNotification(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ) {
    return BleManager.startNotification(
      deviceId,
      serviceUUID,
      characteristicUUID
    );
  }

  stopNotification(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ) {
    return BleManager.stopNotification(
      deviceId,
      serviceUUID,
      characteristicUUID
    );
  }

  readCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ) {
    return BleManager.read(deviceId, serviceUUID, characteristicUUID);
  }

  writeCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    data: number[],
    maxByteSize = 20
  ) {
    return BleManager.write(
      deviceId,
      serviceUUID,
      characteristicUUID,
      data,
      maxByteSize
    );
  }

  writeWithoutResponse(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    data: number[],
    maxByteSize = 20,
    queueSleepTime = 10
  ) {
    return BleManager.writeWithoutResponse(
      deviceId,
      serviceUUID,
      characteristicUUID,
      data,
      maxByteSize,
      queueSleepTime
    );
  }

  requestMTU(deviceId: string, mtuSize: number) {
    return BleManager.requestMTU(deviceId, mtuSize);
  }

  enableBluetooth() {
    return BleManager.enableBluetooth();
  }

  isPeripheralConnected(deviceId: string, serviceUUIDs = []) {
    return BleManager.isPeripheralConnected(deviceId, serviceUUIDs);
  }

  isScanning() {
    return BleManager.isScanning();
  }

  isBluetoothEnabled() {
    return BleManager.checkState();
  }

  onDiscoverPeripheral(callback: any) {
    const subscription = BleManager.onDiscoverPeripheral(callback);
    return subscription;
  }

  onStopScan(callback: any) {
    const subscription = BleManager.onStopScan(callback);
    return subscription;
  }

  onUpdateValue(callback: any) {
    const subscription = BleManager.onDidUpdateValueForCharacteristic(callback);
    return subscription;
  }

  onConnectPeripheral(callback: any) {
    const subscription = BleManager.onConnectPeripheral(callback);
    return subscription;
  }

  onDisconnectPeripheral(callback: any) {
    const subscription = BleManager.onDisconnectPeripheral(callback);
    return subscription;
  }

  onUpdateState(callback: any) {
    const subscription = BleManager.onDidUpdateState(callback);
    return subscription;
  }

  onPeripheralDidBond(callback: any) {
    const subscription = BleManager.onPeripheralDidBond(callback);
    return subscription;
  }

  onCentralManagerWillRestoreState(callback: any) {
    // IOS only
    const subscription = BleManager.onCentralManagerWillRestoreState(callback);
    return subscription;
  }

  onDidUpdateNotificationStateFor(callback: any) {
    // IOS only
    const subscription = BleManager.onDidUpdateNotificationStateFor(callback);
    return subscription;
  }

  onCompanionPeripheral(callback: any) {
    // Android only
    const subscription = BleManager.onCompanionPeripheral(callback);
    return subscription;
  }

  supportsCompanion() {
    // Android only
    return BleManager.supportsCompanion();
  }

  startNotificationWithBuffer(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    buffer: number
  ) {
    // Android only
    return BleManager.startNotificationUseBuffer(
      deviceId,
      serviceUUID,
      characteristicUUID,
      buffer
    );
  }

  refreshCache(deviceId: string) {
    // Android only
    return BleManager.refreshCache(deviceId);
  }

  getAssociatedPeripherals() {
    // Android only
    return BleManager.getAssociatedPeripherals();
  }

  removeAssociatedPeripheral(deviceId: string) {
    // Android only
    return BleManager.removeAssociatedPeripheral(deviceId);
  }

  createBond(deviceId: string, peripheralPin?: string) {
    // Android only
    return BleManager.createBond(deviceId, peripheralPin);
  }

  removeBond(deviceId: string) {
    // Android only
    return BleManager.removeBond(deviceId);
  }

  getBondedPeripherals() {
    // Android only
    return BleManager.getBondedPeripherals();
  }

  getDiscoveredPeripherals() {
    // Android only
    return BleManager.getDiscoveredPeripherals();
  }

  removePeripheral(deviceId: string) {
    // Android only
    return BleManager.removePeripheral(deviceId);
  }

  setName(name: string) {
    // Android only
    return BleManager.setName(name);
  }

  getMaximumWriteValueLengthForWithoutResponse(deviceId: string) {
    // IOS only
    return BleManager.getMaximumWriteValueLengthForWithoutResponse(deviceId);
  }

  getMaximumWriteValueLengthForWithResponse(deviceId: string) {
    // IOS only
    return BleManager.getMaximumWriteValueLengthForWithResponse(deviceId);
  }
}

export default new BLESDK();
