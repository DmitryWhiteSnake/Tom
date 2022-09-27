import { useCallback, useState, useEffect } from "react";

import { BACKEND_BASE_URL } from "../../config";

import css from "./SpeechInput.module.scss";
import type { SpeechInputProps, SpeechButtonProps, Recording } from "./types";

import microphoneIcon from "../../assets/mic.svg";
import mutedMicrophoneIcon from "../../assets/muted_mic.svg";

const DEFAULT_PLACEHOLDER =
  "Type value or hit microphone icon to start speaking";

const SpeechButton = ({
  isSpeaking,
  onActivate,
  onSave,
}: SpeechButtonProps) => {
  if (isSpeaking) {
    return (
      <img
        alt="Tap to stop speaking"
        className={css.speechButtonIcon}
        onClick={onSave}
        src={mutedMicrophoneIcon}
      />
    );
  }

  return (
    <img
      alt="Tap to speak"
      className={css.speechButtonIcon}
      onClick={onActivate}
      src={microphoneIcon}
    />
  );
};

const SpeechInput = ({
  placeholder = DEFAULT_PLACEHOLDER,
  onChange,
  value,
}: SpeechInputProps) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [recording, setRecording] = useState<Recording>({});

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecording((prev: Recording) => {
        return {
          ...prev,
          stream: stream,
        };
      });
      setIsSpeaking(true);
    } catch (err) {
      alert(`Can't start voice recording: ${err}`);
    }
  };

  const saveRecording = async () => {
    if (recording.recorder && recording.recorder.state !== "inactive") {
      recording.recorder.stop();
    }
    setIsSpeaking(false);
    await onSend();
  };

  const onChangeValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  const onSend = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/v1/recognize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioURL: recording.audio }),
      });
      const data = await response.json();

      if (response.status === 200) {
        onChange(data);
      }
    } catch {
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    if (recording.stream) {
      setRecording((prev) => {
        return {
          ...prev,
          recorder: new MediaRecorder(prev.stream as MediaStream),
        };
      });
    }
  }, [recording.stream]);

  useEffect(() => {
    const recorder = recording.recorder;
    let chunks: BlobPart[] = [];

    if (recorder && recorder.state === "inactive") {
      recorder.start();

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/ogg" });

        setRecording((prev) => {
          if (prev.recorder) {
            return {
              audio: window.URL.createObjectURL(blob),
            };
          }

          return {};
        });
      };
    }

    return () => {
      if (recorder && recorder.stream) {
        recorder.stream.getAudioTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [recording.recorder]);

  console.info(recording);

  return (
    <div className={css.speechInputWrapper}>
      <input
        disabled={isSpeaking}
        className={css.speechInput}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChangeValue}
      />
      <SpeechButton
        isSpeaking={isSpeaking}
        onActivate={startRecording}
        onSave={saveRecording}
      />
    </div>
  );
};

export default SpeechInput;
