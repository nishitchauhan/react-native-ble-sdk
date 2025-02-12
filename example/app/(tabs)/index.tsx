/**
 * Sample BLE React Native App
 */

import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import BLESDK, {
  Peripheral,
  BleDisconnectPeripheralEvent,
  BleScanMatchMode,
  BleScanCallbackType,
  BleScanMode,
  BleState,
} from "@nishit_chauhan/react-native-ble-sdk";

import { router } from "expo-router";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

declare module "react-native-ble-manager" {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

type RootStackParamList = {
  ScanDevicesScreen: undefined;
  DetailsScreen: { peripheralData: Peripheral };
};

const ScanDevicesScreen = () => {
  type NavigationProp = NativeStackScreenProps<
    RootStackParamList,
    "ScanDevicesScreen"
  >;
  const { navigation } = useNavigation<NavigationProp>();

  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral["id"], Peripheral>()
  );

  const start = async () => {
    try {
      await BLESDK.start();
    } catch (error) {
      console.log("Unexpected error starting BleManager.", error);
    }
  };

  useEffect(() => {
    start();

    const listeners: any[] = [
      BLESDK.onDiscoverPeripheral(handleDiscoverPeripheral),
      BLESDK.onStopScan(handleStopScan),
      BLESDK.onConnectPeripheral(handleConnectPeripheral),
      BLESDK.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    handleAndroidPermissions();

    return () => {
      console.log("[app] main component unmounting. Removing listeners...");
      for (const listener of listeners) {
        listener.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAndroidPermissions = () => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then((result) => {
        if (result) {
          console.log(
            "[handleAndroidPermissions] User accepts runtime permissions android 12+"
          );
        } else {
          console.log(
            "[handleAndroidPermissions] User refuses runtime permissions android 12+"
          );
        }
      });
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((checkResult) => {
        if (checkResult) {
          console.log(
            "[handleAndroidPermissions] runtime permission Android <12 already OK"
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((requestResult) => {
            if (requestResult) {
              console.log(
                "[handleAndroidPermissions] User accepts runtime permission android <12"
              );
            } else {
              console.log(
                "[handleAndroidPermissions] User refuses runtime permission android <12"
              );
            }
          });
        }
      });
    }
  };

  const checkBluetoothState = async () => {
    const res = await BLESDK.isBluetoothEnabled();
    if (res == BleState.Off) {
      Platform.OS === "android"
        ? await enableBluetooth()
        : Alert.alert(
            "Enable Bluetooth",
            "Bluetooth is required to use this app, please enable it in your device settings.",
            [
              {
                text: "OK",
                onPress: () => Linking.openURL("App-Prefs:root"),
              },
            ]
          );
    }
    return res == BleState.On;
  };

  const startScan = async () => {
    const isEnable = await checkBluetoothState();

    if (!isScanning && isEnable) {
      // reset found peripherals before scan
      setPeripherals(new Map<Peripheral["id"], Peripheral>());

      try {
        console.log("[startScan] starting scan...");
        setIsScanning(true);
        BLESDK.scanDevices(
          SERVICE_UUIDS,
          SECONDS_TO_SCAN_FOR,
          ALLOW_DUPLICATES,
          {
            matchMode: BleScanMatchMode.Sticky,
            scanMode: BleScanMode.LowLatency,
            callbackType: BleScanCallbackType.AllMatches,
          }
        )
          .then(() => {
            console.log("[startScan] scan promise returned successfully.");
          })
          .catch((err: any) => {
            console.log("[startScan] ble scan returned in error", err);
          });
      } catch (error) {
        console.log("[startScan] ble scan error thrown", error);
      }
    }
  };

  const enableBluetooth = async () => {
    try {
      console.log("[enableBluetooth]");
      await BLESDK.enableBluetooth();
    } catch (error) {
      console.log("[enableBluetooth] thrown", error);
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    console.log("[handleStopScan] scan is stopped.");
  };

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent
  ) => {
    console.log(
      `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`
    );
    setPeripherals((map) => {
      let p = map.get(event.peripheral);
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
  };

  const handleConnectPeripheral = (event: any) => {
    console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    console.log("[handleDiscoverPeripheral] new BLE peripheral=", peripheral);
    if (!peripheral.name) {
      peripheral.name = "NO NAME";
    }
    setPeripherals((map) => {
      return new Map(map.set(peripheral.id, peripheral));
    });
  };

  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    if (peripheral && peripheral.connected) {
      try {
        console.log("Disconnect peripheral");
        await BLESDK.disconnect(peripheral.id);
      } catch (error) {
        console.log(
          `[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`,
          error
        );
      }
    } else {
      await connectPeripheral(peripheral);
    }
  };

  const connectPeripheral = async (peripheral: Peripheral) => {
    try {
      if (peripheral) {
        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            p.connecting = true;
            return new Map(map.set(p.id, p));
          }
          return map;
        });

        await BLESDK.connect(peripheral.id);
        console.log(`[connectPeripheral][${peripheral.id}] connected.`);

        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            p.connecting = false;
            p.connected = true;
            return new Map(map.set(p.id, p));
          }
          return map;
        });

        /* Test read current RSSI value, retrieve services first */
        const peripheralData = await BLESDK.retrieveServices(peripheral.id);
        console.log(
          `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
          peripheralData
        );

        setPeripherals((map) => {
          let p = map.get(peripheral.id);
          if (p) {
            return new Map(map.set(p.id, p));
          }
          return map;
        });

        const rssi = await BLESDK.readRSSI(peripheral.id);
        console.log(
          `[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`
        );

        if (peripheralData.characteristics) {
          for (const characteristic of peripheralData.characteristics) {
            if (characteristic.descriptors) {
              for (const descriptor of characteristic.descriptors) {
                try {
                  let data = await BLESDK.readDescriptor(
                    peripheral.id,
                    characteristic.service,
                    characteristic.characteristic,
                    descriptor.uuid
                  );
                  console.log(
                    `[connectPeripheral][${peripheral.id}] ${characteristic.service} ${characteristic.characteristic} ${descriptor.uuid} descriptor read as:`,
                    data
                  );
                } catch (error) {
                  console.log(
                    `[connectPeripheral][${peripheral.id}] failed to retrieve descriptor ${descriptor} for characteristic ${characteristic}:`,
                    error
                  );
                }
              }
            }
          }
        }
        console.log("PeripheralData:", peripheralData);
        // navigation.navigate("DetailsScreen", {
        //   peripheralData: peripheralData,
        // });
        router.navigate({
          pathname: "/bleDetails",
          params: { peripheralData: JSON.stringify(peripheralData) },
        });
      }
    } catch (error) {
      console.log(
        `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
        error
      );
    }
  };

  const renderItem = ({ item }: { item: Peripheral }) => {
    const backgroundColor = item.connected ? "#069400" : Colors.white;
    return (
      <TouchableHighlight
        underlayColor="#0082FC"
        onPress={() => togglePeripheralConnection(item)}
      >
        <View style={[styles.row, { backgroundColor }]}>
          <Text style={styles.peripheralName}>
            {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
            {item.name} - {item?.advertising?.localName}
            {item.connecting && " - Connecting..."}
          </Text>
          <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
          <Text style={styles.peripheralId}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.buttonGroup}>
        <Pressable style={styles.scanButton} onPress={startScan}>
          <Text style={styles.scanButtonText}>
            {isScanning ? "Scanning..." : "Scan Bluetooth"}
          </Text>
        </Pressable>
      </View>

      {Array.from(peripherals.values()).length === 0 && (
        <View style={styles.row}>
          <Text style={styles.noPeripherals}>
            No Peripherals, press "Scan Bluetooth" above.
          </Text>
        </View>
      )}

      <FlatList
        data={Array.from(peripherals.values())}
        contentContainerStyle={{ rowGap: 12 }}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const boxShadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const styles = StyleSheet.create({
  engine: {
    position: "absolute",
    right: 10,
    bottom: 0,
    color: Colors.black,
  },
  buttonGroup: {
    flexDirection: "row",
    width: "100%",
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#0a398a",
    margin: 10,
    borderRadius: 12,
    flex: 1,
    ...boxShadow,
  },
  scanButtonText: {
    fontSize: 16,
    letterSpacing: 0.25,
    color: Colors.white,
  },
  body: {
    backgroundColor: "#0082FC",
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark,
  },
  highlight: {
    fontWeight: "700",
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: "600",
    padding: 4,
    paddingRight: 12,
    textAlign: "right",
  },
  peripheralName: {
    fontSize: 16,
    textAlign: "center",
    padding: 10,
  },
  rssi: {
    fontSize: 12,
    textAlign: "center",
    padding: 2,
  },
  peripheralId: {
    fontSize: 12,
    textAlign: "center",
    padding: 2,
    paddingBottom: 20,
  },
  row: {
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20,
    ...boxShadow,
  },
  noPeripherals: {
    margin: 10,
    textAlign: "center",
    color: Colors.white,
  },
});

export default ScanDevicesScreen;
