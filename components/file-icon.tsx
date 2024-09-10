import { File, FileAudio, FileImage, FileType, FileVideo } from "lucide-react";

interface FileIconProps {
    fileType: string;
}

export function FileIcon({ fileType }: FileIconProps): JSX.Element {
    if (fileType.includes('video')) {
        return <FileVideo />;
    }

    if (fileType.includes('audio')) {
        return <FileAudio />;
    }

    if (fileType.includes('text')) {
        return <FileType />;
    }

    if (fileType.includes('image')) {
        return <FileImage />;
    }

    return <File />;
}