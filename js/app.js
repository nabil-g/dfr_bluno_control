var app = new Vue({
  el: "#app",
  data:{
    DFRBLU_SERVICE_UUID: '0000dfb0-0000-1000-8000-00805f9b34fb',
    DFRBLU_CHAR_RXTX_UUID: '0000dfb1-0000-1000-8000-00805f9b34fb',
    DFRBLU_TX_UUID_DESCRIPTOR: '00002902-0000-1000-8000-00805f9b34fb',
    devices: [],
    device: null,
    connected: false,
    scanning: false,
    commands: []
  },
  methods: {
    initialize: function () {
      this.connected = false;
    },
    startScan: function () {
      app.disconnect();
      this.devices = [];
      this.scanning = true;

      var self = this;

      function onScanSuccess (device) {
        if (device.name != null) {
          self.devices.push(device);
        }
      }

      function onScanFailure (errorCode) {
        app.disconnect('Failed to scan');
      }

      evothings.easyble.reportDeviceOnce(true);
      evothings.easyble.startScan(onScanSuccess, onScanFailure);
    },
    connectTo: function (index) {
      var device = this.devices[index];
      var self = this;
      // write a toast here

      function onConnectSuccess(device) {
        function onServiceSuccess(device) {
          self.connected = true;
          self.device = device;
          self.scanning = false;
          // write a toast here

          device.enableNotification(self.DFRBLU_CHAR_RXTX_UUID,self.receivedData, function (errorCode) {
            console.log('BLE enableNotification error : '+ errorCode);
          });

        }

        function onServiceFailure(errorCode) {
          self.disconnect('Device is not bluno from DFRobot');
          console.log('Error reading services: ' + errorCode);
        }

        // write a toast here

        device.readServices([self.DFRBLU_SERVICE_UUID], onServiceSuccess, onServiceFailure);
      }

      function onConnectFailure(errorCode) {
        self.disconnect('Failed to connect to device');
      }

      evothings.easyble.stopScan();
      device.connect(onConnectSuccess, onConnectFailure);
    },
    sendData: function (data) {
      if (this.connected) {
        data = new Uint8Array(data);
        var self = this;
        function onMessageSendSuccess() {
          // write a toast here
        }

        function onMessageSendFailure() {
          self.disconnect('Failed to send data');
        }

        this.device.writeCharacteristic(this.DFRBLU_CHAR_RXTX_UUID, data, onMessageSendSuccess, onMessageSendFailure);

      } else {
        this.disconnect('Disconnected');
      }
    },
    receivedData: function (data) {
      if(this.connected) {
        // write a toast here
      } else {
        this.disconnect('Disconnected');
      }
    },
    disconnect: function (errorMessage) {
      if(errorMessage) {
        alert(errorMessage);
      }

      this.connected = false;
      this.device = null;
      this.scanning = false;
      evothings.easyble.stopScan();
      evothings.easyble.closeConnectedDevices();

    }
  }
});
