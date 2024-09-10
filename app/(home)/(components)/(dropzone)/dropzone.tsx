/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { acceptedFiles, extensions } from "@/app/constants";
import { Action } from "@/app/types";
import { FileIcon } from "@/components/file-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import compressFileName, { bytesToSize, convertFile, download, loadFfmpeg } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { CircleCheck, CircleX, CloudDownload, CloudUpload, FileSymlink, LoaderCircle, LoaderCircleIcon, TicketX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDropzone from "react-dropzone";
import { toast } from "sonner";

export function Dropzone() {
    const ffmpegRef = useRef<any>(null);
    const [isHover, setIsHover] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [defaultValues, setDefaultValues] = useState<string>("video");
    const [isDone, setIsDone] = useState<boolean>(false);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);

    const reset = () => {
        setIsDone(false);
        setActions([]);
        setFiles([]);
        setIsReady(false);
        setIsConverting(false);
    };

    const downloadAll = (): void => {
        for (const action of actions) {
            !action.is_error && download(action);
        }
    };

    const handleUpload = (data: File[]): void => {
        handleExitHover();
        setFiles(data);

        const tmp: Action[] = [];

        data.forEach((file) => {
            tmp.push({
                file_name: file.name,
                file_size: file.size,
                from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
                to: null,
                file_type: file.type,
                file,
                is_converted: false,
                is_converting: false,
                is_error: false,
            });
        });

        setActions(tmp);
    };

    const deleteAction = (action: Action): void => {
        setActions(actions.filter((el) => el !== action));
        setFiles(files.filter((el) => el.name !== action.file_name));
    };

    const updateAction = (file_name: string, to: string) => {
        setActions(
            actions.map((action): Action => {
                if (action.file_name === file_name) {
                    return {
                        ...action,
                        to,
                    };
                }

                return action;
            })
        );
    };

    const convert = async () => {
        let tmp_actions = actions.map((elt) => ({
            ...elt,
            is_converting: true,
        }));
        setActions(tmp_actions);
        setIsConverting(true);

        for (const action of tmp_actions) {
            try {
                const { url, output } = await convertFile(ffmpegRef.current, action);

                tmp_actions = tmp_actions.map((el) =>
                    el === action
                        ? {
                            ...el,
                            is_converted: true,
                            is_converting: false,
                            url,
                            output,
                        }
                        : el
                );

                setActions(tmp_actions);
            } catch (err) {
                tmp_actions = tmp_actions.map((el) =>
                    el === action
                        ? {
                            ...el,
                            is_converted: false,
                            is_converting: false,
                            is_error: true,
                        }
                        : el
                );

                setActions(tmp_actions);
            }
        }

        setIsDone(true);
        setIsConverting(false);
    };

    const handleHover = (): void => setIsHover(true);

    const handleExitHover = (): void => setIsHover(false);

    const load = async () => {
        const ffmpeg_response: FFmpeg = await loadFfmpeg();

        ffmpegRef.current = ffmpeg_response;

        setIsLoaded(true);
    };

    useEffect(() => {
        const checkIsReady = (): void => {
            let tmp_is_ready = true;

            actions.forEach((action: Action) => !action.to && (tmp_is_ready = false));

            setIsReady(tmp_is_ready);
        };

        if (!actions.length) {
            setIsDone(false);
            setFiles([]);
            setIsReady(false);
            setIsConverting(false);
        } else checkIsReady();
    }, [actions]);

    useEffect(() => {
        load();
    }, []);

    if (actions.length) {
        return (
            <div className="space-y-6">
                {actions.map((action: Action, index: any) => (
                    <div className="w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between" key={index}>
                        {!isLoaded && <Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />}
                        <div className="flex gap-4 items-center">
                            <span className="text-2xl text-indigo-500">
                                <FileIcon fileType={action.file_type} />
                            </span>
                            <div className="flex items-center gap-1 w-96">
                                <span className="text-md font-medium overflow-x-hidden">{compressFileName(action.file_name)}</span>
                                <span className="text-gray-400 text-sm">({bytesToSize(action.file_size)})</span>
                            </div>
                        </div>
                        {action.is_error ? (
                            <Badge variant="destructive" className="flex gap-2">
                                <span>Error Converting File</span>
                                <TicketX />
                            </Badge>
                        ) : action.is_converted ? (
                            <Badge variant="default" className="flex gap-2 bg-green-500">
                                <span>Done</span>
                                <CircleCheck />
                            </Badge>
                        ) : action.is_converting ? (
                            <Badge variant="default" className="flex gap-2">
                                <span>Converting</span>
                                <span className="animate-spin">
                                    <LoaderCircle />
                                </span>
                            </Badge>
                        ) : (
                            <div className="text-gray-400 text-md flex items-center gap-4">
                                <span>Convert to</span>
                                <Select
                                    onValueChange={(value) => {
                                        if (extensions.audio.includes(value)) {
                                            setDefaultValues("audio");
                                        } else if (extensions.video.includes(value)) {
                                            setDefaultValues("video");
                                        }

                                        updateAction(action.file_name, value);
                                    }}
                                >
                                    <SelectTrigger className="w-32 outline-none focus:outline-none focus:ring-0 text-center text-gray-600 bg-gray-50 text-md font-medium">
                                        <SelectValue placeholder="Please select file format..." />
                                    </SelectTrigger>
                                    <SelectContent className="h-fit">
                                        {action.file_type.includes("image") && (
                                            <div className="grid grid-cols-2 gap-2 w-fit">
                                                {extensions.image.map((elt, i) => (
                                                    <div key={i} className="col-span-1 text-center">
                                                        <SelectItem value={elt} className="mx-auto">{elt}</SelectItem>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {action.file_type.includes("video") && (
                                            <Tabs defaultValue={defaultValues} className="w-full">
                                                <TabsList className="w-full">
                                                    <TabsTrigger value="video" className="w-full">Video</TabsTrigger>
                                                    <TabsTrigger value="audio" className="w-full">Audio</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="video">
                                                    <div className="grid grid-cols-3 gap-2 w-fit">
                                                        {extensions.video.map((elt, i) => (
                                                            <div key={i} className="col-span-1 text-center">
                                                                <SelectItem value={elt} className="mx-auto">{elt}</SelectItem>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="audio">
                                                    <div className="grid grid-cols-3 gap-2 w-fit">
                                                        {extensions.audio.map((elt, i) => (
                                                            <div key={i} className="col-span-1 text-center">
                                                                <SelectItem value={elt} className="mx-auto">{elt}</SelectItem>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        )}
                                        {action.file_type.includes("audio") && (
                                            <div className="grid grid-cols-2 gap-2 w-fit">
                                                {extensions.audio.map((elt, i) => (
                                                    <div key={i} className="col-span-1 text-center">
                                                        <SelectItem value={elt} className="mx-auto">{elt}</SelectItem>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {action.is_converted ? <Button variant="outline" onClick={() => download(action)}>Download</Button> : (
                            <span className="cursor-pointer hover:bg-gray-50 rounded-full h-10 w-10 flex items-center justify-center text-2xl text-gray-400" onClick={() => deleteAction(action)}>
                                <CircleX />
                            </span>
                        )}
                    </div>
                ))}
                <div className="flex w-full justify-end">
                    {isDone ? (
                        <div className="space-y-4 w-fit">
                            <Button
                                className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
                                size="lg"
                                onClick={downloadAll}
                            >
                                {actions.length > 1 ? "Download All" : "Download"}
                                <CloudDownload />
                            </Button>
                            <Button
                                size="lg"
                                onClick={reset}
                                variant="outline"
                                className="rounded-xl"
                            >
                                Convert Another File(s)
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="rounded-xl font-semibold relative py-4 text-md flex items-center w-44"
                            size="lg"
                            disabled={!isReady || isConverting}
                            onClick={convert}
                        >
                            {isConverting ? (
                                <span className="animate-spin text-lg">
                                    <LoaderCircleIcon />
                                </span>
                            ) : (
                                <span>Convert Now</span>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <ReactDropzone
            onDrop={handleUpload}
            onDragEnter={handleHover}
            onDragLeave={handleExitHover}
            accept={acceptedFiles}
            onDropRejected={() => {
                handleExitHover();
                toast.error("Invalid file type(s) uploaded");
            }}
            onError={() => {
                handleExitHover();
                toast.error("Error uploading your file(s)");
            }}
        >
            {({ getRootProps, getInputProps }) => (
                <div
                    {...getRootProps()}
                    className="bg-gray-50 h-72 lg:h-80 xl:h-96 rounded-2xl shadow-sm border border-dashed cursor-pointer flex items-center justify-center"
                >
                    <input {...getInputProps()} />
                    <div className="space-y-4 text-gray-500">
                        {isHover ? (
                            <>
                                <div className="flex justify-center text-6xl">
                                    <FileSymlink size={50} />
                                </div>
                                <h3 className="text-xl md:text-2xl text-center font-medium">Yes, right there</h3>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center text-6xl">
                                    <CloudUpload size={50} />
                                </div>
                                <h3 className="text-xl md:text-2xl text-center font-medium">
                                    Click, or drop your files here
                                </h3>
                            </>
                        )}
                    </div>
                </div>
            )}
        </ReactDropzone>
    );
}