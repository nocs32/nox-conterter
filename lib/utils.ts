import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { Action, ConvertFileResult } from "@/app/types";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { sizes } from "@/app/constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

function getFileExtension(file_name: string): string {
    const regex = /(?:\.([^.]+))?$/;
    const match = regex.exec(file_name);

    if (match && match[1]) {
        return match[1];
    }

    return '';
}

function removeFileExtension(file_name: string): string {
    const lastDotIndex = file_name.lastIndexOf('.');

    if (lastDotIndex !== -1) {
        return file_name.slice(0, lastDotIndex);
    }

    return file_name;
}

export async function convertFile(ffmpeg: FFmpeg, action: Action): Promise<ConvertFileResult> {
    const { file, to, file_name, file_type } = action;
    const input = getFileExtension(file_name);
    const output = removeFileExtension(file_name) + '.' + to;

    ffmpeg.writeFile(input, await fetchFile(file));
  
    let ffmpeg_cmd = [];

    if (to === '3gp') {
        ffmpeg_cmd = [ '-i', input, '-r', '20', '-s', '352x288', '-vb', '400k', '-acodec', 'aac', '-strict', 'experimental', '-ac', '1', '-ar', '8000', '-ab', '24k', output ];
    } else { 
        ffmpeg_cmd = ['-i', input, output];
    }
  
    await ffmpeg.exec(ffmpeg_cmd);

    const data = await ffmpeg.readFile(output);
    const blob = new Blob([data], { type: file_type.split('/')[0] });
    const url = URL.createObjectURL(blob);

    return { url, output };
}

export async function loadFfmpeg(): Promise<FFmpeg> {
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return ffmpeg;
}

export default function compressFileName(fileName: string): string {
    const maxSubstrLength = 18;
  
    if (fileName.length > maxSubstrLength) {
        const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');  
        const fileExtension = fileName.split('.').pop();

        if (!fileExtension) {
            return 'Undefined';
        }

        const charsToKeep = maxSubstrLength - (fileNameWithoutExtension.length + fileExtension.length + 3);
  
        const compressedFileName = fileNameWithoutExtension.substring(0, maxSubstrLength - fileExtension.length - 3) + '...' + fileNameWithoutExtension.slice(-charsToKeep) + '.' + fileExtension;
  
        return compressedFileName;
    } else {
        return fileName.trim();
    }
}

export function bytesToSize(bytes: number): string {
    if (bytes === 0) {
        return '0 Bytes';
    }
  
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
  
    return `${size} ${sizes[i]}`;
}

export function download(action: Action) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
};