export type SpeechButtonProps = {
  isSpeaking: boolean;
  onActivate: () => void;
  onSave: () => void;
};

export type SpeechInputProps = {
  placeholder?: string;
  onChange: (value: string) => void;
  value: string;
};

export type Recording = {
  audio?: string;
  stream?: MediaStream;
  recorder?: MediaRecorder;
};
