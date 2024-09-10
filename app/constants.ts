export const extensions = {
    image: [ "jpg", "jpeg", "png", "gif", "bmp", "webp", "ico", "tif", "tiff", "svg", "raw", "tga" ],
    video: [ "mp4", "m4v", "mp4v", "3gp", "3g2", "avi", "mov", "wmv", "mkv", "flv", "ogv", "webm", "h264", "264", "hevc", "265" ],
    audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"]
};

export const acceptedFiles = {
    "image/*": [ ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".ico", ".tif", ".tiff", ".raw", ".tga" ],
    "audio/*": [],
    "video/*": [],
};

export const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];