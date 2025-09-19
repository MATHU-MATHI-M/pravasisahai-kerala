declare module '@blackbox-vision/react-qr-reader' {
  import { CSSProperties } from 'react';

  export interface QrReaderProps {
    constraints?: MediaTrackConstraints;
    onResult?: (result: any, error: any) => void;
    containerStyle?: CSSProperties;
  }

  export const QrReader: React.FC<QrReaderProps>;
}