import { Dropzone } from "./(components)/(dropzone)/dropzone";

export default function Home() {
    return (
        <div className="space-y-16 pb-8">
            <div className="hero pt-2">
                <div className="space-y-6">
                    <h1 className="text-3xl text-center font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
                        Effortless <span className="text-primary">File Conversion</span>
                    </h1>
                    <p className="text-gray-400 text-md md:text-lg text-center md:px-24 xl:px-44 2xl:px-52">
                        Transform your files with ease using our streamlined file converter app. Simply upload your files, select the desired format, and get quick, accurate conversions with minimal effort. Perfect for everyday needs and tailored to deliver reliable results every time.
                    </p>
                    <div className="max-w-4xl mx-auto">
                        <Dropzone />
                    </div>
                </div>
            </div>
        </div>
    );
}
