/* eslint-disable */
declare var NAF: {
  clientId: string;
  connection: {
    adapter?: {
      enableMicrophone: (enabled: boolean) => void;
    };
    broadcastDataGuaranteed: (dataType: string, data: object) => void;
    subscribeToDataChannel: (
      dataType: string,
      callback: (senderId: string, dataType: string, data: object, targetId: string | undefined) => void,
    ) => void;
  };
};
